import '../portal-link.css'

export default function Header({ t, lang, menuOpen, setLang, setMenuOpen, scrollToForm }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="IDEGLI baş sahypa">
        <span className="brand-mark">I</span>
        <span>IDEGLI</span>
      </a>

      <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Esasy menýu">
        <a href="#services" onClick={() => setMenuOpen(false)}>{t.nav[0]}</a>
        <a href="#jobs" onClick={() => setMenuOpen(false)}>{t.nav[1]}</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>{t.nav[2]}</a>
        <a href="#process" onClick={() => setMenuOpen(false)}>{t.nav[3]}</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>{t.nav[4]}</a>
      </nav>

      <div className="header-actions">
        <button
          className="language-button"
          type="button"
          onClick={() => setLang(lang === 'tm' ? 'ru' : 'tm')}
        >
          {t.language}
        </button>
        <a className="header-account-link" href="#/portal">
          {lang === 'tm' ? 'Kabinet' : 'Кабинет'}
        </a>
        <button className="header-cta" type="button" onClick={() => scrollToForm('employer')}>
          {t.findTalent}
        </button>
        <button
          className="menu-button"
          type="button"
          aria-label="Menýuny açmak"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}
