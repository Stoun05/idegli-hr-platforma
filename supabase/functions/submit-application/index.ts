import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const TURNSTILE_SECRET = Deno.env.get('TURNSTILE_SECRET_KEY') || ''
const RATE_LIMIT_PEPPER = Deno.env.get('RATE_LIMIT_PEPPER') || ''
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_SITE_ORIGINS') || 'https://stoun05.github.io,http://localhost:5173').split(',').map((v) => v.trim()).filter(Boolean)
const ALLOWED_HOSTNAMES = (Deno.env.get('TURNSTILE_ALLOWED_HOSTNAMES') || 'stoun05.github.io,localhost').split(',').map((v) => v.trim().toLowerCase()).filter(Boolean)
const IP_LIMIT = Number(Deno.env.get('IP_LIMIT_PER_HOUR') || 8)
const CONTACT_LIMIT = Number(Deno.env.get('CONTACT_LIMIT_PER_DAY') || 3)
const MAX_CV_SIZE = 5 * 1024 * 1024
const CV_BUCKET = 'candidate-cvs'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } })
const candidateKeys = ['name', 'phone', 'email', 'city', 'role', 'experience', 'languages', 'salary', 'message']
const employerKeys = ['name', 'phone', 'email', 'company', 'industry', 'contactRole', 'website', 'vacancy', 'headcount', 'location', 'workType', 'requiredExperience', 'employmentType', 'salaryFrom', 'salaryTo', 'startDate', 'deadline', 'responsibilities', 'requirements', 'offer', 'message', 'confidential']

class PublicError extends Error {
  code: string
  status: number
  constructor(message: string, code = 'validation_failed', status = 400) {
    super(message)
    this.code = code
    this.status = status
  }
}

function cors(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function reply(origin: string, body: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(origin), 'Content-Type': 'application/json; charset=utf-8', ...extra } })
}

function requestOrigin(request: Request) {
  const origin = request.headers.get('origin') || ''
  return ALLOWED_ORIGINS.includes(origin) ? origin : ''
}

