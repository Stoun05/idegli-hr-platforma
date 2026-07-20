import { backendConfig } from '../config/backend.js'

async function readFailure(response, fallback) {
  const raw = await response.text()
  if (!raw) return fallback

  try {
    const payload = JSON.parse(raw)
    return payload.message || payload.error || raw
  } catch {
    return raw
  }
}

function endpoint() {
  return `${backendConfig.supabaseUrl}/functions/v1/portal-profile`
}

export async function saveCandidateProfile(session, fields, cvFile = null) {
  if (!session?.accessToken) throw new Error('Portal login is required.')

  const formData = new FormData()
  formData.append('fields', JSON.stringify(fields))
  if (cvFile) formData.append('cv', cvFile, cvFile.name)

  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await readFailure(response, 'Candidate profile could not be saved.'))
  }

  const payload = await response.json()
  return payload.candidateProfile
}

export async function deleteCandidateProfileCv(session) {
  if (!session?.accessToken) throw new Error('Portal login is required.')

  const response = await fetch(endpoint(), {
    method: 'DELETE',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      Authorization: `Bearer ${session.accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(await readFailure(response, 'Candidate CV could not be removed.'))
  }

  const payload = await response.json()
  return payload.candidateProfile
}
