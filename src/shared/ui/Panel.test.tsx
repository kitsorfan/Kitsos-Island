/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Panel } from './Panel'
import { useGame } from '../state/store'
import type { PanelSection } from '../../types'
import { downloadCv } from '../../features/cv/downloadCv'

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
    await vi.importActual<typeof import('../engine/audio')>('../game/audio')
  return new Proxy(actual, {
    get: (target, prop) => {
      const real = Reflect.get(target, prop)
      return typeof real === 'function' && prop !== 'LEVELS' ? vi.fn() : real
    },
  })
})

vi.mock('../../features/cv/downloadCv', () => ({ downloadCv: vi.fn() }))

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

  it('tells a promotion as one job with every title in it', () => {
    const { container } = render(<Panel />)
    act(() => {
      useGame.getState().openPanel({
        kicker: 'The keeper',
        title: 'The job',
        accent: '#ff8c1a',
        kind: 'board',
        sections: [
          {
            heading: 'At the lighthouse',
            blocks: [
              {
                type: 'timeline',
                entries: [
                  {
                    title: 'Head keeper',
                    org: 'The lighthouse',
                    meta: '2026 – present',
                    steps: [
                      { title: 'Head keeper', meta: '2026 – present' },
                      { title: 'Keeper', meta: '2024 – 2026' },
                    ],
                    bullets: ['Kept the lamp lit.'],
                  },
                ],
              },
            ],
          },
        ],
      })
    })
    // One entry, the employer named once, and each title with its dates.
    expect(container.querySelectorAll('.timeline__item')).toHaveLength(1)
    expect(container.querySelectorAll('.timeline__org')).toHaveLength(1)
    expect(screen.getByText('Head keeper')).toBeInTheDocument()
    expect(screen.getByText('Keeper')).toBeInTheDocument()
    expect(screen.getByText('2024 – 2026')).toBeInTheDocument()
  })
})

describe('the full CV panel', () => {
  const openCv = () => {
    act(() => {
      useGame.getState().openPanel({
        kicker: 'Skip ahead',
        title: 'The full CV',
        sections,
        accent: '#1f6f8b',
        kind: 'cv',
      })
    })
  }

  it('offers the PDF in the header, without scrolling for it', () => {
    render(<Panel />)
    openCv()
    const head = document.querySelector('.panel__head')
    const button = screen.getByRole('button', { name: /Download CV/ })
    expect(head?.contains(button)).toBe(true)
  })

  it('hands the PDF over and says so', () => {
    vi.mocked(downloadCv).mockClear()
    render(<Panel />)
    openCv()
    act(() => {
      screen.getByRole('button', { name: /Download CV/ }).click()
    })
    expect(downloadCv).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: /Saved/ })).toBeInTheDocument()
  })

  it('keeps it out of every other panel', () => {
    render(<Panel />)
    open()
    expect(screen.queryByRole('button', { name: /Download CV/ })).toBeNull()
  })
})
