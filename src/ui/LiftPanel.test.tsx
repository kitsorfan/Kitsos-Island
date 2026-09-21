/**
 * @vitest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { LiftPanel } from './LiftPanel'
import { useGame } from '../state/store'
import { INTERIORS } from '../data/interiors'

/**
 * The panel inside the lift car.
 *
 * The thing worth pinning down is the order. A lift panel that counts
 * downwards from the top of the list is a list of floors; one that counts
 * upwards is a picture of the building, and this one is meant to be the
 * second. The data is written from the ground up because that is the order he
 * worked the floors, so the reversal happens in the component and could be
 * lost in a refactor without anything else failing.
 */

const PRISTINE = useGame.getState()

/** The car as it stands on the ground floor of the Work District. */
function call(room = 'work') {
  const interior = INTERIORS.find((r) => r.id === room)!
  const car = (interior.links ?? []).find((l) => l.kind === 'lift')!
  return {
    linkId: car.id,
    room,
    floor: car.floor ?? 0,
    stops: car.serves ?? [],
  }
}

beforeEach(() => {
  useGame.setState(PRISTINE, true)
  act(() => {
    useGame.getState().start()
  })
})

describe('the lift panel', () => {
  it('stands the floors up the way the building does', () => {
    act(() => {
      useGame.getState().callLift(call())
    })
    render(<LiftPanel />)

    const numbers = screen
      .getAllByRole('button')
      .filter((b) => b.classList.contains('liftpanel__button'))
      .map((b) => b.querySelector('.liftpanel__number')?.textContent)

    expect(numbers).toEqual(['3', '2', '1', '0'])
  })

  it('leaves the data itself counting from the ground up', () => {
    /* The reversal is the panel's doing, not the data's. */
    expect(call().stops.map((s) => s.floor)).toEqual([0, 1, 2, 3])
  })

  it('says how long he was on each floor that has an answer', () => {
    act(() => {
      useGame.getState().callLift(call())
    })
    render(<LiftPanel />)

    expect(screen.getByText('2023–2024')).toBeTruthy()
    expect(screen.getByText('2024–present')).toBeTruthy()
    /* Reception is not a job and the third floor is not one yet. */
    expect(document.querySelectorAll('.liftpanel__when')).toHaveLength(2)
  })

  it('still marks the floor he is standing on', () => {
    act(() => {
      useGame.getState().callLift(call('work-veltiston'))
    })
    render(<LiftPanel />)

    const here = document.querySelector('.liftpanel__button[data-here]')
    expect(here?.querySelector('.liftpanel__number')?.textContent).toBe('2')
    expect(here?.textContent).toContain('you are here')
  })

  it('opens focused on a floor that goes somewhere', () => {
    act(() => {
      useGame.getState().callLift(call())
    })
    render(<LiftPanel />)

    /*
     * Not the third floor, though it is drawn first: an Enter pressed on the
     * way into the car should not spend itself on the one button that only
     * talks back. The newest real floor takes it instead.
     */
    const focused = document.activeElement as HTMLElement | null
    expect(focused?.querySelector('.liftpanel__number')?.textContent).toBe('2')
  })

  it('will not let him press the floor he is standing on', () => {
    act(() => {
      useGame.getState().callLift(call('work-ibm'))
    })
    render(<LiftPanel />)

    /*
     * Not merely refused once pressed: a lift has no button for the floor
     * under your feet, so the panel must not offer one to press.
     */
    const here = document.querySelector<HTMLButtonElement>(
      '.liftpanel__button[data-here]',
    )
    expect(here?.disabled).toBe(true)

    act(() => {
      here?.click()
    })

    /* Nothing moved, and nothing was said about it either. */
    expect(useGame.getState().lift).toBeNull()
    expect(useGame.getState().liftCall?.refused).toBeUndefined()
  })

  it('skips past the floor he is already on when choosing focus', () => {
    act(() => {
      useGame.getState().callLift(call('work-veltiston'))
    })
    render(<LiftPanel />)

    /* Floor 2 is under his feet, so focus falls to the next real one down. */
    const focused = document.activeElement as HTMLElement | null
    expect(focused?.querySelector('.liftpanel__number')?.textContent).toBe('1')
  })
})
