import { useEffect, useRef } from 'react'

/**
 * Cloudflare Turnstile, the check that a person is at the desk.
 *
 * Most visitors never see it do anything: it decides in the background and
 * hands back a token, which the Worker then asks Cloudflare about. Only a
 * browser that looks wrong is shown a box to tick.
 *
 * The script is fetched the first time a desk opens rather than with the
 * island, so nobody who never visits the Radio Center downloads it.
 */

const SCRIPT =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

interface TurnstileApi {
  render(
    element: HTMLElement,
    options: {
      sitekey: string
      action?: string
      theme?: 'auto' | 'light' | 'dark'
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    },
  ): string
  remove(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let loading: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT
    script.async = true
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error())
    script.onerror = () => {
      // Let the next desk try again rather than inheriting the failure.
      loading = null
      reject(new Error('Turnstile did not load'))
    }
    document.head.appendChild(script)
  })
  return loading
}

/**
 * Renders the widget and reports its token, or '' whenever there is none to
 * send (not yet solved, expired, or failed). A token is good for one message:
 * remount this, with a new `key`, to get a fresh one after each send.
 */
export function Turnstile({
  siteKey,
  onToken,
}: {
  siteKey: string
  onToken: (token: string) => void
}) {
  const host = useRef<HTMLDivElement>(null)
  // Read through a ref so a new callback from each render of the desk does
  // not tear the widget down and put it back.
  const report = useRef(onToken)
  useEffect(() => {
    report.current = onToken
  })

  useEffect(() => {
    let widget: string | null = null
    let gone = false
    loadTurnstile()
      .then((api) => {
        if (gone || !host.current) return
        widget = api.render(host.current, {
          sitekey: siteKey,
          action: 'radio',
          theme: 'light',
          callback: (token) => report.current(token),
          'expired-callback': () => report.current(''),
          'error-callback': () => report.current(''),
        })
      })
      .catch(() => report.current(''))
    return () => {
      gone = true
      if (widget !== null) window.turnstile?.remove(widget)
    }
  }, [siteKey])

  return <div className="radio__turnstile" ref={host} />
}
