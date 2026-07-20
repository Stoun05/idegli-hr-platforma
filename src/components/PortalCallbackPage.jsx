import { useEffect, useState } from 'react'
import '../portal.css'
import { consumePortalAuthCallback } from '../services/portalAuthService.js'

const copy = {
  tm: {
    title: 'Hasap tassyklanýar', text: 'Supabase Auth salgysy barlanýar we şahsy kabinet açylýar.',
    error: 'Tassyklama salgysy nädogry, möhleti geçen ýa-da öň ulanylan.', login: 'Kabinete geçmek', language: 'RU',
  },
  ru: {
    title: 'Подтверждаем аккаунт', text: 'Проверяем ссылку Supabase Auth и открываем личный кабинет.',
    error: 'Ссылка подтверждения недействительна, истекла или уже использована.', login: 'Перейти в кабинет', language: 'TM',
  },
}

function portalUrl() {
  return `${window.location.origin}${import.meta.env.BASE_URL || '/'}#/portal`
}

export default function PortalCallbackPage({ lang, setLang }) {
  const [error, setError] = useState('')
  const t = copy[lang]

  useEffect(() => {
    let active = true

    consumePortalAuthCallback(['signup', 'email_change'])
      .then(() => {
        if (active) window.location.replace(portalUrl())
      })
      .catch((callbackError) => {
        if (active) setError(callbackError instanceof Error ? callbackError.message : t.error)
      })

    return () => { active = false }
  }, [])

  return (
    <main className="portal-unavailable portal-recovery-shell">
      <div className="portal-unavailable-card portal-recovery-card">
        <div className="portal-recovery-header">
          <a className="portal-brand" href={portalUrl()}><span>I</span><strong>IDEGLI</strong></a>
          <button type="button" onClick={() => setLang(lang === 'tm' ? 'ru' : 'tm')}>{t.language}</button>
        </div>
        <span>AUTH / CALLBACK</span>
        <h1>{t.title}</h1>
        <p>{t.text}</p>
        {error ? (
          <div className="portal-recovery-success">
            <div className="portal-error" role="alert">{error || t.error}</div>
            <a className="portal-primary-button" href={portalUrl()}>{t.login}</a>
          </div>
        ) : <div className="portal-confirmation">IDEGLI / AUTH…</div>}
      </div>
    </main>
  )
}
