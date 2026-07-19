import { backendConfig } from '../config/backend.js'

function authHeaders(accessToken, extra = {}) {
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

function normalizeApplication(row) {
  return {
    id: row.id,
    audience: row.audience,
    status: row.status,
    source: row.source,
    locale: row.locale,
    fields: row.fields || {},
    cv: row.cv_metadata || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchRemoteApplications(accessToken) {
  const response = await fetch(
    `${backendConfig.supabaseUrl}/rest/v1/applications?select=*&order=created_at.desc&limit=500`,
    { headers: authHeaders(accessToken) },
  )

  if (!response.ok) {
    throw new Error(await parseFailure(response, 'Applications could not be loaded.'))
  }

  const rows = await response.json()
  return rows.map(normalizeApplication)
}

export async function updateRemoteApplicationStatus(accessToken, id, status) {
  const response = await fetch(
    `${backendConfig.supabaseUrl}/rest/v1/applications?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: authHeaders(accessToken, {
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      }),
      body: JSON.stringify({ status }),
    },
  )

  if (!response.ok) {
    throw new Error(await parseFailure(response, 'Application status could not be updated.'))
  }
}

export async function deleteRemoteApplication(accessToken, id) {
  const response = await fetch(
    `${backendConfig.supabaseUrl}/rest/v1/applications?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: authHeaders(accessToken, { Prefer: 'return=minimal' }),
    },
  )

  if (!response.ok) {
    throw new Error(await parseFailure(response, 'Application could not be deleted.'))
  }
}
