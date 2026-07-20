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

function normalizeProfile(row) {
  return {
    id: row.id,
    accountType: row.account_type,
    fullName: row.full_name || '',
    company: row.company || '',
    phone: row.phone || '',
    city: row.city || '',
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

export async function fetchPortalData(accessToken, userId) {
  const [profileResponse, applicationsResponse] = await Promise.all([
    fetch(
      `${backendConfig.supabaseUrl}/rest/v1/portal_profiles?id=eq.${encodeURIComponent(userId)}&select=*`,
      { headers: headers(accessToken) },
    ),
    fetch(
      `${backendConfig.supabaseUrl}/rest/v1/applications?owner_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc&limit=200`,
      { headers: headers(accessToken) },
    ),
  ])

  if (!profileResponse.ok) {
    throw new Error(await parseFailure(profileResponse, 'Portal profile could not be loaded.'))
  }

  if (!applicationsResponse.ok) {
    throw new Error(await parseFailure(applicationsResponse, 'Your applications could not be loaded.'))
  }

  const [profileRows, applicationRows] = await Promise.all([
    profileResponse.json(),
    applicationsResponse.json(),
  ])

  if (!profileRows[0]) {
    throw new Error('Portal profile is missing. Run portal_accounts.sql or contact IDEGLI support.')
  }

  return {
    profile: normalizeProfile(profileRows[0]),
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
  return normalizeProfile(rows[0])
}
