import { describe, expect, it } from 'vitest'
import { CONSOLE, HOLOGRAM, SUIT_RACK } from './deck'
import { INTERIOR_BY_ID } from '../interior/interiors'
import { INTERIOR_MARGIN } from '../interior/interiorLogic'
import { LAUNCH_AREA } from './launch'

/**
 * The deck is laid out in two files — the fittings here, the furniture in
 * `interiors.ts` — so what is worth holding is that the two agree about the
 * room they are both describing.
 *
 * The rule that actually bites: the rack is set into the west wall, and the
 * walker is kept a margin clear of every wall. Put the rack a little further
 * out, or shrink the room, and the nearest floor he can stand on falls
 * outside the reach of its prompt — at which point the suit is unreachable,
 * the button never lights, and the whole flight is dead with nothing on
 * screen to say why.
 */

/** How near the rack the walker has to get. Mirrors Player.tsx's target. */
const RACK_RANGE = 3.6

/** How near the console he has to get. Mirrors Player.tsx's target. */
const BUTTON_RANGE = 2.8

const room = INTERIOR_BY_ID.get(LAUNCH_AREA)!

describe('the flight deck fits in the room it is in', () => {
  it('has a room to be in at all', () => {
    expect(room).toBeDefined()
    expect(room.kicker).toBe('Flight deck')
  })

  it('leaves the suit rack inside reach of somewhere he can stand', () => {
    /* The closest his centre gets to the west wall. */
    const standable = -(room.half[0] - INTERIOR_MARGIN)
    const gap = Math.abs(SUIT_RACK[0] - standable)
    expect(gap).toBeLessThan(RACK_RANGE)
  })

  it('keeps the console, the plinth and the rack out of each other', () => {
    const apart = (
      a: readonly [number, number],
      b: readonly [number, number],
    ) => Math.hypot(a[0] - b[0], a[1] - b[1])

    /* The walk between them is the point of the layout, so this is a floor
       on the distance rather than a ceiling. */
    expect(apart(SUIT_RACK, CONSOLE)).toBeGreaterThan(6)
    expect(apart(SUIT_RACK, HOLOGRAM)).toBeGreaterThan(6)
    expect(apart(CONSOLE, HOLOGRAM)).toBeGreaterThan(5)
  })

  it('leaves the launch button inside reach of somewhere he can stand', () => {
    /*
     * The same rule as the rack, for the same reason. The button sits half a
     * metre proud of the console's centre and the console is drawn rather
     * than declared, so nothing collides here - but the south wall's margin
     * still decides how near the glass he can get.
     */
    const standable = -(room.half[1] - INTERIOR_MARGIN)
    const button = CONSOLE[1] + 0.5
    expect(Math.abs(button - standable)).toBeLessThan(BUTTON_RANGE)
  })

  it('keeps the two prompts from competing for the same keypress', () => {
    /* Whichever is nearer wins, so the reaches must not overlap: standing at
       one must never be standing at the other. */
    const gap = Math.hypot(
      SUIT_RACK[0] - CONSOLE[0],
      SUIT_RACK[1] - (CONSOLE[1] + 0.5),
    )
    expect(gap).toBeGreaterThan(RACK_RANGE + BUTTON_RANGE)
  })

  it('has no cupboards left on the airlock wall', () => {
    /*
     * A row of lockers beside the suit read as a changing room and pulled
     * the eye off the one thing this wall is for.
     */
    const cupboards = (room.props ?? []).filter(
      (prop) => prop.kind === 'locker' && prop.position[0] < -5.5,
    )
    expect(cupboards).toEqual([])
  })

  it('keeps the furniture off the walk from the door to the rack', () => {
    /*
     * The approach: a corridor down the west side between the door and the
     * alcove. Anything solid standing in it hides the suit and blocks the
     * way to it, which is exactly what it did the first time round.
     */
    const inTheWay = (room.props ?? []).filter((prop) => {
      if (prop.solid === false) return false
      const [x, z] = prop.position
      return x < -5.5 && z > SUIT_RACK[1] - 1.6 && z < SUIT_RACK[1] + 1.6
    })
    expect(inTheWay).toEqual([])
  })
})
