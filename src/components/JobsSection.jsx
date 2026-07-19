import ArrowIcon from './ArrowIcon.jsx'

export default function JobsSection({ t, jobs, lang, scrollToForm }) {
  return (
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
  )
}
