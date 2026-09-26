/**
 * @vitest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TouchControls } from './TouchControls'
import { capeHold, clearKeys } from './input'
import { useGame } from '../../shared/state/store'
import { INTERIORS } from '../interior/interiors'
import { fakeScreen } from '../../test/screen'

/**
 * The stick and the round buttons beside it. Which buttons stand there is
 * the whole point of them: every one should be something the game in hand
 * will actually answer, and nothing it will not.
 */

type State = ReturnType<typeof useGame.getState>

const PRISTINE = useGame.getState()

beforeEach(() => {
  useGame.setState(PRISTINE, true)
  fakeScreen({ mobile: true, portrait: true, coarse: true })
  act(() => {
    useGame.setState({ mode: 'explore' })
  })
})

const buttons = () => screen.queryAllByRole('button').map((b) => b.textContent)

describe('the touch controls', () => {
  it('stay off a screen with a keyboard and a mouse', () => {
    fakeScreen({})
    const { container } = render(<TouchControls />)
    expect(container).toBeEmptyDOMElement()
  })

  it('offer jump and A on foot', () => {
    render(<TouchControls />)
    expect(screen.getByRole('button', { name: 'Jump' })).toBeInTheDocument()
    expect(buttons()).toContain('A')
  })

  it('leave the stick on its own at the helm, which is all the boat needs', () => {
    act(() => {
      useGame.setState({
        rescue: { status: 'sailing' } as unknown as State['rescue'],
      })
    })
    render(<TouchControls />)
    expect(buttons()).toEqual([])
  })

  it('give the balloon an up and a down rather than a burner', () => {
    act(() => {
      useGame.setState({
        balloon: { status: 'flying' } as unknown as State['balloon'],
      })
    })
    render(<TouchControls />)
    expect(buttons()).toEqual(expect.arrayContaining(['UP', 'DOWN']))
    expect(buttons()).not.toContain('BURN')
  })

  describe('under the cape', () => {
    const caped = (area = 'island') =>
      act(() => {
        useGame.setState({ outfit: 'star', area } as Partial<State>)
      })

    afterEach(() => clearKeys())

    it('trade the jump for an up and a down, beside A', () => {
      caped()
      render(<TouchControls />)
      expect(screen.queryByRole('button', { name: 'Jump' })).toBeNull()
      expect(buttons()).toEqual(expect.arrayContaining(['UP', 'DOWN', 'A']))
    })

    it('climb and dive for as long as each is held, and no longer', () => {
      caped()
      render(<TouchControls />)
      const up = screen.getByRole('button', { name: 'Fly up' })
      const down = screen.getByRole('button', { name: 'Fly down' })
      fireEvent.pointerDown(up)
      expect(capeHold.up).toBe(true)
      fireEvent.pointerUp(up)
      expect(capeHold.up).toBe(false)
      fireEvent.pointerDown(down)
      expect(capeHold.down).toBe(true)
      fireEvent.pointerLeave(down)
      expect(capeHold.down).toBe(false)
    })

    it('let go when a talk takes the buttons away under a held thumb', () => {
      caped()
      render(<TouchControls />)
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Fly up' }))
      act(() => {
        useGame.setState({ mode: 'dialogue' })
      })
      expect(capeHold.up).toBe(false)
    })

    it('keep the plain jump indoors, where the cape does not fly', () => {
      caped(INTERIORS[0].id)
      render(<TouchControls />)
      expect(screen.getByRole('button', { name: 'Jump' })).toBeInTheDocument()
      expect(buttons()).not.toContain('UP')
    })
  })
})
