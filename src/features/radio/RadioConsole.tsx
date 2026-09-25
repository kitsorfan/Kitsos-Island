import { useEffect, useRef, useState } from 'react'
import { PROFILE } from '../cv/profile'
import * as sfx from '../../shared/engine/audio'
import { useT } from '../../shared/i18n/useT'
import { Turnstile } from './Turnstile'
import {
  SUBJECTS,
  TRANSMIT_PATH,
  checkTransmission,
  looksAutomated,
  messageBody,
  subjectLine,
  type Reply,
  type Subject,
} from './transmission'

type CopyKey = 'email' | 'link' | 'message' | null

/**
 * Where the desk is in sending a message. `failed` carries why, so the desk
 * can say whether it is something to fix or something to route around.
 */
type Status =
  | { at: 'idle' }
  | { at: 'sending' }
  | { at: 'sent' }
  | { at: 'mailed' }
  | { at: 'failed'; problem: Exclude<Reply, { ok: true }>['problem'] }

/**
 * The Turnstile site key, baked in at build time. Without one the desk has no
 * way to prove a person is at it, so it goes back to what it did before there
 * was a transmitter: hand the message to the visitor's own mail client.
 */
const SITE_KEY: string | undefined =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || undefined

/**
 * How long the desk waits on the transmitter before giving up on it. Turnstile
 * and the mail hand-off take a second or two between them; past this, it is
 * hanging rather than slow, and the visitor is better off with the mail
 * client than with a button that says "Transmitting…" forever.
 */
const TRANSMIT_TIMEOUT_MS = 15_000

