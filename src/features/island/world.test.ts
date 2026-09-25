import { describe, expect, it } from 'vitest'
import { BUILDINGS, ISLAND_WALK_RADIUS, NPCS } from './world'
import { FEAST_AREA, placed } from '../party/feast'
import { PARTY_BUTTON } from '../party/partyData'
import { BOARD } from '../arcade/minigames'

/**
 * The island's people, held to the handful of rules that the world cannot
 * check for itself.
 *
 * A route is four or five hand-written pairs of numbers, and nothing at
 * runtime objects to a bad one: an NPC given a waypoint out at sea walks
 * calmly into the water, and one given a waypoint inside a building walks
 * through its wall. Both look like a bug in the engine rather than a typo in
 * a table, which is exactly why they are worth pinning here.
 */

/** Everybody who walks a route out on the island itself. */
const WALKERS = NPCS.filter((npc) => npc.area === 'island' && npc.route?.length)

describe('the people who walk the island', () => {
  it('has somebody walking it at all', () => {
    expect(WALKERS.length).toBeGreaterThan(0)
  })

  it('keeps every waypoint on dry land', () => {
    for (const npc of WALKERS) {
      for (const [x, z] of npc.route ?? []) {
        const from = Math.hypot(x, z)
        expect(
          from,
          `${npc.name} is sent to [${x}, ${z}], ${from.toFixed(1)} out`,
        ).toBeLessThan(ISLAND_WALK_RADIUS)
      }
    }
  })

  /*
   * Three waypoints that were already inside a footprint when this test was
   * written: Nikos clips the Army Camp and the Radio Center on his coastal
   * loop, and Marina stands in the university. The colliders shoulder them
   * back out, so each reads as somebody scraping along a wall rather than
   * walking past it — a blemish rather than a break, and somebody else's
   * route to redraw.
   *
   * Named individually rather than waved through by a looser rule, so that a
   * new one cannot join them quietly.
   */
  const KNOWN_CLIPPING = new Set(['runner', 'studentrep'])

  it('keeps every waypoint out of the buildings', () => {
    for (const npc of WALKERS) {
      if (KNOWN_CLIPPING.has(npc.id)) continue
      for (const [x, z] of npc.route ?? []) {
        for (const b of BUILDINGS) {
          /*
           * The footprint turned by the building's own rotation. Every one of
           * them stands on a quarter turn, so swapping the half-extents is
           * the whole of the rotation — and worth doing rather than squaring
           * the shape off, which reads a coastal path as a wall.
           */
          const scale = b.scale ?? 1
          const turned = Math.abs(Math.sin(b.rotation ?? 0)) > 0.5
          const hx = (turned ? b.half[1] : b.half[0]) * scale
          const hz = (turned ? b.half[0] : b.half[1]) * scale
          const clear =
            Math.abs(x - b.position[0]) > hx || Math.abs(z - b.position[1]) > hz
          expect(clear, `${npc.name} at [${x}, ${z}] is inside ${b.id}`).toBe(
            true,
          )
        }
      }
    }
  })

  /*
   * Nothing stops a walker at runtime: a route is walked in straight lines,
   * and only somebody bolting from a water bomb is pushed out of things. So
   * a leg drawn across the plaza's two fixtures walks straight through the
   * middle of them, which is what the mayor and Thanasis both used to do.
   *
   * Every leg is checked, the one from the last waypoint back to the first
   * included, a step at a time, and has to keep a body's width clear.
   */
  it('walks every leg clear of the games board and the party button', () => {
    const BODY = 0.5
    const board = (x: number, z: number) =>
      Math.hypot(
        Math.max(0, Math.abs(x - BOARD.position[0]) - BOARD.half[0]),
        Math.max(0, Math.abs(z - BOARD.position[1]) - BOARD.half[1]),
      )
    const button = (x: number, z: number) =>
      Math.hypot(x - PARTY_BUTTON.position[0], z - PARTY_BUTTON.position[1]) -
      PARTY_BUTTON.half[0]

    for (const npc of WALKERS) {
      const route = npc.route ?? []
      route.forEach((from, i) => {
        const to = route[(i + 1) % route.length]
        const steps = Math.ceil(
          Math.hypot(to[0] - from[0], to[1] - from[1]) / 0.05,
        )
        for (let s = 0; s <= steps; s++) {
          const x = from[0] + ((to[0] - from[0]) * s) / steps
          const z = from[1] + ((to[1] - from[1]) * s) / steps
          const leg = `${npc.name}, [${from}] to [${to}]`
          expect(board(x, z), `${leg}, walks into the board`).toBeGreaterThan(
            BODY,
          )
          expect(button(x, z), `${leg}, walks into the button`).toBeGreaterThan(
            BODY,
          )
        }
      })
    }
  })

  it('starts everybody on their own route', () => {
    /* A first waypoint somewhere else is a stride across the island the
       moment the world loads. */
    for (const npc of WALKERS) {
      expect(
        npc.route?.[0],
        `${npc.name} does not start where they stand`,
      ).toEqual(npc.position)
    }
  })

  it('gives everybody who walks a pace to walk at', () => {
    for (const npc of WALKERS) {
      expect(npc.pace, `${npc.name} has no pace`).toBeGreaterThan(0)
    }
  })
})

