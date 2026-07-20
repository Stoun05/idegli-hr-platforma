import { useEffect, useState } from 'react'
import '../portal.css'

const copy = {
  tm: {
    title: 'Şahsy kabinet', candidate: 'Kandidat', employer: 'Iş beriji', language: 'RU', logout: 'Çykmak', back: 'Baş sahypa',
    refresh: 'Täzelemek', refreshing: 'Ýüklenýär...', profile: 'Profil maglumatlary', applications: 'Meniň arzalarym',
    fullName: 'Ady we familiýasy', company: 'Kompaniýa', phone: 'Telefon', city: 'Şäher', email: 'E-poçta',
    save: 'Profili saklamak', saving: 'Saklanýar...', saved: 'Profil täzelendi.', total: 'Ähli arzalar', active: 'Aktiw proses',
    emptyTitle: 'Kabinet bilen baglanan arza ýok', emptyCandidate: 'Täze wakansiýa ýüz tutanyňyzda arzaňyz şu ýerde peýda bolar.',
    emptyEmployer: 'Täze işgär sargydyny ibereniňizde sargyt şu ýerde peýda bolar.', newApplication: 'Täze arza ibermek',
    created: 'Iberilen wagty', updated: 'Soňky täzelenme', cv: 'CV', details: 'Maglumatlar', secure: 'Diňe size görünýän maglumat',
  },
  ru: {
    title: 'Личный кабинет', candidate: 'Кандидат', employer: 'Работодатель', language: 'TM', logout: 'Выйти', back: 'На главную',
    refresh: 'Обновить', refreshing: 'Загрузка...', profile: 'Данные профиля', applications: 'Мои заявки',
    fullName: 'Имя и фамилия', company: 'Компания', phone: 'Телефон', city: 'Город', email: 'Email',
    save: 'Сохранить профиль', saving: 'Сохраняем...', saved: 'Профиль обновлён.', total: 'Все заявки', active: 'Активный процесс',
    emptyTitle: 'К кабинету пока не привязаны заявки', emptyCandidate: 'После нового отклика на вакансию заявка появится здесь.',
    emptyEmployer: 'После отправки заявки на подбор сотрудника она появится здесь.', newApplication: 'Отправить новую заявку',
    created: 'Отправлено', updated: 'Последнее обновление', cv: 'Резюме', details: 'Данные', secure: 'Данные видны только вам',
  },
}

const statuses = {
  tm: { new: 'Täze arza', review: 'Seredilýär', contacted: 'Habarlaşyldy', interview: 'Söhbetdeşlik', presented: 'Hödürlendi', completed: 'Tamamlandy', rejected: 'Ret edildi' },
  ru: { new: 'Новая', review: 'На рассмотрении', contacted: 'Связались', interview: 'Интервью', presented: 'Представлен', completed: 'Завершено', rejected: 'Отказ' },
}

function titleOf(application) {
  return application.audience === 'candidate'
    ? application.fields.role || application.fields.name || 'Candidate application'
    : application.fields.vacancy || application.fields.company || 'Employer request'
}

function secondaryOf(application) {
  return application.audience === 'candidate'
    ? application.fields.company || application.fields.city || application.fields.experience
    : application.fields.company || application.fields.location || application.fields.workType
}

function formatDate(value, lang) {
  return value ? new Date(value).toLocaleString(lang === 'tm' ? 'tk-TM' : 'ru-RU') : '—'
}

