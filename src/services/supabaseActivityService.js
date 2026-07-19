import { backendConfig } from '../config/backend.js'

function authHeaders(accessToken, extra = {}) {
  return {
    apikey: backendConfig.supabasePublishableKey,
    Authorization: `Bearer ${accessToken}`,
    ...extra,
  }
}

async function responseFailure(response, fallback) {
  const raw = await response.text()
  if (!raw) return { message: fallback, raw: '' }

  try {
    const payload = JSON.parse(raw)
    return {
      message: payload.message || payload.details || payload.hint || fallback,
      code: payload.code || '',
      raw,
    }
  } catch {
    return { message: raw || fallback, raw }
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

function normalizeDelivery(row) {
  return {
    id: row.id,
    eventId: row.event_id,
    applicationId: row.application_id,
    eventType: row.event_type,
    channel: row.channel,
    recipient: row.recipient,
    status: row.status,
    attempts: row.attempts,
    providerMessageId: row.provider_message_id || '',
    errorMessage: row.error_message || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sentAt: row.sent_at,
  }
}

async function optionalNotificationRows(response) {
  if (response.ok) return response.json()

  const failure = await responseFailure(response, 'Notification deliveries could not be loaded.')
  const tableMissing = failure.code === '42P01'
    || failure.code === 'PGRST205'
    || failure.raw.includes('notification_deliveries') && failure.raw.includes('does not exist')

  if (tableMissing) return []
  throw new Error(failure.message)
}

export async function fetchApplicationActivity(accessToken) {
  const [notesResponse, eventsResponse, deliveriesResponse] = await Promise.all([
    fetch(
      `${backendConfig.supabaseUrl}/rest/v1/application_notes?select=*&order=created_at.desc&limit=2000`,
      { headers: authHeaders(accessToken) },
    ),
    fetch(
      `${backendConfig.supabaseUrl}/rest/v1/application_events?select=*&order=created_at.desc&limit=5000`,
      { headers: authHeaders(accessToken) },
    ),
    fetch(
      `${backendConfig.supabaseUrl}/rest/v1/notification_deliveries?select=*&order=created_at.desc&limit=5000`,
      { headers: authHeaders(accessToken) },
    ),
  ])

  if (!notesResponse.ok) {
    const failure = await responseFailure(notesResponse, 'HR notes could not be loaded.')
    throw new Error(failure.message)
  }

  if (!eventsResponse.ok) {
    const failure = await responseFailure(eventsResponse, 'Application history could not be loaded.')
    throw new Error(failure.message)
  }

  const [notes, events, deliveries] = await Promise.all([
    notesResponse.json(),
    eventsResponse.json(),
    optionalNotificationRows(deliveriesResponse),
  ])

  return {
    notesByApplication: groupByApplication(notes, normalizeNote),
    eventsByApplication: groupByApplication(events, normalizeEvent),
    deliveriesByApplication: groupByApplication(deliveries, normalizeDelivery),
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
    const failure = await responseFailure(response, 'HR note could not be saved.')
    throw new Error(failure.message)
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
    const failure = await responseFailure(response, 'HR note could not be deleted.')
    throw new Error(failure.message)
  }
}
