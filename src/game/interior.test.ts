import { describe, expect, it } from 'vitest'
import {
  DOORWAY_WIDTH,
  FLIGHT,
  FLIGHT_RISE,
  FLIGHT_RUN,
  PROP_FOOTPRINT,
  WELL,
  climbOf,
  doorwayReached,
  flightTop,
  fromLink,
  interiorColliders,
  interiorFloor,
  linkArrival,
  linkFacing,
  linkReached,
  roomProps,
  toLink,
  wayBack,
} from './interior'
import type { InteriorLink, InteriorProp } from '../types'
import { testLink, testRoom } from '../test/rooms'

/**
 * Rooms: the frames links are measured in, the staircase you walk up, and
 * what is solid once you are inside.
 *
 * Two invariants carry most of the weight here, and both are about not
 * getting stuck. Arriving through a link must never put you somewhere that
 * counts as having reached it, or a doorway becomes a loop you cannot walk
 * out of; and a locked door is never through, however far into it you stand.
 */

/** A link in the default frame: on the near wall, facing into the room. */
const link = testLink
const room = testRoom

describe('a link’s own frame', () => {
  const cases: InteriorLink[] = [
    link(),
    link({ position: [3, -4] }),
    link({ position: [3, -4], rotation: Math.PI / 2 }),
    link({ position: [-7, 2], rotation: Math.PI }),
    link({ position: [1, 1], rotation: 0.37 }),
  ]

  it('turns a point out and back to where it started', () => {
    for (const l of cases) {
      for (const [lx, lz] of [
        [0, 0],
        [1.2, 3.4],
        [-2, 5],
      ]) {
        const [x, z] = fromLink(l, lx, lz)
        const [bx, bz] = toLink(l, x, z)
        expect(bx).toBeCloseTo(lx, 9)
        expect(bz).toBeCloseTo(lz, 9)
      }
    }
  })

  it('puts the origin of the frame at the link itself', () => {
    for (const l of cases) {
      const [x, z] = fromLink(l, 0, 0)
      expect(x).toBeCloseTo(l.position[0], 9)
      expect(z).toBeCloseTo(l.position[1], 9)
    }
  })

  it('keeps distances, because it is a turn and not a stretch', () => {
    for (const l of cases) {
      const [ax, az] = fromLink(l, 1, 2)
      const [bx, bz] = fromLink(l, 4, 6)
      expect(Math.hypot(bx - ax, bz - az)).toBeCloseTo(Math.hypot(3, 4), 9)
    }
  })

  it('leaves an unturned link’s frame as the room’s own', () => {
    // With no rotation the two frames are the same one, so a step off the
    // wall in the link's frame is the same step in the room's.
    const [x, z] = fromLink(link({ position: [2, -3] }), 0, 1)
    expect(x).toBeCloseTo(2, 9)
    expect(z).toBeCloseTo(-2, 9)
  })
})

describe('the staircase', () => {
  const stairs = link({ kind: 'stairsUp', to: 'upstairs' })

  it('measures a flight the same way the mesh draws it', () => {
    expect(FLIGHT_RUN).toBeCloseTo(FLIGHT.treads * FLIGHT.going, 10)
    expect(FLIGHT_RISE).toBeCloseTo(FLIGHT.treads * FLIGHT.rise, 10)
  })

  it('is on the floor at the foot of the flight', () => {
    const [x, z] = fromLink(stairs, 0, FLIGHT.foot)
    expect(climbOf(stairs, x, z)).toBeCloseTo(0, 9)
  })

  it('is all the way up at the top of the flight', () => {
    const [x, z] = flightTop(stairs)
    expect(climbOf(stairs, x, z)).toBeCloseTo(1, 9)
  })

  it('climbs steadily in between', () => {
    let last = -Infinity
    for (let lz = FLIGHT.foot; lz >= FLIGHT.foot - FLIGHT_RUN; lz -= 0.2) {
      const [x, z] = fromLink(stairs, 0, lz)
      const climb = climbOf(stairs, x, z)
      expect(climb).toBeGreaterThanOrEqual(last - 1e-9)
      expect(climb).toBeGreaterThanOrEqual(0)
      expect(climb).toBeLessThanOrEqual(1)
      last = climb
    }
  })

  it('is the floor again beside the flight, not partway up it', () => {
    const [x, z] = fromLink(stairs, FLIGHT.halfWidth + 1, 0)
    expect(climbOf(stairs, x, z)).toBe(0)
  })

  it('is the floor again well past the head of the flight', () => {
    // A flight along a wall has ordinary room beyond its soffit, and that is
    // not three metres up.
    const [x, z] = fromLink(stairs, 0, FLIGHT.foot - FLIGHT_RUN - 4)
    expect(climbOf(stairs, x, z)).toBe(0)
  })

  it('is the floor in front of the foot of the flight', () => {
    const [x, z] = fromLink(stairs, 0, FLIGHT.foot + 3)
    expect(climbOf(stairs, x, z)).toBe(0)
  })
})

