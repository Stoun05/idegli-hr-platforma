import { backendConfig, getBackendMode } from '../config/backend.js'
import { saveApplication as saveLocalApplication } from './applicationStore.js'
import { submitSupabaseApplication } from './supabaseApplicationService.js'

export async function submitApplication(application) {
  if (!backendConfig.hasSupabase) {
    const localRecord = saveLocalApplication(application)

    return localRecord
      ? { ok: true, mode: 'local-demo', record: localRecord }
      : { ok: false, mode: 'local-demo', error: 'Local browser storage is unavailable.' }
  }

  try {
    const remoteRecord = await submitSupabaseApplication(application)

    if (backendConfig.enableLocalAdminMirror) {
      saveLocalApplication(application)
    }

    return { ok: true, mode: 'supabase', record: remoteRecord }
  } catch (error) {
    const backupRecord = saveLocalApplication(application)

    return {
      ok: false,
      mode: 'supabase-error',
      backupSaved: Boolean(backupRecord),
      error: error instanceof Error ? error.message : 'Application submission failed.',
    }
  }
}

export function getApplicationBackendMode() {
  return getBackendMode()
}
