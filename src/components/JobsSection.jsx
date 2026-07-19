import { useEffect, useMemo, useState } from 'react'
import '../jobs.css'
import JobDetailPanel from './JobDetailPanel.jsx'

export default function JobsSection({ t, jobs, lang, scrollToForm }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [level, setLevel] = useState('all')
  const [type, setType] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)

  const categoryOptions = useMemo(
    () => Array.from(new Map(jobs.map((job) => [job.categoryKey, job.category[lang]])).entries()),
    [jobs, lang],
  )
  const levelOptions = useMemo(() => [...new Set(jobs.map((job) => job.level))], [jobs])
  const typeOptions = useMemo(
    () => Array.from(new Map(jobs.map((job) => [job.typeKey, job.type[lang]])).entries()),
    [jobs, lang],
  )

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()

    return jobs.filter((job) => {
      const searchableText = [
        job.title.tm,
        job.title.ru,
        job.company,
        job.location,
        job.category.tm,
        job.category.ru,
      ].join(' ').toLocaleLowerCase()

      const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery)
      const matchesCategory = category === 'all' || job.categoryKey === category
      const matchesLevel = level === 'all' || job.level === level
      const matchesType = type === 'all' || job.typeKey === type

      return matchesQuery && matchesCategory && matchesLevel && matchesType
    })
  }, [jobs, query, category, level, type])

  useEffect(() => {
    if (!selectedJob) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedJob(null)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedJob])

  const resetFilters = () => {
    setQuery('')
    setCategory('all')
    setLevel('all')
    setType('all')
  }

  const applyForJob = (job) => {
    setSelectedJob(null)
    scrollToForm('candidate', job.title[lang])
  }

  return (
    <section className="section jobs-section" id="jobs">
      <div className="section-heading jobs-heading">
        <div>
          <p className="eyebrow light"><span />{t.jobsEyebrow}</p>
          <h2>{t.jobsTitle}</h2>
        </div>
        <div>
          <p>{t.jobsText}</p>
          <button className="reset-filters-button" type="button" onClick={resetFilters}>
            {t.allJobs} ↗
          </button>
        </div>
      </div>

      <div className="jobs-toolbar" aria-label={t.jobsTitle}>
        <label className="job-search-field">
          <span>{t.searchLabel}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchJobs}
          />
        </label>

        <label className="job-filter-field">
          <span>{t.categoryLabel}</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">{t.allCategories}</option>
            {categoryOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>

        <label className="job-filter-field">
          <span>{t.levelLabel}</span>
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="all">{t.allLevels}</option>
            {levelOptions.map((value) => <option value={value} key={value}>{value}</option>)}
          </select>
        </label>

        <label className="job-filter-field">
          <span>{t.typeLabel}</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">{t.allTypes}</option>
            {typeOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
      </div>

      <div className="jobs-result-bar">
        <p><strong>{filteredJobs.length}</strong> {t.jobsFound}</p>
        {(query || category !== 'all' || level !== 'all' || type !== 'all') && (
          <button className="reset-filters-button" type="button" onClick={resetFilters}>
            {t.resetFilters}
          </button>
        )}
      </div>

      <div className="job-list">
        {filteredJobs.length > 0 ? filteredJobs.map((job, index) => (
          <article className={selectedJob?.id === job.id ? 'job-card is-selected' : 'job-card'} key={job.id}>
            <div className="job-index">{String(index + 1).padStart(2, '0')}</div>
            <div className="job-main">
              <p>{job.company}</p>
              <h3>{job.title[lang]}</h3>
              <span className="job-category">{job.category[lang]}</span>
            </div>
            <div className="job-meta">
              <span>{job.location}</span>
              <span>{job.type[lang]}</span>
              <span>{job.level}</span>
            </div>
            <div className="job-actions">
              <button type="button" onClick={() => setSelectedJob(job)}>{t.viewDetails}</button>
              <button className="primary-job-action" type="button" onClick={() => applyForJob(job)}>{t.apply}</button>
            </div>
          </article>
        )) : (
          <div className="no-jobs-state">
            <h3>{t.noJobsTitle}</h3>
            <p>{t.noJobsText}</p>
          </div>
        )}
      </div>

      <JobDetailPanel
        job={selectedJob}
        lang={lang}
        t={t}
        onClose={() => setSelectedJob(null)}
        onApply={applyForJob}
      />
    </section>
  )
}
