import ArrowIcon from './ArrowIcon.jsx'

export default function FinalCta({ t, scrollToForm }) {
  return (
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
  )
}