export default function PortalDashboard({ lang, setLang, session, profile, applications, busy, error, onRefresh, onSaveProfile, onLogout }) {
  const [form, setForm] = useState(profile)
  const [saved, setSaved] = useState(false)
  const t = copy[lang]
  const labels = statuses[lang]
  const activeCount = applications.filter((item) => !['completed', 'rejected'].includes(item.status)).length
  const accountLabel = profile.accountType === 'candidate' ? t.candidate : t.employer
  const applyHash = profile.accountType === 'candidate' ? '#apply-candidate' : '#apply-employer'

  useEffect(() => {
    setForm(profile)
  }, [profile])

  const update = (key, value) => {
    setSaved(false)
    setForm((current) => ({ ...current, [key]: value }))
  }

  const submitProfile = async (event) => {
    event.preventDefault()
    setSaved(false)

    try {
      await onSaveProfile?.(form)
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }

  return (
    <main className="portal-dashboard-shell">
      <header className="portal-topbar portal-dashboard-header">
        <a className="portal-brand" href="#top"><span>I</span><strong>IDEGLI</strong></a>
        <div>
          <span className="portal-user-chip">{session.user?.email} · {accountLabel}</span>
          <button type="button" onClick={() => setLang(lang === 'tm' ? 'ru' : 'tm')}>{t.language}</button>
          <button type="button" disabled={busy} onClick={onRefresh}>{busy ? t.refreshing : t.refresh}</button>
          <button type="button" onClick={onLogout}>{t.logout}</button>
          <a href="#top">← {t.back}</a>
        </div>
      </header>

      <section className="portal-dashboard-main">
        <div className="portal-dashboard-title">
          <div>
            <span>{accountLabel} / IDEGLI</span>
            <h1>{t.title}</h1>
            <p>{t.secure}</p>
          </div>
          <a className="portal-primary-button portal-new-application" href={applyHash}>{t.newApplication}</a>
        </div>

        {error && <div className="portal-error portal-dashboard-error" role="alert">{error}</div>}

        <div className="portal-stat-grid">
          <article><span>{t.total}</span><strong>{applications.length}</strong></article>
          <article><span>{t.active}</span><strong>{activeCount}</strong></article>
          <article><span>{accountLabel}</span><strong>{profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'I'}</strong></article>
        </div>

        <div className="portal-dashboard-grid">
          <section className="portal-profile-card">
            <div className="portal-section-heading"><h2>{t.profile}</h2><span>{accountLabel}</span></div>
            <form onSubmit={submitProfile}>
              <label><span>{t.fullName}</span><input required value={form.fullName || ''} onChange={(event) => update('fullName', event.target.value)} /></label>
              {profile.accountType === 'employer' && <label><span>{t.company}</span><input required value={form.company || ''} onChange={(event) => update('company', event.target.value)} /></label>}
              <label><span>{t.email}</span><input disabled value={session.user?.email || ''} /></label>
              <label><span>{t.phone}</span><input type="tel" value={form.phone || ''} onChange={(event) => update('phone', event.target.value)} /></label>
              <label><span>{t.city}</span><input value={form.city || ''} onChange={(event) => update('city', event.target.value)} /></label>
              {saved && <p className="portal-saved" role="status">{t.saved}</p>}
              <button className="portal-primary-button" type="submit" disabled={busy}>{busy ? t.saving : t.save}</button>
            </form>
          </section>

          <section className="portal-applications-card">
            <div className="portal-section-heading"><h2>{t.applications}</h2><span>{applications.length}</span></div>

            {applications.length ? (
              <div className="portal-application-list">
                {applications.map((application) => (
                  <article className="portal-application-item" key={application.id}>
                    <div className="portal-application-topline">
                      <div><span>{application.audience === 'candidate' ? t.candidate : t.employer}</span><h3>{titleOf(application)}</h3><p>{secondaryOf(application)}</p></div>
                      <strong className={`portal-status status-${application.status}`}>{labels[application.status] || application.status}</strong>
                    </div>
                    <div className="portal-application-dates">
                      <span>{t.created}: {formatDate(application.createdAt, lang)}</span>
                      <span>{t.updated}: {formatDate(application.updatedAt, lang)}</span>
                    </div>
                    <details>
                      <summary>{t.details}</summary>
                      <div className="portal-field-grid">
                        {Object.entries(application.fields || {}).map(([key, value]) => value !== '' && value != null ? (
                          <div key={key}><span>{key}</span><strong>{typeof value === 'boolean' ? (value ? '✓' : '—') : String(value)}</strong></div>
                        ) : null)}
                        {application.cv && <div><span>{t.cv}</span><strong>{application.cv.name}</strong></div>}
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            ) : (
              <div className="portal-empty-state">
                <span>0</span>
                <h3>{t.emptyTitle}</h3>
                <p>{profile.accountType === 'candidate' ? t.emptyCandidate : t.emptyEmployer}</p>
                <a href={applyHash}>{t.newApplication}</a>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
