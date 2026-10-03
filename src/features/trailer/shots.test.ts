import { describe, expect, it } from 'vitest'
import { CARDS, SCORE, SHOTS } from './shots'

/**
 * The shot list is edited by hand, and the easy mistakes are ones that only
 * show up a minute into a recording: a card left hanging past the end, a
 * change of music that falls in the middle of a shot, the score stopping
 * before the pictures do. These hold the cut together as it changes.
 */

const bars = SHOTS.reduce((sum, s) => sum + s.bars, 0)

/** The bar lines the cuts fall on. */
const cuts = SHOTS.reduce<number[]>(
  (at, shot) => [...at, at[at.length - 1] + shot.bars],
  [0],
)

describe('the shots', () => {
  it('each have a name of their own', () => {
    const ids = SHOTS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each last at least a bar', () => {
    for (const shot of SHOTS) expect(shot.bars).toBeGreaterThanOrEqual(1)
  })
})

describe('the cards', () => {
  it('all come and go inside the trailer', () => {
    for (const card of CARDS) {
      expect(card.from).toBeGreaterThanOrEqual(0)
      expect(card.to).toBeGreaterThan(card.from)
      expect(card.to).toBeLessThanOrEqual(bars)
    }
  })

  it('end with the end card, up on a cut and held to the last frame', () => {
    const end = CARDS.find((c) => c.kind === 'end')!
    expect(cuts).toContain(end.from)
    expect(end.to).toBe(bars)
  })
})

describe('the score', () => {
  it('changes piece only where the picture cuts', () => {
    for (const cue of SCORE.cues) expect(cuts).toContain(cue.bar)
  })

  it('plays under the end card and stops short of the last frame, to ring out', () => {
    const end = CARDS.find((c) => c.kind === 'end')!
    expect(SCORE.bars).toBeGreaterThan(end.from)
    expect(SCORE.bars).toBeLessThan(bars)
  })
})
