import { useState } from 'react'
import '../admin-auth.css'

const copy = {
  tm: {
    eyebrow: 'Goralan dolandyryş zolagy',
    title: 'IDEGLI admin giriş',
    text: 'Diňe IDEGLI-niň admin ýa-da HR roly berlen ulanyjylary remote kandidat bazasyna girip biler.',
    email: 'Admin e-poçtasy',
    password: 'Parol',
    submit: 'Giriş etmek',
    submitting: 'Barlanýar...',
    back: 'Saýta dolanmak',
    language: 'RU',
    roleError: 'Bu hasaba admin ýa-da HR roly berilmedik.',
    loginError: 'E-poçta ýa-da parol nädogry, ýa-da giriş mümkin däl.',
    security: 'Sessiya şu brauzerde saklanýar. Maglumatlara giriş Supabase RLS tarapyndan hem barlanýar.',
  },
  ru: {
    eyebrow: 'Защищённая зона управления',
    title: 'Вход в админ-панель IDEGLI',
    text: 'Доступ к удалённой базе кандидатов есть только у пользователей с ролью admin или hr.',
    email: 'Email администратора',
    password: 'Пароль',
    submit: 'Войти',
    submitting: 'Проверяем...',
    back: 'Вернуться на сайт',
    language: 'TM',
    roleError: 'У этой учётной записи нет роли admin или hr.',
    loginError: 'Неверный email или пароль либо вход недоступен.',
    security: 'Сессия хранится в этом браузере. Доступ к данным дополнительно проверяется политиками Supabase RLS.',
  },
}

export default function AdminLogin({ lang, setLang, onLogin, error, isSubmitting }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const t = copy[lang]

  const submit = async (event) => {
    event.preventDefault()
    await onLogin(email.trim(), password)
  }

  return (
    <div className="admin-login-shell">
      <header className="admin-login-header">
        <a className="admin-brand" href="#top"><span>I</span><strong>IDEGLI</strong></a>
        <div>
          <button type="button" onClick={() => setLang(lang === 'tm' ? 'ru' : 'tm')}>{t.language}</button>
          <a href="#top">← {t.back}</a>
        </div>
      </header>

      <main className="admin-login-main">
        <section className="admin-login-copy">
          <p>{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <span>{t.text}</span>
        </section>

        <form className="admin-login-card" onSubmit={submit}>
          <label>
            <span>{t.email}</span>
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span>{t.password}</span>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <div className="admin-login-error" role="alert">{error}</div>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t.submitting : t.submit}
          </button>
          <small>{t.security}</small>
        </form>
      </main>
    </div>
  )
}

export { copy as adminLoginCopy }
