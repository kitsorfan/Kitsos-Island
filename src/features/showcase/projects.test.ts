import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  PER_ROW,
  PROJECTS,
  PROJECT_EXHIBITS,
  SCREEN_PITCH,
  SCREEN_WIDTH,
  SHOWCASE,
  rowCount,
  rowHalf,
  screenAt,
  screenOffset,
  screensIn,
  showcaseColliders,
} from './projects'
import { INTERIOR_BY_ID } from '../interior/interiors'
import { INTERIOR_MARGIN, interiorColliders } from '../interior/interiorLogic'
import { NPCS } from '../island/world'
import { resolveCollisions } from '../../shared/engine/collision'
import { CATALOGUE } from '../../shared/state/store'
import type { Collider } from '../island/terrainLogic'

/**
 * The side projects and the stand of screens they are shown on.
 *
 * The stand grows a screen for every project added, sideways from the middle
 * of a row and then a row further back, and nothing in the room stops it
 * walking into the bookshelves or across the spot somebody stands on: the
 * room simply draws them through each other. So most of what is held here is
 * where it ends up, and each test says what it hit and by how much.
 */

const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url))
const LOBBY = INTERIOR_BY_ID.get(SHOWCASE.area)!

/**
 * What the stand is built to hold: two full rows. A third would stand so
 * close to the boards on the north wall that there would be nowhere left to
 * read them from.
 */
const ROOM_FOR = PER_ROW * 2

const same = (a: Collider, b: Collider) =>
  a.x === b.x && a.z === b.z && a.hx === b.hx && a.hz === b.hz

/** Everything solid in the lobby but the stand itself. */
const FURNITURE = interiorColliders(LOBBY).filter(
  (c) => !showcaseColliders().some((row) => same(row, c)),
)

/** The gap between two boxes; negative when they overlap. */
function gap(a: Collider, b: Collider): number {
  return Math.max(
    Math.abs(a.x - b.x) - (a.hx + b.hx),
    Math.abs(a.z - b.z) - (a.hz + b.hz),
  )
}

