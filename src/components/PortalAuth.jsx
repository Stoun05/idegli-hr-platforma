import { useState } from 'react'
import '../portal.css'

const copy = {
  tm: {
    eyebrow: 'Şahsy kabinet',
    title: 'Karýeraňyzy ýa-da işgär gözlegiňizi bir ýerden dolandyryň',
    text: 'Kandidat öz arzalaryny, iş beriji bolsa kompaniýa sargytlaryny diňe öz kabinetinde görýär.',
    login: 'Giriş', register: 'Registrasiýa', email: 'E-poçta', password: 'Parol',
    fullName: 'Ady we familiýasy', company: 'Kompaniýanyň ady', accountType: 'Hasap görnüşi',
    candidate: 'Kandidat', employer: 'Iş beriji', submitLogin: 'Kabinete girmek', submitRegister: 'Hasap döretmek',
    busy: 'Garaşyň...', passwordHint: 'Iň az 8 nyşan', back: 'Baş sahypa', language: 'RU',
    confirmationTitle: 'E-poçtaňyzy tassyklaň',
    confirmationText: 'Registrasiýa kabul edildi. Supabase tarapyndan iberilen tassyklama salgysyny açyp, soň giriş ediň.',
  },
  ru: {
    eyebrow: 'Личный кабинет',
    title: 'Управляйте карьерой или подбором сотрудников в одном месте',
    text: 'Кандидат видит только свои отклики, а работодатель — только заявки своей компании.',
    login: 'Вход', register: 'Регистрация', email: 'Email', password: 'Пароль',
    fullName: 'Имя и фамилия', company: 'Название компании', accountType: 'Тип аккаунта',
    candidate: 'Кандидат', employer: 'Работодатель', submitLogin: 'Войти в кабинет', submitRegister: 'Создать аккаунт',
    busy: 'Подождите...', passwordHint: 'Минимум 8 символов', back: 'На главную', language: 'TM',
    confirmationTitle: 'Подтвердите email',
    confirmationText: 'Регистрация принята. Откройте ссылку подтверждения от Supabase, затем войдите в кабинет.',
  },
}

export default function PortalAuth({ lang, setLang, onLogin, onRegister, busy, error, confirmationRequired }) {
  const [mode, setMode] = useState('login')
  const [accountType, setAccountType] = useState('candidate')
  const t = copy[lang]

  const submit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    if (mode === 'login') {
      await onLogin?.(String(formData.get('email') || ''), String(formData.get('password') || ''))
      return
    }

    await onRegister?.({
      email: String(formData.get('email') || ''),
      password: String(formData.get('password') || ''),
      fullName: String(formData.get('fullName') || ''),
      accountType,
      company: String(formData.get('company') || ''),
    })
  }

  return (
    <main className="portal-auth-shell">
      <header className="portal-topbar">
        <a className="portal-brand" href="#top"><span>I</span><strong>IDEGLI</strong></a>
        <div>
          <button type="button" onClick={() => setLang(lang === 'tm' ? 'ru' : 'tm')}>{t.language}</button>
          <a href="#top">← {t.back}</a>
        </div>
      </header>

      <section className="portal-auth-layout">
        <div className="portal-auth-copy">
          <span>{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.text}</p>
          <div className="portal-auth-benefits">
            <strong>01</strong><p>{lang === 'tm' ? 'Diňe öz maglumatlaryňyzy görersiňiz.' : 'Вы видите только собственные данные.'}</p>
            <strong>02</strong><p>{lang === 'tm' ? 'Statuslar real wagtda täzelenýär.' : 'Статусы обновляются в одном кабинете.'}</p>
            <strong>03</strong><p>{lang === 'tm' ? 'RLS we Supabase Auth bilen gorag.' : 'Защита через RLS и Supabase Auth.'}</p>
          </div>
        </div>

        <div className="portal-auth-card">
          <div className="portal-auth-tabs">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>{t.login}</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>{t.register}</button>
          </div>

          {confirmationRequired && (
            <div className="portal-confirmation" role="status">
              <strong>{t.confirmationTitle}</strong>
              <p>{t.confirmationText}</p>
            </div>
          )}

          <form onSubmit={submit}>
            {mode === 'register' && (
              <>
                <label><span>{t.fullName}</span><input required name="fullName" autoComplete="name" /></label>
                <fieldset>
                  <legend>{t.accountType}</legend>
                  <div className="portal-account-type">
                    <button type="button" className={accountType === 'candidate' ? 'active' : ''} onClick={() => setAccountType('candidate')}>{t.candidate}</button>
                    <button type="button" className={accountType === 'employer' ? 'active' : ''} onClick={() => setAccountType('employer')}>{t.employer}</button>
                  </div>
                </fieldset>
                {accountType === 'employer' && <label><span>{t.company}</span><input required name="company" autoComplete="organization" /></label>}
              </>
            )}

            <label><span>{t.email}</span><input required name="email" type="email" autoComplete="email" /></label>
            <label><span>{t.password}</span><input required name="password" type="password" minLength="8" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><small>{t.passwordHint}</small></label>

            {error && <div className="portal-error" role="alert">{error}</div>}

            <button className="portal-primary-button" type="submit" disabled={busy}>
              {busy ? t.busy : mode === 'login' ? t.submitLogin : t.submitRegister}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
