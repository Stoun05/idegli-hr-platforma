import { useEffect, useState } from 'react'
import AdminDashboard from './AdminDashboard.jsx'
import AdminLogin, { adminLoginCopy } from './AdminLogin.jsx'
import {
  getAdminRole,
  getValidAdminSession,
  isAllowedAdminSession,
  signInAdmin,
  signOutAdmin,
} from '../services/supabaseAuthService.js'
import {
  deleteRemoteApplication,
  fetchRemoteApplications,
  updateRemoteApplicationStatus,
} from '../services/supabaseAdminService.js'
import {
  createApplicationNote,
  deleteApplicationNote,
  fetchApplicationActivity,
} from '../services/supabaseActivityService.js'
import { deleteCandidateCv, downloadPrivateCv } from '../services/cvStorageService.js'

const EMPTY_ACTIVITY = {
  notesByApplication: {},
  eventsByApplication: {},
  deliveriesByApplication: {},
}

export default function AdminPortal({ lang, setLang }) {
  const [session, setSession] = useState(null)
  const [applications, setApplications] = useState([])
  const [activity, setActivity] = useState(EMPTY_ACTIVITY)
  const [isBooting, setIsBooting] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState('')

  const loadRemoteData = async (activeSession) => {
    setIsLoadingData(true)
    setError('')

    try {
      const [rows, nextActivity] = await Promise.all([
        fetchRemoteApplications(activeSession.accessToken),
        fetchApplicationActivity(activeSession.accessToken),
      ])
      setApplications(rows)
      setActivity(nextActivity)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Remote HR data could not be loaded.')
    } finally {
      setIsLoadingData(false)
    }
  }

  const refreshActivity = async (activeSession) => {
    const nextActivity = await fetchApplicationActivity(activeSession.accessToken)
    setActivity(nextActivity)
  }

  useEffect(() => {
    let cancelled = false

    const initialize = async () => {
      const storedSession = await getValidAdminSession()

      if (cancelled) return

      if (storedSession && isAllowedAdminSession(storedSession)) {
        setSession(storedSession)
        await loadRemoteData(storedSession)
      } else if (storedSession) {
        await signOutAdmin(storedSession)
      }

      if (!cancelled) setIsBooting(false)
    }

    initialize()

    return () => {
      cancelled = true
    }
  }, [])

  const handleLogin = async (email, password) => {
    setIsSubmitting(true)
    setError('')

    try {
      const nextSession = await signInAdmin(email, password)

      if (!isAllowedAdminSession(nextSession)) {
        await signOutAdmin(nextSession)
        setError(adminLoginCopy[lang].roleError)
        return
      }

      setSession(nextSession)
      await loadRemoteData(nextSession)
    } catch {
      setError(adminLoginCopy[lang].loginError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await signOutAdmin(session)
    setApplications([])
    setActivity(EMPTY_ACTIVITY)
    setSession(null)
    setError('')
  }

  const validSessionOrLogout = async () => {
    const activeSession = await getValidAdminSession()

    if (!activeSession || !isAllowedAdminSession(activeSession)) {
      await handleLogout()
      return null
    }

    setSession(activeSession)
    return activeSession
  }

  const handleRefresh = async () => {
    const activeSession = await validSessionOrLogout()
    if (activeSession) await loadRemoteData(activeSession)
  }

  const handleStatusChange = async (id, status) => {
    const activeSession = await validSessionOrLogout()
    if (!activeSession) return

    setIsLoadingData(true)
    setError('')

    try {
      await updateRemoteApplicationStatus(activeSession.accessToken, id, status)
      setApplications((current) => current.map((item) => item.id === id ? { ...item, status } : item))
      await refreshActivity(activeSession)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Status could not be updated.')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleAddNote = async (applicationId, body) => {
    const activeSession = await validSessionOrLogout()
    if (!activeSession) throw new Error('Admin session expired.')

    setIsLoadingData(true)
    setError('')

    try {
      await createApplicationNote(activeSession.accessToken, applicationId, body)
      await refreshActivity(activeSession)
    } catch (noteError) {
      const message = noteError instanceof Error ? noteError.message : 'HR note could not be saved.'
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    const activeSession = await validSessionOrLogout()
    if (!activeSession) throw new Error('Admin session expired.')

    setIsLoadingData(true)
    setError('')

    try {
      await deleteApplicationNote(activeSession.accessToken, noteId)
      await refreshActivity(activeSession)
    } catch (noteError) {
      const message = noteError instanceof Error ? noteError.message : 'HR note could not be deleted.'
      setError(message)
      throw new Error(message)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleDelete = async (id) => {
    const activeSession = await validSessionOrLogout()
    if (!activeSession) return

    setIsLoadingData(true)
    setError('')

    try {
      const record = applications.find((item) => item.id === id)

      if (record?.cv?.storagePath) {
        const cvDeleted = await deleteCandidateCv(record.cv.storagePath, activeSession.accessToken)
        if (!cvDeleted) throw new Error('CV file could not be deleted from private storage.')
      }

      await deleteRemoteApplication(activeSession.accessToken, id)
      setApplications((current) => current.filter((item) => item.id !== id))
      setActivity((current) => {
        const notesByApplication = { ...current.notesByApplication }
        const eventsByApplication = { ...current.eventsByApplication }
        const deliveriesByApplication = { ...current.deliveriesByApplication }
        delete notesByApplication[id]
        delete eventsByApplication[id]
        delete deliveriesByApplication[id]
        return { notesByApplication, eventsByApplication, deliveriesByApplication }
      })
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Application could not be deleted.')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleCvDownload = async (cv) => {
    const activeSession = await validSessionOrLogout()
    if (!activeSession) return

    setIsLoadingData(true)
    setError('')

    try {
      await downloadPrivateCv(activeSession.accessToken, cv)
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'CV could not be downloaded.')
    } finally {
      setIsLoadingData(false)
    }
  }

  if (isBooting) {
    return <div className="admin-auth-loading">IDEGLI / AUTH</div>
  }

  if (!session) {
    return (
      <AdminLogin
        lang={lang}
        setLang={setLang}
        onLogin={handleLogin}
        error={error}
        isSubmitting={isSubmitting}
      />
    )
  }

  return (
    <AdminDashboard
      lang={lang}
      setLang={setLang}
      mode="remote"
      applications={applications}
      activity={activity}
      remoteError={error}
      remoteBusy={isLoadingData}
      remoteUser={{
        email: session.user?.email || '',
        role: getAdminRole(session),
      }}
      onRefresh={handleRefresh}
      onStatusChange={handleStatusChange}
      onAddNote={handleAddNote}
      onDeleteNote={handleDeleteNote}
      onDelete={handleDelete}
      onCvDownload={handleCvDownload}
      onLogout={handleLogout}
    />
  )
}
