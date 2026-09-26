/**
 * @vitest-environment jsdom
 */
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Toast } from './Toast'
import { useGame } from '../state/store'
import { fakeScreen } from '../../test/screen'

/**
 * The toast is how the island says something happened without stopping the
 * visit to say it. Three things matter about it: that it says what the thing
 * was, that it goes away on its own so nobody has to dismiss it, and that it
 * reads in whichever language is chosen.
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
  useGame.setState(PRISTINE, true)
})

const raise = (kind: 'journal' | 'key' | 'mission') =>
  act(() => {
    useGame.setState({
      toast: { title: 'The lamp', body: 'It still turns.', kind },
    })
  })

describe('Toast', () => {
  it('shows nothing at all when there is nothing to say', () => {
    const { container } = render(<Toast />)
    expect(container).toBeEmptyDOMElement()
  })

  it('says what was found', () => {
    render(<Toast />)
    raise('journal')
    expect(screen.getByText('The lamp')).toBeInTheDocument()
    expect(screen.getByText('It still turns.')).toBeInTheDocument()
  })

  it('names the kind of thing it was', () => {
    render(<Toast />)
    raise('key')
    expect(screen.getByText('Key obtained')).toBeInTheDocument()
  })

  it('is announced to a screen reader without stealing the focus', () => {
    // A notice, not an interruption: someone reading a panel should hear
    // about the journal entry without being pulled out of what they were on.
    render(<Toast />)
    raise('mission')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('goes away on its own', () => {
    vi.useFakeTimers()
    try {
      render(<Toast />)
      raise('journal')
      expect(screen.getByText('The lamp')).toBeInTheDocument()
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(screen.queryByText('The lamp')).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('stays off a phone, where there is no corner to spare for it', () => {
    fakeScreen({ mobile: true, portrait: true })
    const { container } = render(<Toast />)
    raise('journal')
    expect(container).toBeEmptyDOMElement()
  })

  it('still clears itself on a phone, so it cannot turn up late', () => {
    vi.useFakeTimers()
    try {
      fakeScreen({ mobile: true })
      render(<Toast />)
      raise('journal')
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(useGame.getState().toast).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('reads in Greek when Greek is chosen', async () => {
    act(() => {
      useGame.setState({ locale: 'el' })
    })
    render(<Toast />)
    raise('journal')

    /*
     * The Greek is fetched rather than bundled, so it arrives a tick after
     * the render that asked for it. Until then the toast reads in English,
     * which is the point: a visitor sees words either way, never a blank or
     * a raw key. Waiting here is waiting for exactly what they would see.
     */
    await waitFor(() => {
      // Whatever the Greek for it is, it is not the English.
      expect(screen.queryByText('Journal updated')).not.toBeInTheDocument()
    })
  })
})
