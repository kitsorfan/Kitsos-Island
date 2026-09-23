import { beforeEach, describe, expect, it } from 'vitest'
import {
  ARENA,
  MAX_ENEMIES,
  MAX_FRIENDS,
  MIN_ENEMIES,
  RINGERS,
  ROSTER,
  buildTeams,
  canFire,
  closeArena,
  combatantName,
  pickTeams,
} from './paintballLogic'

/**
 * Picking sides for a paintball match.
 *
 * Your side is always people you have actually met — the island will not hand
 * you a friend you have never spoken to — and the other side is made up of
 * the locals you did not pick, topped up with faces from out of town when the
 * island runs out of people. The counts are clamped at both ends, because a
 * match against nobody and a match against the whole island are both
 * unplayable.
 *
 * The draw itself is random, so what is asserted here are the things that are
 * true of every draw rather than of one.
 */

beforeEach(() => {
  closeArena()
})

describe('buildTeams', () => {
  it('puts the people you asked for on your side', () => {
    const picked = ROSTER.slice(0, 3)
    const { friends } = buildTeams(picked, 8)
    expect(friends).toHaveLength(3)
    for (const id of friends) expect(picked).toContain(id)
  })

  it('will not field more friends than a side holds', () => {
    const { friends } = buildTeams([...ROSTER], 8)
    expect(friends.length).toBeLessThanOrEqual(MAX_FRIENDS)
  })

  it('ignores somebody the island has never heard of', () => {
    const { friends } = buildTeams(['a-stranger'], 8)
    expect(friends).toEqual([])
  })

  it('counts somebody named twice only once', () => {
    const one = ROSTER[0]
    const { friends } = buildTeams([one, one, one], 8)
    expect(friends).toEqual([one])
  })

  it('never puts the same person on both sides', () => {
    const picked = ROSTER.slice(0, 4)
    const { friends, enemies } = buildTeams(picked, 12)
    for (const id of friends) expect(enemies).not.toContain(id)
  })

  it('fields a playable number of opponents, whatever it is asked for', () => {
    for (const asked of [-50, 0, 1, 8, 200]) {
      const { enemies } = buildTeams([], asked)
      expect(enemies.length).toBeGreaterThanOrEqual(MIN_ENEMIES)
      expect(enemies.length).toBeLessThanOrEqual(MAX_ENEMIES)
    }
  })

  it('rounds a fractional count of opponents', () => {
    expect(buildTeams([], 7.4).enemies).toHaveLength(7)
    expect(buildTeams([], 7.6).enemies).toHaveLength(8)
  })

  it('brings in faces from out of town once the island runs out', () => {
    const { enemies } = buildTeams([], MAX_ENEMIES)
    const ringers = enemies.filter((id) => id.startsWith('ringer-'))
    expect(ringers.length).toBeGreaterThan(0)
    for (const id of ringers) {
      const ringer = RINGERS.get(id)
      expect(ringer?.name.length).toBeGreaterThan(0)
    }
  })

  it('does not leave last round’s strangers lying about', () => {
    buildTeams([], MAX_ENEMIES)
    const many = RINGERS.size
    buildTeams([], MIN_ENEMIES)
    expect(RINGERS.size).toBeLessThan(many)
  })

  it('gives everybody on the field a distinct place in it', () => {
    const { friends, enemies } = buildTeams(ROSTER.slice(0, 3), 12)
    const everyone = [...friends, ...enemies]
    expect(new Set(everyone).size).toBe(everyone.length)
  })
})

describe('pickTeams', () => {
  it('always draws a playable match', () => {
    for (let i = 0; i < 50; i++) {
      const { friends, enemies } = pickTeams()
      expect(friends.length).toBeLessThanOrEqual(MAX_FRIENDS)
      expect(enemies.length).toBeGreaterThanOrEqual(MIN_ENEMIES)
      expect(enemies.length).toBeLessThanOrEqual(MAX_ENEMIES)
    }
  })

  it('may hand you nobody at all, some afternoons', () => {
    // Allies are a coin toss: some afternoons nobody picks up a marker.
    let sawEmpty = false
    for (let i = 0; i < 200 && !sawEmpty; i++) {
      if (pickTeams().friends.length === 0) sawEmpty = true
    }
    expect(sawEmpty).toBe(true)
  })
})

describe('combatantName', () => {
  it('names a local by their own name', () => {
    const name = combatantName(ROSTER[0])
    expect(name.length).toBeGreaterThan(0)
    expect(name).not.toBe('Someone')
  })

  it('names somebody from out of town', () => {
    const { enemies } = buildTeams([], MAX_ENEMIES)
    const ringer = enemies.find((id) => id.startsWith('ringer-'))
    if (ringer) expect(combatantName(ringer).length).toBeGreaterThan(0)
  })

  it('has something to call a stranger rather than nothing', () => {
    expect(combatantName('nobody-at-all')).toBe('Someone')
  })
})

describe('canFire', () => {
  it('will not go off during the countdown', () => {
    ARENA.countdown = 3
    expect(canFire(false)).toBe(false)
  })

  it('goes off once the countdown is done', () => {
    ARENA.countdown = 0
    expect(canFire(false)).toBe(true)
  })

  it('will not go off while you are flat on the ground', () => {
    // Getting down is cover, and the price of cover is that you cannot shoot
    // out of it.
    ARENA.countdown = 0
    expect(canFire(true)).toBe(false)
  })
})
