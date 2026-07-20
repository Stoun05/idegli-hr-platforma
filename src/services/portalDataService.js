import { backendConfig } from '../config/backend.js'

function headers(accessToken, extra = {}) {
  return {
    apikey: backendConfig.supabasePublishableKey,
    Authorization: `Bearer ${accessToken}`,
    ...extra,
  }
}

async function parseFailure(response, fallback) {
  const raw = await response.text()
  if (!raw) return fallback

  try {
    const payload = JSON.parse(raw)
    return payload.message || payload.details || payload.hint || raw
  } catch {
    return raw
  }
}

export function normalizePortalProfile(row) {
  return {
    id: row.id,
    accountType: row.account_type,
    fullName: row.full_name || '',
    company: row.company || '',
    phone: row.phone || '',
    city: row.city || '',
    candidateProfile: {
      role: row.candidate_role || '',
      experienceKey: row.candidate_experience_key || '',
      languages: row.candidate_languages || '',
      salary: row.candidate_salary || '',
      message: row.candidate_message || '',
      cv: row.candidate_cv_metadata || null,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function normalizeApplication(row) {
  return {
    id: row.id,
    audience: row.audience,
    status: row.status,
    locale: row.locale,
    fields: row.fields || {},
    cv: row.cv_metadata || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchPortalProfile(accessToken, userId) {
  const response = await fetch(
    `${backendConfig.supabaseUrl}/rest/v1/portal_profiles?id=eq.${encodeURIComponent(userId)}&select=*`,
    { headers: headers(accessToken) },
  )

  if (!response.ok) {
    throw new Error(await parseFailure(response, 'Portal profile could not be loaded.'))
  }

  const rows = await response.json()
  if (!rows[0]) {
    throw new Error('Portal profile is missing. Run portal_accounts.sql or contact IDEGLI support.')
  }

  return normalizePortalProfile(rows[0])
}

export async function fetchPortalData(accessToken, userId) {
  const [profile, applicationsResponse] = await Promise.all([
    fetchPortalProfile(accessToken, userId),
    fetch(
      `${backendConfig.supabaseUrl}/rest/v1/applications?owner_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc&limit=200`,
      { headers: headers(accessToken) },
    ),
  ])

  if (!applicationsResponse.ok) {
    throw new Error(await parseFailure(applicationsResponse, 'Your applications could not be loaded.'))
  }

  const applicationRows = await applicationsResponse.json()

  return {
    profile,
    applications: applicationRows.map(normalizeApplication),
  }
}

export async function updatePortalProfile(accessToken, userId, changes) {
  const response = await fetch(
    `${backendConfig.supabaseUrl}/rest/v1/portal_profiles?id=eq.${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: headers(accessToken, {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      }),
      body: JSON.stringify({
        full_name: changes.fullName.trim(),
        company: changes.company.trim() || null,
        phone: changes.phone.trim() || null,
        city: changes.city.trim() || null,
      }),
    },
  )

  if (!response.ok) {
    throw new Error(await parseFailure(response, 'Portal profile could not be updated.'))
  }

  const rows = await response.json()
  return normalizePortalProfile(rows[0])
}