describe('interiorFloor', () => {
  it('is flat in a room with no stairs', () => {
    const flat = room({ links: [] })
    expect(interiorFloor(flat, 0, 0)).toBe(0)
    expect(interiorFloor(flat, 4, -7)).toBe(0)
  })

  it('is flat in a room with no links at all', () => {
    expect(interiorFloor(room(), 2, 2)).toBe(0)
  })

  it('rises to the top of a flight and no further', () => {
    const stairs = link({ kind: 'stairsUp', to: 'up' })
    const withStairs = room({ links: [stairs] })
    const [tx, tz] = flightTop(stairs)
    expect(interiorFloor(withStairs, tx, tz)).toBeCloseTo(FLIGHT_RISE, 9)
    const [fx, fz] = fromLink(stairs, 0, FLIGHT.foot)
    expect(interiorFloor(withStairs, fx, fz)).toBeCloseTo(0, 9)
  })

  it('ignores a door, which is not something you climb', () => {
    const withDoor = room({ links: [link({ kind: 'door' })] })
    expect(interiorFloor(withDoor, 0, 0)).toBe(0)
  })
})

describe('linkReached', () => {
  it('is never true for a locked door, however far in you stand', () => {
    const locked = link({ kind: 'locked' })
    for (const [lx, lz] of [
      [0, 0],
      [0, 1],
      [0, -3],
      [0.5, 0.5],
    ]) {
      const [x, z] = fromLink(locked, lx, lz)
      expect(linkReached(locked, x, z)).toBe(false)
    }
  })

  it('is true in the reveal of a door', () => {
    const door = link()
    const [x, z] = fromLink(door, 0, 0)
    expect(linkReached(door, x, z)).toBe(true)
  })

  it('is false to the side of a door', () => {
    const door = link()
    const [x, z] = fromLink(door, 4, 0)
    expect(linkReached(door, x, z)).toBe(false)
  })

  it('is true only near the top of a flight', () => {
    const stairs = link({ kind: 'stairsUp' })
    const [tx, tz] = flightTop(stairs)
    expect(linkReached(stairs, tx, tz)).toBe(true)
    const [fx, fz] = fromLink(stairs, 0, FLIGHT.foot)
    expect(linkReached(stairs, fx, fz)).toBe(false)
  })

  it('is true in the well of a stairwell and not beside it', () => {
    const down = link({ kind: 'stairsDown' })
    const [ix, iz] = fromLink(down, 0, 0)
    expect(linkReached(down, ix, iz)).toBe(true)
    const [ox, oz] = fromLink(down, WELL.halfWidth + 2, 0)
    expect(linkReached(down, ox, oz)).toBe(false)
  })
})

describe('linkArrival', () => {
  const kinds: InteriorLink['kind'][] = [
    'door',
    'stairsUp',
    'stairsDown',
    'hatch',
    'lift',
  ]

  it('never puts you somewhere that counts as through, for any kind', () => {
    // Otherwise arriving fires the link again and a doorway becomes a loop
    // the visitor cannot walk out of.
    for (const kind of kinds) {
      const l = link({ kind })
      const [x, z] = linkArrival(l)
      expect(linkReached(l, x, z)).toBe(false)
    }
  })

  it('stands clear of the threshold whatever way the link is turned', () => {
    for (const rotation of [0, Math.PI / 2, Math.PI, -1.1]) {
      const l = link({ rotation, position: [2, -3] })
      const [x, z] = linkArrival(l)
      expect(Math.hypot(x - 2, z + 3)).toBeGreaterThan(1)
      expect(linkReached(l, x, z)).toBe(false)
    }
  })

  it('faces the way the link is turned', () => {
    expect(linkFacing(link())).toBe(0)
    expect(linkFacing(link({ rotation: 1.25 }))).toBe(1.25)
  })
})

describe('wayBack', () => {
  const hall = link({ to: 'hall' })
  const attic = link({ to: 'attic', kind: 'stairsUp' })
  const here = room({ links: [hall, attic] })

  it('finds the link that points at the room you came from', () => {
    expect(wayBack(here, 'hall')).toBe(hall)
    expect(wayBack(here, 'attic')).toBe(attic)
  })

  it('finds nothing for a room this one does not join', () => {
    expect(wayBack(here, 'basement')).toBeUndefined()
  })

  it('finds nothing in a room with no links', () => {
    expect(wayBack(room(), 'hall')).toBeUndefined()
  })
})

describe('doorwayReached', () => {
  const here = room({ half: [8, 10] })

  it('is true in the middle of the front wall', () => {
    expect(doorwayReached(here, 0, 10)).toBe(true)
  })

  it('is false away from the wall', () => {
    expect(doorwayReached(here, 0, 0)).toBe(false)
  })

  it('is false along the wall but past the doorway', () => {
    expect(doorwayReached(here, DOORWAY_WIDTH, 10)).toBe(false)
  })
})

