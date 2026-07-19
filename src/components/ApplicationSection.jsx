import { useRef, useState } from 'react'
import '../application.css'
import { applicationCopy } from '../data/applicationContent.js'
import ArrowIcon from './ArrowIcon.jsx'
import EmployerRequestFields from './EmployerRequestFields.jsx'

const MAX_CV_SIZE = 5 * 1024 * 1024
const ALLOWED_CV_EXTENSIONS = ['pdf', 'doc', 'docx']

export default function ApplicationSection({
  t,
  lang,
  audience,
  setAudience,
  submitted,
  setSubmitted,
  selectedRole,
  handleSubmit,
}) {
  const [cvFile, setCvFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [consent, setConsent] = useState(false)
  const [validationError, setValidationError] = useState('')
  const fileInputRef = useRef(null)
  const extra = applicationCopy[lang]

  const resetValidation = () => {
    setSubmitted(false)
    setValidationError('')
  }

  const changeAudience = (nextAudience) => {
    setAudience(nextAudience)
    resetValidation()
    setConsent(false)
  }

  const clearCv = () => {
    setCvFile(null)
    setFileError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    setSubmitted(false)
    setValidationError('')

    if (!file) {
      clearCv()
      return
    }

    const extension = file.name.split('.').pop()?.toLowerCase()

    if (!extension || !ALLOWED_CV_EXTENSIONS.includes(extension)) {
      setCvFile(null)
      setFileError(extra.cvFormatError)
      event.target.value = ''
      return
    }

    if (file.size > MAX_CV_SIZE) {
      setCvFile(null)
      setFileError(extra.cvSizeError)
      event.target.value = ''
      return
    }

    setCvFile(file)
    setFileError('')
  }

  const submitValidatedForm = (event) => {
    event.preventDefault()
    setSubmitted(false)
    setValidationError('')

    if (audience === 'candidate' && !cvFile) {
      setFileError(extra.cvRequired)
      setValidationError(extra.cvRequired)
      return
    }

    if (!consent) {
      setValidationError(extra.consentRequired)
      return
    }

    handleSubmit(event)
  }

  return (
    <section className="section form-section" id="apply">
      <div className="form-intro">
        <p className="eyebrow light"><span />{t.formEyebrow}</p>
        <h2>{t.formTitle}</h2>
        <div className="audience-tabs" role="tablist">
          <button
            type="button"
            className={audience === 'candidate' ? 'active' : ''}
            onClick={() => changeAudience('candidate')}
          >
            {t.candidateTab}
          </button>
          <button
            type="button"
            className={audience === 'employer' ? 'active' : ''}
            onClick={() => changeAudience('employer')}
          >
            {t.employerTab}
          </button>
        </div>
      </div>

      <div className="application-panel">
        <div className="application-copy">
          <span className="application-kicker">{audience === 'candidate' ? 'CANDIDATE' : 'EMPLOYER'} / 01</span>
          <h3>{audience === 'candidate' ? t.candidateTitle : t.employerTitle}</h3>
          <p>{audience === 'candidate' ? t.candidateText : t.employerText}</p>
        </div>

        <form onSubmit={submitValidatedForm}>
          <div className="form-grid">
            <label>
              <span>{t.fields.name}</span>
              <input required name="name" autoComplete="name" onChange={resetValidation} />
            </label>
            <label>
              <span>{t.fields.phone}</span>
              <input required name="phone" type="tel" autoComplete="tel" onChange={resetValidation} />
            </label>
            <label>
              <span>{t.fields.email}</span>
              <input required name="email" type="email" autoComplete="email" onChange={resetValidation} />
            </label>

            {audience === 'candidate' ? (
              <>
                <label>
                  <span>{extra.city}</span>
                  <input required name="city" autoComplete="address-level2" onChange={resetValidation} />
                </label>
                <label>
                  <span>{t.fields.role}</span>
                  <input
                    key={selectedRole || 'candidate-role'}
                    required
                    name="role"
                    defaultValue={selectedRole}
                    onChange={resetValidation}
                  />
                </label>
                <label>
                  <span>{t.fields.experience}</span>
                  <select required name="experience" defaultValue="" onChange={resetValidation}>
                    <option value="" disabled>{extra.experiencePlaceholder}</option>
                    {extra.experienceOptions.map((option) => <option value={option} key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  <span>{extra.languages}</span>
                  <input required name="languages" placeholder="Türkmen, Русский, English" onChange={resetValidation} />
                </label>
                <label>
                  <span>{extra.salary}</span>
                  <input name="salary" inputMode="numeric" onChange={resetValidation} />
                </label>
                <label className="wide-field">
                  <span>{t.fields.message}</span>
                  <textarea name="message" rows="3" onChange={resetValidation} />
                </label>

                <div className="cv-field">
                  <div className="cv-field-header">
                    <strong>{extra.cvTitle}</strong>
                    <small>{extra.cvHint}</small>
                  </div>
                  <div className="cv-dropzone">
                    <input
                      ref={fileInputRef}
                      id="candidate-cv"
                      name="cv"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                    />
                    <span className="cv-icon">CV</span>
                    <div className="cv-copy">
                      <strong>{cvFile ? cvFile.name : extra.cvChoose}</strong>
                      <span>{cvFile ? `${extra.cvSelected} · ${(cvFile.size / 1024 / 1024).toFixed(2)} MB` : extra.cvHint}</span>
                    </div>
                    {cvFile ? (
                      <button className="cv-action-button" type="button" onClick={clearCv}>{extra.cvRemove}</button>
                    ) : (
                      <label className="cv-action-button" htmlFor="candidate-cv">{extra.cvChoose}</label>
                    )}
                  </div>
                  {fileError && <p className="form-error-message" role="alert">{fileError}</p>}
                </div>
              </>
            ) : (
              <EmployerRequestFields t={t} extra={extra} resetValidation={resetValidation} />
            )}

            <label className="consent-field">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => {
                  setConsent(event.target.checked)
                  resetValidation()
                }}
              />
              <span>{audience === 'candidate' ? extra.consent : extra.employerConsent}</span>
            </label>

            {validationError && (
              <div className="form-validation-summary" role="alert">
                <strong>{extra.validationTitle}:</strong> {validationError}
              </div>
            )}
          </div>

          <div className="form-submit-row">
            <button className="button button-accent" type="submit">
              {audience === 'candidate' ? t.submitCandidate : t.submitEmployer} <ArrowIcon />
            </button>
            <small>{submitted ? t.submitted : t.privacy}</small>
          </div>
        </form>
      </div>
    </section>
  )
}