export function RadioConsole() {
  const t = useT()
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [subject, setSubject] = useState<Subject>(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState<CopyKey>(null)
  const [status, setStatus] = useState<Status>({ at: 'idle' })
  const [token, setToken] = useState('')
  /** Bumped to remount Turnstile: each token is good for one message. */
  const [challenge, setChallenge] = useState(0)
  /**
   * The honeypot's contents, and when the desk was opened.
   *
   * Both are checked again by the Worker, which is the check that counts; the
   * ones here only spare it the request. Either way a bot is refused in
   * silence — telling a bot why it failed is how it learns.
   */
  const [trap, setTrap] = useState('')
  const openedAt = useRef(0)
  // Stamped once the desk is actually on screen, rather than while it is
  // being rendered: the clock is not something to read during a render.
  useEffect(() => {
    openedAt.current = Date.now()
  }, [])

  const online = SITE_KEY !== undefined
  const body = messageBody({ name, from, message })

  const mailto = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
    subjectLine(subject),
  )}&body=${encodeURIComponent(body)}`

  const copy = async (key: Exclude<CopyKey, null>, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      sfx.confirm()
      window.setTimeout(() => setCopied(null), 1800)
    } catch {
      setCopied(null)
    }
  }

  const automated = () =>
    looksAutomated({ company: trap, elapsed: Date.now() - openedAt.current })

  const handOver = () => {
    sfx.jingle()
    setStatus({ at: 'mailed' })
    window.location.href = mailto
  }

  const transmit = async () => {
    // Silently. A bot gets the same nothing whichever test it failed, and a
    // person cannot reach this branch: the field is off-screen and the three
    // seconds are gone before they have finished the first line.
    if (automated()) return
    if (!online) return handOver()

    const draft = {
      name,
      from,
      subject,
      message,
      company: trap,
      elapsed: Date.now() - openedAt.current,
      token,
    }
    const checked = checkTransmission(draft)
    if (!checked.ok) {
      setStatus({ at: 'failed', problem: checked.problem })
      return
    }

    setStatus({ at: 'sending' })
    let reply: Reply
    try {
      const res = await fetch(TRANSMIT_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
        // Covers reading the answer too, so a stalled body counts as well.
        signal: AbortSignal.timeout(TRANSMIT_TIMEOUT_MS),
      })
      reply = (await res.json()) as Reply
    } catch {
      reply = { ok: false, problem: 'relay' }
    }

    // Whatever happened, that token has been spent.
    setToken('')
    setChallenge((n) => n + 1)

    if (reply.ok) {
      sfx.jingle()
      setStatus({ at: 'sent' })
      setMessage('')
    } else {
      setStatus({ at: 'failed', problem: reply.problem })
    }
  }

  const sending = status.at === 'sending'
  const failed = status.at === 'failed' ? status.problem : null
  /** A failure the visitor cannot fix from here: offer the mail client. */
  const stranded = failed === 'relay' || failed === 'malformed'

  return (
    <div className="radio">
      <div className="radio__channels">
        <a
          className="channel"
          href={`mailto:${PROFILE.email}`}
          onClick={() => sfx.confirm()}
        >
          <span className="channel__band">{t('Channel 1 · Email')}</span>
          <strong>{PROFILE.email}</strong>
        </a>
        <button
          className="channel channel--button"
          onClick={() => copy('email', PROFILE.email)}
        >
          <span className="channel__band">{t('Clipboard')}</span>
          <strong>{copied === 'email' ? 'Copied ✓' : 'Copy address'}</strong>
        </button>

        <a
          className="channel"
          href={PROFILE.linkedin}
          target="_blank"
          rel="noreferrer"
          onClick={() => sfx.confirm()}
        >
          <span className="channel__band">{t('Channel 2 · LinkedIn')}</span>
          <strong>{PROFILE.linkedinLabel}</strong>
        </a>
        <button
          className="channel channel--button"
          onClick={() => copy('link', PROFILE.linkedin)}
        >
          <span className="channel__band">{t('Clipboard')}</span>
          <strong>{copied === 'link' ? 'Copied ✓' : 'Copy profile'}</strong>
        </button>
      </div>

      <div className="radio__desk">
        <h3 className="panel__heading">{t('Channel 3 · Message desk')}</h3>
        <p className="panel__text">
          {online
            ? t(
                'Messages from this desk come straight to my inbox. Leave an address and I will write back.',
              )
            : t(
                'This island has no backend. The desk hands your message to your own mail client, already addressed and written.',
              )}
        </p>

        <div className="field-row">
          <label className="field">
            <span>{t('Your name')}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('Ada Lovelace')}
            />
          </label>
          <label className="field">
            <span>{t('Your email')}</span>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder={t('ada@example.com')}
              type="email"
              required={online}
              aria-invalid={failed === 'from' || undefined}
            />
          </label>
        </div>

        <label className="field">
          <span>{t('Subject')}</span>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
          >
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>{t('Message')}</span>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('Hi Kitsos, I found you on your island…')}
          />
        </label>

        {/*
          The honeypot, named like a field worth filling and left out of the
          tab order, off the screen and out of the accessibility tree. No
          person will ever put anything in it. Anything that does is not one.
        */}
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="radio-company">Company</label>
          <input
            id="radio-company"
            name="company"
            type="text"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {SITE_KEY !== undefined && (
          <Turnstile key={challenge} siteKey={SITE_KEY} onToken={setToken} />
        )}

        <div className="radio__actions">
          <button
            className="button button--primary"
            onClick={transmit}
            disabled={!message.trim() || sending || (online && !token)}
          >
            {sending ? t('📡 Transmitting…') : t('📡 Transmit')}
          </button>
          <button
            className="button"
            onClick={() => {
              // This one hands over the address too, so it gets the same
              // test as the transmit button.
              if (automated()) return
              copy('message', `${PROFILE.email}\n\n${body}`)
            }}
          >
            {copied === 'message' ? 'Copied ✓' : 'Copy message'}
          </button>
        </div>

        {status.at === 'sent' && (
          <p className="radio__status" role="status">
            {t('Signal received. I will answer at the address you left.')}
          </p>
        )}
        {status.at === 'mailed' && (
          <p className="radio__status" role="status">
            Signal sent to your mail client. If nothing opened, copy the message
            instead. The address is {PROFILE.email}.
          </p>
        )}
        {failed && (
          <p className="radio__status radio__status--failed" role="alert">
            {failed === 'from' &&
              t('That email address does not look right. I need it to reply.')}
            {failed === 'name' && t('That name is too long for the desk.')}
            {failed === 'message' &&
              t('The message is empty, or longer than the desk can carry.')}
            {failed === 'subject' && t('Pick one of the subjects on the list.')}
            {failed === 'challenge' &&
              t('The check that you are a person did not pass. Try once more.')}
            {failed === 'busy' &&
              t('Too many messages in a minute. Wait a little and try again.')}
            {stranded && (
              <>
                {t(
                  'The transmitter is down. Your message is still here: send it from your own mail client instead.',
                )}{' '}
                <a
                  href={mailto}
                  onClick={() => {
                    sfx.jingle()
                    setStatus({ at: 'mailed' })
                  }}
                >
                  {t('Open it in my mail client')}
                </a>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
