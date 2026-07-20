import { backendConfig, getBackendMode } from '../config/backend.js'
import { saveApplication as saveLocalApplication } from './applicationStore.js'
import { getValidPortalSession } from './portalAuthService.js'
import { submitSecureApplication } from './secureApplicationService.js'

function localApplication(application) {
  return {
    audience: application.audience,
    fields: application.fields,
    cv: application.cv || null,
  }
}

export async function submitApplication(application) {
  if (!backendConfig.hasSupabase) {
    const localRecord = saveLocalApplication(localApplication(application))

    return localRecord
      ? { ok: true, mode: 'local-demo', record: localRecord }
      : { ok: false, mode: 'local-demo', error: 'Local browser storage is unavailable.' }
  }

  if (!backendConfig.hasSecureSubmission) {
    return {
      ok: false,
      mode: 'supabase-configuration-error',
      error: 'Cloudflare Turnstile site key is missing.',
    }
  }

  try {
    const portalSession = await getValidPortalSession()
    const remoteRecord = await submitSecureApplication(application, portalSession)

    if (backendConfig.enableLocalAdminMirror) {
      saveLocalApplication(localApplication(application))
    }

    return { ok: true, mode: 'supabase', record: remoteRecord }
  } catch (error) {
    const backupRecord = saveLocalApplication(localApplication(application))

    return {
      ok: false,
      mode: 'supabase-error',
      backupSaved: Boolean(backupRecord),
      code: error?.code || '',
      retryAfter: Number(error?.retryAfter || 0),
      error: error instanceof Error ? error.message : 'Application submission failed.',
    }
  }
}

export function getApplicationBackendMode() {
  return getBackendMode()
}
