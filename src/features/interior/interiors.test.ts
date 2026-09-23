import { describe, expect, it } from 'vitest'
import { INTERIOR_BY_ID } from './interiors'
import { INTERIOR_MARGIN, interiorColliders } from './interiorLogic'
import type { Exhibit, Interior } from '../../types'

/**
 * The globe in the corner of the Evangeliki classroom.
 *
 * A 'prop' exhibit is the one kind whose prompt and whose target are in two
 * different places: you stand at `position` and the pointer hits `hitbox`,
 * which sits on a piece of furniture placed independently of either. Nothing
 * in the type system ties those three together, so this is what does.
 *
 * All of it is the same failure stated three ways — a globe you cannot get
 * to. Walking the room is the only other way to catch it.
 */

const room = INTERIOR_BY_ID.get('school-evangeliki')!
const globe = room.exhibits.find((e) => e.id === 'evangeliki-globe')!

/** How close you have to be for the prompt — `range` in Player.tsx. */
const REACH = 2.9

/** Is (x, z) inside anything solid in the room? */
function blocked(interior: Interior, x: number, z: number): boolean {
  return interiorColliders(interior).some(
    (c) => Math.abs(x - c.x) < c.hx && Math.abs(z - c.z) < c.hz,
  )
}

describe('the globe at Evangeliki', () => {
  it('is an exhibit that draws nothing of its own', () => {
    expect(globe.kind).toBe('prop')
    expect(globe.hitbox).toBeDefined()
  })

  it('hangs its hitbox on the globe actually standing in the room', () => {
    const prop = room.props.find((p) => p.kind === 'globe')!
    const box = globe.hitbox!
    expect(box.at).toEqual(prop.position)
    // The ball is 1.1 up the stand with a radius of 0.55: the box has to
    // cover it, and not float above the empty air over it.
    expect(box.y).toBeCloseTo(1.1)
    expect(box.size).toBeGreaterThanOrEqual(0.55)
  })

  it('puts the prompt somewhere you can actually stand', () => {
    const [x, z] = globe.position
    expect(blocked(room, x, z)).toBe(false)
    // And off the walls, which push you back inward.
    expect(Math.abs(x)).toBeLessThan(room.half[0] - INTERIOR_MARGIN)
    expect(Math.abs(z)).toBeLessThan(room.half[1] - INTERIOR_MARGIN)
  })

  it('puts the prompt within reach of the globe it names', () => {
    const [px, pz] = globe.position
    const [gx, gz] = globe.hitbox!.at
    expect(Math.hypot(px - gx, pz - gz)).toBeLessThan(REACH)
  })

  it('opens a panel rather than hiding a switch', () => {
    // Unlike the helicopter, nothing here is a door: the reward is the
    // panel, so the journal entry is filed on the first look.
    expect(globe.panel).toBeDefined()
    expect(globe.reveals).toBeUndefined()
    expect(globe.journal).toBeDefined()
  })
})

describe('every prop exhibit', () => {
  const props: [string, Exhibit][] = []
  for (const interior of INTERIOR_BY_ID.values())
    for (const e of interior.exhibits)
      if (e.kind === 'prop') props.push([interior.id, e])

  it.each(props)('%s: %o is reachable and hit-boxed', (id, exhibit) => {
    const interior = INTERIOR_BY_ID.get(id)!
    const box = exhibit.hitbox
    expect(box).toBeDefined()
    const [px, pz] = exhibit.position
    expect(blocked(interior, px, pz)).toBe(false)
    expect(Math.hypot(px - box!.at[0], pz - box!.at[1])).toBeLessThan(REACH)
  })
})
