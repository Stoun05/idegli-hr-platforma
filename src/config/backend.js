const normalizeUrl = (value = '') => value.trim().replace(/\/+$/, '')

const supabaseUrl = normalizeUrl(import.meta.env.VITE_SUPABASE_URL || '')
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim()
const enableLocalAdminMirror = String(import.meta.env.VITE_ENABLE_LOCAL_ADMIN_MIRROR || 'false') === 'true'

export const backendConfig = Object.freeze({
  supabaseUrl,
  supabasePublishableKey,
  enableLocalAdminMirror,
  hasSupabase: Boolean(supabaseUrl && supabasePublishableKey),
})

export function getBackendMode() {
  return backendConfig.hasSupabase ? 'supabase' : 'local-demo'
}
