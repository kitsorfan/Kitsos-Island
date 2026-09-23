import { describe, expect, it } from 'vitest'
import {
  CREDITS,
  PER_ROLE,
  ROLL_TOTAL,
  THANKS,
  THANKS_HOLD,
  cardFade,
  creditAt,
} from './credits'

describe('the roll', () => {
  it('starts on the first credit', () => {
    expect(creditAt(0).role).toBe(CREDITS[0])
    expect(creditAt(0).thanks).toBe(false)
  })

  it('moves on one card at a time', () => {
    expect(creditAt(PER_ROLE * 0.5).role).toBe(CREDITS[0])
    expect(creditAt(PER_ROLE * 1.5).role).toBe(CREDITS[1])
    expect(creditAt(PER_ROLE * 2.5).role).toBe(CREDITS[2])
  })

  it('ends on the thanks rather than on a job title', () => {
    /* The last thing it says is the thing that is not a joke. */
    const last = creditAt(CREDITS.length * PER_ROLE + THANKS_HOLD / 2)
    expect(last.thanks).toBe(true)
    expect(last.role).toBeNull()
  })

  it('loops back round rather than running out', () => {
    /* He is up there until he chooses to come down, so the roll has no end
       to reach - one full turn later it is back at the top. */
    expect(creditAt(ROLL_TOTAL).role).toBe(CREDITS[0])
    expect(creditAt(ROLL_TOTAL * 3 + PER_ROLE * 1.5).role).toBe(CREDITS[1])
  })

  it('survives a clock that reads before it started', () => {
    /* A tab restored, a machine that slept: negative elapsed must land on a
       real card rather than off the front of the array. */
    const early = creditAt(-5)
    expect(early.role ?? THANKS).toBeTruthy()
    expect(Number.isFinite(early.t)).toBe(true)
  })

  it('never asks for a card that is not there', () => {
    /* Walk the whole loop in small steps; every instant must resolve. */
    for (let at = 0; at < ROLL_TOTAL * 2; at += 0.37) {
      const card = creditAt(at)
      if (!card.thanks) expect(card.role).toBeTruthy()
      expect(card.t).toBeGreaterThanOrEqual(0)
      expect(card.t).toBeLessThanOrEqual(1)
    }
  })
})

describe('what the roll says', () => {
  it('credits the man himself with most of it', () => {
    const his = CREDITS.filter((c) => c.who.includes('Kitsos'))
    expect(his.length).toBeGreaterThan(CREDITS.length / 2)
  })

  it('thanks Amalia and the family by name', () => {
    const said = THANKS.lines.join(' ')
    expect(said).toContain('Amalia')
    expect(said).toContain('family')
  })
})

describe('how a card fades', () => {
  it('is invisible at both ends and full in the middle', () => {
    expect(cardFade(0)).toBe(0)
    expect(cardFade(0.5)).toBe(1)
    expect(cardFade(1)).toBe(0)
  })

  it('holds full brightness for most of its time on screen', () => {
    /*
     * The rule that makes a roll readable. A card that is fading the whole
     * time it is up is never actually legible, which is the usual way this
     * goes wrong - so the hold has to be the bulk of it.
     */
    let lit = 0
    const steps = 100
    for (let i = 0; i < steps; i++) {
      if (cardFade(i / steps) === 1) lit++
    }
    expect(lit / steps).toBeGreaterThan(0.6)
  })
})
