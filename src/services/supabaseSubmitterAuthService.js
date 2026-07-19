import { backendConfig } from '../config/backend.js'

const SESSION_KEY = 'idegli_supabase_submitter_session_v1'

function persistSession(payload, previousSession = null) {
  const session = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || previousSession?.refreshToken || '',
    expiresAt: payload.expires_at || Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600),
    user: payload.user || previousSession?.user || null,
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

async function refreshSession(session) {
  if (!session?.refreshToken) return null

  const response = await fetch(`${backendConfig.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  })

  if (!response.ok) {
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }

  return persistSession(await response.json(), session)
}

async function createAnonymousSession() {
  const response = await fetch(`${backendConfig.supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: { source: 'idegli-website' } }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token || !payload.user?.id) {
    throw new Error(payload.message || payload.msg || payload.error_description || 'Anonymous candidate session could not be created.')
  }

  return persistSession(payload)
}

export async function getCandidateSubmitterSession() {
  if (!backendConfig.hasSupabase) throw new Error('Supabase is not configured.')

  const stored = readStoredSession()
  if (stored?.accessToken && stored?.user?.id) {
    const expiresSoon = Number(stored.expiresAt || 0) <= Math.floor(Date.now() / 1000) + 60
    if (!expiresSoon) return stored

    const refreshed = await refreshSession(stored)
    if (refreshed) return refreshed
  }

  return createAnonymousSession()
}
