/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsCard } from './SettingsCard'
import { useGame } from '../state/store'
import { LEVELS } from '../engine/audio'
import { KEYS } from '../../features/island/world'
import { EL } from '../i18n/el/index'
import { loadLocale } from '../i18n'

/**
 * Everything the visitor is allowed to turn down.
 *
 * The row that matters most is the one that takes the visit back. There is no
 * way back from it, so it asks twice — and the test that guards that is worth
 * more than all the volume tests together: a single tap must never be enough
 * to wipe a journal somebody spent an afternoon filling.
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

const PRISTINE = useGame.getState()

beforeEach(() => {
  localStorage.clear()
  useGame.setState(PRISTINE, true)
})

/** Something in the journal, so there is a visit worth clearing. */
const walkTheIsland = () =>
  act(() => {
    useGame.getState().record({
      id: 'the-lamp',
      title: 'The lamp',
      body: 'It still turns.',
      source: 'The lighthouse',
    })
    useGame.getState().takeKey(KEYS[0].id)
  })

const button = (name: RegExp) => screen.getByRole('button', { name })

describe('the language', () => {
  it('offers both, and says which is on', () => {
    render(<SettingsCard />)
    expect(button(/english/i)).toBeInTheDocument()
    expect(button(/ελληνικά/i)).toBeInTheDocument()
  })

  it('changes the language when one is chosen', async () => {
    render(<SettingsCard />)
    act(() => button(/ελληνικά/i).click())
    expect(useGame.getState().locale).toBe('el')
    /* Choosing Greek sends for the dictionary; let it land inside the test
       rather than while React is being torn down around it. */
    await act(() => loadLocale('el'))
  })
})

describe('the quality', () => {
  it('offers the three settings', () => {
    render(<SettingsCard />)
    expect(button(/auto/i)).toBeInTheDocument()
    expect(button(/high/i)).toBeInTheDocument()
    expect(button(/low/i)).toBeInTheDocument()
  })

  it('takes one by hand', () => {
    render(<SettingsCard />)
    act(() => button(/low/i).click())
    expect(useGame.getState().quality).toBe('low')
  })
})

describe('the volumes', () => {
  it('offers both as sliders, so they can be dragged or arrowed', () => {
    // A slider can be dragged, arrowed and read out by a screen reader
    // without any of that having to be written here.
    render(<SettingsCard />)
    expect(screen.getAllByRole('slider')).toHaveLength(2)
  })

  it('runs each one from silent to loudest', () => {
    render(<SettingsCard />)
    for (const slider of screen.getAllByRole('slider')) {
      expect(slider).toHaveAttribute('min', '0')
      expect(slider).toHaveAttribute('max', String(LEVELS))
    }
  })

  it('turns the sound down when one is moved', () => {
    render(<SettingsCard />)
    const [music] = screen.getAllByRole('slider')
    fireEvent.change(music, { target: { value: '2' } })
    expect(useGame.getState().musicLevel).toBe(2)
  })
})

describe('taking the visit back', () => {
  it('will not clear a visit that has not happened yet', () => {
    render(<SettingsCard />)
    expect(button(/clear progress/i)).toBeDisabled()
  })

  it('says what the page is keeping once there is something', () => {
    walkTheIsland()
    render(<SettingsCard />)
    expect(button(/clear progress/i)).toBeEnabled()
  })

  it('does not clear anything on the first press', () => {
    // One tap away from the volume, and no way back from it.
    walkTheIsland()
    render(<SettingsCard />)
    act(() => button(/clear progress/i).click())
    expect(useGame.getState().entries).toHaveLength(1)
  })

  it('asks again before it does', () => {
    walkTheIsland()
    render(<SettingsCard />)
    act(() => button(/clear progress/i).click())
    expect(button(/clear it/i)).toBeInTheDocument()
    expect(button(/keep it/i)).toBeInTheDocument()
  })

  it('offers a way out of the asking', () => {
    walkTheIsland()
    render(<SettingsCard />)
    act(() => button(/clear progress/i).click())
    act(() => button(/keep it/i).click())
    expect(useGame.getState().entries).toHaveLength(1)
    expect(button(/clear progress/i)).toBeInTheDocument()
  })

  it('clears the visit once it has been asked twice', () => {
    walkTheIsland()
    render(<SettingsCard />)
    act(() => button(/clear progress/i).click())
    act(() => button(/clear it/i).click())
    expect(useGame.getState().entries).toEqual([])
    expect(localStorage.getItem('island.progress')).toBeNull()
  })

  it('leaves the settings alone when the visit is cleared', async () => {
    // In Greek, so this also checks the card is still usable in the language
    // somebody chose rather than only in the one it was written in. The
    // labels come from the dictionary rather than being spelled out here, so
    // a reworded translation does not break the test.
    walkTheIsland()
    act(() => {
      useGame.getState().setLocale('el')
    })
    /* The Greek is fetched now. The static EL import above happens to have
       loaded it already, but leaning on that would make this test pass by
       accident; asking for it plainly says what it needs. */
    await act(() => loadLocale('el'))
    render(<SettingsCard />)
    act(() => button(new RegExp(EL['Clear progress'])).click())
    act(() => button(new RegExp(EL['Clear it'])).click())
    expect(useGame.getState().locale).toBe('el')
    expect(useGame.getState().entries).toEqual([])
  })
})
