/**
 * The island's one piece of backend: the Radio Center's transmitter.
 *
 * Everything else on kitsorfan.com is static files, served by Cloudflare
 * straight from dist/ without this Worker ever running (wrangler.jsonc sends
 * only /api/* here first). This takes a message from the desk, makes sure a
 * person wrote it, and mails it on to my own inbox.
 *
 * The mail goes out through Cloudflare's send_email binding, which only ever
 * delivers to an address verified in Email Routing. That is the whole reason
 * it costs nothing, and also the reason it cannot be turned into a relay for
 * anyone else's mail: the one place it can send to is mine.
 */
import {
  TRANSMIT_PATH,
  checkTransmission,
  looksAutomated,
  messageBody,
  subjectLine,
  type Reply,
} from '../src/features/radio/transmission.ts'

/** The slice of the send_email binding this Worker uses. */
export interface Mailer {
  send(message: {
    to: string
    from: string
    replyTo?: string
    subject: string
    text: string
  }): Promise<{ messageId: string }>
}

/** The slice of the rate limiting binding this Worker uses. */
export interface Limiter {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

export interface Env {
  RADIO: Mailer
  /** Optional, so a local run without the binding still works. */
  RADIO_LIMIT?: Limiter
  /** Set with `wrangler secret put TURNSTILE_SECRET`, never committed. */
  TURNSTILE_SECRET: string
  /** The verified Email Routing destination: my inbox. */
  RADIO_TO: string
  /** The address on kitsorfan.com the mail is sent from. */
  RADIO_FROM: string
}

/**
 * Nothing a message legitimately needs comes near this. It is here so the
 * body is never read in full before it is known to be a reasonable size.
 */
const MAX_BODY = 16 * 1024

const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * The _headers file does not reach responses a Worker writes itself, so the
 * ones that matter for a JSON answer are set here.
 */
function answer(status: number, reply: Reply, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(reply), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  })
}

/** Asks Turnstile whether the token came from a browser that passed. */
async function challengePassed(token: string, secret: string, ip: string) {
  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (ip) form.append('remoteip', ip)
  try {
    const res = await fetch(SITEVERIFY, { method: 'POST', body: form })
    const outcome = (await res.json()) as { success?: boolean }
    return outcome.success === true
  } catch {
    // Turnstile being unreachable is not a pass.
    return false
  }
}

export async function handle(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname !== TRANSMIT_PATH) {
    return new Response('Not found', { status: 404 })
  }
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    })
  }

  // Only the island's own page may post here. A browser always sends Origin
  // on a cross-site POST and cannot be made to lie about it.
  if (request.headers.get('Origin') !== url.origin) {
    return answer(403, { ok: false, problem: 'malformed' })
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? ''
  if (env.RADIO_LIMIT) {
    const { success } = await env.RADIO_LIMIT.limit({ key: ip || 'unknown' })
    if (!success) return answer(429, { ok: false, problem: 'busy' })
  }

  if (!request.headers.get('Content-Type')?.includes('application/json')) {
    return answer(415, { ok: false, problem: 'malformed' })
  }
  const declared = Number(request.headers.get('Content-Length') ?? 0)
  if (declared > MAX_BODY) {
    return answer(413, { ok: false, problem: 'malformed' })
  }
  const raw = await request.text()
  if (raw.length > MAX_BODY) {
    return answer(413, { ok: false, problem: 'malformed' })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return answer(400, { ok: false, problem: 'malformed' })
  }

  const checked = checkTransmission(parsed)
  if (!checked.ok) return answer(400, checked)
  const t = checked.value

  // A bot is told it succeeded. Telling it why it failed is how it learns.
  if (looksAutomated(t)) return answer(200, { ok: true })

  if (!(await challengePassed(t.token, env.TURNSTILE_SECRET, ip))) {
    return answer(403, { ok: false, problem: 'challenge' })
  }

  try {
    await env.RADIO.send({
      to: env.RADIO_TO,
      from: env.RADIO_FROM,
      replyTo: t.from,
      subject: subjectLine(t.subject),
      text: messageBody(t),
    })
  } catch (error) {
    console.error('radio: the message could not be handed on', error)
    return answer(502, { ok: false, problem: 'relay' })
  }

  return answer(200, { ok: true })
}

export default { fetch: handle }
