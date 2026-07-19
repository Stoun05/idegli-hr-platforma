export default function ProcessSection({ t }) {
  return (
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
  )
}
