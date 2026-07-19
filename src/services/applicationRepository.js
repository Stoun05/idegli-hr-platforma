import { backendConfig, getBackendMode } from '../config/backend.js'
import { saveApplication as saveLocalApplication } from './applicationStore.js'
import { deleteCandidateCv, uploadCandidateCv } from './cvStorageService.js'
import { submitSupabaseApplication } from './supabaseApplicationService.js'
import { getCandidateSubmitterSession } from './supabaseSubmitterAuthService.js'

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

  let submitterSession = null
  let uploadedCv = null

  try {
    let remoteApplication = application

    if (application.audience === 'candidate') {
      if (!application.cvFile) throw new Error('Candidate CV file is required.')

      submitterSession = await getCandidateSubmitterSession()
      uploadedCv = await uploadCandidateCv(application.cvFile, submitterSession)
      remoteApplication = {
        ...application,
        cv: uploadedCv,
        submitterId: submitterSession.user.id,
      }
    }

    const remoteRecord = await submitSupabaseApplication(
      remoteApplication,
      submitterSession?.accessToken || '',
    )

    if (backendConfig.enableLocalAdminMirror) {
      saveLocalApplication(localApplication(remoteApplication))
    }

    return { ok: true, mode: 'supabase', record: remoteRecord }
  } catch (error) {
    if (uploadedCv?.storagePath && submitterSession?.accessToken) {
      await deleteCandidateCv(uploadedCv.storagePath, submitterSession.accessToken).catch(() => false)
    }

    const backupRecord = saveLocalApplication(localApplication(application))

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
