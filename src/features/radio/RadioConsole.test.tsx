/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The message desk, from the visitor's side of it.
 *
 * The site key is read once, when the module loads, so each case imports a
 * fresh copy of the desk after deciding whether there is one. Turnstile and
 * the Worker are both played by stubs: Turnstile hands back a token as soon
 * as it is drawn, and `fetch` answers however the case needs.
 */

vi.mock(import('../../shared/engine/audio'), async (importOriginal) => ({
  ...(await importOriginal()),
  confirm: vi.fn(),
  jingle: vi.fn(),
}))

let now = 0
let fetchMock: ReturnType<typeof vi.fn>

async function openDesk(siteKey: string) {
  vi.resetModules()
  vi.stubEnv('VITE_TURNSTILE_SITE_KEY', siteKey)
  const { RadioConsole } = await import('./RadioConsole')
  render(<RadioConsole />)
}

/** Fills the desk in the way a person would, then lets the clock run on. */
async function fillIn(from = 'ada@example.com') {
  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText('Ada Lovelace'), 'Ada')
  if (from)
    await user.type(screen.getByPlaceholderText('ada@example.com'), from)
  await user.type(
    screen.getByPlaceholderText('Hi Kitsos, I found you on your island…'),
    'Hello there',
  )
  now += 20_000
  return user
}

const transmit = () => screen.getByRole('button', { name: /Transmit/ })

beforeEach(() => {
  now = 1_000_000
  vi.spyOn(Date, 'now').mockImplementation(() => now)
  fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }))
  vi.stubGlobal('fetch', fetchMock)
  window.turnstile = {
    render: vi.fn((_el, options) => {
      options.callback('turnstile-token')
      return 'widget-1'
    }),
    remove: vi.fn(),
  }
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  delete window.turnstile
})

describe('with the transmitter on', () => {
  it('says the message goes straight to my inbox', async () => {
    await openDesk('site-key')
    expect(screen.getByText(/come straight to my inbox/)).toBeInTheDocument()
    expect(window.turnstile?.render).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: 'site-key', action: 'radio' }),
    )
  })

  it('posts the message with its token, and says it arrived', async () => {
    await openDesk('site-key')
    const user = await fillIn()
    await waitFor(() => expect(transmit()).toBeEnabled())
    await user.click(transmit())

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Signal received',
    )
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/transmit')
    expect(JSON.parse(init.body)).toMatchObject({
      name: 'Ada',
      from: 'ada@example.com',
      message: 'Hello there',
      company: '',
      token: 'turnstile-token',
      elapsed: 20_000,
    })
    // The message is cleared, and a fresh challenge drawn for the next one.
    expect(
      screen.getByPlaceholderText('Hi Kitsos, I found you on your island…'),
    ).toHaveValue('')
    expect(window.turnstile?.render).toHaveBeenCalledTimes(2)
  })

  it('waits for the challenge before it can be pressed', async () => {
    window.turnstile!.render = vi.fn(() => 'widget-1')
    await openDesk('site-key')
    await fillIn()
    expect(transmit()).toBeDisabled()
  })

  it('asks for a reply address before sending anything', async () => {
    await openDesk('site-key')
    const user = await fillIn('not-an-address')
    await waitFor(() => expect(transmit()).toBeEnabled())
    await user.click(transmit())
    expect(screen.getByRole('alert')).toHaveTextContent(
      'That email address does not look right',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('offers the mail client when the transmitter is down', async () => {
    fetchMock.mockResolvedValue(
      Response.json({ ok: false, problem: 'relay' }, { status: 502 }),
    )
    await openDesk('site-key')
    const user = await fillIn()
    await waitFor(() => expect(transmit()).toBeEnabled())
    await user.click(transmit())

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('The transmitter is down')
    const link = screen.getByRole('link', { name: 'Open it in my mail client' })
    expect(link.getAttribute('href')).toMatch(
      /^mailto:kitsorfan@protonmail\.com\?subject=/,
    )
  })

  it('treats a network failure the same way', async () => {
    fetchMock.mockRejectedValue(new TypeError('offline'))
    await openDesk('site-key')
    const user = await fillIn()
    await waitFor(() => expect(transmit()).toBeEnabled())
    await user.click(transmit())
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The transmitter is down',
    )
  })

  it('gives up on a transmitter that never answers', async () => {
    // Stand in for the clock running out: the desk's own timeout signal is
    // one the test aborts, and the Worker is a fetch that never settles
    // until it is.
    const clock = new AbortController()
    const timeout = vi
      .spyOn(AbortSignal, 'timeout')
      .mockReturnValue(clock.signal)
    fetchMock.mockImplementation(
      (_url, init: RequestInit) =>
        new Promise((_resolve, reject) =>
          init.signal?.addEventListener('abort', () =>
            reject(init.signal?.reason),
          ),
        ),
    )
    await openDesk('site-key')
    const user = await fillIn()
    await waitFor(() => expect(transmit()).toBeEnabled())
    await user.click(transmit())

    expect(transmit()).toHaveTextContent('Transmitting…')
    expect(timeout).toHaveBeenCalledWith(15_000)
    clock.abort(new DOMException('The operation timed out.', 'TimeoutError'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The transmitter is down',
    )
    expect(transmit()).not.toHaveTextContent('Transmitting…')
  })

  it('says when to wait, rather than offering a workaround', async () => {
    fetchMock.mockResolvedValue(
      Response.json({ ok: false, problem: 'busy' }, { status: 429 }),
    )
    await openDesk('site-key')
    const user = await fillIn()
    await waitFor(() => expect(transmit()).toBeEnabled())
    await user.click(transmit())
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many messages',
    )
    expect(
      screen.queryByRole('link', { name: 'Open it in my mail client' }),
    ).not.toBeInTheDocument()
  })

  it('sends nothing for whatever fills in the trap', async () => {
    await openDesk('site-key')
    const user = await fillIn()
    await user.type(document.getElementById('radio-company')!, 'ACME')
    await waitFor(() => expect(transmit()).toBeEnabled())
    await user.click(transmit())
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('sends nothing for whatever fills it in too fast', async () => {
    await openDesk('site-key')
    const user = await fillIn()
    now -= 20_000
    await waitFor(() => expect(transmit()).toBeEnabled())
    await user.click(transmit())
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('with no transmitter configured', () => {
  it('hands the message to the mail client, as before', async () => {
    // jsdom cannot follow a mailto: and says so on the console.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await openDesk('')
    expect(screen.getByText(/This island has no backend/)).toBeInTheDocument()
    expect(window.turnstile?.render).not.toHaveBeenCalled()

    const user = await fillIn('')
    await user.click(transmit())
    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Signal sent to your mail client',
    )
  })
})
