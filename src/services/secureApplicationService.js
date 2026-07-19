import { backendConfig } from '../config/backend.js'

async function readError(response) {
  const raw = await response.text()
  if (!raw) return { message: 'Application submission failed.', code: '' }

  try {
    const payload = JSON.parse(raw)
    return {
      message: payload.message || payload.error || 'Application submission failed.',
      code: payload.code || '',
      retryAfter: Number(payload.retryAfter || 0),
    }
  } catch {
    return { message: raw, code: '' }
  }
}

export async function submitSecureApplication(application) {
  if (!backendConfig.hasSupabase) throw new Error('Supabase is not configured.')
  if (!backendConfig.turnstileSiteKey) throw new Error('Turnstile site key is not configured.')
  if (!application.turnstileToken) throw new Error('Turnstile verification is required.')

  const formData = new FormData()
  formData.append('payload', JSON.stringify({
    audience: application.audience,
    locale: application.locale || 'tm',
    fields: application.fields,
    consent: true,
  }))
  formData.append('turnstileToken', application.turnstileToken)

  if (application.audience === 'candidate' && application.cvFile) {
    formData.append('cv', application.cvFile, application.cvFile.name)
  }

  const response = await fetch(`${backendConfig.supabaseUrl}/functions/v1/submit-application`, {
    method: 'POST',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
    },
    body: formData,
  })

  if (!response.ok) {
    const failure = await readError(response)
    const error = new Error(failure.message)
    error.code = failure.code
    error.retryAfter = failure.retryAfter
    throw error
  }

  return response.json()
}
