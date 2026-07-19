export default function Footer({ t }) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <a className="brand inverted" href="#top">
          <span className="brand-mark">I</span>
          <span>IDEGLI</span>
        </a>
        <p>{t.footerText}</p>
      </div>
      <div className="footer-links">
        <a href="#services">{t.nav[0]}</a>
        <a href="#jobs">{t.nav[1]}</a>
        <a href="#process">{t.nav[2]}</a>
        <a href="#apply">{t.nav[3]}</a>
      </div>
      <div className="footer-bottom">
        <span>© 2026 IDEGLI. {t.rights}</span>
        <span>Aşgabat, Türkmenistan</span>
      </div>
    </footer>
  )
}
