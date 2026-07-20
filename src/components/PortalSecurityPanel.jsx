import { useState } from 'react'
import '../portal-security.css'

const copy = {
  tm: {
    title: 'Hasap howpsuzlygy', password: 'Paroly üýtgetmek', email: 'E-poçtany üýtgetmek',
    currentPassword: 'Häzirki parol', newPassword: 'Täze parol', confirmPassword: 'Täze paroly gaýtalaň',
    nonce: 'E-poçta arkaly gelen 6 belgili kod', sendCode: 'Howpsuzlyk koduny ibermek', codeSent: 'Kod e-poçta iberildi.',
    savePassword: 'Paroly täzelemek', passwordSaved: 'Parol üstünlikli täzelendi.',
    newEmail: 'Täze e-poçta', saveEmail: 'E-poçtany üýtgetmek',
    emailSent: 'Tassyklama haty iberildi. Supabase sazlamasyna görä köne we täze e-poçtany tassyklamak gerek bolup biler.',
    mismatch: 'Täze parollar gabat gelenok.', short: 'Täze parol iň az 8 nyşan bolmaly.',
    sameEmail: 'Täze e-poçta häzirki e-poçtadan tapawutly bolmaly.', busy: 'Garaşyň...', optional: 'Secure password change açyk bolsa kod gerek bolar.',
  },
  ru: {
    title: 'Безопасность аккаунта', password: 'Изменить пароль', email: 'Изменить email',
    currentPassword: 'Текущий пароль', newPassword: 'Новый пароль', confirmPassword: 'Повторите новый пароль',
    nonce: '6-значный код из письма', sendCode: 'Отправить код безопасности', codeSent: 'Код отправлен на email.',
    savePassword: 'Обновить пароль', passwordSaved: 'Пароль успешно обновлён.',
    newEmail: 'Новый email', saveEmail: 'Изменить email',
    emailSent: 'Письмо подтверждения отправлено. В зависимости от настроек Supabase может потребоваться подтверждение старого и нового адреса.',
    mismatch: 'Новые пароли не совпадают.', short: 'Новый пароль должен содержать минимум 8 символов.',
    sameEmail: 'Новый email должен отличаться от текущего.', busy: 'Подождите...', optional: 'Код нужен, если включён Secure password change.',
  },
}

export default function PortalSecurityPanel({ lang, email, busy, onChangePassword, onChangeEmail, onSendNonce }) {
  const [passwordMessage, setPasswordMessage] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [localError, setLocalError] = useState('')
  const t = copy[lang]

  const submitPassword = async (event) => {
    event.preventDefault()
    setLocalError('')
    setPasswordMessage('')
    const data = new FormData(event.currentTarget)
    const currentPassword = String(data.get('currentPassword') || '')
    const newPassword = String(data.get('newPassword') || '')
    const confirmPassword = String(data.get('confirmPassword') || '')
    const nonce = String(data.get('nonce') || '')

    if (newPassword.length < 8) return setLocalError(t.short)
    if (newPassword !== confirmPassword) return setLocalError(t.mismatch)

    try {
      await onChangePassword?.({ currentPassword, newPassword, nonce })
      event.currentTarget.reset()
      setPasswordMessage(t.passwordSaved)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Password update failed.')
    }
  }

  const submitEmail = async (event) => {
    event.preventDefault()
    setLocalError('')
    setEmailMessage('')
    const data = new FormData(event.currentTarget)
    const newEmail = String(data.get('newEmail') || '').trim()
    const currentPassword = String(data.get('emailCurrentPassword') || '')
    if (newEmail.toLowerCase() === String(email || '').toLowerCase()) return setLocalError(t.sameEmail)

    try {
      await onChangeEmail?.({ newEmail, currentPassword })
      event.currentTarget.reset()
      setEmailMessage(t.emailSent)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Email update failed.')
    }
  }

  const sendNonce = async () => {
    setLocalError('')
    try {
      await onSendNonce?.()
      setPasswordMessage(t.codeSent)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Security code could not be sent.')
    }
  }

  return (
    <section className="portal-security-card">
      <div className="portal-section-heading"><h2>{t.title}</h2><span>AUTH</span></div>

      <details open>
        <summary>{t.password}</summary>
        <form onSubmit={submitPassword}>
          <label><span>{t.currentPassword}</span><input required name="currentPassword" type="password" autoComplete="current-password" /></label>
          <label><span>{t.newPassword}</span><input required name="newPassword" type="password" minLength="8" autoComplete="new-password" /></label>
          <label><span>{t.confirmPassword}</span><input required name="confirmPassword" type="password" minLength="8" autoComplete="new-password" /></label>
          <label><span>{t.nonce}</span><input name="nonce" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" /><small>{t.optional}</small></label>
          <button className="portal-secondary-button" type="button" disabled={busy} onClick={sendNonce}>{t.sendCode}</button>
          <button className="portal-primary-button" type="submit" disabled={busy}>{busy ? t.busy : t.savePassword}</button>
        </form>
      </details>

      <details>
        <summary>{t.email}</summary>
        <form onSubmit={submitEmail}>
          <label><span>{t.newEmail}</span><input required name="newEmail" type="email" autoComplete="email" /></label>
          <label><span>{t.currentPassword}</span><input required name="emailCurrentPassword" type="password" autoComplete="current-password" /></label>
          <button className="portal-primary-button" type="submit" disabled={busy}>{busy ? t.busy : t.saveEmail}</button>
        </form>
      </details>

      {localError && <div className="portal-error" role="alert">{localError}</div>}
      {passwordMessage && <div className="portal-saved" role="status">{passwordMessage}</div>}
      {emailMessage && <div className="portal-confirmation" role="status">{emailMessage}</div>}
    </section>
  )
}
