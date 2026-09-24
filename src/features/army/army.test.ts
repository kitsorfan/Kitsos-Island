import { describe, expect, it } from 'vitest'
import {
  BUNK_FEET,
  MARCH_LENGTH,
  OPS_AREA,
  PRIVATES,
  REPORT_AT,
  admits,
  marchAt,
  marchRoute,
} from './army'
import { INTERIOR_BY_ID } from '../interior/interiors'
import { interiorColliders } from '../interior/interiorLogic'
import { NPCS } from '../island/world'
import type { InteriorLink } from '../../types'

/**
 * The camp's inside: a door that opens for the uniform, and an inspection
 * that has to march five men to five bunks without walking any of them
 * through the furniture.
 */

const barracks = INTERIOR_BY_ID.get('army')!
const ops = INTERIOR_BY_ID.get(OPS_AREA)!

describe('the officers’ door', () => {
  const door = (barracks.links ?? []).find((l) => l.to === OPS_AREA)!

  it('leads from the barracks to the operations room, and back', () => {
    expect(door).toBeDefined()
    expect((ops.links ?? []).some((l) => l.to === 'army')).toBe(true)
    expect(ops.building).toBe('army')
  })

  it('opens for the uniform and nothing else', () => {
    expect(admits(door, 'officer')).toBe(true)
    expect(admits(door, 'islander')).toBe(false)
    expect(admits(door, 'star')).toBe(false)
  })

  it('says why it will not open', () => {
    expect(door.lines?.length).toBeGreaterThan(0)
  })

  it('does not care what anybody wears through an ordinary door', () => {
    const plain: InteriorLink = {
      id: 'x',
      kind: 'door',
      label: 'a door',
      position: [0, 0],
    }
    expect(admits(plain, 'islander')).toBe(true)
  })

  it('has the commander on the far side of it, with his letter', () => {
    const inside = NPCS.filter((n) => n.area === OPS_AREA).map((n) => n.id)
    expect(inside).toContain('mitsidis')
    expect(ops.exhibits.some((e) => e.id === 'army-reference')).toBe(true)
  })
})

describe('the evening inspection', () => {
  it('has a bunk for every man', () => {
    expect(PRIVATES.length).toBe(5)
    expect(BUNK_FEET.length).toBe(PRIVATES.length)
  })

  it('has nobody in the room before the first man is through the door', () => {
    for (let i = 1; i < PRIVATES.length; i++) {
      expect(marchAt(i, 0).entered).toBe(false)
    }
  })

  it('stands every man at his own bunk by the end, facing into the room', () => {
    for (let i = 0; i < PRIVATES.length; i++) {
      const step = marchAt(i, MARCH_LENGTH + 0.01)
      expect(step.arrived).toBe(true)
      expect([step.x, step.z]).toEqual(BUNK_FEET[i])
      /* West rail faces east, east rail faces west. */
      expect(Math.sign(Math.sin(step.facing))).toBe(-Math.sign(step.x))
    }
  })

  it('reports only once they are all standing still', () => {
    expect(REPORT_AT).toBeGreaterThan(MARCH_LENGTH)
  })

  it('never marches anybody through the furniture', () => {
    const solid = interiorColliders(barracks)
    for (let i = 0; i < PRIVATES.length; i++) {
      for (let t = 0; t <= MARCH_LENGTH; t += 0.05) {
        const { x, z, entered } = marchAt(i, t)
        if (!entered) continue
        for (const c of solid) {
          const inside =
            Math.abs(x - c.x) < c.hx + 0.3 && Math.abs(z - c.z) < c.hz + 0.3
          expect(
            inside,
            `private ${i} at ${x.toFixed(2)}, ${z.toFixed(2)}`,
          ).toBe(false)
        }
      }
    }
  })

  it('routes every man in through the front door', () => {
    for (let i = 0; i < PRIVATES.length; i++) {
      const [x, z] = marchRoute(i)[0]
      expect(x).toBe(0)
      expect(z).toBeGreaterThan(barracks.half[1] - 1.5)
    }
  })
})
