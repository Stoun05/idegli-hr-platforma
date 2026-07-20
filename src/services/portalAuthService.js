import { backendConfig } from '../config/backend.js'

const PORTAL_SESSION_KEY = 'idegli_supabase_portal_session_v1'

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

  window.localStorage.setItem(PORTAL_SESSION_KEY, JSON.stringify(session))
  return session
}

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(PORTAL_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function signUpPortal({ email, password, fullName, accountType, company = '' }) {
  if (!backendConfig.hasSupabase) throw new Error('Supabase is not configured.')

  const response = await fetch(`${backendConfig.supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      data: {
        full_name: fullName,
        account_type: accountType,
        company: accountType === 'employer' ? company : '',
      },
    }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(readError(payload, 'Portal registration failed.'))

  if (payload.access_token) {
    return { session: persistSession(payload), confirmationRequired: false }
  }

  return {
    session: null,
    confirmationRequired: true,
    user: payload.user || null,
  }
}

export async function signInPortal(email, password) {
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
  if (!response.ok) throw new Error(readError(payload, 'Portal login failed.'))

  return persistSession(payload)
}

export async function refreshPortalSession(session) {
  if (!session?.refreshToken || !backendConfig.hasSupabase) return null

  const response = await fetch(`${backendConfig.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  })

  if (!response.ok) {
    clearPortalSession()
    return null
  }

  return persistSession(await response.json(), session)
}

export async function getValidPortalSession() {
  const session = readStoredSession()
  if (!session?.accessToken) return null

  const expiresSoon = Number(session.expiresAt || 0) <= Math.floor(Date.now() / 1000) + 60
  if (!expiresSoon) return session

  return refreshPortalSession(session)
}

export function clearPortalSession() {
  window.localStorage.removeItem(PORTAL_SESSION_KEY)
}

export async function signOutPortal(session) {
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
    clearPortalSession()
  }
}
