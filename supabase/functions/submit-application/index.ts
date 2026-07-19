import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY') || ''
const RATE_LIMIT_PEPPER = Deno.env.get('RATE_LIMIT_PEPPER') || ''
const ALLOWED_SITE_ORIGINS = (Deno.env.get('ALLOWED_SITE_ORIGINS') || 'https://stoun05.github.io,http://localhost:5173')
  .split(',').map((item) => item.trim()).filter(Boolean)
const TURNSTILE_ALLOWED_HOSTNAMES = (Deno.env.get('TURNSTILE_ALLOWED_HOSTNAMES') || 'stoun05.github.io,localhost')
  .split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
const IP_LIMIT_PER_HOUR = Number(Deno.env.get('IP_LIMIT_PER_HOUR') || 8)
const CONTACT_LIMIT_PER_DAY = Number(Deno.env.get('CONTACT_LIMIT_PER_DAY') || 3)
const MAX_CV_SIZE = 5 * 1024 * 1024
const CV_BUCKET = 'candidate-cvs'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const candidateKeys = ['name', 'phone', 'email', 'city', 'role', 'experience', 'languages', 'salary', 'message']
const employerKeys = [
  'name', 'phone', 'email', 'company', 'industry', 'contactRole', 'website', 'vacancy', 'headcount',
  'location', 'workType', 'requiredExperience', 'employmentType', 'salaryFrom', 'salaryTo', 'startDate',
  'deadline', 'responsibilities', 'requirements', 'offer', 'message', 'confidential',
]

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function respond(origin: string, body: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8', ...extra },
  })
}

function allowedOrigin(request: Request) {
  const origin = request.headers.get('origin') || ''
  return ALLOWED_SITE_ORIGINS.includes(origin) ? origin : ''
}

