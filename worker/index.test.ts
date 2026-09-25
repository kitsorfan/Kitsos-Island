import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handle, type Env } from './index'
import { SUBJECTS, TRANSMIT_PATH } from '../src/features/radio/transmission'

/**
 * The transmitter, driven the way Cloudflare drives it: a Request in, a
 * Response out, and the bindings standing in as fakes. Turnstile is the one
 * thing reached over the network, so `fetch` is stubbed to play its part.
 */

const ORIGIN = 'https://www.kitsorfan.com'

const MESSAGE = {
  name: 'Ada Lovelace',
  from: 'ada@example.com',
  subject: SUBJECTS[2],
  message: 'How does the lighthouse open?',
  company: '',
  elapsed: 15_000,
  token: 'a-token',
}

let env: Env & {
  RADIO: { send: ReturnType<typeof vi.fn> }
  RADIO_LIMIT: { limit: ReturnType<typeof vi.fn> }
}
let siteverify: ReturnType<typeof vi.fn>

beforeEach(() => {
  env = {
    RADIO: { send: vi.fn().mockResolvedValue({ messageId: 'm1' }) },
    RADIO_LIMIT: { limit: vi.fn().mockResolvedValue({ success: true }) },
    TURNSTILE_SECRET: 'secret',
    RADIO_TO: 'kitsorfan@protonmail.com',
    RADIO_FROM: 'radio@kitsorfan.com',
  }
  siteverify = vi.fn().mockResolvedValue(Response.json({ success: true }))
  vi.stubGlobal('fetch', siteverify)
  return () => vi.unstubAllGlobals()
})

