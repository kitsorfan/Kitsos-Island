import { useState } from 'react'
import { PROFILE } from '../data/profile'
import * as sfx from '../game/audio'

const SUBJECTS = [
  'A role I think you would fit',
  'Freelance / collaboration',
  'Technical question',
  'Just saying hello',
]

type CopyKey = 'email' | 'phone' | null

export function RadioConsole() {
  const [name, setName] = useState('')
  const [from, setFrom] = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState<CopyKey>(null)
  const [sent, setSent] = useState(false)

  const body = [
    message.trim(),
    '',
    '—',
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

  const transmit = () => {
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
          <span className="channel__band">Channel 1 · Email</span>
          <strong>{PROFILE.email}</strong>
        </a>
        <button
          className="channel channel--button"
          onClick={() => copy('email', PROFILE.email)}
        >
          <span className="channel__band">Clipboard</span>
          <strong>{copied === 'email' ? 'Copied ✓' : 'Copy address'}</strong>
        </button>

        <a
          className="channel"
          href={`tel:${PROFILE.phone.replace(/\s/g, '')}`}
          onClick={() => sfx.confirm()}
        >
          <span className="channel__band">Channel 2 · Phone</span>
          <strong>{PROFILE.phone}</strong>
        </a>
        <button
          className="channel channel--button"
          onClick={() => copy('phone', PROFILE.phone)}
        >
          <span className="channel__band">Clipboard</span>
          <strong>{copied === 'phone' ? 'Copied ✓' : 'Copy number'}</strong>
        </button>

        <a
          className="channel channel--wide"
          href={PROFILE.linkedin}
          target="_blank"
          rel="noreferrer"
          onClick={() => sfx.confirm()}
        >
          <span className="channel__band">Channel 3 · LinkedIn</span>
          <strong>{PROFILE.linkedinLabel}</strong>
        </a>
      </div>

      <div className="radio__desk">
        <h3 className="panel__heading">Channel 4 · Message desk</h3>
        <p className="panel__text">
          This island has no backend — the desk hands your message to your own mail
          client, already addressed and written.
        </p>

        <div className="field-row">
          <label className="field">
            <span>Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Lovelace"
            />
          </label>
          <label className="field">
            <span>Your email</span>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="ada@example.com"
              type="email"
            />
          </label>
        </div>

        <label className="field">
          <span>Subject</span>
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Message</span>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hi Kitsos — I found you on your island…"
          />
        </label>

        <div className="radio__actions">
          <button
            className="button button--primary"
            onClick={transmit}
            disabled={!message.trim()}
          >
            📡 Transmit
          </button>
          <button
            className="button"
            onClick={() => copy('email', `${PROFILE.email}\n\n${body}`)}
          >
            Copy message
          </button>
        </div>
        {sent && (
          <p className="radio__status">
            Signal sent to your mail client. If nothing opened, copy the message
            instead — the address is {PROFILE.email}.
          </p>
        )}
      </div>
    </div>
  )
}
