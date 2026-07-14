import { useMemo, useState } from 'react'

const copy = {
  tm: {
    nav: ['Hyzmatlar', 'Wakansiýalar', 'Iş tertibi', 'Habarlaşmak'],
    language: 'RU',
    eyebrow: 'Premium recruitment platformasy',
    heroTitleA: 'Dogry adam.',
    heroTitleB: 'Dogry iş.',
    heroText:
      'IDEGLI kompaniýalara güýçli hünärmenleri, hünärmenlere bolsa ösüş mümkinçiliklerini tapmaga kömek edýär.',
    findJob: 'Iş tapmak',
    findTalent: 'Işgär tapmak',
    heroNote: 'Recruitment · Executive Search · Karýera konsultasiýasy',
    stats: [
      ['3', 'esasy hyzmat ugry'],
      ['2', 'taraply platforma'],
      ['1', 'bitewi kandidat ulgamy'],
    ],
    servicesEyebrow: 'Hyzmatlarymyz',
    servicesTitle: 'Adam bilen biznesiň arasynda dogry baglanyşyk',
    servicesText:
      'Her bir iş orunyna diňe CV däl, eýsem tejribe, häsiýet we ösüş potensialy boýunça seredýäris.',
    services: [
      {
        number: '01',
        title: 'Professional recruitment',
        text: 'Kompaniýanyň talaplaryna laýyk hünärmenleri gözlemek, saýlamak we söhbetdeşlige taýýarlamak.',
      },
      {
        number: '02',
        title: 'Executive Search',
        text: 'Ýolbaşçy, seýrek hünärmen we strategik wezipeler üçin maksatly gözleg prosesi.',
      },
      {
        number: '03',
        title: 'Karýera konsultasiýasy',
        text: 'CV, söhbetdeşlik, hünär ugry we indiki karýera ädimi boýunça şahsy maslahat.',
      },
    ],
    jobsEyebrow: 'Täze mümkinçilikler',
    jobsTitle: 'Saýlanan wakansiýalar',
    jobsText: 'Ilkinji demo üçin nusga wakansiýalar. Soňra olar admin panel arkaly dolandyrylar.',
    allJobs: 'Ähli wakansiýalar',
    apply: 'Ýüz tutmak',
    processEyebrow: 'Iş tertibi',
    processTitle: 'Açyk we düşnükli dört ädim',
    steps: [
      ['Talaby öwrenýäris', 'Wezipäni, topary we kompaniýanyň garaşýan netijesini anyklaýarys.'],
      ['Maksatly gözleg edýäris', 'Bazadan we hünär torlaryndan laýyk kandidatlary tapýarys.'],
      ['Saýlap-seçýäris', 'Tejribe, başarnyk we motivasiýa boýunça ilkinji söhbetdeşligi geçirýäris.'],
      ['Duşuşygy gurnaýarys', 'Iň laýyk kandidatlary kompaniýa hödürläp, prosesi soňuna çenli alyp barýarys.'],
    ],
    formEyebrow: 'Başlamak üçin',
    formTitle: 'Siziň maksadyňyz haýsy?',
    candidateTab: 'Iş gözleýärin',
    employerTab: 'Işgär gözleýärin',
    candidateTitle: 'Karýeraňyzyň indiki ädimini başlaň',
    candidateText: 'Esasy maglumatlaryňyzy goýuň. Bu demo forma maglumat ibermez, diňe interfeýsi görkezýär.',
    employerTitle: 'Toparyňyz üçin güýçli hünärmeni tapalyň',
    employerText: 'Wezipäniň adyny we aragatnaşyk maglumatlaryňyzy goýuň. Soň backend bilen birikdiriler.',
    fields: {
      name: 'Ady we familiýasy',
      phone: 'Telefon belgisi',
      email: 'E-poçta',
      role: 'Gözleýän wezipesi',
      company: 'Kompaniýanyň ady',
      vacancy: 'Açyk wezipe',
      experience: 'Tejribe derejesi',
      message: 'Goşmaça maglumat',
    },
    submitCandidate: 'Profili ibermek',
    submitEmployer: 'Sargydy ibermek',
    submitted: 'Sag boluň! Demo arza kabul edildi.',
    privacy: 'Ibermek bilen şahsy maglumatlaryň işlenmegine razylyk berýärsiňiz.',
    ctaTitle: 'Dogry adam bilen ösüş has çalt başlanýar.',
    ctaText: 'IDEGLI üçin professional HR ekosistemasynyň ilkinji wersiýasy.',
    start: 'Arza goýmak',
    footerText: 'Işgär saýlap-seçiş we karýera hyzmatlary platformasy.',
    rights: 'Ähli hukuklar goralan.',
  },
  ru: {
    nav: ['Услуги', 'Вакансии', 'Как мы работаем', 'Контакты'],
    language: 'TM',
    eyebrow: 'Премиальная рекрутинговая платформа',
    heroTitleA: 'Правильный человек.',
    heroTitleB: 'Правильная работа.',
    heroText:
      'IDEGLI помогает компаниям находить сильных специалистов, а специалистам — возможности для роста.',
    findJob: 'Найти работу',
    findTalent: 'Найти сотрудника',
    heroNote: 'Recruitment · Executive Search · Карьерная консультация',
    stats: [
      ['3', 'основных направления'],
      ['2', 'стороны платформы'],
      ['1', 'единая система кандидатов'],
    ],
    servicesEyebrow: 'Наши услуги',
    servicesTitle: 'Точная связь между человеком и бизнесом',
    servicesText:
      'Мы смотрим не только на резюме, но и на опыт, характер и потенциал роста кандидата.',
    services: [
      {
        number: '01',
        title: 'Professional recruitment',
        text: 'Поиск, отбор и подготовка специалистов под требования конкретной компании.',
      },
      {
        number: '02',
        title: 'Executive Search',
        text: 'Целевой поиск руководителей, редких специалистов и кандидатов на стратегические позиции.',
      },
      {
        number: '03',
        title: 'Карьерная консультация',
        text: 'Персональная помощь с резюме, интервью, карьерным направлением и следующим шагом.',
      },
    ],
    jobsEyebrow: 'Новые возможности',
    jobsTitle: 'Избранные вакансии',
    jobsText: 'Демонстрационные вакансии для первой версии. Позже они будут управляться через админ-панель.',
    allJobs: 'Все вакансии',
    apply: 'Откликнуться',
    processEyebrow: 'Как мы работаем',
    processTitle: 'Четыре понятных этапа',
    steps: [
      ['Изучаем задачу', 'Уточняем роль, команду и ожидаемый бизнес-результат.'],
      ['Запускаем поиск', 'Ищем подходящих кандидатов в базе и профессиональных сообществах.'],
      ['Проводим отбор', 'Оцениваем опыт, навыки и мотивацию на первичном интервью.'],
      ['Организуем встречу', 'Представляем лучших кандидатов и сопровождаем процесс до результата.'],
    ],
    formEyebrow: 'Начать сотрудничество',
    formTitle: 'Какая у вас цель?',
    candidateTab: 'Ищу работу',
    employerTab: 'Ищу сотрудника',
    candidateTitle: 'Начните следующий этап своей карьеры',
    candidateText: 'Оставьте основные данные. Демоформа пока показывает интерфейс и не отправляет информацию.',
    employerTitle: 'Найдём сильного специалиста для вашей команды',
    employerText: 'Укажите вакансию и контакты. На следующем этапе форма будет подключена к базе.',
    fields: {
      name: 'Имя и фамилия',
      phone: 'Номер телефона',
      email: 'Электронная почта',
      role: 'Желаемая должность',
      company: 'Название компании',
      vacancy: 'Открытая позиция',
      experience: 'Уровень опыта',
      message: 'Дополнительная информация',
    },
    submitCandidate: 'Отправить профиль',
    submitEmployer: 'Отправить заявку',
    submitted: 'Спасибо! Демозаявка принята.',
    privacy: 'Отправляя форму, вы соглашаетесь на обработку персональных данных.',
    ctaTitle: 'С правильным человеком рост начинается быстрее.',
    ctaText: 'Первая версия профессиональной HR-экосистемы для IDEGLI.',
    start: 'Оставить заявку',
    footerText: 'Платформа рекрутинга и карьерных услуг.',
    rights: 'Все права защищены.',
  },
}

