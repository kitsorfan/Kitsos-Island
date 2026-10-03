import { describe, expect, it } from 'vitest'
import { BAR, FPS, barFrame, layout, presence, slotAt } from './cut'
import { BPM } from '../radio/music'

/**
 * The edit is what keeps the pictures on the music. What is worth holding it
 * to is that every cut lands on a bar line however many shots come before
 * it, that the shots tile the trailer with no frame dropped or shown twice,
 * and that a card is never up outside its own bars.
 */

describe('the bar', () => {
  it('is four beats of the island’s tempo', () => {
    expect(BAR).toBeCloseTo((4 * 60) / BPM, 10)
  })

  it('falls on the nearest frame', () => {
    expect(barFrame(0)).toBe(0)
    expect(Math.abs(barFrame(1) - BAR * FPS)).toBeLessThanOrEqual(0.5)
  })
})

describe('layout', () => {
  it('lays the shots end to end with no gap and no overlap', () => {
    const slots = layout([2, 1, 1, 3, 2])
    expect(slots[0].from).toBe(0)
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].from).toBe(slots[i - 1].to)
    }
  })

  it('keeps a long run of one-bar shots on the beat', () => {
    // Rounding shot by shot would let the error pile up; rounding against
    // the top of the trailer keeps every cut within half a frame of its bar.
    const slots = layout(Array.from({ length: 40 }, () => 1))
    slots.forEach((slot, i) => {
      expect(Math.abs(slot.from - i * BAR * FPS)).toBeLessThanOrEqual(0.5)
    })
  })

  it('accounts for every frame of the trailer', () => {
    const slots = layout([2, 2, 1, 3])
    const total = slots.reduce((sum, s) => sum + (s.to - s.from), 0)
    expect(total).toBe(barFrame(8))
  })
})

describe('slotAt', () => {
  const slots = layout([1, 2])

  it('finds the shot a frame belongs to', () => {
    expect(slotAt(slots, 0)).toBe(0)
    expect(slotAt(slots, slots[0].to - 1)).toBe(0)
    expect(slotAt(slots, slots[1].from)).toBe(1)
  })

  it('finds nothing past the end', () => {
    expect(slotAt(slots, slots[1].to)).toBe(-1)
  })
})

describe('presence', () => {
  const slot = { from: 100, to: 200 }

  it('is nothing outside the card’s own frames', () => {
    expect(presence(99, slot, 10, 10)).toBe(0)
    expect(presence(200, slot, 10, 10)).toBe(0)
  })

  it('comes up, holds, and goes', () => {
    expect(presence(100, slot, 10, 10)).toBeCloseTo(0.1)
    expect(presence(150, slot, 10, 10)).toBe(1)
    expect(presence(199, slot, 10, 10)).toBeCloseTo(0.1)
  })

  it('is fully up on its first frame when it has no rise', () => {
    expect(presence(100, slot, 0, 10)).toBe(1)
  })
})
