import ArrowIcon from './ArrowIcon.jsx'

export default function ApplicationSection({
  t,
  audience,
  setAudience,
  submitted,
  setSubmitted,
  selectedRole,
  handleSubmit,
}) {
  return (
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
              {audience === 'candidate' ? (
                <input
                  key={selectedRole || 'candidate-role'}
                  required
                  name="role"
                  defaultValue={selectedRole}
                />
              ) : (
                <input required name="company" />
              )}
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
  )
}
