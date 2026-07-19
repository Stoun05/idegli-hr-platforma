import { useEffect, useRef, useState } from 'react'
import '../turnstile.css'

const SCRIPT_ID = 'cloudflare-turnstile-script'
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile)

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID)

    if (existing) {
      existing.addEventListener('load', () => resolve(window.turnstile), { once: true })
      existing.addEventListener('error', () => reject(new Error('Turnstile script could not be loaded.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.turnstile)
    script.onerror = () => reject(new Error('Turnstile script could not be loaded.'))
    document.head.appendChild(script)
  })
}

export default function TurnstileWidget({ siteKey, lang, resetKey, onToken, onError }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const callbacksRef = useRef({ onToken, onError })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    callbacksRef.current = { onToken, onError }
  }, [onToken, onError])

  useEffect(() => {
    let active = true

    const renderWidget = async () => {
      if (!siteKey || !containerRef.current) return

      setLoading(true)

      try {
        const turnstile = await loadTurnstileScript()
        if (!active || !turnstile || !containerRef.current) return

        if (widgetIdRef.current != null) {
          turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action: 'idegli_application',
          theme: 'dark',
          size: 'flexible',
          language: lang === 'ru' ? 'ru' : 'auto',
          callback: (token) => callbacksRef.current.onToken?.(token),
          'expired-callback': () => callbacksRef.current.onToken?.(''),
          'timeout-callback': () => callbacksRef.current.onToken?.(''),
          'error-callback': (code) => {
            callbacksRef.current.onToken?.('')
            callbacksRef.current.onError?.(String(code || 'turnstile-error'))
          },
        })
      } catch (error) {
        callbacksRef.current.onToken?.('')
        callbacksRef.current.onError?.(error instanceof Error ? error.message : 'Turnstile failed.')
      } finally {
        if (active) setLoading(false)
      }
    }

    renderWidget()

    return () => {
      active = false
      if (window.turnstile && widgetIdRef.current != null) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [siteKey, lang])

  useEffect(() => {
    if (window.turnstile && widgetIdRef.current != null) {
      window.turnstile.reset(widgetIdRef.current)
      onToken?.('')
    }
  }, [resetKey])

  return (
    <div className="turnstile-field">
      {loading && <span className="turnstile-loading">Cloudflare Turnstile…</span>}
      <div ref={containerRef} className="turnstile-widget" />
    </div>
  )
}
