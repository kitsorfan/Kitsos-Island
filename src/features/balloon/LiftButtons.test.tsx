/**
 * @vitest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LiftButtons } from './LiftButtons'
import { clearKeys, liftHold } from '../player/input'
import { useGame } from '../../shared/state/store'

/**
 * Up and down for the balloon: the burner and the vent, on the screen. Held
 * for as long as the climb or the sink is wanted, and never left on.
 */

type Flight = ReturnType<typeof useGame.getState>['balloon']

const PRISTINE = useGame.getState()

const fly = () =>
  act(() => {
    useGame.setState({
      mode: 'explore',
      balloon: { status: 'flying' } as unknown as Flight,
    })
  })

beforeEach(() => {
  useGame.setState(PRISTINE, true)
})

afterEach(() => clearKeys())

const up = () => screen.getByRole('button', { name: /Climb/ })
const down = () => screen.getByRole('button', { name: /Sink/ })

describe.each(['round', 'edge'] as const)('the %s lift buttons', (look) => {
  it('are not there until the balloon is up', () => {
    const { container } = render(<LiftButtons look={look} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('climb for as long as up is held, and no longer', () => {
    fly()
    render(<LiftButtons look={look} />)
    fireEvent.pointerDown(up())
    expect(liftHold.up).toBe(true)
    fireEvent.pointerUp(up())
    expect(liftHold.up).toBe(false)
  })

  it('sink for as long as down is held', () => {
    fly()
    render(<LiftButtons look={look} />)
    fireEvent.pointerDown(down())
    expect(liftHold.down).toBe(true)
    fireEvent.pointerCancel(down())
    expect(liftHold.down).toBe(false)
  })

  it('let go if a finger slides off', () => {
    fly()
    render(<LiftButtons look={look} />)
    fireEvent.pointerDown(up())
    fireEvent.pointerLeave(up())
    expect(liftHold.up).toBe(false)
  })

  it('let go as the flight ends under a held button', () => {
    fly()
    render(<LiftButtons look={look} />)
    fireEvent.pointerDown(up())
    act(() => {
      useGame.setState({ balloon: null })
    })
    expect(screen.queryByRole('button', { name: /Climb/ })).toBeNull()
    expect(liftHold.up).toBe(false)
  })
})
