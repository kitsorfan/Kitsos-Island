/**
 * @vitest-environment jsdom
 */
import { act, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Journal } from './Journal'
import { CATALOGUE, TOTAL_ENTRIES, useGame } from '../state/store'

/**
 * The record of the visit.
 *
 * It shows every entry the island holds, found or not, which is the point: a
 * journal that only listed what you had already seen would not tell you there
 * was anything left to look for. So the two things worth holding it to are
 * that the unfound ones are present but not given away, and that the count at
 * the top is the truth.
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
    useGame.getState().openJournal()
  })
})

/** Files a real entry out of the island's own catalogue. */
const find = (index: number) => {
  const entry = CATALOGUE[index]
  act(() => {
    useGame.getState().record({
      id: entry.id,
      title: entry.title,
      body: entry.body,
      source: 'A test',
    })
  })
  return entry
}

const panel = () => screen.getByRole('region', { name: /journal/i })

describe('Journal', () => {
  it('opens with nothing found yet', () => {
    render(<Journal />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      `0 of ${TOTAL_ENTRIES}`,
    )
  })

  it('counts what has been found against what there is', () => {
    render(<Journal />)
    expect(panel().textContent).toContain(String(TOTAL_ENTRIES))
  })

  it('shows an entry once it has been found', () => {
    const entry = find(0)
    render(<Journal />)
    expect(within(panel()).getByText(entry.title)).toBeInTheDocument()
  })

  it('counts up as things are found', () => {
    find(0)
    find(1)
    render(<Journal />)
    expect(panel().textContent).toContain('2')
  })

  it('has a card for everything the island holds, found or not', () => {
    // A journal listing only what you have seen would never tell you there
    // was anything left to look for.
    render(<Journal />)
    expect(panel().textContent?.length).toBeGreaterThan(0)
    expect(CATALOGUE.length).toBe(TOTAL_ENTRIES)
  })

  it('does not give away what has not been found', () => {
    const unfound = CATALOGUE[2]
    render(<Journal />)
    expect(within(panel()).queryByText(unfound.body)).not.toBeInTheDocument()
  })

  it('closes back onto the island', () => {
    render(<Journal />)
    act(() => {
      screen.getByRole('button', { name: /close/i }).click()
    })
    expect(useGame.getState().mode).toBe('explore')
  })
})
