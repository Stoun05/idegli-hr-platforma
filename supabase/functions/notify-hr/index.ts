import { createClient } from 'npm:@supabase/supabase-js@2'

type JsonObject = Record<string, unknown>

type ApplicationEvent = {
  id: string
  application_id: string
  event_type: 'created' | 'status_changed' | 'note_added'
  from_status: string | null
  to_status: string | null
  actor_email: string | null
  actor_role: string | null
  metadata: JsonObject | null
  created_at: string
}

type ApplicationRow = {
  id: string
  audience: 'candidate' | 'employer'
  status: string
  locale: 'tm' | 'ru'
  fields: JsonObject
  created_at: string
  updated_at: string
}

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: ApplicationEvent | null
  old_record: ApplicationEvent | null
}

type NotificationContent = {
  subject: string
  text: string
  telegramHtml: string
  emailHtml: string
  replyTo?: string
  summary: JsonObject
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const WEBHOOK_SECRET = Deno.env.get('NOTIFICATION_WEBHOOK_SECRET') || ''
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || ''
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID') || ''
const TELEGRAM_MESSAGE_THREAD_ID = Deno.env.get('TELEGRAM_MESSAGE_THREAD_ID') || ''
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const EMAIL_FROM = Deno.env.get('NOTIFICATION_EMAIL_FROM') || ''
const EMAIL_TO = Deno.env.get('NOTIFICATION_EMAIL_TO') || ''
const ADMIN_PANEL_URL = Deno.env.get('ADMIN_PANEL_URL') || 'https://stoun05.github.io/idegli-hr-platforma/#/admin'
const NOTIFY_ON_NOTE_ADDED = (Deno.env.get('NOTIFY_ON_NOTE_ADDED') || 'true').toLowerCase() !== 'false'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const statusLabels: Record<string, string> = {
  new: 'Täze arza',
  review: 'Seredilýär',
  contacted: 'Habarlaşyldy',
  interview: 'Söhbetdeşlik',
  presented: 'Hödürlendi',
  completed: 'Tamamlandy',
  rejected: 'Ret edildi',
}

function jsonResponse(body: JsonObject, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function secureEqual(left: string, right: string) {
  if (!left || !right || left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function field(fields: JsonObject, key: string) {
  const value = fields[key]
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value)
}

function applicationTitle(application: ApplicationRow) {
  const fields = application.fields || {}
  if (application.audience === 'candidate') {
    return field(fields, 'name') || field(fields, 'email') || 'Kandidat'
  }
  return field(fields, 'company') || field(fields, 'name') || 'Iş beriji'
}

function applicationRole(application: ApplicationRow) {
  const fields = application.fields || {}
  return application.audience === 'candidate'
    ? field(fields, 'role') || field(fields, 'experience')
    : field(fields, 'vacancy') || field(fields, 'industry')
}

function notificationRows(application: ApplicationRow) {
  const fields = application.fields || {}
  const rows: Array<[string, string]> = []

  const add = (label: string, value: string) => {
    if (value) rows.push([label, value])
  }

  add(application.audience === 'candidate' ? 'Kandidat' : 'Kompaniýa', applicationTitle(application))
  add(application.audience === 'candidate' ? 'Wezipe' : 'Wakansiýa', applicationRole(application))
  add('Telefon', field(fields, 'phone'))
  add('E-poçta', field(fields, 'email'))
  add('Şäher', field(fields, 'city') || field(fields, 'location'))

  if (application.audience === 'employer') {
    add('Işgär sany', field(fields, 'headcount'))
    add('Iş görnüşi', field(fields, 'workType'))
  }

  return rows
}

function buildNotification(event: ApplicationEvent, application: ApplicationRow): NotificationContent {
  const title = applicationTitle(application)
  const role = applicationRole(application)
  const rows = notificationRows(application)
  const actor = event.actor_email || event.actor_role || 'Ulgam'
  const currentStatus = statusLabels[application.status] || application.status

  let headline = ''
  let subject = ''
  let eventLine = ''

  if (event.event_type === 'created') {
    headline = application.audience === 'candidate' ? 'Täze kandidat arzasy' : 'Täze iş beriji sargydy'
    subject = `IDEGLI: ${headline} — ${title}`
    eventLine = `Status: ${currentStatus}`
  } else if (event.event_type === 'status_changed') {
    const fromStatus = statusLabels[event.from_status || ''] || event.from_status || '—'
    const toStatus = statusLabels[event.to_status || ''] || event.to_status || currentStatus
    headline = 'Arza statusy üýtgedildi'
    subject = `IDEGLI: Status üýtgedildi — ${title}`
    eventLine = `${fromStatus} → ${toStatus} · ${actor}`
  } else {
    headline = 'Täze HR belligi goşuldy'
    subject = `IDEGLI: HR belligi — ${title}`
    eventLine = `Goşan: ${actor}`
  }

  const plainRows = rows.map(([label, value]) => `${label}: ${value}`).join('\n')
  const text = [
    headline,
    '',
    plainRows,
    eventLine,
    role ? `Ugury: ${role}` : '',
    '',
    `Admin paneli: ${ADMIN_PANEL_URL}`,
  ].filter(Boolean).join('\n')

  const telegramRows = rows
    .map(([label, value]) => `<b>${escapeHtml(label)}:</b> ${escapeHtml(value)}`)
    .join('\n')

  const telegramHtml = [
    `<b>${escapeHtml(headline)}</b>`,
    '',
    telegramRows,
    `<b>Waka:</b> ${escapeHtml(eventLine)}`,
    '',
    `<a href="${escapeHtml(ADMIN_PANEL_URL)}">Admin panelini açmak</a>`,
  ].join('\n')

  const emailRows = rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px;color:#65706a;border-bottom:1px solid #e6e7e2;">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;font-weight:600;border-bottom:1px solid #e6e7e2;">${escapeHtml(value)}</td>
      </tr>`)
    .join('')

  const emailHtml = `
    <!doctype html>
    <html lang="tk">
      <body style="margin:0;background:#f3f2ed;color:#17231e;font-family:Arial,sans-serif;">
        <div style="max-width:680px;margin:0 auto;padding:32px 18px;">
          <div style="background:#13231d;color:#fff;padding:28px;border-radius:20px 20px 0 0;">
            <div style="font-size:12px;letter-spacing:.12em;color:#d8ff63;">IDEGLI HR PLATFORMASY</div>
            <h1 style="margin:14px 0 0;font-size:28px;line-height:1.2;">${escapeHtml(headline)}</h1>
          </div>
          <div style="background:#fff;padding:26px;border-radius:0 0 20px 20px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">${emailRows}</table>
            <div style="margin-top:22px;padding:14px 16px;border-radius:12px;background:#f2f6e6;">
              <strong>Waka:</strong> ${escapeHtml(eventLine)}
            </div>
            <a href="${escapeHtml(ADMIN_PANEL_URL)}" style="display:inline-block;margin-top:24px;padding:13px 18px;border-radius:999px;background:#13231d;color:#fff;text-decoration:none;font-weight:700;">
              Admin panelini açmak
            </a>
          </div>
        </div>
      </body>
    </html>`

  const replyTo = field(application.fields || {}, 'email')

  return {
    subject,
    text,
    telegramHtml,
    emailHtml,
    replyTo: replyTo.includes('@') ? replyTo : undefined,
    summary: {
      title,
      role,
      audience: application.audience,
      eventType: event.event_type,
      status: application.status,
    },
  }
}

function emailRecipients() {
  return EMAIL_TO.split(/[;,]/).map((item) => item.trim()).filter(Boolean)
}

async function beginDelivery(
  event: ApplicationEvent,
  channel: 'telegram' | 'email',
  recipient: string,
  payload: JsonObject,
) {
  const { data: existing, error: selectError } = await supabase
    .from('notification_deliveries')
    .select('id,status,attempts')
    .eq('event_id', event.id)
    .eq('channel', channel)
    .eq('recipient', recipient)
    .maybeSingle()

  if (selectError) throw selectError
  if (existing?.status === 'sent') return { id: existing.id as string, alreadySent: true }

  if (existing?.id) {
    const { error } = await supabase
      .from('notification_deliveries')
      .update({
        status: 'processing',
        attempts: Number(existing.attempts || 0) + 1,
        error_message: null,
        payload,
      })
      .eq('id', existing.id)

    if (error) throw error
    return { id: existing.id as string, alreadySent: false }
  }

  const { data, error } = await supabase
    .from('notification_deliveries')
    .insert({
      event_id: event.id,
      application_id: event.application_id,
      event_type: event.event_type,
      channel,
      recipient,
      status: 'processing',
      payload,
    })
    .select('id')
    .single()

  if (error) throw error
  return { id: data.id as string, alreadySent: false }
}

async function finishDelivery(
  id: string,
  status: 'sent' | 'failed' | 'skipped',
  providerMessageId = '',
  errorMessage = '',
) {
  const { error } = await supabase
    .from('notification_deliveries')
    .update({
      status,
      provider_message_id: providerMessageId || null,
      error_message: errorMessage ? errorMessage.slice(0, 2000) : null,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (error) console.error('notification delivery log update failed', error)
}

async function sendTelegram(event: ApplicationEvent, content: NotificationContent) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return { channel: 'telegram', skipped: true, reason: 'not configured' }

  const delivery = await beginDelivery(event, 'telegram', TELEGRAM_CHAT_ID, content.summary)
  if (delivery.alreadySent) return { channel: 'telegram', skipped: true, reason: 'already sent' }

  try {
    const body: JsonObject = {
      chat_id: TELEGRAM_CHAT_ID,
      text: content.telegramHtml,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      protect_content: true,
    }

    if (TELEGRAM_MESSAGE_THREAD_ID) {
      body.message_thread_id = Number(TELEGRAM_MESSAGE_THREAD_ID)
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const result = await response.json().catch(() => ({})) as JsonObject
    if (!response.ok || result.ok === false) {
      throw new Error(String(result.description || `Telegram returned ${response.status}`))
    }

    const telegramResult = result.result as JsonObject | undefined
    const messageId = telegramResult?.message_id ? String(telegramResult.message_id) : ''
    await finishDelivery(delivery.id, 'sent', messageId)
    return { channel: 'telegram', sent: true, messageId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Telegram notification failed.'
    await finishDelivery(delivery.id, 'failed', '', message)
    return { channel: 'telegram', sent: false, error: message }
  }
}

async function sendEmail(event: ApplicationEvent, content: NotificationContent) {
  const recipients = emailRecipients()
  if (!RESEND_API_KEY || !EMAIL_FROM || recipients.length === 0) {
    return { channel: 'email', skipped: true, reason: 'not configured' }
  }

  const recipientKey = recipients.join(',')
  const delivery = await beginDelivery(event, 'email', recipientKey, content.summary)
  if (delivery.alreadySent) return { channel: 'email', skipped: true, reason: 'already sent' }

  try {
    const payload: JsonObject = {
      from: EMAIL_FROM,
      to: recipients,
      subject: content.subject,
      html: content.emailHtml,
      text: content.text,
    }

    if (content.replyTo) payload.reply_to = content.replyTo

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `idegli/${event.id}/email`,
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json().catch(() => ({})) as JsonObject
    if (!response.ok) {
      throw new Error(String(result.message || result.name || `Resend returned ${response.status}`))
    }

    const messageId = result.id ? String(result.id) : ''
    await finishDelivery(delivery.id, 'sent', messageId)
    return { channel: 'email', sent: true, messageId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email notification failed.'
    await finishDelivery(delivery.id, 'failed', '', message)
    return { channel: 'email', sent: false, error: message }
  }
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: 'Supabase server environment is incomplete.' }, 503)
  }

  if (!WEBHOOK_SECRET) {
    return jsonResponse({ error: 'NOTIFICATION_WEBHOOK_SECRET is not configured.' }, 503)
  }

  const providedSecret = request.headers.get('x-idegli-webhook-secret') || ''
  if (!secureEqual(providedSecret, WEBHOOK_SECRET)) {
    return jsonResponse({ error: 'Unauthorized webhook request.' }, 401)
  }

  let payload: WebhookPayload
  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON payload.' }, 400)
  }

  const event = payload.record
  if (payload.type !== 'INSERT' || payload.schema !== 'public' || payload.table !== 'application_events' || !event) {
    return jsonResponse({ ok: true, ignored: true, reason: 'Unsupported database event.' })
  }

  if (event.event_type === 'note_added' && !NOTIFY_ON_NOTE_ADDED) {
    return jsonResponse({ ok: true, ignored: true, reason: 'Note notifications are disabled.' })
  }

  const { data: application, error } = await supabase
    .from('applications')
    .select('id,audience,status,locale,fields,created_at,updated_at')
    .eq('id', event.application_id)
    .single<ApplicationRow>()

  if (error || !application) {
    console.error('application fetch failed', error)
    return jsonResponse({ error: 'Application could not be loaded.' }, 500)
  }

  const content = buildNotification(event, application)
  const results = await Promise.all([
    sendTelegram(event, content),
    sendEmail(event, content),
  ])

  const sentCount = results.filter((item) => 'sent' in item && item.sent).length
  const failedCount = results.filter((item) => 'sent' in item && item.sent === false).length

  return jsonResponse({
    ok: failedCount === 0,
    eventId: event.id,
    applicationId: event.application_id,
    sentCount,
    failedCount,
    results,
  }, failedCount > 0 ? 207 : 200)
})