function requestIp(request: Request) {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(`${RATE_LIMIT_PEPPER}:${value.trim().toLowerCase()}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function sanitizeFields(audience: 'candidate' | 'employer', source: unknown) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new PublicError('Form data is invalid.')
  const allowed = audience === 'candidate' ? candidateKeys : employerKeys
  const input = source as Record<string, unknown>
  const fields: Record<string, string | boolean> = {}

  for (const key of allowed) {
    const value = input[key]
    if (key === 'confidential') {
      fields[key] = value === true || value === 'true'
    } else if (value != null) {
      const text = String(value).trim()
      if (text.length > 4000) throw new PublicError('One or more fields are too long.')
      fields[key] = text
    }
  }

  const required = audience === 'candidate'
    ? ['name', 'phone', 'email', 'city', 'role', 'experience', 'languages']
    : ['name', 'phone', 'email', 'company', 'vacancy', 'headcount', 'location', 'workType', 'requiredExperience', 'employmentType']

  if (required.some((key) => !fields[key])) throw new PublicError('Complete all required fields.')
  const email = String(fields.email || '')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new PublicError('Enter a valid email address.')
  if (String(fields.phone || '').length > 50) throw new PublicError('Enter a valid phone number.')
  return fields
}

async function verifyTurnstile(token: string, ip: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: ip, idempotency_key: crypto.randomUUID() }),
      signal: controller.signal,
    })
    const result = await response.json()
    const hostname = String(result.hostname || '').toLowerCase()
    return response.ok && result.success === true && result.action === 'idegli_application' && (!hostname || ALLOWED_HOSTNAMES.includes(hostname))
  } finally {
    clearTimeout(timeout)
  }
}

async function attemptCount(column: 'ip_hash' | 'contact_hash', hash: string, since: Date) {
  const { count, error } = await supabase.from('submission_attempts').select('id', { count: 'exact', head: true }).eq(column, hash).gte('created_at', since.toISOString())
  if (error) throw error
  return count || 0
}

async function logAttempt(data: Record<string, unknown>) {
  const { error } = await supabase.from('submission_attempts').insert(data)
  if (error) console.error('submission attempt log failed', error)
}

Deno.serve(async (request) => {
  const origin = requestOrigin(request)
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors(origin || ALLOWED_ORIGINS[0] || '*') })
  if (!origin) return reply(ALLOWED_ORIGINS[0] || '*', { error: 'Origin is not allowed.', code: 'origin_denied' }, 403)
  if (request.method !== 'POST') return reply(origin, { error: 'Method not allowed.' }, 405)
  if (!SUPABASE_URL || !SERVICE_KEY || !TURNSTILE_SECRET || !RATE_LIMIT_PEPPER) return reply(origin, { error: 'Secure submission service is not configured.', code: 'configuration_error' }, 503)

  const ipHash = await sha256(`ip:${requestIp(request)}`)
  let contactHash = ''
  let audience: 'candidate' | 'employer' | null = null
  let uploadedPath = ''

  try {
    const formData = await request.formData()
    const token = String(formData.get('turnstileToken') || '')
    const payload = JSON.parse(String(formData.get('payload') || '{}'))
    audience = payload.audience === 'candidate' || payload.audience === 'employer' ? payload.audience : null
    if (!audience || !payload.consent || !['tm', 'ru'].includes(payload.locale)) throw new PublicError('Form data is invalid.')

    const fields = sanitizeFields(audience, payload.fields)
    contactHash = await sha256(`contact:${String(fields.email)}:${String(fields.phone)}`)
    if (!token || token.length > 2048) throw new PublicError('Complete the security check.', 'captcha_required')
    if (!await verifyTurnstile(token, requestIp(request))) throw new PublicError('Security verification expired or failed. Try again.', 'captcha_failed')

    const [ipCount, contactCount] = await Promise.all([
      attemptCount('ip_hash', ipHash, new Date(Date.now() - 60 * 60 * 1000)),
      attemptCount('contact_hash', contactHash, new Date(Date.now() - 24 * 60 * 60 * 1000)),
    ])

    if (ipCount >= IP_LIMIT || contactCount >= CONTACT_LIMIT) {
      await logAttempt({ audience, ip_hash: ipHash, contact_hash: contactHash, outcome: 'rate_limited', reason: ipCount >= IP_LIMIT ? 'ip_hourly' : 'contact_daily' })
      return reply(origin, { error: 'Too many applications. Try again later.', code: 'rate_limited', retryAfter: 3600 }, 429, { 'Retry-After': '3600' })
    }

    const applicationId = crypto.randomUUID()
    let cvMetadata: Record<string, unknown> | null = null

    if (audience === 'candidate') {
      const cv = formData.get('cv')
      if (!(cv instanceof File) || cv.size === 0) throw new PublicError('Candidate CV is required.')
      const extension = cv.name.split('.').pop()?.toLowerCase() || ''
      const mime = ({ pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } as Record<string, string>)[extension]
      if (!mime || cv.size > MAX_CV_SIZE) throw new PublicError('CV must be PDF, DOC or DOCX and no larger than 5 MB.')

      uploadedPath = `applications/${applicationId}/${crypto.randomUUID()}.${extension}`
      const { error } = await supabase.storage.from(CV_BUCKET).upload(uploadedPath, cv, { contentType: mime, cacheControl: '0', upsert: false })
      if (error) throw error
      cvMetadata = { bucket: CV_BUCKET, storagePath: uploadedPath, name: cv.name.slice(0, 255), size: cv.size, type: mime, uploadedAt: new Date().toISOString() }
    }

    const { error } = await supabase.from('applications').insert({
      id: applicationId, audience, status: 'new', source: 'secure-edge', locale: payload.locale,
      fields, cv_metadata: cvMetadata, submitter_id: null, consent: true,
    })
    if (error) throw error

    await logAttempt({ audience, ip_hash: ipHash, contact_hash: contactHash, outcome: 'accepted' })
    return reply(origin, { ok: true, applicationId, mode: 'supabase' }, 201)
  } catch (error) {
    if (uploadedPath) await supabase.storage.from(CV_BUCKET).remove([uploadedPath]).catch(() => null)
    const isPublic = error instanceof PublicError
    const message = error instanceof Error ? error.message : 'Unknown submission error'
    console.error('secure application submission failed', error)
    await logAttempt({
      audience,
      ip_hash: ipHash,
      contact_hash: contactHash || null,
      outcome: isPublic && (error as PublicError).code.startsWith('captcha') ? 'captcha_failed' : isPublic ? 'validation_failed' : 'server_failed',
      reason: isPublic ? (error as PublicError).code : 'internal_error',
    })
    return reply(origin, {
      error: isPublic ? message : 'The application could not be submitted. Try again later.',
      code: isPublic ? (error as PublicError).code : 'submission_failed',
    }, isPublic ? (error as PublicError).status : 500)
  }
})
