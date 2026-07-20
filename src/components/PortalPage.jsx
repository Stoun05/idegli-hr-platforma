import { useEffect, useState } from 'react'
import { backendConfig } from '../config/backend.js'
import { fetchPortalData, updatePortalProfile } from '../services/portalDataService.js'
import {
  getValidPortalSession,
  signInPortal,
  signOutPortal,
  signUpPortal,
} from '../services/portalAuthService.js'
import PortalAuth from './PortalAuth.jsx'
import PortalDashboard from './PortalDashboard.jsx'

const configurationCopy = {
  tm: {
    title: 'Şahsy kabinet entek sazlanmady',
    text: 'Supabase maglumatlary goşulandan we portal_accounts.sql işledilenden soň kandidat we iş beriji kabinetleri açylar.',
    back: 'Baş sahypa', language: 'RU',
  },
  ru: {
    title: 'Личный кабинет ещё не настроен',
    text: 'Кабинеты кандидата и работодателя откроются после подключения Supabase и запуска portal_accounts.sql.',
    back: 'На главную', language: 'TM',
  },
}

export default function PortalPage({ lang, setLang }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [booting, setBooting] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmationRequired, setConfirmationRequired] = useState(false)

  const loadPortalData = async (activeSession) => {
    const data = await fetchPortalData(activeSession.accessToken, activeSession.user.id)
    setProfile(data.profile)
    setApplications(data.applications)
  }

  useEffect(() => {
    let active = true

    const initialize = async () => {
      if (!backendConfig.hasSupabase) {
        if (active) setBooting(false)
        return
      }

      try {
        const storedSession = await getValidPortalSession()
        if (storedSession && active) {
          setSession(storedSession)
          await loadPortalData(storedSession)
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Portal could not be loaded.')
      } finally {
        if (active) setBooting(false)
      }
    }

    initialize()
    return () => { active = false }
  }, [])

  const login = async (email, password) => {
    setBusy(true)
    setError('')
    setConfirmationRequired(false)

    try {
      const nextSession = await signInPortal(email.trim(), password)
      await loadPortalData(nextSession)
      setSession(nextSession)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Portal login failed.')
    } finally {
      setBusy(false)
    }
  }

  const register = async (details) => {
    setBusy(true)
    setError('')
    setConfirmationRequired(false)

    try {
      const result = await signUpPortal({
        ...details,
        email: details.email.trim(),
        fullName: details.fullName.trim(),
        company: details.company.trim(),
      })

      if (result.session) {
        await loadPortalData(result.session)
        setSession(result.session)
      } else {
        setConfirmationRequired(true)
      }
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Portal registration failed.')
    } finally {
      setBusy(false)
    }
  }

  const refresh = async () => {
    setBusy(true)
    setError('')

    try {
      const activeSession = await getValidPortalSession()
      if (!activeSession) {
        setSession(null)
        setProfile(null)
        setApplications([])
        return
      }

      setSession(activeSession)
      await loadPortalData(activeSession)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Portal data could not be refreshed.')
    } finally {
      setBusy(false)
    }
  }

  const saveProfile = async (changes) => {
    setBusy(true)
    setError('')

    try {
      const activeSession = await getValidPortalSession()
      if (!activeSession) throw new Error('Portal session expired. Log in again.')
      const updated = await updatePortalProfile(activeSession.accessToken, activeSession.user.id, changes)
      setSession(activeSession)
      setProfile(updated)
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Portal profile could not be saved.'
      setError(message)
      throw new Error(message)
    } finally {
      setBusy(false)
    }
  }

  const logout = async () => {
    await signOutPortal(session)
    setSession(null)
    setProfile(null)
    setApplications([])
    setError('')
    setConfirmationRequired(false)
  }

  if (booting) return <div className="portal-loading">IDEGLI / PORTAL</div>

  if (!backendConfig.hasSupabase) {
    const t = configurationCopy[lang]
    return (
      <main className="portal-unavailable">
        <div className="portal-unavailable-card">
          <a className="portal-brand" href="#top"><span>I</span><strong>IDEGLI</strong></a>
          <span>PORTAL / CONFIG</span>
          <h1>{t.title}</h1>
          <p>{t.text}</p>
          <div>
            <button type="button" onClick={() => setLang(lang === 'tm' ? 'ru' : 'tm')}>{t.language}</button>
            <a href="#top">← {t.back}</a>
          </div>
        </div>
      </main>
    )
  }

  if (!session || !profile) {
    return (
      <PortalAuth
        lang={lang}
        setLang={setLang}
        onLogin={login}
        onRegister={register}
        busy={busy}
        error={error}
        confirmationRequired={confirmationRequired}
      />
    )
  }

  return (
    <PortalDashboard
      lang={lang}
      setLang={setLang}
      session={session}
      profile={profile}
      applications={applications}
      busy={busy}
      error={error}
      onRefresh={refresh}
      onSaveProfile={saveProfile}
      onLogout={logout}
    />
  )
}
