import { useMemo, useState } from 'react'
import '../admin.css'
import '../admin-remote.css'
import {
  clearApplications,
  getApplications,
  removeApplication,
  updateApplicationStatus,
} from '../services/applicationStore.js'

const adminCopy = {
  tm: {
    title: 'IDEGLI admin paneli',
    subtitleLocal: 'Kandidat arzalary we iş beriji sargytlary üçin brauzer demo dolandyryşy.',
    subtitleRemote: 'Supabase bazasyndaky kandidat arzalary we iş beriji sargytlary.',
    demo: 'Diňe demo',
    live: 'Goralan remote baza',
    warningLocal: 'Maglumatlar diňe şu brauzeriň localStorage bölüminde saklanýar we başga enjamda görünmeýär.',
    warningRemote: 'Maglumatlar Supabase/PostgreSQL bazasyndan gelýär. Giriş admin ýa-da HR roly we RLS arkaly goralýar.',
    back: 'Saýta dolanmak', language: 'RU', all: 'Ählisi', candidates: 'Kandidatlar', employers: 'Iş berijiler', newItems: 'Täze',
    search: 'Ady, kompaniýa, wezipe, telefon ýa-da e-poçta boýunça gözleg', statusFilter: 'Ähli statuslar', export: 'CSV çykarmak',
    clear: 'Hemmesini arassalamak', refresh: 'Täzelemek', logout: 'Çykmak', loading: 'Ýüklenýär...',
    emptyTitle: 'Arza tapylmady', emptyTextLocal: 'Saýtdaky dalaşgär ýa-da iş beriji formasyny dolduryň. Arza şu ýerde peýda bolar.',
    emptyTextRemote: 'Remote maglumat bazasynda şu filtre laýyk arza ýok.', candidate: 'Kandidat', employer: 'Iş beriji', created: 'Döredilen wagty',
    cv: 'CV metadata', cvMissing: 'CV ýok', details: 'Ähli maglumatlar', delete: 'Pozmak', confirmDelete: 'Bu ýazgyny pozmalymy?',
    confirmClear: 'Şu brauzerde saklanan ähli demo arzalary pozmalymy?', localOnly: 'Lokal maglumat', secureData: 'Goralan maglumat',
  },
  ru: {
    title: 'Админ-панель IDEGLI',
    subtitleLocal: 'Демо-управление откликами кандидатов и заявками работодателей.',
    subtitleRemote: 'Отклики кандидатов и заявки работодателей из базы Supabase.',
    demo: 'Только демо', live: 'Защищённая удалённая база',
    warningLocal: 'Данные хранятся только в localStorage этого браузера и не видны на других устройствах.',
    warningRemote: 'Данные загружаются из Supabase/PostgreSQL. Доступ защищён ролью admin или hr и политиками RLS.',
    back: 'Вернуться на сайт', language: 'TM', all: 'Все', candidates: 'Кандидаты', employers: 'Работодатели', newItems: 'Новые',
    search: 'Поиск по имени, компании, вакансии, телефону или email', statusFilter: 'Все статусы', export: 'Экспорт CSV',
    clear: 'Очистить всё', refresh: 'Обновить', logout: 'Выйти', loading: 'Загрузка...', emptyTitle: 'Заявок пока нет',
    emptyTextLocal: 'Заполните форму кандидата или работодателя на сайте. Заявка появится здесь.',
    emptyTextRemote: 'В удалённой базе нет заявок, соответствующих выбранным фильтрам.', candidate: 'Кандидат', employer: 'Работодатель',
    created: 'Создано', cv: 'Метаданные CV', cvMissing: 'CV отсутствует', details: 'Все данные', delete: 'Удалить',
    confirmDelete: 'Удалить эту запись?', confirmClear: 'Удалить все демозаявки, сохранённые в этом браузере?',
    localOnly: 'Локальные данные', secureData: 'Защищённые данные',
  },
}

const statusOptions = {
  tm: [['new', 'Täze arza'], ['review', 'Seredilýär'], ['contacted', 'Habarlaşyldy'], ['interview', 'Söhbetdeşlik'], ['presented', 'Hödürlendi'], ['completed', 'Tamamlandy'], ['rejected', 'Ret edildi']],
  ru: [['new', 'Новая заявка'], ['review', 'На рассмотрении'], ['contacted', 'Связались'], ['interview', 'Интервью'], ['presented', 'Представлен'], ['completed', 'Завершено'], ['rejected', 'Отказ']],
}

