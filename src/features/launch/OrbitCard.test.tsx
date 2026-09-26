/**
 * @vitest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OrbitCard } from './OrbitCard'
import { useGame } from '../../shared/state/store'

/**
 * The card at the end of the flight.
 *
 * What is worth holding it to is the one thing that broke: the certificate
 * is a canvas, and a canvas that is painted by an effect is blank until
 * something runs that effect. The card comes up behind the credits, so the
 * first paint has to happen on the frame the credits end - not on the first
 * keystroke after it.
 */

vi.mock('../../shared/engine/audio', async () => {
  const actual = await vi.importActual<
    typeof import('../../shared/engine/audio')
  >('../../shared/engine/audio')
  return new Proxy(actual, {
    get: (target, prop) => {
      const real = Reflect.get(target, prop)
      return typeof real === 'function' && prop !== 'LEVELS' ? vi.fn() : real
    },
  })
})
vi.mock('../cv/downloadCv', () => ({ downloadCv: vi.fn() }))

/* The preview is drawn straight onto a 2d context, which jsdom does not
   implement. Only whether it was asked to draw matters here, so the context
   is a stub and `drawCertificate` is spied on. */
const drawn = vi.hoisted(() => vi.fn())
vi.mock('./certificate', async () => {
  const actual =
    await vi.importActual<typeof import('./certificate')>('./certificate')
  return { ...actual, drawCertificate: drawn, downloadCertificate: vi.fn() }
})

beforeEach(() => {
  drawn.mockClear()
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => ({}) as unknown as CanvasRenderingContext2D,
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext
})

describe('the certificate preview', () => {
  it('is painted as soon as the credits end, without a keystroke', () => {
    /* Arrived, and the roll still playing: the card is not on screen yet. */
    act(() => {
      useGame.setState({
        launch: { started: 0, arrived: true },
        credits: true,
      })
    })
    render(<OrbitCard />)
    expect(drawn).not.toHaveBeenCalled()

    /*
     * The roll ends and the canvas mounts for the first time. Nothing the
     * visitor did changed - no name typed, no language switched - so if the
     * effect only watches those it will not run, and the card comes up
     * blank. This is the regression.
     */
    act(() => {
      useGame.setState({ credits: false })
    })
    expect(drawn).toHaveBeenCalled()
  })
})

describe('the LinkedIn links', () => {
  beforeEach(() => {
    act(() => {
      useGame.setState({
        launch: { started: 0, arrived: true },
        credits: false,
      })
    })
  })

  const link = (name: RegExp) => screen.queryByRole('link', { name })

  it('offer the island to share before any name is typed', () => {
    render(<OrbitCard />)
    expect(link(/Share the island/)).toHaveAttribute(
      'href',
      expect.stringContaining(encodeURIComponent('https://www.kitsorfan.com/')),
    )
    expect(link(/Add to your LinkedIn profile/)).toBeNull()
  })

  it('offer the certificate for the profile once it has a name on it', () => {
    render(<OrbitCard />)
    fireEvent.change(screen.getByPlaceholderText('Your name'), {
      target: { value: 'Ada Lovelace' },
    })
    const add = link(/Add to your LinkedIn profile/)
    expect(add).toHaveAttribute(
      'href',
      expect.stringContaining('startTask=CERTIFICATION_NAME'),
    )
    expect(add?.getAttribute('href')).toContain('certId=KI-')
  })
})
