import { useEffect, useRef, useState } from 'react'
import { PROFILE } from '../data/profile'
import * as sfx from '../game/audio'
import { useT } from '../i18n/useT'

const SUBJECTS = [
  'A role I think you would fit',
  'Freelance / collaboration',
  'Technical question',
  'Just saying hello',
]

type CopyKey = 'email' | 'link' | 'message' | null

/**
 * How long a person needs to fill this in, at the very fastest. A bot fills
 * every field in the same tick it finds them; nobody types a name, an
 * address and a message in under three seconds.
 */
const HUMAN_MS = 3000

export function RadioConsole() {
  const t = useT()
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState<CopyKey>(null)
  const [sent, setSent] = useState(false)
  /**
   * The honeypot's contents, and when the desk was opened.
   *
   * There is no backend here to defend: the desk hands the message to the
   * visitor's own mail client, so the worst a bot can do is harvest the
   * address or set a mailto off. Both are worth refusing, and both are
   * refused in silence — telling a bot why it failed is how it learns.
   */
  const [trap, setTrap] = useState('')
  const openedAt = useRef(0)
  // Stamped once the desk is actually on screen, rather than while it is
  // being rendered: the clock is not something to read during a render.
  useEffect(() => {
    openedAt.current = Date.now()
  }, [])

  const body = [
    message.trim(),
    '',
    '–',
    name.trim() && `From: ${name.trim()}`,
    from.trim() && `Reply to: ${from.trim()}`,
    'Sent from the Radio Center on Kitsos Island.',
  ]
    .filter(Boolean)
    .join('\n')

  const mailto = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
    `[Kitsos Island] ${subject}`,
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

  /**
   * True when whatever filled this in was not a person: something typed in
   * the field none of them can see, or the whole form arrived faster than
   * anyone can type it.
   */
  const automated = () =>
    trap.trim() !== '' || Date.now() - openedAt.current < HUMAN_MS

  const transmit = () => {
    // Silently. A bot gets the same nothing whichever test it failed, and a
    // person cannot reach this branch: the field is off-screen and the three
    // seconds are gone before they have finished the first line.
    if (automated()) return
    sfx.jingle()
    setSent(true)
    window.location.href = mailto
  }

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
          {t(
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
            />
          </label>
        </div>

        <label className="field">
          <span>{t('Subject')}</span>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
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

        <div className="radio__actions">
          <button
            className="button button--primary"
            onClick={transmit}
            disabled={!message.trim()}
          >
            {t('📡 Transmit')}
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
        {sent && (
          <p className="radio__status">
            Signal sent to your mail client. If nothing opened, copy the message
            instead. The address is {PROFILE.email}.
          </p>
        )}
      </div>
    </div>
  )
}
