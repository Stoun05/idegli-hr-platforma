import { useEffect, useState } from 'react'
import '../portal.css'
import {
  clearPortalSession,
  completePortalPasswordRecovery,
  consumePortalAuthCallback,
} from '../services/portalAuthService.js'

const copy = {
  tm: {
    eyebrow: 'Paroly dikeltmek', title: 'Täze parol dörediň', text: 'E-poçtadaky recovery salgysy barlanandan soň täze parolyňyzy belläň.',
    password: 'Täze parol', confirm: 'Täze paroly gaýtalaň', submit: 'Paroly täzelemek', busy: 'Täzelenýär...',
    mismatch: 'Parollar gabat gelenok.', short: 'Parol iň az 8 nyşan bolmaly.', success: 'Parol üstünlikli täzelendi. Indi täze parol bilen giriş ediň.',
    login: 'Giriş sahypasyna geçmek', invalid: 'Recovery salgysy nädogry, möhleti geçen ýa-da öň ulanylan.', language: 'RU',
  },
  ru: {
    eyebrow: 'Восстановление пароля', title: 'Создайте новый пароль', text: 'После проверки recovery-ссылки из письма установите новый пароль.',
    password: 'Новый пароль', confirm: 'Повторите новый пароль', submit: 'Обновить пароль', busy: 'Обновляем...',
    mismatch: 'Пароли не совпадают.', short: 'Пароль должен содержать минимум 8 символов.', success: 'Пароль успешно обновлён. Войдите с новым паролем.',
    login: 'Перейти ко входу', invalid: 'Recovery-ссылка недействительна, истекла или уже использована.', language: 'TM',
  },
}

function portalUrl() {
  return `${window.location.origin}${import.meta.env.BASE_URL || '/'}#/portal`
}

export default function PortalRecoveryPage({ lang, setLang }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const t = copy[lang]

  useEffect(() => {
    let active = true

    consumePortalAuthCallback(['recovery'])
      .then((nextSession) => { if (active) setSession(nextSession) })
      .catch((callbackError) => { if (active) setError(callbackError instanceof Error ? callbackError.message : t.invalid) })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') || '')
    const confirmation = String(data.get('confirmation') || '')

    if (password.length < 8) return setError(t.short)
    if (password !== confirmation) return setError(t.mismatch)
    if (!session) return setError(t.invalid)

    setBusy(true)
    try {
      await completePortalPasswordRecovery(session, password)
      clearPortalSession()
      event.currentTarget.reset()
      setSuccess(true)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : t.invalid)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="portal-unavailable portal-recovery-shell">
      <div className="portal-unavailable-card portal-recovery-card">
        <div className="portal-recovery-header">
          <a className="portal-brand" href={portalUrl()}><span>I</span><strong>IDEGLI</strong></a>
          <button type="button" onClick={() => setLang(lang === 'tm' ? 'ru' : 'tm')}>{t.language}</button>
        </div>
        <span>{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{t.text}</p>

        {loading ? <div className="portal-confirmation">IDEGLI / AUTH…</div> : success ? (
          <div className="portal-recovery-success">
            <div className="portal-saved">{t.success}</div>
            <a className="portal-primary-button" href={portalUrl()}>{t.login}</a>
          </div>
        ) : (
          <form className="portal-recovery-form" onSubmit={submit}>
            <label><span>{t.password}</span><input required name="password" type="password" minLength="8" autoComplete="new-password" /></label>
            <label><span>{t.confirm}</span><input required name="confirmation" type="password" minLength="8" autoComplete="new-password" /></label>
            {error && <div className="portal-error" role="alert">{error || t.invalid}</div>}
            <button className="portal-primary-button" type="submit" disabled={busy || !session}>{busy ? t.busy : t.submit}</button>
          </form>
        )}
      </div>
    </main>
  )
}
