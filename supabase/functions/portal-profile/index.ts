import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_SITE_ORIGINS') || 'https://stoun05.github.io,http://localhost:5173')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
const CV_BUCKET = 'candidate-cvs'
const MAX_CV_SIZE = 5 * 1024 * 1024
const EXPERIENCE_KEYS = new Set(['', 'none', 'junior', 'mid', 'senior'])

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

class PublicError extends Error {
  code: string
  status: number

  constructor(message: string, code = 'validation_failed', status = 400) {
    super(message)
    this.code = code
    this.status = status
  }
}

function requestOrigin(request: Request) {
  const origin = request.headers.get('origin') || ''
  return ALLOWED_ORIGINS.includes(origin) ? origin : ''
}

function cors(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'apikey, authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    'Vary': 'Origin',
  }
}

function reply(origin: string, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(origin),
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

function cleanText(value: unknown, maxLength: number) {
  const text = String(value || '').trim()
  if (text.length > maxLength) throw new PublicError('One or more candidate profile fields are too long.')
  return text || null
}

function normalizeCandidateProfile(row: Record<string, unknown>) {
  return {
    role: row.candidate_role || '',
    experienceKey: row.candidate_experience_key || '',
    languages: row.candidate_languages || '',
    salary: row.candidate_salary || '',
    message: row.candidate_message || '',
    cv: row.candidate_cv_metadata || null,
  }
}

async function requireCandidate(request: Request) {
  const authorization = request.headers.get('authorization') || ''
  if (!authorization.toLowerCase().startsWith('bearer ')) {
    throw new PublicError('Portal login is required.', 'portal_login_required', 401)
  }

  const token = authorization.slice(7).trim()
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user) {
    throw new PublicError('Portal session expired. Log in again.', 'portal_session_invalid', 401)
  }

  const { data: profile, error: profileError } = await supabase
    .from('portal_profiles')
    .select('id, account_type, candidate_role, candidate_experience_key, candidate_languages, candidate_salary, candidate_message, candidate_cv_metadata')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !profile) {
    throw new PublicError('Portal profile could not be verified.', 'portal_profile_missing', 403)
  }

  if (profile.account_type !== 'candidate') {
    throw new PublicError('Only candidate accounts can manage a reusable CV profile.', 'candidate_account_required', 403)
  }

  return { user: userData.user, profile }
}

function validatedCv(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const mime = ({
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  } as Record<string, string>)[extension]

  if (!mime || file.size <= 0 || file.size > MAX_CV_SIZE) {
    throw new PublicError('CV must be PDF, DOC or DOCX and no larger than 5 MB.', 'invalid_cv')
  }

  return { extension, mime }
}

Deno.serve(async (request) => {
  const origin = requestOrigin(request)

  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(origin || ALLOWED_ORIGINS[0] || '*') })
  }

  if (!origin) {
    return reply(ALLOWED_ORIGINS[0] || '*', { error: 'Origin is not allowed.', code: 'origin_denied' }, 403)
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return reply(origin, { error: 'Portal profile service is not configured.', code: 'configuration_error' }, 503)
  }

  let uploadedPath = ''

  try {
    const { user, profile } = await requireCandidate(request)
    const oldCv = profile.candidate_cv_metadata as Record<string, unknown> | null

    if (request.method === 'DELETE') {
      const oldPath = typeof oldCv?.storagePath === 'string' ? oldCv.storagePath : ''
      const { error: updateError } = await supabase
        .from('portal_profiles')
        .update({ candidate_cv_metadata: null })
        .eq('id', user.id)

      if (updateError) throw updateError

      if (oldPath.startsWith(`profiles/${user.id}/`)) {
        const { error: removeError } = await supabase.storage.from(CV_BUCKET).remove([oldPath])
        if (removeError) console.error('candidate profile CV cleanup failed', removeError)
      }

      return reply(origin, {
        ok: true,
        candidateProfile: normalizeCandidateProfile({ ...profile, candidate_cv_metadata: null }),
      })
    }

    if (request.method !== 'POST') {
      return reply(origin, { error: 'Method not allowed.' }, 405)
    }

    const formData = await request.formData()
    const rawFields = JSON.parse(String(formData.get('fields') || '{}'))
    const experienceKey = String(rawFields.experienceKey || '').trim()

    if (!EXPERIENCE_KEYS.has(experienceKey)) {
      throw new PublicError('Candidate experience value is invalid.')
    }

    const updatePayload: Record<string, unknown> = {
      candidate_role: cleanText(rawFields.role, 200),
      candidate_experience_key: experienceKey || null,
      candidate_languages: cleanText(rawFields.languages, 500),
      candidate_salary: cleanText(rawFields.salary, 120),
      candidate_message: cleanText(rawFields.message, 2000),
    }

    const cv = formData.get('cv')
    let nextCv = oldCv

    if (cv instanceof File && cv.size > 0) {
      const { extension, mime } = validatedCv(cv)
      uploadedPath = `profiles/${user.id}/${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from(CV_BUCKET)
        .upload(uploadedPath, cv, {
          contentType: mime,
          cacheControl: '0',
          upsert: false,
        })

      if (uploadError) throw uploadError

      nextCv = {
        bucket: CV_BUCKET,
        storagePath: uploadedPath,
        name: cv.name.slice(0, 255),
        size: cv.size,
        type: mime,
        uploadedAt: new Date().toISOString(),
        source: 'candidate-profile',
      }
      updatePayload.candidate_cv_metadata = nextCv
    }

    const { data: updated, error: updateError } = await supabase
      .from('portal_profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select('candidate_role, candidate_experience_key, candidate_languages, candidate_salary, candidate_message, candidate_cv_metadata')
      .single()

    if (updateError || !updated) throw updateError || new Error('Candidate profile update returned no data.')

    const oldPath = typeof oldCv?.storagePath === 'string' ? oldCv.storagePath : ''
    if (uploadedPath && oldPath && oldPath !== uploadedPath && oldPath.startsWith(`profiles/${user.id}/`)) {
      const { error: removeError } = await supabase.storage.from(CV_BUCKET).remove([oldPath])
      if (removeError) console.error('old candidate profile CV cleanup failed', removeError)
    }

    return reply(origin, {
      ok: true,
      candidateProfile: normalizeCandidateProfile(updated),
    })
  } catch (error) {
    if (uploadedPath) {
      await supabase.storage.from(CV_BUCKET).remove([uploadedPath]).catch(() => null)
    }

    const isPublic = error instanceof PublicError
    console.error('candidate profile update failed', error)

    return reply(origin, {
      error: isPublic ? error.message : 'Candidate profile could not be updated. Try again later.',
      code: isPublic ? error.code : 'candidate_profile_failed',
    }, isPublic ? error.status : 500)
  }
})
