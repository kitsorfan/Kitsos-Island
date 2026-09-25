/**
 * What a message from the Radio Center desk is, and what makes one fit to
 * send.
 *
 * Read on both sides of the wire: the desk uses it to decide whether the
 * Transmit button may be pressed at all, and the Worker behind /api/transmit
 * uses the very same rules to decide whether to pass it on. Written once so
 * the two can never disagree about what a valid message looks like.
 */

/** Where the desk posts to. The Worker answers this path and nothing else. */
export const TRANSMIT_PATH = '/api/transmit'

export const SUBJECTS = [
  'A role I think you would fit',
  'Freelance / collaboration',
  'Technical question',
  'Just saying hello',
] as const

export type Subject = (typeof SUBJECTS)[number]

/**
 * How long a person needs to fill this in, at the very fastest. A bot fills
 * every field in the same tick it finds them; nobody types a name, an
 * address and a message in under three seconds.
 */
export const HUMAN_MS = 3000

export const LIMITS = {
  name: 100,
  /** The longest address RFC 5321 allows through. */
  from: 254,
  message: 5000,
  /** Turnstile's own ceiling on a token. */
  token: 2048,
} as const

/** What the desk sends. Everything is a string or a number: it is JSON. */
export interface Transmission {
  name: string
  from: string
  subject: Subject
  message: string
  /** The honeypot. Anything in it means no person filled the form in. */
  company: string
  /** Milliseconds between the desk opening and Transmit being pressed. */
  elapsed: number
  /** The Turnstile token, proving a browser solved the challenge. */
  token: string
}

/** Why a message was turned away, so the desk can say which field to fix. */
export type Problem = 'name' | 'from' | 'subject' | 'message' | 'malformed'

/**
 * What the Worker answers with. Beyond the field problems, the ones the desk
 * cannot fix by editing: the challenge was not passed, too many messages came
 * from one place in a minute, or the mail itself could not be handed on.
 */
export type Reply =
  | { ok: true }
  | { ok: false; problem: Problem | 'challenge' | 'busy' | 'relay' }

export type Checked =
  { ok: true; value: Transmission } | { ok: false; problem: Problem }

/**
 * Deliberately loose: something, an @, something with a dot in it. The real
 * test of an address is whether a reply to it arrives, and a stricter pattern
 * only ever turns away the unusual addresses that are perfectly valid.
 */
const ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** A line break has no business in a name or an address, only in the body. */
const BREAK = /[\r\n]/

/**
 * Trim, check and narrow whatever arrived into a Transmission.
 *
 * Takes `unknown` rather than a Transmission because on the Worker's side it
 * is handed straight from `request.json()`, and nothing that came over the
 * network has earned a type yet.
 */
export function checkTransmission(raw: unknown): Checked {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, problem: 'malformed' }
  }
  const r = raw as Record<string, unknown>
  const text = (key: string) =>
    typeof r[key] === 'string' ? (r[key] as string).trim() : null

  const name = text('name')
  const from = text('from')
  const subject = text('subject')
  const message = text('message')
  const company = text('company')
  const token = text('token')
  const elapsed = r.elapsed

  if (
    name === null ||
    from === null ||
    subject === null ||
    message === null ||
    company === null ||
    token === null ||
    typeof elapsed !== 'number' ||
    !Number.isFinite(elapsed) ||
    token.length > LIMITS.token
  ) {
    return { ok: false, problem: 'malformed' }
  }

  if (name.length > LIMITS.name || BREAK.test(name)) {
    return { ok: false, problem: 'name' }
  }
  if (from.length > LIMITS.from || !ADDRESS.test(from)) {
    return { ok: false, problem: 'from' }
  }
  if (!(SUBJECTS as readonly string[]).includes(subject)) {
    return { ok: false, problem: 'subject' }
  }
  if (message === '' || message.length > LIMITS.message) {
    return { ok: false, problem: 'message' }
  }

  return {
    ok: true,
    value: {
      name,
      from,
      subject: subject as Subject,
      message,
      company,
      elapsed,
      token,
    },
  }
}

/**
 * True when whatever filled this in was not a person: something typed in
 * the field none of them can see, or the whole form arrived faster than
 * anyone can type it.
 */
export function looksAutomated(t: Pick<Transmission, 'company' | 'elapsed'>) {
  return t.company.trim() !== '' || t.elapsed < HUMAN_MS
}

/** The subject line as it lands in the inbox. */
export function subjectLine(subject: string) {
  return `[Kitsos Island] ${subject}`
}

/**
 * The message as it lands in the inbox, signed off with who sent it. The
 * desk's mail-client fallback writes exactly the same body, so a message
 * reads the same whichever way it arrived.
 */
export function messageBody(
  t: Pick<Transmission, 'name' | 'from' | 'message'>,
) {
  // Null for a line with nothing to say, so that the blank line between the
  // message and the signature survives the filter and the empty ones do not.
  return [
    t.message.trim(),
    '',
    '–',
    t.name.trim() ? `From: ${t.name.trim()}` : null,
    t.from.trim() ? `Reply to: ${t.from.trim()}` : null,
    'Sent from the Radio Center on Kitsos Island.',
  ]
    .filter((line) => line !== null)
    .join('\n')
}
