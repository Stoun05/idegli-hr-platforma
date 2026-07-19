const STORAGE_KEY = 'idegli_hr_applications_v1'

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('IDEGLI application storage could not be read.', error)
    return []
  }
}

function writeStorage(applications) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
    return true
  } catch (error) {
    console.error('IDEGLI application storage could not be updated.', error)
    return false
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getApplications() {
  return readStorage().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function saveApplication({ audience, fields, cv }) {
  const now = new Date().toISOString()
  const record = {
    id: createId(),
    audience,
    status: 'new',
    source: 'github-pages-demo',
    createdAt: now,
    updatedAt: now,
    fields,
    cv: cv
      ? {
          name: cv.name,
          size: cv.size,
          type: cv.type,
        }
      : null,
  }

  const applications = [record, ...readStorage()]
  return writeStorage(applications) ? record : null
}

export function updateApplicationStatus(id, status) {
  const now = new Date().toISOString()
  const applications = readStorage().map((application) =>
    application.id === id
      ? { ...application, status, updatedAt: now }
      : application,
  )

  return writeStorage(applications)
}

export function removeApplication(id) {
  const applications = readStorage().filter((application) => application.id !== id)
  return writeStorage(applications)
}

export function clearApplications() {
  return writeStorage([])
}

export function getStorageKey() {
  return STORAGE_KEY
}
