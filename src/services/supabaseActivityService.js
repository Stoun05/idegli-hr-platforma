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

function groupByApplication(rows, normalize) {
  return rows.reduce((groups, row) => {
    const item = normalize(row)
    const current = groups[item.applicationId] || []
    groups[item.applicationId] = [...current, item]
    return groups
  }, {})
}

function normalizeNote(row) {
  return {
    id: row.id,
    applicationId: row.application_id,
    body: row.body,
    authorId: row.created_by,
    authorEmail: row.created_by_email || '',
    authorRole: row.created_by_role || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function normalizeEvent(row) {
  return {
    id: row.id,
    applicationId: row.application_id,
    type: row.event_type,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    actorId: row.actor_id,
    actorEmail: row.actor_email || '',
    actorRole: row.actor_role || '',
    metadata: row.metadata || {},
    createdAt: row.created_at,
  }
}

export async function fetchApplicationActivity(accessToken) {
  const [notesResponse, eventsResponse] = await Promise.all([
    fetch(
      `${backendConfig.supabaseUrl}/rest/v1/application_notes?select=*&order=created_at.desc&limit=2000`,
      { headers: authHeaders(accessToken) },
    ),
    fetch(
      `${backendConfig.supabaseUrl}/rest/v1/application_events?select=*&order=created_at.desc&limit=5000`,
      { headers: authHeaders(accessToken) },
    ),
  ])

  if (!notesResponse.ok) {
    throw new Error(await parseFailure(notesResponse, 'HR notes could not be loaded.'))
  }

  if (!eventsResponse.ok) {
    throw new Error(await parseFailure(eventsResponse, 'Application history could not be loaded.'))
  }

  const [notes, events] = await Promise.all([notesResponse.json(), eventsResponse.json()])

  return {
    notesByApplication: groupByApplication(notes, normalizeNote),
    eventsByApplication: groupByApplication(events, normalizeEvent),
  }
}

export async function createApplicationNote(accessToken, applicationId, body) {
  const response = await fetch(`${backendConfig.supabaseUrl}/rest/v1/application_notes`, {
    method: 'POST',
    headers: authHeaders(accessToken, {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({ application_id: applicationId, body: body.trim() }),
  })

  if (!response.ok) {
    throw new Error(await parseFailure(response, 'HR note could not be saved.'))
  }

  const rows = await response.json()
  return normalizeNote(Array.isArray(rows) ? rows[0] : rows)
}

export async function deleteApplicationNote(accessToken, noteId) {
  const response = await fetch(
    `${backendConfig.supabaseUrl}/rest/v1/application_notes?id=eq.${encodeURIComponent(noteId)}`,
    {
      method: 'DELETE',
      headers: authHeaders(accessToken, { Prefer: 'return=minimal' }),
    },
  )

  if (!response.ok) {
    throw new Error(await parseFailure(response, 'HR note could not be deleted.'))
  }
}
