import { useMemo, useState } from 'react'
import ApplicationSection from './components/ApplicationSection.jsx'
import FinalCta from './components/FinalCta.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import HeroSection from './components/HeroSection.jsx'
import JobsSection from './components/JobsSection.jsx'
import ProcessSection from './components/ProcessSection.jsx'
import ServicesSection from './components/ServicesSection.jsx'
import { copy, jobs } from './data/siteContent.js'

function App() {
  const [lang, setLang] = useState('tm')
  const [menuOpen, setMenuOpen] = useState(false)
  const [audience, setAudience] = useState('candidate')
  const [submitted, setSubmitted] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const t = useMemo(() => copy[lang], [lang])

  const scrollToForm = (nextAudience, role = '') => {
    setAudience(nextAudience)
    setSubmitted(false)
    setSelectedRole(nextAudience === 'candidate' ? role : '')
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="site-shell">
      <Header
        t={t}
        lang={lang}
        menuOpen={menuOpen}
        setLang={setLang}
        setMenuOpen={setMenuOpen}
        scrollToForm={scrollToForm}
      />

      <main>
        <HeroSection t={t} scrollToForm={scrollToForm} />
        <ServicesSection t={t} />
        <JobsSection t={t} jobs={jobs} lang={lang} scrollToForm={scrollToForm} />
        <ProcessSection t={t} />
        <ApplicationSection
          t={t}
          lang={lang}
          audience={audience}
          setAudience={setAudience}
          submitted={submitted}
          setSubmitted={setSubmitted}
          selectedRole={selectedRole}
          handleSubmit={handleSubmit}
        />
        <FinalCta t={t} scrollToForm={scrollToForm} />
      </main>

      <Footer t={t} />
    </div>
  )
}

export default App