const fieldLabels = {
  tm: {
    name: 'Ady we familiýasy', phone: 'Telefon', email: 'E-poçta', city: 'Şäher', role: 'Isleýän wezipesi', experience: 'Tejribe', languages: 'Diller', salary: 'Garaşýan aýlygy', message: 'Goşmaça maglumat', company: 'Kompaniýa', industry: 'Iş ugry', contactRole: 'Jogapkär adamyň wezipesi', website: 'Web-saýt', vacancy: 'Açyk wezipe', headcount: 'Işgär sany', location: 'Ýerleşýän ýeri', workType: 'Iş görnüşi', requiredExperience: 'Talap edilýän tejribe', employmentType: 'Işe alyş görnüşi', salaryFrom: 'Aýlykdan', salaryTo: 'Aýlyga çenli', startDate: 'Başlama senesi', deadline: 'Soňky möhlet', responsibilities: 'Borçlar', requirements: 'Talaplar', offer: 'Hödürlenýän şertler', confidential: 'Gizlin wakansiýa',
  },
  ru: {
    name: 'Имя и фамилия', phone: 'Телефон', email: 'Email', city: 'Город', role: 'Желаемая должность', experience: 'Опыт', languages: 'Языки', salary: 'Ожидаемая зарплата', message: 'Дополнительно', company: 'Компания', industry: 'Отрасль', contactRole: 'Должность контактного лица', website: 'Сайт', vacancy: 'Вакансия', headcount: 'Количество сотрудников', location: 'Локация', workType: 'Формат работы', requiredExperience: 'Требуемый опыт', employmentType: 'Тип занятости', salaryFrom: 'Зарплата от', salaryTo: 'Зарплата до', startDate: 'Дата выхода', deadline: 'Дедлайн', responsibilities: 'Задачи', requirements: 'Требования', offer: 'Условия', confidential: 'Конфиденциальная вакансия',
  },
}

