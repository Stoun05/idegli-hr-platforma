const normalizeUrl = (value = '') => value.trim().replace(/\/+$/, '')

const supabaseUrl = normalizeUrl(import.meta.env.VITE_SUPABASE_URL || '')
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim()
const turnstileSiteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim()
const enableLocalAdminMirror = String(import.meta.env.VITE_ENABLE_LOCAL_ADMIN_MIRROR || 'false') === 'true'

export const backendConfig = Object.freeze({
  supabaseUrl,
  supabasePublishableKey,
  turnstileSiteKey,
  enableLocalAdminMirror,
  hasSupabase: Boolean(supabaseUrl && supabasePublishableKey),
  hasTurnstile: Boolean(turnstileSiteKey),
  hasSecureSubmission: Boolean(supabaseUrl && supabasePublishableKey && turnstileSiteKey),
})

export function getBackendMode() {
  return backendConfig.hasSupabase ? 'supabase' : 'local-demo'
}
