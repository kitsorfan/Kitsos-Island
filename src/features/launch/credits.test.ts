import { describe, expect, it } from 'vitest'
import {
  ROLL,
  ROLL_TOTAL,
  cardFade,
  cardRise,
  creditAt,
  rollDone,
} from './credits'

describe('the roll', () => {
  it('opens on the title card', () => {
    const at = creditAt(0)
    expect(at?.card.kind).toBe('title')
    expect(at?.index).toBe(0)
  })

  it('moves through the cards in order', () => {
    let last = -1
    for (let at = 0; at < ROLL_TOTAL; at += 0.5) {
      const card = creditAt(at)
      expect(card).not.toBeNull()
      /* Never backwards, and never skipping one. */
      expect(card!.index).toBeGreaterThanOrEqual(last)
      if (card!.index !== last) expect(card!.index).toBe(last + 1)
      last = card!.index
    }
    /* And it got all the way to the end. */
    expect(last).toBe(ROLL.length - 1)
  })

  it('ends on the thanks rather than on a job title', () => {
    expect(ROLL[ROLL.length - 1].kind).toBe('thanks')
  })

  it('finishes rather than looping', () => {
    /*
     * The rule the certificate waits on. It used to loop, which made the
     * roll wallpaper and left the card with nothing to wait for.
     */
    expect(creditAt(ROLL_TOTAL)).toBeNull()
    expect(creditAt(ROLL_TOTAL + 60)).toBeNull()
    expect(rollDone(ROLL_TOTAL)).toBe(true)
    expect(rollDone(ROLL_TOTAL - 0.1)).toBe(false)
  })

  it('survives a clock that reads before it started', () => {
    /* A tab restored, a machine that slept: negative elapsed lands on the
       first card rather than off the front of the array. */
    const early = creditAt(-5)
    expect(early?.index).toBe(0)
    expect(early?.t).toBeGreaterThanOrEqual(0)
  })

  it('gives every card a readable share of the screen', () => {
    for (const card of ROLL) {
      expect(card.hold).toBeGreaterThanOrEqual(4)
    }
  })

  it('runs long enough to be an ending, and not so long as to be a wait', () => {
    expect(ROLL_TOTAL).toBeGreaterThan(30)
    expect(ROLL_TOTAL).toBeLessThan(75)
  })
})

describe('what the roll says', () => {
  it('credits the man himself with most of it', () => {
    const roles = ROLL.flatMap((c) => c.roles ?? [])
    const his = roles.filter((r) => r.who.includes('Kitsos'))
    expect(his.length).toBeGreaterThan(roles.length / 3)
  })

  it('thanks Amalia and the family by name', () => {
    const thanks = ROLL.find((c) => c.kind === 'thanks')
    const said = (thanks?.lines ?? []).join(' ')
    expect(said).toContain('Amalia')
    expect(said).toContain('family')
  })

  it('credits the player with the one thing that was theirs', () => {
    /*
     * Everybody who reaches this card walked every road on the island to get
     * here, so the movement is honestly theirs - and it is the only credit
     * on the roll that is literally true of the person reading it.
     */
    const movement = ROLL.find((c) => c.heading === 'Movement')
    expect(movement?.roles?.[0].who).toBe('You')
  })

  it('puts the player last of the credits, before the thanks', () => {
    const order = ROLL.map((c) => c.heading)
    expect(order[order.length - 2]).toBe('Movement')
    expect(ROLL[ROLL.length - 1].kind).toBe('thanks')
  })

  it('gives every role somebody to have done it', () => {
    for (const role of ROLL.flatMap((c) => c.roles ?? [])) {
      expect(role.who.trim()).not.toBe('')
    }
  })
})

describe('how a card is drawn', () => {
  it('fades in and out, and holds in between', () => {
    expect(cardFade(0)).toBe(0)
    expect(cardFade(0.5)).toBe(1)
    expect(cardFade(1)).toBe(0)
  })

  it('holds full brightness for most of its time on screen', () => {
    /*
     * The rule that makes a roll readable. A card fading the whole time it
     * is up is never actually legible, which is the usual way this goes
     * wrong - so the hold has to be the bulk of it.
     */
    let lit = 0
    const steps = 100
    for (let i = 0; i < steps; i++) if (cardFade(i / steps) === 1) lit++
    expect(lit / steps).toBeGreaterThan(0.7)
  })

  it('rises across its life, and never past the end of its travel', () => {
    expect(cardRise(0)).toBe(0)
    expect(cardRise(1)).toBe(1)
    /* Clamped, so a card held a frame too long does not fly off. */
    expect(cardRise(1.4)).toBe(1)
    expect(cardRise(-1)).toBe(0)
  })
})