function clientIp(request: Request) {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(`${RATE_LIMIT_PEPPER}:${value.trim().toLowerCase()}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function extensionOf(filename = '') {
  return filename.split('.').pop()?.toLowerCase() || ''
}

function cvMime(extension: string) {
  return {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }[extension] || ''
}

function sanitizeFields(audience: 'candidate' | 'employer', source: unknown) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error('Invalid form fields.')
  const allowed = audience === 'candidate' ? candidateKeys : employerKeys
  const input = source as Record<string, unknown>
  const fields: Record<string, string | boolean> = {}

  for (const key of allowed) {
    const value = input[key]
    if (key === 'confidential') {
      fields[key] = value === true || value === 'true'
      continue
    }
    if (value == null) continue
    const text = String(value).trim()
    if (text.length > 4000) throw new Error(`Field ${key} is too long.`)
    fields[key] = text
  }

  for (const required of audience === 'candidate'
    ? ['name', 'phone', 'email', 'city', 'role', 'experience', 'languages']
    : ['name', 'phone', 'email', 'company', 'vacancy', 'headcount', 'location', 'workType', 'requiredExperience', 'employmentType']) {
    if (!fields[required]) throw new Error(`Required field is missing: ${required}`)
  }

  const email = String(fields.email || '')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error('Invalid email address.')
  if (String(fields.phone || '').length > 50) throw new Error('Invalid phone number.')

  return fields
}

async function verifyTurnstile(token: string, ip: string) {
  const body = new URLSearchParams({
    secret: TURNSTILE_SECRET_KEY,
    response: token,
    remoteip: ip,
    idempotency_key: crypto.randomUUID(),
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    })
    const result = await response.json()
    const hostname = String(result.hostname || '').toLowerCase()
    const validHostname = !hostname || TURNSTILE_ALLOWED_HOSTNAMES.includes(hostname)
    return {
      ok: response.ok && result.success === true && result.action === 'idegli_application' && validHostname,
      codes: Array.isArray(result['error-codes']) ? result['error-codes'] : [],
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function countAttempts(column: 'ip_hash' | 'contact_hash', hash: string, since: Date) {
  const { count, error } = await supabase
    .from('submission_attempts')
    .select('id', { count: 'exact', head: true })
    .eq(column, hash)
    .gte('created_at', since.toISOString())

  if (error) throw error
  return count || 0
}

async function logAttempt(data: Record<string, unknown>) {
  const { error } = await supabase.from('submission_attempts').insert(data)
  if (error) console.error('submission attempt log failed', error)
}

Deno.serve(async (request) => {
  const origin = allowedOrigin(request)
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin || ALLOWED_SITE_ORIGINS[0] || '*') })
  if (!origin) return respond(ALLOWED_SITE_ORIGINS[0] || '*', { error: 'Origin is not allowed.', code: 'origin_denied' }, 403)
  if (request.method !== 'POST') return respond(origin, { error: 'Method not allowed.' }, 405)

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TURNSTILE_SECRET_KEY || !RATE_LIMIT_PEPPER) {
    return respond(origin, { error: 'Secure submission service is not configured.', code: 'configuration_error' }, 503)
  }

  const ip = clientIp(request)
  const ipHash = await sha256(`ip:${ip}`)
  let contactHash = ''
  let audience: 'candidate' | 'employer' | null = null

  try {
    const formData = await request.formData()
    const token = String(formData.get('turnstileToken') || '')
    const rawPayload = JSON.parse(String(formData.get('payload') || '{}'))
    audience = rawPayload.audience === 'candidate' || rawPayload.audience === 'employer' ? rawPayload.audience : null

    if (!audience || !rawPayload.consent || !['tm', 'ru'].includes(rawPayload.locale)) {
      await logAttempt({ audience, ip_hash: ipHash, outcome: 'validation_failed', reason: 'invalid_payload' })
      return respond(origin, { error: 'Form data is invalid.', code: 'validation_failed' }, 400)
    }

    const fields = sanitizeFields(audience, rawPayload.fields)
    contactHash = await sha256(`contact:${String(fields.email)}:${String(fields.phone)}`)

    if (!token || token.length > 2048) {
      await logAttempt({ audience, ip_hash: ipHash, contact_hash: contactHash, outcome: 'captcha_failed', reason: 'missing_token' })
      return respond(origin, { error: 'Complete the security check.', code: 'captcha_required' }, 400)
    }

    const verification = await verifyTurnstile(token, ip)
    if (!verification.ok) {
      await logAttempt({ audience, ip_hash: ipHash, contact_hash: contactHash, outcome: 'captcha_failed', reason: verification.codes.join(',') || 'verification_failed' })
      return respond(origin, { error: 'Security verification expired or failed. Try again.', code: 'captcha_failed' }, 400)
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [ipCount, contactCount] = await Promise.all([
      countAttempts('ip_hash', ipHash, hourAgo),
      countAttempts('contact_hash', contactHash, dayAgo),
    ])

    if (ipCount >= IP_LIMIT_PER_HOUR || contactCount >= CONTACT_LIMIT_PER_DAY) {
      await logAttempt({ audience, ip_hash: ipHash, contact_hash: contactHash, outcome: 'rate_limited', reason: ipCount >= IP_LIMIT_PER_HOUR ? 'ip_hourly' : 'contact_daily' })
      return respond(origin, { error: 'Too many applications. Try again later.', code: 'rate_limited', retryAfter: 3600 }, 429, { 'Retry-After': '3600' })
    }

    const applicationId = crypto.randomUUID()
    let cvMetadata: Record<string, unknown> | null = null
    let uploadedPath = ''

    if (audience === 'candidate') {
      const cv = formData.get('cv')
      if (!(cv instanceof File) || cv.size === 0) throw new Error('Candidate CV is required.')
      const extension = extensionOf(cv.name)
      const mime = cvMime(extension)
      if (!mime || cv.size > MAX_CV_SIZE) throw new Error('CV must be PDF, DOC or DOCX and no larger than 5 MB.')

      uploadedPath = `applications/${applicationId}/${crypto.randomUUID()}.${extension}`
      const { error: uploadError } = await supabase.storage.from(CV_BUCKET).upload(uploadedPath, cv, {
        contentType: mime,
        cacheControl: '0',
        upsert: false,
      })
      if (uploadError) throw uploadError

      cvMetadata = {
        bucket: CV_BUCKET,
        storagePath: uploadedPath,
        name: cv.name.slice(0, 255),
        size: cv.size,
        type: mime,
        uploadedAt: new Date().toISOString(),
      }
    }

    const { error: insertError } = await supabase.from('applications').insert({
      id: applicationId,
      audience,
      status: 'new',
      source: 'secure-edge',
      locale: rawPayload.locale,
      fields,
      cv_metadata: cvMetadata,
      submitter_id: null,
      consent: true,
    })

    if (insertError) {
      if (uploadedPath) await supabase.storage.from(CV_BUCKET).remove([uploadedPath])
      throw insertError
    }

    await logAttempt({ audience, ip_hash: ipHash, contact_hash: contactHash, outcome: 'accepted' })
    return respond(origin, { ok: true, applicationId, mode: 'supabase' }, 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Application submission failed.'
    await logAttempt({ audience, ip_hash: ipHash, contact_hash: contactHash || null, outcome: 'server_failed', reason: message.slice(0, 500) })
    return respond(origin, { error: message, code: 'submission_failed' }, 400)
  }
})