describe('roomProps', () => {
  const plain: InteriorProp[] = [
    { kind: 'desk', position: [0, 0] } as InteriorProp,
  ]
  const trimmings: InteriorProp[] = [
    { kind: 'wreath', position: [1, 1] } as InteriorProp,
  ]

  it('hands back the room’s own list when nothing is decorated', () => {
    const here = room({ props: plain })
    // By reference: a room that is not dressed does not rebuild its furniture
    // on every frame that asks.
    expect(roomProps(here, false)).toBe(plain)
  })

  it('hands back the plain list in a room with no trimmings', () => {
    const here = room({ props: plain })
    expect(roomProps(here, true)).toBe(plain)
  })

  it('adds the trimmings on the day, without losing the furniture', () => {
    const here = room({ props: plain, festive: trimmings })
    const dressed = roomProps(here, true)
    expect(dressed).toHaveLength(2)
    expect(dressed).toEqual([...plain, ...trimmings])
  })

  it('leaves the trimmings in the loft on every other day', () => {
    const here = room({ props: plain, festive: trimmings })
    expect(roomProps(here, false)).toBe(plain)
  })
})

describe('interiorColliders', () => {
  it('finds nothing solid in an empty room', () => {
    // The walls are the room's bounds rather than colliders; what this
    // gathers is the things standing inside them.
    expect(interiorColliders(room({ props: [] }))).toEqual([])
  })

  it('makes furniture solid', () => {
    const withDesk = interiorColliders(
      room({ props: [{ kind: 'desk', position: [2, 2] } as InteriorProp] }),
    )
    const bare = interiorColliders(room({ props: [] }))
    expect(withDesk.length).toBe(bare.length + 1)
  })

  it('lets you walk over a rug and past a painting', () => {
    const flat = interiorColliders(
      room({
        props: [
          { kind: 'rug', position: [0, 0] } as InteriorProp,
          { kind: 'painting', position: [0, 3] } as InteriorProp,
          { kind: 'poster', position: [1, 3] } as InteriorProp,
        ],
      }),
    )
    expect(flat.length).toBe(interiorColliders(room({ props: [] })).length)
  })

  it('honours a prop that says it is not solid', () => {
    const through = interiorColliders(
      room({
        props: [
          { kind: 'desk', position: [2, 2], solid: false } as InteriorProp,
        ],
      }),
    )
    expect(through.length).toBe(interiorColliders(room({ props: [] })).length)
  })

  it('turns a prop’s footprint with it when it is set square on', () => {
    const along = interiorColliders(
      room({
        props: [{ kind: 'sofa', position: [0, 0] } as InteriorProp],
      }),
    ).at(-1)!
    const across = interiorColliders(
      room({
        props: [
          {
            kind: 'sofa',
            position: [0, 0],
            rotation: Math.PI / 2,
          } as InteriorProp,
        ],
      }),
    ).at(-1)!
    expect(across.hx).toBeCloseTo(along.hz, 9)
    expect(across.hz).toBeCloseTo(along.hx, 9)
  })

  it('scales a prop’s footprint with it', () => {
    const one = interiorColliders(
      room({ props: [{ kind: 'desk', position: [0, 0] } as InteriorProp] }),
    ).at(-1)!
    const big = interiorColliders(
      room({
        props: [{ kind: 'desk', position: [0, 0], scale: 2 } as InteriorProp],
      }),
    ).at(-1)!
    expect(big.hx).toBeCloseTo(one.hx * 2, 9)
    expect(big.hz).toBeCloseTo(one.hz * 2, 9)
  })

  it('rails a flight in, so the only way up is up', () => {
    const stairs = link({ kind: 'stairsUp' })
    const withStairs = interiorColliders(room({ links: [stairs] }))
    const bare = interiorColliders(room({ links: [] }))
    // Two strings up the sides and a stop across the head.
    expect(withStairs.length).toBe(bare.length + 3)
  })

  it('rails a stairwell, so you go down it from its open end', () => {
    const down = link({ kind: 'stairsDown' })
    const withWell = interiorColliders(room({ links: [down] }))
    const bare = interiorColliders(room({ links: [] }))
    expect(withWell.length).toBe(bare.length + 2)
  })

  it('leaves a doorway open', () => {
    const withDoor = interiorColliders(room({ links: [link()] }))
    const bare = interiorColliders(room({ links: [] }))
    expect(withDoor.length).toBe(bare.length)
  })

  it('adds the trimmings’ own footprints only when dressed', () => {
    const here = room({
      props: [],
      festive: [{ kind: 'feastTable', position: [0, 0] } as InteriorProp],
    })
    expect(interiorColliders(here, false).length).toBeLessThanOrEqual(
      interiorColliders(here, true).length,
    )
  })
})

describe('PROP_FOOTPRINT', () => {
  it('gives every footprint two non-negative half-extents', () => {
    for (const [kind, half] of Object.entries(PROP_FOOTPRINT)) {
      expect(half, kind).toHaveLength(2)
      expect(half[0], kind).toBeGreaterThanOrEqual(0)
      expect(half[1], kind).toBeGreaterThanOrEqual(0)
    }
  })

  it('gives a rug no footprint at all, because you stand on it', () => {
    expect(PROP_FOOTPRINT.rug).toEqual([0, 0])
  })
})