function post(
  body: unknown,
  headers: Record<string, string> = {},
  path = TRANSMIT_PATH,
) {
  return new Request(`${ORIGIN}${path}`, {
    method: 'POST',
    headers: {
      Origin: ORIGIN,
      'Content-Type': 'application/json',
      'CF-Connecting-IP': '203.0.113.7',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

async function send(request: Request) {
  const res = await handle(request, env)
  const text = await res.text()
  let json: unknown = null
  try {
    json = JSON.parse(text)
  } catch {
    // Not every answer is JSON: the 404 and the 405 are plain text.
  }
  return { status: res.status, json, headers: res.headers }
}

describe('a message from the desk', () => {
  it('is mailed to my inbox, with the sender as the reply address', async () => {
    const { status, json } = await send(post(MESSAGE))
    expect(status).toBe(200)
    expect(json).toEqual({ ok: true })
    expect(env.RADIO.send).toHaveBeenCalledWith({
      to: 'kitsorfan@protonmail.com',
      from: 'radio@kitsorfan.com',
      replyTo: 'ada@example.com',
      subject: '[Kitsos Island] Technical question',
      text: expect.stringContaining('How does the lighthouse open?'),
    })
  })

  it('has its Turnstile token checked with the secret and the IP', async () => {
    await send(post(MESSAGE))
    const [url, init] = siteverify.mock.calls[0]
    expect(url).toBe(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    )
    const form = init.body as FormData
    expect(form.get('secret')).toBe('secret')
    expect(form.get('response')).toBe('a-token')
    expect(form.get('remoteip')).toBe('203.0.113.7')
  })

  it('is counted against the address it came from', async () => {
    await send(post(MESSAGE))
    expect(env.RADIO_LIMIT.limit).toHaveBeenCalledWith({ key: '203.0.113.7' })
  })

  it('is answered with no-store JSON', async () => {
    const { headers } = await send(post(MESSAGE))
    expect(headers.get('Content-Type')).toContain('application/json')
    expect(headers.get('Cache-Control')).toBe('no-store')
  })
})

describe('what is turned away', () => {
  it('answers 404 anywhere but the transmit path', async () => {
    expect((await send(post(MESSAGE, {}, '/api/other'))).status).toBe(404)
  })

  it('answers 405 to anything but a POST', async () => {
    const { status, headers } = await send(
      new Request(`${ORIGIN}${TRANSMIT_PATH}`),
    )
    expect(status).toBe(405)
    expect(headers.get('Allow')).toBe('POST')
  })

  it('refuses a post from another site, or from no page at all', async () => {
    expect(
      (await send(post(MESSAGE, { Origin: 'https://evil.example' }))).status,
    ).toBe(403)
    const bare = post(MESSAGE)
    bare.headers.delete('Origin')
    expect((await send(bare)).status).toBe(403)
    expect(env.RADIO.send).not.toHaveBeenCalled()
  })

  it('answers 429 once the address has sent too many', async () => {
    env.RADIO_LIMIT.limit.mockResolvedValue({ success: false })
    const { status, json } = await send(post(MESSAGE))
    expect(status).toBe(429)
    expect(json).toEqual({ ok: false, problem: 'busy' })
    expect(env.RADIO.send).not.toHaveBeenCalled()
  })

  it('still works with no rate limiter bound, as in a local run', async () => {
    const { RADIO_LIMIT: _, ...bare } = env
    const res = await handle(post(MESSAGE), bare)
    expect(res.status).toBe(200)
  })

  it('refuses anything that is not JSON', async () => {
    const { status } = await send(
      post(MESSAGE, { 'Content-Type': 'text/plain' }),
    )
    expect(status).toBe(415)
  })

  it('refuses a body too big to be a message, before reading it', async () => {
    const huge = { ...MESSAGE, message: 'm'.repeat(20_000) }
    expect((await send(post(huge))).status).toBe(413)

    // A Request built here drops Content-Length (the fetch spec forbids
    // setting it), so the one Cloudflare hands over is played by hand.
    const text = vi.fn()
    const declared = {
      url: `${ORIGIN}${TRANSMIT_PATH}`,
      method: 'POST',
      headers: new Headers({
        Origin: ORIGIN,
        'Content-Type': 'application/json',
        'Content-Length': '999999',
      }),
      text,
    } as unknown as Request
    expect((await send(declared)).status).toBe(413)
    expect(text).not.toHaveBeenCalled()
  })

  it('refuses JSON that does not parse', async () => {
    const { status, json } = await send(post('{"name":'))
    expect(status).toBe(400)
    expect(json).toEqual({ ok: false, problem: 'malformed' })
  })

  it('says which field is wrong', async () => {
    const { status, json } = await send(post({ ...MESSAGE, from: 'nope' }))
    expect(status).toBe(400)
    expect(json).toEqual({ ok: false, problem: 'from' })
  })

  it('tells a bot it succeeded, and sends nothing', async () => {
    for (const bot of [
      { ...MESSAGE, company: 'ACME Ltd' },
      { ...MESSAGE, elapsed: 40 },
    ]) {
      const { status, json } = await send(post(bot))
      expect(status).toBe(200)
      expect(json).toEqual({ ok: true })
    }
    expect(siteverify).not.toHaveBeenCalled()
    expect(env.RADIO.send).not.toHaveBeenCalled()
  })

  it('refuses a message whose challenge did not pass', async () => {
    siteverify.mockResolvedValue(Response.json({ success: false }))
    const { status, json } = await send(post(MESSAGE))
    expect(status).toBe(403)
    expect(json).toEqual({ ok: false, problem: 'challenge' })
    expect(env.RADIO.send).not.toHaveBeenCalled()
  })

  it('does not count Turnstile being unreachable as a pass', async () => {
    siteverify.mockRejectedValue(new TypeError('network down'))
    expect((await send(post(MESSAGE))).status).toBe(403)
    expect(env.RADIO.send).not.toHaveBeenCalled()
  })

  it('answers 502 when the mail cannot be handed on', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    env.RADIO.send.mockRejectedValue(new Error('E_DELIVERY'))
    const { status, json } = await send(post(MESSAGE))
    expect(status).toBe(502)
    expect(json).toEqual({ ok: false, problem: 'relay' })
  })
})
