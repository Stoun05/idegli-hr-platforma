import { useEffect, useMemo, useState } from 'react'
import './company.css'
import AboutSection from './components/AboutSection.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import ApplicationSection from './components/ApplicationSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import FinalCta from './components/FinalCta.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import HeroSection from './components/HeroSection.jsx'
import JobsSection from './components/JobsSection.jsx'
import ProcessSection from './components/ProcessSection.jsx'
import ServicesSection from './components/ServicesSection.jsx'
import { companyCopy } from './data/companyContent.js'
import { copy, jobs } from './data/siteContent.js'
import { getApplicationBackendMode, submitApplication } from './services/applicationRepository.js'

function App() {
  const [lang, setLang] = useState('tm')
  const [menuOpen, setMenuOpen] = useState(false)
  const [audience, setAudience] = useState('candidate')
  const [submitted, setSubmitted] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === '#/admin')
  const t = useMemo(() => ({ ...copy[lang], ...companyCopy[lang] }), [lang])
  const backendMode = getApplicationBackendMode()

  useEffect(() => {
    const handleHashChange = () => setIsAdmin(window.location.hash === '#/admin')
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const scrollToForm = (nextAudience, role = '') => {
    setAudience(nextAudience)
    setSubmitted(false)
    setSelectedRole(nextAudience === 'candidate' ? role : '')
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (application) => {
    const result = await submitApplication({ ...application, locale: lang })
    setSubmitted(result.ok)
    return result
  }

  if (isAdmin) {
    return <AdminDashboard lang={lang} setLang={setLang} />
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
        <AboutSection t={t} />
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
          backendMode={backendMode}
        />
        <ContactSection t={t} scrollToForm={scrollToForm} />
        <FinalCta t={t} scrollToForm={scrollToForm} />
      </main>

      <Footer t={t} />
    </div>
  )
}

export default App
