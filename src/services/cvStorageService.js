import { backendConfig } from '../config/backend.js'

export const CV_BUCKET = 'candidate-cvs'

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/')
}

async function readFailure(response, fallback) {
  const raw = await response.text()
  if (!raw) return fallback

  try {
    const payload = JSON.parse(raw)
    return payload.message || payload.error || payload.statusCode || raw
  } catch {
    return raw
  }
}

export async function deleteCandidateCv(storagePath, accessToken) {
  if (!storagePath || !accessToken) return false

  const response = await fetch(`${backendConfig.supabaseUrl}/storage/v1/object/${CV_BUCKET}`, {
    method: 'DELETE',
    headers: {
      apikey: backendConfig.supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefixes: [storagePath] }),
  })

  return response.ok
}

export async function downloadPrivateCv(accessToken, cv) {
  if (!accessToken || !cv?.storagePath) throw new Error('CV storage path is missing.')

  const filename = cv.name || 'candidate-cv'
  const response = await fetch(
    `${backendConfig.supabaseUrl}/storage/v1/object/authenticated/${CV_BUCKET}/${encodePath(cv.storagePath)}?download=${encodeURIComponent(filename)}`,
    {
      headers: {
        apikey: backendConfig.supabasePublishableKey,
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(await readFailure(response, 'CV could not be downloaded.'))
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
