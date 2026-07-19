export default function AboutSection({ t }) {
  return (
    <section className="section about-section" id="about">
      <div className="about-heading">
        <div>
          <p className="eyebrow dark"><span />{t.aboutEyebrow}</p>
          <h2>{t.aboutTitle}</h2>
        </div>
        <div className="about-copy">
          <p className="about-lead">{t.aboutLead}</p>
          <p>{t.aboutText}</p>
        </div>
      </div>

      <div className="about-values">
        {t.aboutValues.map((value) => (
          <article className="about-value-card" key={value.number}>
            <span>{value.number}</span>
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </article>
        ))}
      </div>

      <blockquote className="about-statement">{t.aboutStatement}</blockquote>
    </section>
  )
}
