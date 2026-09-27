/**
 * @vitest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TouchControls } from './TouchControls'
import { capeHold, clearKeys, rideHold } from './input'
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

  describe('on the bike', () => {
    const riding = () =>
      act(() => {
        useGame.setState({
          moto: { status: 'riding' } as unknown as State['moto'],
        })
      })

    afterEach(() => clearKeys())

    it('trade the stick for bars on the left and pedals on the right', () => {
      riding()
      const { container } = render(<TouchControls />)
      expect(container.querySelector('.stick')).toBeNull()
      const left = container.querySelector('.ride-bars')
      const right = container.querySelector('.touch__buttons')
      expect(left?.querySelectorAll('button')).toHaveLength(2)
      expect(
        [...(right?.querySelectorAll('button') ?? [])].map(
          (b) => b.textContent,
        ),
      ).toEqual(['WHEELIE', 'BRAKE', 'GAS'])
    })

    it('hold each one for as long as the thumb is on it, and no longer', () => {
      riding()
      render(<TouchControls />)
      const holds = [
        ['Steer left', 'left'],
        ['Steer right', 'right'],
        ['Gas', 'gas'],
        ['Brake', 'brake'],
        ['Wheelie', 'wheelie'],
      ] as const
      for (const [name, hold] of holds) {
        const button = screen.getByRole('button', { name })
        fireEvent.pointerDown(button)
        expect(rideHold[hold]).toBe(true)
        fireEvent.pointerUp(button)
        expect(rideHold[hold]).toBe(false)
      }
    })

    it('let go when the race ends under a held thumb', () => {
      riding()
      render(<TouchControls />)
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Gas' }))
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Steer left' }))
      act(() => {
        useGame.setState({ mode: 'moto' })
      })
      expect(rideHold.gas).toBe(false)
      expect(rideHold.left).toBe(false)
    })
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