function escapeCsv(value) {
  const text = value == null ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function downloadCsv(applications) {
  const columns = ['id', 'audience', 'status', 'createdAt', 'name', 'phone', 'email', 'company', 'role', 'vacancy', 'city', 'experience', 'languages', 'salary', 'industry', 'location', 'workType', 'headcount', 'confidential', 'cvName']
  const rows = applications.map((application) => {
    const data = { id: application.id, audience: application.audience, status: application.status, createdAt: application.createdAt, ...application.fields, cvName: application.cv?.name || '' }
    return columns.map((column) => escapeCsv(data[column])).join(',')
  })
  const csv = `\uFEFF${columns.join(',')}\n${rows.join('\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `idegli-applications-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function getPrimaryTitle(application) {
  return application.audience === 'candidate'
    ? application.fields.name || application.fields.email || 'Candidate'
    : application.fields.company || application.fields.name || 'Employer'
}

function getSecondaryTitle(application) {
  return application.audience === 'candidate'
    ? application.fields.role || application.fields.experience
    : application.fields.vacancy || application.fields.industry
}

export default function AdminDashboard({
  lang,
  setLang,
  mode = 'local',
  applications: remoteApplications = [],
  remoteError = '',
  remoteBusy = false,
  remoteUser = null,
  onRefresh,
  onStatusChange,
  onDelete,
  onLogout,
}) {
  const [localApplications, setLocalApplications] = useState(() => getApplications())
  const [audienceFilter, setAudienceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const t = adminCopy[lang]
  const isRemote = mode === 'remote'
  const applications = isRemote ? remoteApplications : localApplications

  const filteredApplications = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return applications.filter((application) => {
      const matchesAudience = audienceFilter === 'all' || application.audience === audienceFilter
      const matchesStatus = statusFilter === 'all' || application.status === statusFilter
      const searchable = Object.values(application.fields || {}).join(' ').toLocaleLowerCase()
      return matchesAudience && matchesStatus && (!normalized || searchable.includes(normalized))
    })
  }, [applications, audienceFilter, statusFilter, query])

  const stats = {
    all: applications.length,
    candidates: applications.filter((item) => item.audience === 'candidate').length,
    employers: applications.filter((item) => item.audience === 'employer').length,
    newItems: applications.filter((item) => item.status === 'new').length,
  }

  const changeStatus = async (id, status) => {
    if (isRemote) return onStatusChange?.(id, status)
    if (updateApplicationStatus(id, status)) setLocalApplications(getApplications())
  }

  const deleteRecord = async (id) => {
    if (!window.confirm(t.confirmDelete)) return
    if (isRemote) return onDelete?.(id)
    if (removeApplication(id)) setLocalApplications(getApplications())
  }

  const clearAll = () => {
    if (!window.confirm(t.confirmClear)) return
    if (clearApplications()) setLocalApplications([])
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <a className="admin-brand" href="#top"><span>I</span><strong>IDEGLI</strong></a>
        <div className="admin-header-actions">
          {isRemote && remoteUser && <span className="admin-user-chip">{remoteUser.email} · {remoteUser.role}</span>}
          <button type="button" onClick={() => setLang(lang === 'tm' ? 'ru' : 'tm')}>{t.language}</button>
          {isRemote && <button type="button" onClick={onLogout}>{t.logout}</button>}
          <a href="#top">← {t.back}</a>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-hero">
          <div>
            <span className={`admin-demo-badge ${isRemote ? 'is-remote' : ''}`}>{isRemote ? t.live : t.demo}</span>
            <h1>{t.title}</h1>
            <p>{isRemote ? t.subtitleRemote : t.subtitleLocal}</p>
          </div>
          <div className="admin-warning">
            <strong>{isRemote ? t.secureData : t.localOnly}</strong>
            <p>{isRemote ? t.warningRemote : t.warningLocal}</p>
          </div>
        </section>

        {remoteError && <div className="admin-remote-error" role="alert">{remoteError}</div>}

        <section className="admin-stats" aria-label="Application statistics">
          <button className={audienceFilter === 'all' ? 'active' : ''} type="button" onClick={() => setAudienceFilter('all')}><span>{t.all}</span><strong>{stats.all}</strong></button>
          <button className={audienceFilter === 'candidate' ? 'active' : ''} type="button" onClick={() => setAudienceFilter('candidate')}><span>{t.candidates}</span><strong>{stats.candidates}</strong></button>
          <button className={audienceFilter === 'employer' ? 'active' : ''} type="button" onClick={() => setAudienceFilter('employer')}><span>{t.employers}</span><strong>{stats.employers}</strong></button>
          <div><span>{t.newItems}</span><strong>{stats.newItems}</strong></div>
        </section>

        <section className="admin-toolbar">
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">{t.statusFilter}</option>
            {statusOptions[lang].map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          <button type="button" onClick={() => downloadCsv(filteredApplications)} disabled={!filteredApplications.length}>{t.export}</button>
          {isRemote ? (
            <button type="button" onClick={onRefresh} disabled={remoteBusy}>{remoteBusy ? t.loading : t.refresh}</button>
          ) : (
            <button className="danger" type="button" onClick={clearAll} disabled={!applications.length}>{t.clear}</button>
          )}
        </section>

        <section className="admin-records">
          {filteredApplications.length ? filteredApplications.map((application) => (
            <article className="admin-record-card" key={application.id}>
              <div className="admin-record-heading">
                <div>
                  <span className={`record-type ${application.audience}`}>{application.audience === 'candidate' ? t.candidate : t.employer}</span>
                  <h2>{getPrimaryTitle(application)}</h2>
                  <p>{getSecondaryTitle(application)}</p>
                </div>
                <div className="record-status-control">
                  <select disabled={remoteBusy} value={application.status} onChange={(event) => changeStatus(application.id, event.target.value)}>
                    {statusOptions[lang].map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                  </select>
                  <button disabled={remoteBusy} type="button" onClick={() => deleteRecord(application.id)}>{t.delete}</button>
                </div>
              </div>

              <div className="admin-record-contact">
                {application.fields.phone && <a href={`tel:${application.fields.phone}`}>{application.fields.phone}</a>}
                {application.fields.email && <a href={`mailto:${application.fields.email}`}>{application.fields.email}</a>}
                <span>{t.created}: {new Date(application.createdAt).toLocaleString(lang === 'tm' ? 'tk-TM' : 'ru-RU')}</span>
              </div>

              <details>
                <summary>{t.details}</summary>
                <div className="record-details-grid">
                  {Object.entries(application.fields || {}).map(([key, value]) => value !== '' && value != null ? (
                    <div key={key}><span>{fieldLabels[lang][key] || key}</span><strong>{typeof value === 'boolean' ? (value ? '✓' : '—') : String(value)}</strong></div>
                  ) : null)}
                  <div><span>{t.cv}</span><strong>{application.cv ? `${application.cv.name} · ${(application.cv.size / 1024 / 1024).toFixed(2)} MB` : t.cvMissing}</strong></div>
                </div>
              </details>
            </article>
          )) : (
            <div className="admin-empty-state">
              <span>0</span><h2>{t.emptyTitle}</h2><p>{isRemote ? t.emptyTextRemote : t.emptyTextLocal}</p><a href="#apply">{t.back}</a>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
