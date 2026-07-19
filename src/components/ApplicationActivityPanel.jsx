import { useState } from 'react'
import '../admin-activity.css'

const copy = {
  tm: {
    notesTitle: 'HR bellikleri',
    historyTitle: 'Kandidat taryhy',
    placeholder: 'Söhbetdeşlik, aragatnaşyk ýa-da indiki ädim barada içerki bellik ýazyň...',
    addNote: 'Belligi goşmak',
    saving: 'Saklanýar...',
    deleteNote: 'Pozmak',
    confirmDelete: 'Bu HR belligini pozmalymy?',
    noNotes: 'Häzirlikçe içerki bellik ýok.',
    noHistory: 'Taryh ýazgysy entek ýok.',
    created: 'Arza döredildi',
    statusChanged: 'Status üýtgedildi',
    noteAdded: 'HR belligi goşuldy',
    system: 'Ulgam',
    unknown: 'Näbelli ulanyjy',
    maxLength: 'Iň köp 4000 nyşan',
  },
  ru: {
    notesTitle: 'Заметки HR',
    historyTitle: 'История кандидата',
    placeholder: 'Добавьте внутреннюю заметку об интервью, контакте или следующем шаге...',
    addNote: 'Добавить заметку',
    saving: 'Сохраняем...',
    deleteNote: 'Удалить',
    confirmDelete: 'Удалить эту заметку HR?',
    noNotes: 'Внутренних заметок пока нет.',
    noHistory: 'История пока пуста.',
    created: 'Заявка создана',
    statusChanged: 'Статус изменён',
    noteAdded: 'Добавлена заметка HR',
    system: 'Система',
    unknown: 'Неизвестный пользователь',
    maxLength: 'До 4000 символов',
  },
}

const statusLabels = {
  tm: {
    new: 'Täze arza', review: 'Seredilýär', contacted: 'Habarlaşyldy', interview: 'Söhbetdeşlik',
    presented: 'Hödürlendi', completed: 'Tamamlandy', rejected: 'Ret edildi',
  },
  ru: {
    new: 'Новая заявка', review: 'На рассмотрении', contacted: 'Связались', interview: 'Интервью',
    presented: 'Представлен', completed: 'Завершено', rejected: 'Отказ',
  },
}

function formatDate(value, lang) {
  if (!value) return '—'
  return new Date(value).toLocaleString(lang === 'tm' ? 'tk-TM' : 'ru-RU')
}

function actorName(item, t) {
  return item.actorEmail || item.authorEmail || item.actorRole || item.authorRole || t.system
}

function eventText(event, t, labels) {
  if (event.type === 'status_changed') {
    const from = labels[event.fromStatus] || event.fromStatus || '—'
    const to = labels[event.toStatus] || event.toStatus || '—'
    return `${t.statusChanged}: ${from} → ${to}`
  }

  if (event.type === 'note_added') return t.noteAdded
  return t.created
}

export default function ApplicationActivityPanel({
  lang,
  notes = [],
  events = [],
  busy = false,
  onAddNote,
  onDeleteNote,
}) {
  const [noteBody, setNoteBody] = useState('')
  const [localError, setLocalError] = useState('')
  const t = copy[lang]
  const labels = statusLabels[lang]

  const submitNote = async (event) => {
    event.preventDefault()
    const trimmed = noteBody.trim()
    if (!trimmed) return

    setLocalError('')

    try {
      await onAddNote?.(trimmed)
      setNoteBody('')
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Note could not be saved.')
    }
  }

  const deleteNote = async (noteId) => {
    if (!window.confirm(t.confirmDelete)) return
    setLocalError('')

    try {
      await onDeleteNote?.(noteId)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Note could not be deleted.')
    }
  }

  return (
    <section className="application-activity-panel">
      <div className="activity-notes-column">
        <div className="activity-column-heading">
          <h3>{t.notesTitle}</h3>
          <span>{notes.length}</span>
        </div>

        <form className="activity-note-form" onSubmit={submitNote}>
          <textarea
            value={noteBody}
            maxLength={4000}
            rows={4}
            disabled={busy}
            placeholder={t.placeholder}
            onChange={(event) => setNoteBody(event.target.value)}
          />
          <div>
            <small>{noteBody.length}/4000 · {t.maxLength}</small>
            <button type="submit" disabled={busy || !noteBody.trim()}>
              {busy ? t.saving : t.addNote}
            </button>
          </div>
        </form>

        {localError && <p className="activity-local-error" role="alert">{localError}</p>}

        <div className="activity-note-list">
          {notes.length ? notes.map((note) => (
            <article className="activity-note-card" key={note.id}>
              <p>{note.body}</p>
              <footer>
                <span>{actorName(note, t)} · {formatDate(note.createdAt, lang)}</span>
                <button type="button" disabled={busy} onClick={() => deleteNote(note.id)}>{t.deleteNote}</button>
              </footer>
            </article>
          )) : <p className="activity-empty">{t.noNotes}</p>}
        </div>
      </div>

      <div className="activity-history-column">
        <div className="activity-column-heading">
          <h3>{t.historyTitle}</h3>
          <span>{events.length}</span>
        </div>

        <div className="activity-timeline">
          {events.length ? events.map((event) => (
            <article className={`activity-event event-${event.type}`} key={event.id}>
              <span className="activity-event-dot" aria-hidden="true" />
              <div>
                <strong>{eventText(event, t, labels)}</strong>
                <p>{actorName(event, t)} · {formatDate(event.createdAt, lang)}</p>
              </div>
            </article>
          )) : <p className="activity-empty">{t.noHistory}</p>}
        </div>
      </div>
    </section>
  )
}
