import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  PROJECTS,
  PROJECT_EXHIBITS,
  SCREEN_PITCH,
  SCREEN_WIDTH,
  SHOWCASE,
  rowHalf,
  screenAt,
  screenOffset,
  showcaseCollider,
} from './projects'
import { INTERIOR_BY_ID } from '../interior/interiors'
import { INTERIOR_MARGIN, interiorColliders } from '../interior/interiorLogic'
import { NPCS } from '../island/world'
import { resolveCollisions } from '../../shared/engine/collision'
import { CATALOGUE } from '../../shared/state/store'
import type { Collider } from '../island/terrainLogic'

/**
 * The side projects and the row of screens they are shown on.
 *
 * The row grows a screen for every project added, sideways from its middle,
 * and nothing in the room stops a longer one walking into the bookshelves or
 * across the spot somebody stands on: the room simply draws them through
 * each other. So most of what is held here is where it ends up, and each
 * test says what it hit and by how much.
 */

const PUBLIC = fileURLToPath(new URL('../../../public/', import.meta.url))
const LOBBY = INTERIOR_BY_ID.get(SHOWCASE.area)!
const ROW = showcaseCollider()

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

  it('centres the row, a screen and a stride apart', () => {
    expect(screenOffset(0) + screenOffset(PROJECTS.length - 1)).toBeCloseTo(0)
    expect(SCREEN_PITCH).toBeGreaterThan(SCREEN_WIDTH + 0.5)
    expect(screenOffset(1, 2) - screenOffset(0, 2)).toBeCloseTo(SCREEN_PITCH)
  })

  it('is solid along its whole length, posts included', () => {
    expect(interiorColliders(LOBBY)).toContainEqual(ROW)
    expect(ROW.hx).toBeCloseTo(rowHalf())
    for (let i = 0; i < PROJECTS.length; i++) {
      const [x, z] = screenAt(i)
      expect(Math.abs(x - ROW.x) + SCREEN_WIDTH / 2).toBeLessThan(ROW.hx)
      expect(z).toBe(ROW.z)
    }
  })

  it('leaves the spot in front of every screen free to stand on', () => {
    for (let i = 0; i < PROJECTS.length; i++) {
      const [x, z] = screenAt(i)
      const spot: [number, number] = [x, z + 1.4]
      const out = resolveCollisions([...spot], 0.5, interiorColliders(LOBBY), {
        kind: 'rect',
        hx: LOBBY.half[0] - INTERIOR_MARGIN,
        hz: LOBBY.half[1] - INTERIOR_MARGIN,
      })
      expect(out[0], PROJECTS[i].id).toBeCloseTo(spot[0])
      expect(out[1], PROJECTS[i].id).toBeCloseTo(spot[1])
    }
  })
})

describe('where the row stands', () => {
  it('stays inside the room, off the walls', () => {
    expect(Math.abs(ROW.x) + ROW.hx).toBeLessThan(
      LOBBY.half[0] - INTERIOR_MARGIN,
    )
    expect(Math.abs(ROW.z) + ROW.hz).toBeLessThan(
      LOBBY.half[1] - INTERIOR_MARGIN,
    )
  })

  it('leaves room to walk round every other thing in the lobby', () => {
    const others = interiorColliders(LOBBY).filter(
      (c) => !(c.x === ROW.x && c.z === ROW.z && c.hx === ROW.hx),
    )
    expect(others.length).toBeGreaterThan(0)
    for (const c of others) {
      expect(gap(ROW, c), `something at [${c.x}, ${c.z}]`).toBeGreaterThan(1.2)
    }
  })

  it('is not in anybody’s way, nor in the doorway', () => {
    const spot = (x: number, z: number) => ({ x, z, hx: 0, hz: 0 })
    for (const npc of NPCS.filter((n) => n.area === SHOWCASE.area)) {
      for (const [x, z] of npc.route ?? [npc.position]) {
        expect(gap(ROW, spot(x, z)), npc.id).toBeGreaterThan(2)
      }
    }
    expect(gap(ROW, spot(...LOBBY.spawn))).toBeGreaterThan(3)
  })

  it('keeps clear of the stairs and the lift', () => {
    for (const link of LOBBY.links ?? []) {
      const [x, z] = link.position
      expect(gap(ROW, { x, z, hx: 0, hz: 0 }), link.id).toBeGreaterThan(4)
    }
  })
})
