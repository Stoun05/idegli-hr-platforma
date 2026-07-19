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
import { downloadPrivateCv } from '../services/cvStorageService.js'

export default function AdminPortal({ lang, setLang }) {
  const [session, setSession] = useState(null)
  const [applications, setApplications] = useState([])
  const [isBooting, setIsBooting] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [error, setError] = useState('')

  const loadApplications = async (activeSession) => {
    setIsLoadingData(true)
    setError('')

    try {
      const rows = await fetchRemoteApplications(activeSession.accessToken)
      setApplications(rows)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Applications could not be loaded.')
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const initialize = async () => {
      const storedSession = await getValidAdminSession()

      if (cancelled) return

      if (storedSession && isAllowedAdminSession(storedSession)) {
        setSession(storedSession)
        await loadApplications(storedSession)
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
      await loadApplications(nextSession)
    } catch {
      setError(adminLoginCopy[lang].loginError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await signOutAdmin(session)
    setApplications([])
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
    if (activeSession) await loadApplications(activeSession)
  }

  const handleStatusChange = async (id, status) => {
    const activeSession = await validSessionOrLogout()
    if (!activeSession) return

    setIsLoadingData(true)
    setError('')

    try {
      await updateRemoteApplicationStatus(activeSession.accessToken, id, status)
      setApplications((current) => current.map((item) => item.id === id ? { ...item, status } : item))
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Status could not be updated.')
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
      await deleteRemoteApplication(activeSession.accessToken, id)
      setApplications((current) => current.filter((item) => item.id !== id))
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
      remoteError={error}
      remoteBusy={isLoadingData}
      remoteUser={{
        email: session.user?.email || '',
        role: getAdminRole(session),
      }}
      onRefresh={handleRefresh}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
      onCvDownload={handleCvDownload}
      onLogout={handleLogout}
    />
  )
}
