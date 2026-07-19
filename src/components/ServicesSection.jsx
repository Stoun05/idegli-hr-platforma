import ArrowIcon from './ArrowIcon.jsx'

export default function ServicesSection({ t }) {
  return (
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
  )
}