describe('the projects', () => {
  it('has at least one to show', () => {
    expect(PROJECTS.length).toBeGreaterThan(0)
  })

  it('gives each one an id of its own', () => {
    const ids = PROJECTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('leads each one with a link to the real thing, over https', () => {
    for (const project of PROJECTS) {
      expect(
        project.links.filter((l) => l.primary),
        project.id,
      ).toHaveLength(1)
      for (const link of project.links) {
        expect(link.href, `${project.id}: ${link.label}`).toMatch(/^https:\/\//)
      }
    }
  })

  it('has the screenshot it asks for in public/projects/', () => {
    // A missing one draws a title card rather than breaking, which is
    // exactly why it would go unnoticed without this.
    for (const project of PROJECTS) {
      expect(
        existsSync(`${PUBLIC}projects/${project.image}`),
        project.image,
      ).toBe(true)
    }
  })
})

describe('the screens in the lobby', () => {
  it('stands every project in the room, as an exhibit of it', () => {
    for (const exhibit of PROJECT_EXHIBITS) {
      expect(LOBBY.exhibits).toContain(exhibit)
      expect(exhibit.kind).toBe('project')
    }
    expect(PROJECT_EXHIBITS.map((e) => e.id)).toEqual(PROJECTS.map((p) => p.id))
  })

  it('files every one in the journal, under the building', () => {
    for (const project of PROJECTS) {
      const entry = CATALOGUE.find((e) => e.id === project.id)
      expect(entry?.title, project.id).toBe(project.journal.title)
      expect(entry?.source).toBe(LOBBY.name)
    }
  })

  it('is solid where it stands', () => {
    for (const row of showcaseColliders()) {
      expect(interiorColliders(LOBBY)).toContainEqual(row)
    }
  })
})

describe('the rows', () => {
  it('fills a row before starting the next, and never overfills one', () => {
    for (let count = 1; count <= ROOM_FOR + 1; count++) {
      const rows = Array.from({ length: rowCount(count) }, (_, r) =>
        screensIn(r, count),
      )
      expect(
        rows.reduce((a, b) => a + b),
        `${count}`,
      ).toBe(count)
      expect(
        rows.slice(0, -1).every((n) => n === PER_ROW),
        `${count}`,
      ).toBe(true)
      expect(rows.at(-1), `${count}`).toBeGreaterThan(0)
      expect(rows.at(-1), `${count}`).toBeLessThanOrEqual(PER_ROW)
    }
  })

  it('centres every row, a screen and a shoulder apart', () => {
    expect(SCREEN_PITCH).toBeGreaterThan(SCREEN_WIDTH + 0.5)
    for (let count = 1; count <= ROOM_FOR + 1; count++) {
      for (let r = 0; r < rowCount(count); r++) {
        const first = r * PER_ROW
        const last = first + screensIn(r, count) - 1
        expect(
          screenOffset(first, count) + screenOffset(last, count),
          `${count}, row ${r}`,
        ).toBeCloseTo(0)
        for (let i = first; i < last; i++) {
          expect(
            screenOffset(i + 1, count) - screenOffset(i, count),
          ).toBeCloseTo(SCREEN_PITCH)
        }
      }
    }
  })
})

/*
 * Where the stand stands, held twice: as it is today, and as it will be with
 * two full rows, so a project added later finds its place already cleared
 * rather than failing here the day it arrives.
 */
describe.each([
  ['as it stands', PROJECTS.length],
  ['with two full rows', ROOM_FOR],
])('the stand %s', (_, count) => {
  const rows = showcaseColliders(count)
  const solid = [...FURNITURE, ...rows]
  const screens = Array.from({ length: count }, (_, i) => screenAt(i, count))

  it('is solid along every row, posts included', () => {
    screens.forEach(([x, z], i) => {
      const r = Math.floor(i / PER_ROW)
      const row = rows[r]
      expect(row.hx).toBeCloseTo(rowHalf(screensIn(r, count)))
      expect(Math.abs(x - row.x) + SCREEN_WIDTH / 2).toBeLessThan(row.hx)
      expect(z).toBe(row.z)
    })
  })

  it('leaves the spot in front of every screen free to stand on', () => {
    screens.forEach(([x, z], i) => {
      const spot: [number, number] = [x, z + 1.4]
      const out = resolveCollisions([...spot], 0.5, solid, {
        kind: 'rect',
        hx: LOBBY.half[0] - INTERIOR_MARGIN,
        hz: LOBBY.half[1] - INTERIOR_MARGIN,
      })
      expect(out[0], `screen ${i}`).toBeCloseTo(spot[0])
      expect(out[1], `screen ${i}`).toBeCloseTo(spot[1])
    })
  })

  it('stays inside the room, off the walls', () => {
    for (const row of rows) {
      expect(Math.abs(row.x) + row.hx).toBeLessThan(
        LOBBY.half[0] - INTERIOR_MARGIN,
      )
      expect(Math.abs(row.z) + row.hz).toBeLessThan(
        LOBBY.half[1] - INTERIOR_MARGIN,
      )
    }
  })

  it('leaves room to walk round every other thing in the lobby', () => {
    expect(FURNITURE.length).toBeGreaterThan(0)
    for (const row of rows) {
      for (const c of solid.filter((c) => c !== row)) {
        expect(gap(row, c), `something at [${c.x}, ${c.z}]`).toBeGreaterThan(
          1.2,
        )
      }
    }
  })

  it('leaves the aisle up the middle of the room open', () => {
    for (const row of rows) expect(row.x + row.hx).toBeLessThan(-1.5)
  })

  it('is not in anybody’s way, nor in the doorway', () => {
    const spot = (x: number, z: number) => ({ x, z, hx: 0, hz: 0 })
    for (const row of rows) {
      for (const npc of NPCS.filter((n) => n.area === SHOWCASE.area)) {
        for (const [x, z] of npc.route ?? [npc.position]) {
          expect(gap(row, spot(x, z)), npc.id).toBeGreaterThan(2)
        }
      }
      expect(gap(row, spot(...LOBBY.spawn))).toBeGreaterThan(3)
    }
  })

  it('keeps clear of the stairs and the lift', () => {
    for (const row of rows) {
      for (const link of LOBBY.links ?? []) {
        const [x, z] = link.position
        expect(gap(row, { x, z, hx: 0, hz: 0 }), link.id).toBeGreaterThan(4)
      }
    }
  })

  it('leaves room to stand and read every other exhibit in the lobby', () => {
    const others = LOBBY.exhibits.filter((e) => e.kind !== 'project')
    expect(others.length).toBeGreaterThan(0)
    for (const row of rows) {
      for (const exhibit of others) {
        const [x, z] = exhibit.position
        expect(gap(row, { x, z, hx: 0, hz: 0 }), exhibit.id).toBeGreaterThan(4)
      }
    }
  })
})
