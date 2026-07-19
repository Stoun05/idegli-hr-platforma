import ArrowIcon from './ArrowIcon.jsx'

export default function JobDetailPanel({ job, lang, t, onClose, onApply }) {
  if (!job) return null

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="job-modal-backdrop" role="presentation" onMouseDown={handleBackdropClick}>
      <article
        className="job-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`job-title-${job.id}`}
      >
        <button className="job-modal-close" type="button" onClick={onClose} aria-label={t.closeDetails}>
          ×
        </button>

        <div className="job-detail-heading">
          <div>
            <p className="job-detail-kicker">{job.category[lang]} · {job.level}</p>
            <h3 id={`job-title-${job.id}`}>{job.title[lang]}</h3>
            <p>{job.summary[lang]}</p>
          </div>
          <span className="demo-vacancy-badge">{t.demoVacancy}</span>
        </div>

        <div className="job-detail-facts">
          <div><span>{t.companyLabel}</span><strong>{job.company}</strong></div>
          <div><span>{t.locationLabel}</span><strong>{job.location}</strong></div>
          <div><span>{t.workTypeLabel}</span><strong>{job.type[lang]}</strong></div>
          <div><span>{t.salaryLabel}</span><strong>{job.salary[lang]}</strong></div>
        </div>

        <div className="job-detail-content">
          <section>
            <h4>{t.responsibilitiesLabel}</h4>
            <ul>
              {job.responsibilities[lang].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
          <section>
            <h4>{t.requirementsLabel}</h4>
            <ul>
              {job.requirements[lang].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
          <section>
            <h4>{t.offerLabel}</h4>
            <ul>
              {job.offer[lang].map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        </div>

        <div className="job-detail-footer">
          <p>{t.demoVacancyNote}</p>
          <button className="button button-accent" type="button" onClick={() => onApply(job)}>
            {t.applyNow} <ArrowIcon />
          </button>
        </div>
      </article>
    </div>
  )
}
