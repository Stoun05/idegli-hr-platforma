import { backendConfig } from '../config/backend.js'

export const CV_BUCKET = 'candidate-cvs'

const MIME_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/')
}

function extensionOf(filename = '') {
  return filename.split('.').pop()?.toLowerCase() || ''
}

function uniqueId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
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

export async function uploadCandidateCv(file, session) {
  const extension = extensionOf(file?.name)
  const contentType = MIME_TYPES[extension]

  if (!file || !contentType || !session?.accessToken || !session?.user?.id) {
    throw new Error('CV upload data is incomplete.')
  }

  const storagePath = `anonymous/${session.user.id}/${uniqueId()}.${extension}`
  const response = await fetch(
    `${backendConfig.supabaseUrl}/storage/v1/object/${CV_BUCKET}/${encodePath(storagePath)}`,
    {
      method: 'POST',
      headers: {
        apikey: backendConfig.supabasePublishableKey,
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'x-upsert': 'false',
      },
      body: file,
    },
  )

  if (!response.ok) {
    throw new Error(await readFailure(response, 'CV could not be uploaded.'))
  }

  return {
    bucket: CV_BUCKET,
    storagePath,
    name: file.name,
    size: file.size,
    type: contentType,
    uploadedAt: new Date().toISOString(),
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
