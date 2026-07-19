import { backendConfig } from '../config/backend.js'

const ADMIN_SESSION_KEY = 'idegli_supabase_admin_session_v1'
const ALLOWED_ROLES = new Set(['admin', 'hr'])

function readError(payload, fallback) {
  return payload?.error_description || payload?.msg || payload?.message || payload?.error || fallback
}

function persistSession(payload, previousSession = null) {
  const session = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || previousSession?.refreshToken || '',
    expiresAt: payload.expires_at || Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600),
    tokenType: payload.token_type || 'bearer',
    user: payload.user || previousSession?.user || null,
  }

  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session))
  return session
}

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getAdminRole(session) {
  return session?.user?.app_metadata?.role || ''
}

export function isAllowedAdminSession(session) {
  return ALLOWED_ROLES.has(getAdminRole(session))
}

export async function signInAdmin(email, password) {
  if (!backendConfig.hasSupabase) throw new Error('Supabase is not configured.')

  const response = await fetch(`${backendConfig.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(readError(payload, 'Admin login failed.'))

  return persistSession(payload)
}

export async function refreshAdminSession(session) {
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
    clearAdminSession()
    return null
  }

  const payload = await response.json()
  return persistSession(payload, session)
}

export async function getValidAdminSession() {
  const session = readStoredSession()
  if (!session?.accessToken) return null

  const expiresSoon = Number(session.expiresAt || 0) <= Math.floor(Date.now() / 1000) + 60
  if (!expiresSoon) return session

  return refreshAdminSession(session)
}

export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_SESSION_KEY)
}

export async function signOutAdmin(session) {
  try {
    if (session?.accessToken && backendConfig.hasSupabase) {
      await fetch(`${backendConfig.supabaseUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          apikey: backendConfig.supabasePublishableKey,
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
    }
  } finally {
    clearAdminSession()
  }
}