const jobs = [
  {
    title: { tm: 'Satuw bölüminiň ýolbaşçysy', ru: 'Руководитель отдела продаж' },
    company: 'Retail group',
    location: 'Aşgabat',
    type: { tm: 'Doly iş güni', ru: 'Полный день' },
    level: 'Senior',
  },
  {
    title: { tm: 'Baş hasapçy', ru: 'Главный бухгалтер' },
    company: 'Logistics company',
    location: 'Aşgabat',
    type: { tm: 'Doly iş güni', ru: 'Полный день' },
    level: 'Lead',
  },
  {
    title: { tm: 'Marketing menejeri', ru: 'Маркетинг-менеджер' },
    company: 'FMCG brand',
    location: 'Aşgabat',
    type: { tm: 'Gibrid', ru: 'Гибрид' },
    level: 'Middle',
  },
  {
    title: { tm: 'HR hünärmeni', ru: 'HR-специалист' },
    company: 'Service company',
    location: 'Aşgabat',
    type: { tm: 'Doly iş güni', ru: 'Полный день' },
    level: 'Middle',
  },
  {
    title: { tm: 'Maliýe analitigi', ru: 'Финансовый аналитик' },
    company: 'Investment team',
    location: 'Aşgabat',
    type: { tm: 'Doly iş güni', ru: 'Полный день' },
    level: 'Middle',
  },
  {
    title: { tm: 'Operasion direktor', ru: 'Операционный директор' },
    company: 'Private holding',
    location: 'Aşgabat',
    type: { tm: 'Doly iş güni', ru: 'Полный день' },
    level: 'Executive',
  },
]

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>
}