describe('Angelica, the island warden', () => {
  /*
   * The architect in the family, who used to be an in-law you could only
   * meet on Christmas Day. She is the same person, let out of the basement:
   * there is exactly one Angelica in this family and she should not be
   * duplicated to put her on the roads.
   */
  const angelica = NPCS.find((n) => n.id === 'inlaw-angelica')

  it('is out on the island, inspecting it', () => {
    expect(angelica).toBeDefined()
    expect(angelica?.area).toBe('island')
    /* A warden who stands still is a guard; she is meant to be doing rounds. */
    expect(angelica?.route?.length).toBeGreaterThan(2)
    expect(angelica?.pace).toBeGreaterThan(0)
  })

  it('is not shut away for the rest of the year any more', () => {
    /* `feastOnly` returns null on every day but the twenty-fifth, which is
       what kept her off the island. */
    expect(angelica?.feastOnly).toBeUndefined()
  })

  it('still has her seat at the Christmas table', () => {
    expect(angelica?.feast).toBeDefined()
    /* And what she says there is the family's Angelica, not the inspector. */
    expect(angelica?.feastLines?.length).toBeGreaterThan(0)
  })

  it('is dressed for a site visit', () => {
    expect(angelica?.prop).toBe('hardhat')
    expect(angelica?.blazer).toBeTruthy()
  })

  it('points at Kitsos as well as at herself', () => {
    const said = (angelica?.lines ?? []).join(' ')
    expect(said).toContain('Kitsos')
    /* The island's one way to actually reach him. */
    expect(said).toContain('Radio Center')
  })

  it('files what she is for in the journal', () => {
    expect(angelica?.journal?.title).toBeTruthy()
    expect(angelica?.journal?.body).toContain('Radio Center')
  })

  it('is the only Angelica out on the island', () => {
    const outdoors = NPCS.filter(
      (n) => n.name === 'Angelica' && n.area === 'island',
    )
    expect(outdoors).toHaveLength(1)
  })
})

describe('Angelica on the twenty-fifth', () => {
  const angelica = NPCS.find((n) => n.id === 'inlaw-angelica')!

  it('walks the roads on an ordinary day', () => {
    expect(placed(angelica, 'island', false)?.id).toBe('inlaw-angelica')
    expect(placed(angelica, FEAST_AREA, false)).toBeNull()
  })

  it('leaves the roads for the table at Christmas', () => {
    /* Christmas outranks the rounds: the seat is read before the area, so
       she is in the basement and nowhere else that day. */
    expect(placed(angelica, 'island', true)).toBeNull()
    expect(placed(angelica, FEAST_AREA, true)?.area).toBe(FEAST_AREA)
  })

  it('leaves the hard hat and the site blazer at the door', () => {
    /* Nobody comes to Christmas dinner dressed for a site visit. */
    const attable = placed(angelica, FEAST_AREA, true)
    expect(attable?.prop).toBeUndefined()
    expect(attable?.blazer).toBeUndefined()
    expect(attable?.dress).toBe(angelica.feastWear?.dress)
  })

  it('talks like family there, not like an inspector', () => {
    const attable = placed(angelica, FEAST_AREA, true)
    expect(attable?.lines).toEqual(angelica.feastLines)
    expect(attable?.lines.join(' ')).toContain('Chronia polla')
  })
})
