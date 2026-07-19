import ArrowIcon from './ArrowIcon.jsx'

export default function HeroSection({ t, scrollToForm }) {
  return (
    <>
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
    </>
  )
}