function App() {
  const [lang, setLang] = useState('tm')
  const [menuOpen, setMenuOpen] = useState(false)
  const [audience, setAudience] = useState('candidate')
  const [submitted, setSubmitted] = useState(false)
  const t = useMemo(() => copy[lang], [lang])

  const scrollToForm = (nextAudience) => {
    setAudience(nextAudience)
    setSubmitted(false)
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="IDEGLI baş sahypa">
          <span className="brand-mark">I</span>
          <span>IDEGLI</span>
        </a>

        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Esasy menýu">
          <a href="#services" onClick={() => setMenuOpen(false)}>{t.nav[0]}</a>
          <a href="#jobs" onClick={() => setMenuOpen(false)}>{t.nav[1]}</a>
          <a href="#process" onClick={() => setMenuOpen(false)}>{t.nav[2]}</a>
          <a href="#apply" onClick={() => setMenuOpen(false)}>{t.nav[3]}</a>
        </nav>

        <div className="header-actions">
          <button className="language-button" type="button" onClick={() => setLang(lang === 'tm' ? 'ru' : 'tm')}>
            {t.language}
          </button>
          <button className="header-cta" type="button" onClick={() => scrollToForm('employer')}>
            {t.findTalent}
          </button>
          <button
            className="menu-button"
            type="button"
            aria-label="Menýuny açmak"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow"><span />{t.eyebrow}</p>
            <h1>
              {t.heroTitleA}
              <br />
              <em>{t.heroTitleB}</em>
            </h1>
            <p className="hero-description">{t.heroText}</p>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={() => scrollToForm('candidate')}>
                {t.findJob} <ArrowIcon />
              </button>
              <button className="button button-secondary" type="button" onClick={() => scrollToForm('employer')}>
                {t.findTalent}
              </button>
            </div>
            <p className="hero-note">{t.heroNote}</p>
          </div>

          <div className="hero-visual" aria-label="Kandidat saýlaw prosesi">
            <div className="visual-grid" />
            <div className="visual-label">IDEGLI / TALENT MATCH</div>
            <div className="candidate-stack">
              <article className="candidate-card card-back">
                <span className="candidate-avatar">AM</span>
                <div><strong>Project Manager</strong><small>Management · 6 years</small></div>
              </article>
              <article className="candidate-card card-middle">
                <span className="candidate-avatar">SA</span>
                <div><strong>Marketing Lead</strong><small>Brand · Strategy</small></div>
              </article>
              <article className="candidate-card card-front">
                <div className="match-row">
                  <span className="candidate-avatar large">MK</span>
                  <span className="match-badge">Best match</span>
                </div>
                <div className="candidate-main">
                  <p>Selected professional</p>
                  <h3>Commercial Director</h3>
                  <div className="skill-list"><span>Leadership</span><span>Sales</span><span>Strategy</span></div>
                </div>
                <div className="card-footer"><span>Profile 01</span><strong>IDEGLI ↗</strong></div>
              </article>
            </div>
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
          </div>
        </section>

        <section className="stats-strip" aria-label="Platforma görkezijileri">
          {t.stats.map(([value, label]) => (
            <div className="stat" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="section services-section" id="services">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow dark"><span />{t.servicesEyebrow}</p>
              <h2>{t.servicesTitle}</h2>
            </div>
            <p>{t.servicesText}</p>
          </div>

          <div className="service-grid">
            {t.services.map((service) => (
              <article className="service-card" key={service.number}>
                <div className="service-number">{service.number}</div>
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
                <span className="service-arrow"><ArrowIcon /></span>
              </article>
            ))}
          </div>
        </section>

        <section className="section jobs-section" id="jobs">
          <div className="section-heading jobs-heading">
            <div>
              <p className="eyebrow light"><span />{t.jobsEyebrow}</p>
              <h2>{t.jobsTitle}</h2>
            </div>
            <div>
              <p>{t.jobsText}</p>
              <a href="#apply">{t.allJobs} <ArrowIcon /></a>
            </div>
          </div>

          <div className="job-list">
            {jobs.map((job, index) => (
              <article className="job-card" key={`${job.company}-${index}`}>
                <div className="job-index">{String(index + 1).padStart(2, '0')}</div>
                <div className="job-main">
                  <p>{job.company}</p>
                  <h3>{job.title[lang]}</h3>
                </div>
                <div className="job-meta">
                  <span>{job.location}</span>
                  <span>{job.type[lang]}</span>
                  <span>{job.level}</span>
                </div>
                <button type="button" onClick={() => scrollToForm('candidate')} aria-label={t.apply}>
                  <ArrowIcon />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="section process-section" id="process">
          <div className="section-heading centered-heading">
            <p className="eyebrow dark"><span />{t.processEyebrow}</p>
            <h2>{t.processTitle}</h2>
          </div>
          <div className="process-grid">
            {t.steps.map(([title, text], index) => (
              <article className="process-card" key={title}>
                <div className="process-top">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <i />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section form-section" id="apply">
          <div className="form-intro">
            <p className="eyebrow light"><span />{t.formEyebrow}</p>
            <h2>{t.formTitle}</h2>
            <div className="audience-tabs" role="tablist">
              <button
                type="button"
                className={audience === 'candidate' ? 'active' : ''}
                onClick={() => { setAudience('candidate'); setSubmitted(false) }}
              >
                {t.candidateTab}
              </button>
              <button
                type="button"
                className={audience === 'employer' ? 'active' : ''}
                onClick={() => { setAudience('employer'); setSubmitted(false) }}
              >
                {t.employerTab}
              </button>
            </div>
          </div>

          <div className="application-panel">
            <div className="application-copy">
              <span className="application-kicker">{audience === 'candidate' ? 'CANDIDATE' : 'EMPLOYER'} / 01</span>
              <h3>{audience === 'candidate' ? t.candidateTitle : t.employerTitle}</h3>
              <p>{audience === 'candidate' ? t.candidateText : t.employerText}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  <span>{t.fields.name}</span>
                  <input required name="name" autoComplete="name" />
                </label>
                <label>
                  <span>{t.fields.phone}</span>
                  <input required name="phone" type="tel" autoComplete="tel" />
                </label>
                <label>
                  <span>{t.fields.email}</span>
                  <input name="email" type="email" autoComplete="email" />
                </label>
                <label>
                  <span>{audience === 'candidate' ? t.fields.role : t.fields.company}</span>
                  <input required name={audience === 'candidate' ? 'role' : 'company'} />
                </label>
                <label>
                  <span>{audience === 'candidate' ? t.fields.experience : t.fields.vacancy}</span>
                  <input required name={audience === 'candidate' ? 'experience' : 'vacancy'} />
                </label>
                <label className="wide-field">
                  <span>{t.fields.message}</span>
                  <textarea name="message" rows="3" />
                </label>
              </div>
              <div className="form-submit-row">
                <button className="button button-accent" type="submit">
                  {audience === 'candidate' ? t.submitCandidate : t.submitEmployer} <ArrowIcon />
                </button>
                <small>{submitted ? t.submitted : t.privacy}</small>
              </div>
            </form>
          </div>
        </section>

        <section className="final-cta">
          <div>
            <p>IDEGLI / 2026</p>
            <h2>{t.ctaTitle}</h2>
            <span>{t.ctaText}</span>
          </div>
          <button className="round-cta" type="button" onClick={() => scrollToForm('employer')}>
            <span>{t.start}</span>
            <ArrowIcon />
          </button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <a className="brand inverted" href="#top"><span className="brand-mark">I</span><span>IDEGLI</span></a>
          <p>{t.footerText}</p>
        </div>
        <div className="footer-links">
          <a href="#services">{t.nav[0]}</a>
          <a href="#jobs">{t.nav[1]}</a>
          <a href="#process">{t.nav[2]}</a>
          <a href="#apply">{t.nav[3]}</a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 IDEGLI. {t.rights}</span>
          <span>Aşgabat, Türkmenistan</span>
        </div>
      </footer>
    </div>
  )
}

export default App
