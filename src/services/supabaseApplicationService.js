import { backendConfig } from '../config/backend.js'

function toDatabaseRecord(application) {
  return {
    audience: application.audience,
    status: 'new',
    source: 'github-pages',
    locale: application.locale || 'tm',
    fields: application.fields,
    cv_metadata: application.cv || null,
    consent: true,
  }
}

async function readErrorDetail(response) {
  const raw = await response.text()
  if (!raw) return ''

  try {
    const payload = JSON.parse(raw)
    return payload.message || payload.details || payload.hint || raw
  } catch {
    return raw
  }
}

export async function submitSupabaseApplication(application) {
  if (!backendConfig.hasSupabase) {
    throw new Error('Supabase is not configured.')
  }

  const response = await fetch(`${backendConfig.supabaseUrl}/rest/v1/applications`, {
    method: 'POST',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      Authorization: `Bearer ${backendConfig.supabasePublishableKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(toDatabaseRecord(application)),
  })

  if (!response.ok) {
    const detail = await readErrorDetail(response)
    throw new Error(detail || `Supabase request failed with status ${response.status}.`)
  }

  const rows = await response.json()
  return Array.isArray(rows) ? rows[0] : rows
}
