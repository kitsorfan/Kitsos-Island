import { beforeEach, describe, expect, it } from 'vitest'
import {
  COUNT,
  HEAD_START,
  HIDE,
  HOLD_OUT,
  PLAYERS,
  SPOTS,
  TOUCH,
  closeHide,
  nearestHidden,
  openHide,
  stepHide,
} from './hideLogic'
import { ISLAND_WALK_RADIUS } from '../island/world'

/**
 * Hide and seek across the island, from either end of it.
 *
 * The rule that makes it a game rather than a light show is the same in both
 * directions: seeing somebody is not finding them, and being seen is not
 * being caught. Somebody has to reach somebody and put a hand on them. A
 * beam that found people at range would make the seeker's half trivial and
 * the hider's half hopeless.
 */

const standing = {
  x: 0,
  z: 0,
  facing: 0,
  moving: false,
  crouched: false,
  lit: false,
}

beforeEach(() => {
  closeHide()
})

describe('the hiding places', () => {
  it('has more of them than there are people to hide', () => {
    expect(SPOTS.length).toBeGreaterThanOrEqual(PLAYERS.length)
  })

  it('puts every one of them somewhere on the island', () => {
    for (const [x, z] of SPOTS) {
      expect(Math.hypot(x, z)).toBeLessThan(ISLAND_WALK_RADIUS + 5)
    }
  })

  it('does not hide two people in the same bush', () => {
    const seen = new Set(SPOTS.map(([x, z]) => `${x},${z}`))
    expect(seen.size).toBe(SPOTS.length)
  })
})

describe('starting a game', () => {
  it('turns out everybody who is about', () => {
    openHide('seeker')
    expect(HIDE.folk).toHaveLength(COUNT)
    expect(HIDE.active).toBe(true)
  })

  it('starts with nobody found', () => {
    openHide('seeker')
    expect(HIDE.found).toBe(0)
    for (const folk of HIDE.folk) expect(folk.found).toBe(false)
  })

  it('gives the hider a head start and the seeker none', () => {
    openHide('hider')
    expect(HIDE.headStart).toBe(HEAD_START)
    openHide('seeker')
    expect(HIDE.headStart).toBe(0)
  })

  it('puts everybody somewhere reachable when you are seeking', () => {
    // Anything that landed inside a wall or a tree is pushed back out at the
    // start, so every one of them is somewhere you can put a hand on.
    openHide('seeker')
    for (const folk of HIDE.folk) {
      expect(Math.hypot(folk.x, folk.z)).toBeLessThan(ISLAND_WALK_RADIUS)
    }
  })

  it('stands them in the square with their eyes shut when you are hiding', () => {
    openHide('hider')
    for (const folk of HIDE.folk) {
      expect(Math.hypot(folk.x, folk.z)).toBeCloseTo(6, 6)
    }
  })

  it('starts a second game clean', () => {
    openHide('seeker')
    HIDE.folk[0].found = true
    HIDE.found = 1
    openHide('seeker')
    expect(HIDE.found).toBe(0)
    expect(HIDE.folk.every((f) => !f.found)).toBe(true)
  })
})

describe('nearestHidden', () => {
  it('finds nobody before a game has started', () => {
    closeHide()
    HIDE.folk.length = 0
    expect(nearestHidden(0, 0)).toBeNull()
  })

  it('finds the nearest one still hiding', () => {
    openHide('seeker')
    const target = HIDE.folk[0]
    const near = nearestHidden(target.x, target.z)
    expect(near?.folk).toBe(target)
    expect(near?.distance).toBeCloseTo(0, 6)
  })

  it('skips the ones already found', () => {
    openHide('seeker')
    const target = HIDE.folk[0]
    target.found = true
    expect(nearestHidden(target.x, target.z)?.folk).not.toBe(target)
  })

  it('finds nobody once everybody is found', () => {
    openHide('seeker')
    for (const folk of HIDE.folk) folk.found = true
    expect(nearestHidden(0, 0)).toBeNull()
  })
})

describe('seeking', () => {
  it('does not find somebody by shining a light on them', () => {
    // A light on somebody is not finding them. You have to reach them.
    openHide('seeker')
    const target = HIDE.folk[0]
    const away = { ...standing, x: target.x + 12, z: target.z, lit: true }
    stepHide(0.1, away)
    expect(target.found).toBe(false)
    expect(HIDE.found).toBe(0)
  })

  it('finds somebody you walk up to', () => {
    openHide('seeker')
    const target = HIDE.folk[0]
    const events = stepHide(0.1, { ...standing, x: target.x, z: target.z })
    expect(target.found).toBe(true)
    expect(HIDE.found).toBe(1)
    expect(events.found).toBe(1)
  })

  it('does not find the same person twice', () => {
    openHide('seeker')
    const target = HIDE.folk[0]
    stepHide(0.1, { ...standing, x: target.x, z: target.z })
    stepHide(0.1, { ...standing, x: target.x, z: target.z })
    expect(HIDE.found).toBe(1)
  })

  it('reaches only as far as an arm', () => {
    openHide('seeker')
    const target = HIDE.folk[0]
    stepHide(0.1, { ...standing, x: target.x + TOUCH + 1, z: target.z })
    expect(target.found).toBe(false)
  })

  it('wins the game when the last one is found', () => {
    openHide('seeker')
    let won = false
    for (const folk of HIDE.folk) {
      const events = stepHide(0.05, { ...standing, x: folk.x, z: folk.z })
      if (events.won) won = true
    }
    expect(HIDE.found).toBe(COUNT)
    expect(won).toBe(true)
    expect(HIDE.done).toBe(true)
  })
})

describe('hiding', () => {
  it('gives you time to be somewhere else before they start', () => {
    openHide('hider')
    const events = stepHide(0.1, { ...standing, x: 40, z: 40 })
    expect(events.finished).toBe(false)
    expect(HIDE.headStart).toBeLessThan(HEAD_START)
    expect(HIDE.headStart).toBeGreaterThan(0)
  })

  it('starts the search exactly once', () => {
    openHide('hider')
    let started = 0
    for (let i = 0; i < 400; i++) {
      if (stepHide(0.05, { ...standing, x: 90, z: 90 }).started) started++
    }
    expect(started).toBe(1)
  })

  it('is not caught on the frame the search begins, however visible', () => {
    // Seeing you is not catching you: somebody has to get a hand on you,
    // which is the same rule you play by when it is the other way round. The
    // searchers start in the square, so being lit up in the middle of it is
    // the most visible a hider can be — and still not caught until one of
    // them has walked the distance.
    openHide('hider')
    let events = stepHide(0.05, { ...standing, lit: true })
    while (HIDE.headStart > 0) {
      events = stepHide(0.05, { ...standing, x: 60, z: 60, lit: true })
    }
    expect(events.finished).toBe(false)
    expect(HIDE.done).toBe(false)
  })

  it('holds out for long enough to be worth holding out', () => {
    expect(HOLD_OUT).toBeGreaterThan(HEAD_START)
  })
})

describe('a step that should do nothing', () => {
  it('does nothing before a game has started', () => {
    closeHide()
    const events = stepHide(0.1, standing)
    expect(events.found).toBe(0)
    expect(events.finished).toBe(false)
  })

  it('does nothing once the game is over', () => {
    openHide('seeker')
    HIDE.done = true
    const was = HIDE.found
    stepHide(0.1, { ...standing, x: HIDE.folk[0].x, z: HIDE.folk[0].z })
    expect(HIDE.found).toBe(was)
  })
})
