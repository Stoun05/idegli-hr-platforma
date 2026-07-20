import { useEffect, useRef, useState } from 'react'
import '../candidate-profile.css'

const MAX_CV_SIZE = 5 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx']

const copy = {
  tm: {
    title: 'Kandidat anketasy', badge: 'AUTO-FILL', text: 'Bu maglumatlar täze ýüz tutmalarda awtomatik doldurylar.',
    role: 'Islenýän wezipe', experience: 'Tejribe derejesi', languages: 'Bilýän dilleri', salary: 'Garaşýan aýlygy',
    message: 'Özüňiz barada gysgaça', save: 'Anketany saklamak', saving: 'Saklanýar...', saved: 'Kandidat anketasy täzelendi.',
    cv: 'Esasy CV', cvHint: 'PDF, DOC ýa-da DOCX · iň köp 5 MB', choose: 'CV saýlamak', replace: 'Çalyşmak', remove: 'Aýyrmak',
    selected: 'Täze saýlanan CV', current: 'Kabinetde saklanan CV', noCv: 'CV entek goşulmady.',
    formatError: 'Diňe PDF, DOC ýa-da DOCX faýly kabul edilýär.', sizeError: 'CV 5 MB-dan uly bolmaly däl.',
    removeConfirm: 'Kabinetde saklanan CV-ni aýyrmalymy?', complete: 'Anketa dolulygy',
    experiencePlaceholder: 'Tejribe derejesini saýlaň',
    experienceOptions: [
      { value: 'none', label: 'Tejribesiz' },
      { value: 'junior', label: '1–2 ýyl' },
      { value: 'mid', label: '3–5 ýyl' },
      { value: 'senior', label: '5 ýyldan köp' },
    ],
  },
  ru: {
    title: 'Анкета кандидата', badge: 'AUTO-FILL', text: 'Эти данные будут автоматически подставляться в новые отклики.',
    role: 'Желаемая должность', experience: 'Уровень опыта', languages: 'Языки', salary: 'Ожидаемая зарплата',
    message: 'Кратко о себе', save: 'Сохранить анкету', saving: 'Сохраняем...', saved: 'Анкета кандидата обновлена.',
    cv: 'Основное резюме', cvHint: 'PDF, DOC или DOCX · до 5 МБ', choose: 'Выбрать CV', replace: 'Заменить', remove: 'Удалить',
    selected: 'Новое выбранное CV', current: 'CV сохранено в кабинете', noCv: 'Резюме пока не добавлено.',
    formatError: 'Поддерживаются только PDF, DOC и DOCX.', sizeError: 'Размер CV не должен превышать 5 МБ.',
    removeConfirm: 'Удалить сохранённое в кабинете резюме?', complete: 'Заполнение анкеты',
    experiencePlaceholder: 'Выберите уровень опыта',
    experienceOptions: [
      { value: 'none', label: 'Без опыта' },
      { value: 'junior', label: '1–2 года' },
      { value: 'mid', label: '3–5 лет' },
      { value: 'senior', label: 'Более 5 лет' },
    ],
  },
}

function completion(profile) {
  const values = [profile.role, profile.experienceKey, profile.languages, profile.salary, profile.message, profile.cv]
  return Math.round((values.filter(Boolean).length / values.length) * 100)
}

export default function CandidateProfilePanel({ lang, profile, busy, onSave, onDeleteCv }) {
  const [form, setForm] = useState(profile || {})
  const [cvFile, setCvFile] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)
  const t = copy[lang]
  const percent = completion({ ...form, cv: cvFile || profile?.cv })

  useEffect(() => {
    setForm(profile || {})
    setCvFile(null)
    setSaved(false)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }, [profile])

  const update = (key, value) => {
    setSaved(false)
    setForm((current) => ({ ...current, [key]: value }))
  }

  const selectCv = (event) => {
    const file = event.target.files?.[0]
    setSaved(false)
    setError('')
    if (!file) return setCvFile(null)

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      event.target.value = ''
      setCvFile(null)
      return setError(t.formatError)
    }

    if (file.size > MAX_CV_SIZE) {
      event.target.value = ''
      setCvFile(null)
      return setError(t.sizeError)
    }

    setCvFile(file)
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSaved(false)

    try {
      await onSave?.({
        role: String(form.role || '').trim(),
        experienceKey: String(form.experienceKey || ''),
        languages: String(form.languages || '').trim(),
        salary: String(form.salary || '').trim(),
        message: String(form.message || '').trim(),
      }, cvFile)
      setSaved(true)
      setCvFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Candidate profile could not be saved.')
    }
  }

  const deleteCv = async () => {
    if (!profile?.cv || !window.confirm(t.removeConfirm)) return
    setError('')
    setSaved(false)

    try {
      await onDeleteCv?.()
      setCvFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Candidate CV could not be removed.')
    }
  }

  return (
    <section className="candidate-profile-card">
      <div className="portal-section-heading"><h2>{t.title}</h2><span>{t.badge}</span></div>
      <p className="candidate-profile-note">{t.text}</p>

      <div className="candidate-completion">
        <div><span>{t.complete}</span><strong>{percent}%</strong></div>
        <div className="candidate-completion-track"><span style={{ width: `${percent}%` }} /></div>
      </div>

      <form onSubmit={submit}>
        <label><span>{t.role}</span><input value={form.role || ''} onChange={(event) => update('role', event.target.value)} /></label>
        <label><span>{t.experience}</span><select value={form.experienceKey || ''} onChange={(event) => update('experienceKey', event.target.value)}>
          <option value="">{t.experiencePlaceholder}</option>
          {t.experienceOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select></label>
        <label><span>{t.languages}</span><input value={form.languages || ''} placeholder="Türkmen, Русский, English" onChange={(event) => update('languages', event.target.value)} /></label>
        <label><span>{t.salary}</span><input value={form.salary || ''} inputMode="numeric" onChange={(event) => update('salary', event.target.value)} /></label>
        <label><span>{t.message}</span><textarea rows="3" value={form.message || ''} onChange={(event) => update('message', event.target.value)} /></label>

        <div className="candidate-profile-cv">
          <div><strong>{t.cv}</strong><small>{t.cvHint}</small></div>
          <input ref={fileRef} id="portal-candidate-cv" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={selectCv} />
          <div className="candidate-profile-cv-row">
            <span className="candidate-profile-cv-icon">CV</span>
            <div>
              <strong>{cvFile?.name || profile?.cv?.name || t.noCv}</strong>
              <small>{cvFile ? `${t.selected} · ${(cvFile.size / 1024 / 1024).toFixed(2)} MB` : profile?.cv ? t.current : t.cvHint}</small>
            </div>
            <label htmlFor="portal-candidate-cv">{profile?.cv || cvFile ? t.replace : t.choose}</label>
          </div>
          {profile?.cv && <button className="candidate-profile-remove" type="button" disabled={busy} onClick={deleteCv}>{t.remove}</button>}
        </div>

        {error && <div className="portal-error" role="alert">{error}</div>}
        {saved && <div className="portal-saved" role="status">{t.saved}</div>}
        <button className="portal-primary-button" type="submit" disabled={busy}>{busy ? t.saving : t.save}</button>
      </form>
    </section>
  )
}
