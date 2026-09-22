import { beforeEach, describe, expect, it } from 'vitest'
import { CHALLENGE_EARSHOT, GUARD, challenge, holdTheLine } from './guard'
import { BUILDINGS } from '../island/world'

/**
 * The sentry on the gate after dark.
 *
 * There is a line across the road that the player is put back outside of,
 * every frame, for as long as they lean on it. Two things make that bearable
 * rather than infuriating: the push is always outward and always to the same
 * distance, so leaning on it does not shove you across the island; and the
 * whistle blows once when you walk up rather than once a frame, so being
 * turned away is an event and not an alarm.
 */

/** The first building that is actually guarded after dark. */
const guarded = BUILDINGS.find((b) => b.closesAtNight && b.sentries)!

/** Puts the singleton back the way a fresh page would have it. */
const reset = () => {
  GUARD.left = 0
  GUARD.blast = 0
  GUARD.near = false
  GUARD.holding = false
  GUARD.x = 0
  GUARD.z = 0
}

beforeEach(reset)

describe('by day', () => {
  it('lets anybody walk up to the door', () => {
    const at: [number, number] = [guarded.door[0], guarded.door[1]]
    const whistled = holdTheLine(at, 0.1, false)
    expect(whistled).toBe(false)
    expect(at).toEqual([guarded.door[0], guarded.door[1]])
  })

  it('stands nobody down at the gate', () => {
    holdTheLine([guarded.door[0], guarded.door[1]], 0.1, false)
    expect(GUARD.near).toBe(false)
    expect(GUARD.holding).toBe(false)
  })
})

describe('by night', () => {
  it('leaves somebody nowhere near it alone', () => {
    const at: [number, number] = [0, 0]
    expect(holdTheLine(at, 0.1, true)).toBe(false)
    expect(at).toEqual([0, 0])
  })

  it('blows the whistle when somebody walks up', () => {
    const at: [number, number] = [guarded.door[0] + 8, guarded.door[1]]
    expect(holdTheLine(at, 0.1, true)).toBe(true)
  })

  it('blows it once on the way up, not once a frame', () => {
    const at: [number, number] = [guarded.door[0] + 8, guarded.door[1]]
    expect(holdTheLine(at, 0.016, true)).toBe(true)
    expect(holdTheLine(at, 0.016, true)).toBe(false)
  })

  it('puts somebody leaning on the line back outside it', () => {
    const at: [number, number] = [guarded.door[0], guarded.door[1] + 1]
    holdTheLine(at, 0.1, true)
    const back = Math.hypot(at[0] - guarded.door[0], at[1] - guarded.door[1])
    expect(back).toBeGreaterThan(1)
  })

  it('pushes outward, never across the island', () => {
    for (const bearing of [0, 1, 2, 3, 4, 5]) {
      reset()
      const from: [number, number] = [
        guarded.door[0] + Math.cos(bearing) * 2,
        guarded.door[1] + Math.sin(bearing) * 2,
      ]
      const at: [number, number] = [from[0], from[1]]
      holdTheLine(at, 0.1, true)
      // Still on the same side of the door it came from.
      const wentIn = Math.hypot(at[0] - from[0], at[1] - from[1])
      expect(wentIn).toBeLessThan(6)
    }
  })

  it('puts everyone back to the same distance, whichever way they came', () => {
    const distances: number[] = []
    for (const bearing of [0, 1.5, 3, 4.5]) {
      reset()
      const at: [number, number] = [
        guarded.door[0] + Math.cos(bearing),
        guarded.door[1] + Math.sin(bearing),
      ]
      holdTheLine(at, 0.1, true)
      distances.push(
        Math.hypot(at[0] - guarded.door[0], at[1] - guarded.door[1]),
      )
    }
    for (const d of distances) expect(d).toBeCloseTo(distances[0], 6)
  })

  it('handles somebody standing exactly on the gate', () => {
    // Arriving by map does that, and a push with no direction to push in
    // would be a divide by nought.
    const at: [number, number] = [guarded.door[0], guarded.door[1]]
    holdTheLine(at, 0.1, true)
    expect(Number.isFinite(at[0])).toBe(true)
    expect(Number.isFinite(at[1])).toBe(true)
  })

  it('knows when somebody is leaning on the line', () => {
    const at: [number, number] = [guarded.door[0] + 1, guarded.door[1]]
    holdTheLine(at, 0.1, true)
    expect(GUARD.holding).toBe(true)
  })

  it('forgets somebody who walks away, and greets them again', () => {
    const close: [number, number] = [guarded.door[0] + 8, guarded.door[1]]
    expect(holdTheLine(close, 0.1, true)).toBe(true)
    // Off across the island, and back.
    holdTheLine([0, 0], 0.1, true)
    expect(GUARD.near).toBe(false)
    const again: [number, number] = [guarded.door[0] + 8, guarded.door[1]]
    expect(holdTheLine(again, 0.1, true)).toBe(true)
  })
})

describe('challenge', () => {
  it('earns a word from the sentry whether you moved or not', () => {
    challenge(guarded.door[0], guarded.door[1])
    expect(GUARD.left).toBeGreaterThan(0)
    expect(GUARD.x).toBe(guarded.door[0])
    expect(GUARD.z).toBe(guarded.door[1])
  })

  it('carries far enough to be heard from the door', () => {
    expect(CHALLENGE_EARSHOT).toBeGreaterThan(0)
  })
})

describe('the sentry’s own clock', () => {
  it('runs down when nothing is happening', () => {
    challenge(guarded.door[0], guarded.door[1])
    const was = GUARD.left
    holdTheLine([0, 0], 0.5, true)
    expect(GUARD.left).toBeLessThan(was)
  })

  it('never runs below nothing', () => {
    challenge(guarded.door[0], guarded.door[1])
    for (let i = 0; i < 50; i++) holdTheLine([0, 0], 1, true)
    expect(GUARD.left).toBe(0)
    expect(GUARD.blast).toBe(0)
  })
})
