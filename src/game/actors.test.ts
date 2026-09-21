import { beforeEach, describe, expect, it } from 'vitest'
import { ACTOR_POS, REACTIONS, ageReactions, clearActors } from './actors'

/**
 * Where everyone who moves is standing, and how they are taking it.
 *
 * This lives outside React on purpose: the positions are written every frame
 * by the characters and read every frame by the player, and routing that
 * through state would mean a strolling townsperson triggered a re-render of
 * the island. Nothing here is clever — it is a map and a countdown — so what
 * is worth checking is that the countdown actually ends, because a reaction
 * that never expires is a townsperson who runs away forever.
 */

beforeEach(() => {
  ACTOR_POS.clear()
  REACTIONS.clear()
})

describe('where everyone is', () => {
  it('remembers where somebody is standing', () => {
    ACTOR_POS.set('the-keeper', { x: 4, z: -2 })
    expect(ACTOR_POS.get('the-keeper')).toEqual({ x: 4, z: -2 })
  })

  it('knows nothing about somebody who is not on the island', () => {
    expect(ACTOR_POS.get('nobody')).toBeUndefined()
  })

  it('clears the island when a game takes it over', () => {
    ACTOR_POS.set('a', { x: 0, z: 0 })
    ACTOR_POS.set('b', { x: 1, z: 1 })
    clearActors()
    expect(ACTOR_POS.size).toBe(0)
  })

  it('leaves the reactions alone when it clears the positions', () => {
    REACTIONS.set('a', { kind: 'cheer', left: 2, x: 0, z: 0 })
    clearActors()
    expect(REACTIONS.size).toBe(1)
  })
})

describe('how everyone is taking it', () => {
  it('burns a reaction down', () => {
    REACTIONS.set('a', { kind: 'cheer', left: 2, x: 0, z: 0 })
    ageReactions(0.5)
    expect(REACTIONS.get('a')?.left).toBeCloseTo(1.5, 9)
  })

  it('drops one that has run out', () => {
    REACTIONS.set('a', { kind: 'fright', left: 0.4, x: 0, z: 0 })
    ageReactions(0.5)
    expect(REACTIONS.has('a')).toBe(false)
  })

  it('drops one that lands exactly on nothing', () => {
    REACTIONS.set('a', { kind: 'fright', left: 0.5, x: 0, z: 0 })
    ageReactions(0.5)
    expect(REACTIONS.has('a')).toBe(false)
  })

  it('burns several down at once, dropping only the spent ones', () => {
    REACTIONS.set('gone', { kind: 'cheer', left: 0.2, x: 0, z: 0 })
    REACTIONS.set('staying', { kind: 'fright', left: 5, x: 1, z: 1 })
    ageReactions(1)
    expect(REACTIONS.has('gone')).toBe(false)
    expect(REACTIONS.has('staying')).toBe(true)
  })

  it('empties itself eventually, whatever is in it', () => {
    // A reaction that never expires is a townsperson who runs forever.
    for (let i = 0; i < 20; i++) {
      REACTIONS.set(`a${i}`, { kind: 'fright', left: i * 0.4, x: 0, z: 0 })
    }
    for (let i = 0; i < 100; i++) ageReactions(0.5)
    expect(REACTIONS.size).toBe(0)
  })

  it('is quiet when there is nothing to burn down', () => {
    expect(() => ageReactions(0.5)).not.toThrow()
  })

  it('remembers what a fright was, so there is something to run from', () => {
    REACTIONS.set('a', { kind: 'fright', left: 3, x: 12, z: -4 })
    ageReactions(0.1)
    expect(REACTIONS.get('a')).toMatchObject({ x: 12, z: -4 })
  })
})
