/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Panel } from './Panel'
import { useGame } from '../state/store'
import type { PanelSection } from '../types'

/**
 * The card that opens when something on the island is looked at properly.
 *
 * It is the island's main way of showing writing, so the things worth
 * checking are the ones a reader would notice: that the panel says what it is
 * about, that a long one starts at the top rather than wherever the last one
 * was scrolled to, and that there is always a way to shut it — by the button,
 * and by pressing the darkness around it.
 */

vi.mock('../game/audio', async () => {
  const actual =
    await vi.importActual<typeof import('../game/audio')>('../game/audio')
  return new Proxy(actual, {
    get: (target, prop) => {
      const real = Reflect.get(target, prop)
      return typeof real === 'function' && prop !== 'LEVELS' ? vi.fn() : real
    },
  })
})

const PRISTINE = useGame.getState()

beforeEach(() => {
  useGame.setState(PRISTINE, true)
  act(() => {
    useGame.getState().start()
  })
})

const sections: PanelSection[] = [
  {
    heading: 'What it was',
    blocks: [{ type: 'text', text: 'A lamp at the top of a tower.' }],
  },
]

const open = () => {
  act(() => {
    useGame.getState().openPanel({
      kicker: 'The lighthouse',
      title: 'The lamp',
      sections,
      accent: '#ff8c1a',
      kind: 'board',
    })
  })
}

describe('Panel', () => {
  it('shows nothing when nothing is open', () => {
    const { container } = render(<Panel />)
    expect(container).toBeEmptyDOMElement()
  })

  it('says what it is about', () => {
    render(<Panel />)
    open()
    expect(screen.getByText('The lamp')).toBeInTheDocument()
    expect(screen.getByText('The lighthouse')).toBeInTheDocument()
  })

  it('shows what it has to say', () => {
    render(<Panel />)
    open()
    expect(screen.getByText('What it was')).toBeInTheDocument()
    expect(
      screen.getByText('A lamp at the top of a tower.'),
    ).toBeInTheDocument()
  })

  it('shuts on its own button', () => {
    render(<Panel />)
    open()
    act(() => {
      screen.getByRole('button', { name: /close/i }).click()
    })
    expect(useGame.getState().mode).toBe('explore')
  })

  it('shuts when the darkness around it is pressed', () => {
    // Somewhere to press that is not a button, for anybody who did not spot
    // the one in the corner.
    const { container } = render(<Panel />)
    open()
    const overlay = container.querySelector('.overlay')!
    act(() => {
      overlay.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    })
    expect(useGame.getState().mode).toBe('explore')
  })

  it('does not shut when the card itself is pressed', () => {
    // Otherwise selecting a line of the writing would close what you were
    // reading.
    render(<Panel />)
    open()
    act(() => {
      screen
        .getByText('A lamp at the top of a tower.')
        .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    })
    expect(useGame.getState().mode).toBe('panel')
  })
})
