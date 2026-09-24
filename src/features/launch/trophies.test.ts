import { describe, expect, it } from 'vitest'
import { TROPHIES, TROPHY_BY_ID, trophyCount, wonTrophies } from './trophies'
import { MINIGAMES } from '../arcade/minigames'

describe('the sticker sheet', () => {
  it('has one sticker per minigame, and two for hide and seek', () => {
    /*
     * Six for five games. Finding people in the dark and not being found
     * are different skills under one name, so each is worth its own - and
     * if a game is ever added to the board this is what fails first.
     */
    expect(TROPHIES).toHaveLength(MINIGAMES.length + 1)
    const hide = TROPHIES.filter((t) => t.id.startsWith('hide-'))
    expect(hide).toHaveLength(2)
  })

  it('covers every game on the board', () => {
    for (const game of MINIGAMES) {
      const covered = TROPHIES.some(
        (t) => t.id === game.id || t.id.startsWith(`${game.id}-`),
      )
      expect(covered, `no sticker for ${game.id}`).toBe(true)
    }
  })

  it('gives every sticker a name, a colour and a mark', () => {
    for (const trophy of TROPHIES) {
      expect(trophy.label.trim()).not.toBe('')
      expect(trophy.color).toMatch(/^#[0-9a-f]{6}$/i)
      expect(trophy.icon).toBeTruthy()
    }
  })

  it('has no two stickers with the same id', () => {
    expect(TROPHY_BY_ID.size).toBe(TROPHIES.length)
  })
})

describe('counting what was won', () => {
  it('counts nothing on a fresh visit', () => {
    expect(trophyCount({})).toBe(0)
    expect(wonTrophies({})).toEqual([])
  })

  it('counts only what is actually on the sheet', () => {
    /* An id from an older save, or one invented: it is not a sticker and
       must not be counted as one. */
    expect(trophyCount({ paintball: true, 'not-a-game': true })).toBe(1)
  })

  it('keeps the sheet order rather than the order they were won', () => {
    const won = { 'hide-hiding': true, paintball: true } as Record<string, true>
    expect(wonTrophies(won).map((t) => t.id)).toEqual([
      'paintball',
      'hide-hiding',
    ])
  })

  it('counts the lot when every game has been won', () => {
    const all = Object.fromEntries(TROPHIES.map((t) => [t.id, true as const]))
    expect(trophyCount(all)).toBe(TROPHIES.length)
  })
})
