import { backendConfig } from '../config/backend.js'

const PORTAL_SESSION_KEY = 'idegli_supabase_portal_session_v1'

function readError(payload, fallback) {
  return payload?.error_description || payload?.msg || payload?.message || payload?.error || fallback
}

function authUrl(path, redirectTo = '') {
  const url = new URL(`${backendConfig.supabaseUrl}/auth/v1/${path}`)
  if (redirectTo) url.searchParams.set('redirect_to', redirectTo)
  return url.toString()
}

function portalRedirectUrl(flow) {
  const url = new URL(import.meta.env.BASE_URL || '/', window.location.origin)
  url.searchParams.set('portal', flow)
  return url.toString()
}

function persistSession(payload, previousSession = null) {
  const session = {
    accessToken: payload.access_token || previousSession?.accessToken || '',
    refreshToken: payload.refresh_token || previousSession?.refreshToken || '',
    expiresAt: payload.expires_at || Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600),
    tokenType: payload.token_type || previousSession?.tokenType || 'bearer',
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

async function authenticatePortal(email, password) {
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
  return payload
}

async function fetchPortalUser(accessToken) {
  const response = await fetch(`${backendConfig.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(readError(payload, 'Portal session could not be verified.'))
  return payload.user || payload
}

async function updatePortalUser(session, attributes, redirectFlow = '') {
  const response = await fetch(
    authUrl('user', redirectFlow ? portalRedirectUrl(redirectFlow) : ''),
    {
      method: 'PUT',
      headers: {
        apikey: backendConfig.supabasePublishableKey,
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attributes),
    },
  )

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(readError(payload, 'Portal account could not be updated.'))

  const user = payload.user || payload
  return {
    user,
    session: persistSession({ user }, session),
  }
}

function authFragment() {
  const raw = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  return new URLSearchParams(raw)
}

export async function signUpPortal({ email, password, fullName, accountType, company = '' }) {
  if (!backendConfig.hasSupabase) throw new Error('Supabase is not configured.')

  const response = await fetch(authUrl('signup', portalRedirectUrl('callback')), {
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
  return persistSession(await authenticatePortal(email, password))
}

export async function requestPortalPasswordReset(email) {
  if (!backendConfig.hasSupabase) throw new Error('Supabase is not configured.')

  const response = await fetch(authUrl('recover', portalRedirectUrl('recovery')), {
    method: 'POST',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(readError(payload, 'Password reset email could not be sent.'))
  return true
}

export async function consumePortalAuthCallback(expectedTypes = []) {
  if (!backendConfig.hasSupabase) throw new Error('Supabase is not configured.')

  const params = authFragment()
  const fragmentError = params.get('error_description') || params.get('error')
  if (fragmentError) throw new Error(fragmentError.replaceAll('+', ' '))

  const type = params.get('type') || ''
  if (expectedTypes.length && !expectedTypes.includes(type)) {
    throw new Error('This authentication link has the wrong type.')
  }

  const accessToken = params.get('access_token') || ''
  if (!accessToken) throw new Error('Authentication token is missing or expired.')

  const user = await fetchPortalUser(accessToken)
  return persistSession({
    access_token: accessToken,
    refresh_token: params.get('refresh_token') || '',
    expires_in: Number(params.get('expires_in') || 3600),
    expires_at: Number(params.get('expires_at') || 0) || undefined,
    token_type: params.get('token_type') || 'bearer',
    user,
  })
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

export async function requestPortalReauthentication(session) {
  const response = await fetch(`${backendConfig.supabaseUrl}/auth/v1/reauthenticate`, {
    method: 'GET',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      Authorization: `Bearer ${session.accessToken}`,
    },
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(readError(payload, 'Security code could not be sent.'))
  return true
}

export async function changePortalPassword(session, { currentPassword = '', newPassword, nonce = '' }) {
  const attributes = { password: newPassword }
  if (currentPassword) attributes.current_password = currentPassword
  if (nonce) attributes.nonce = nonce
  return updatePortalUser(session, attributes)
}

export async function completePortalPasswordRecovery(session, newPassword) {
  return updatePortalUser(session, { password: newPassword })
}

export async function changePortalEmail(session, { newEmail, currentPassword }) {
  const verifiedPayload = await authenticatePortal(session.user?.email || '', currentPassword)
  const verifiedSession = persistSession(verifiedPayload, session)
  return updatePortalUser(verifiedSession, { email: newEmail }, 'callback')
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
