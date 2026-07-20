import { useEffect, useMemo, useState } from 'react'
import './company.css'
import AboutSection from './components/AboutSection.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import AdminPortal from './components/AdminPortal.jsx'
import ApplicationSection from './components/ApplicationSection.jsx'
import ContactSection from './components/ContactSection.jsx'
import FinalCta from './components/FinalCta.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import HeroSection from './components/HeroSection.jsx'
import JobsSection from './components/JobsSection.jsx'
import PortalCallbackPage from './components/PortalCallbackPage.jsx'
import PortalPage from './components/PortalPage.jsx'
import PortalRecoveryPage from './components/PortalRecoveryPage.jsx'
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
  const [route, setRoute] = useState(() => window.location.hash)
  const t = useMemo(() => ({ ...copy[lang], ...companyCopy[lang] }), [lang])
  const backendMode = getApplicationBackendMode()
  const portalFlow = new URLSearchParams(window.location.search).get('portal') || ''

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      setRoute(hash)
      setMenuOpen(false)

      if (hash === '#apply-candidate' || hash === '#apply-employer') {
        setAudience(hash === '#apply-candidate' ? 'candidate' : 'employer')
        setSelectedRole('')
        setSubmitted(false)
        window.setTimeout(() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' }), 0)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
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

  if (portalFlow === 'recovery') {
    return <PortalRecoveryPage lang={lang} setLang={setLang} />
  }

  if (portalFlow === 'callback') {
    return <PortalCallbackPage lang={lang} setLang={setLang} />
  }

  if (route === '#/admin') {
    return backendMode === 'supabase'
      ? <AdminPortal lang={lang} setLang={setLang} />
      : <AdminDashboard lang={lang} setLang={setLang} />
  }

  if (route === '#/portal') {
    return <PortalPage lang={lang} setLang={setLang} />
  }

  return (
    <div className="site-shell">
      <Header t={t} lang={lang} menuOpen={menuOpen} setLang={setLang} setMenuOpen={setMenuOpen} scrollToForm={scrollToForm} />
      <main>
        <HeroSection t={t} scrollToForm={scrollToForm} />
        <ServicesSection t={t} />
        <JobsSection t={t} jobs={jobs} lang={lang} scrollToForm={scrollToForm} />
        <AboutSection t={t} />
        <ProcessSection t={t} />
        <ApplicationSection
          t={t} lang={lang} audience={audience} setAudience={setAudience}
          submitted={submitted} setSubmitted={setSubmitted} selectedRole={selectedRole}
          handleSubmit={handleSubmit} backendMode={backendMode}
        />
        <ContactSection t={t} scrollToForm={scrollToForm} />
        <FinalCta t={t} scrollToForm={scrollToForm} />
      </main>
      <Footer t={t} lang={lang} />
    </div>
  )
}

export default App
