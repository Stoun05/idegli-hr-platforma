import { contactInfo } from '../data/companyContent.js'
import ArrowIcon from './ArrowIcon.jsx'

export default function ContactSection({ t, scrollToForm }) {
  return (
    <section className="section contact-section" id="contact">
      <div className="contact-intro">
        <p className="eyebrow light"><span />{t.contactEyebrow}</p>
        <h2>{t.contactTitle}</h2>
        <p>{t.contactText}</p>
      </div>

      <div className="contact-panel">
        <div className="contact-list">
          <a href={contactInfo.phoneHref} className="contact-item">
            <span>{t.contactPhone}</span>
            <strong>{contactInfo.phone}</strong>
            <ArrowIcon />
          </a>
          <a href={contactInfo.emailHref} className="contact-item">
            <span>{t.contactEmail}</span>
            <strong>{contactInfo.email}</strong>
            <ArrowIcon />
          </a>
          <div className="contact-item contact-location">
            <span>{t.contactLocation}</span>
            <strong>{t.contactLocationValue}</strong>
            <span aria-hidden="true">•</span>
          </div>
        </div>

        <div className="contact-actions-block">
          <p>{t.contactOpen}</p>
          <div className="contact-actions">
            <button className="button button-accent" type="button" onClick={() => scrollToForm('candidate')}>
              {t.contactCandidate} <ArrowIcon />
            </button>
            <button className="button contact-secondary-button" type="button" onClick={() => scrollToForm('employer')}>
              {t.contactEmployer} <ArrowIcon />
            </button>
          </div>
          <small>{t.contactNote}</small>
        </div>
      </div>
    </section>
  )
}
