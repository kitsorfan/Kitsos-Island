import { describe, expect, it } from 'vitest'
import { MIN_SPEED, sparkAlpha } from './trailLogic'

/**
 * The trail is a cloud of meshes and a shader, neither of which a headless
 * run can look at. What it also has is a fade curve, and that is a rule worth
 * stating: it is the difference between a spark and a smear.
 */
describe('how a spark fades', () => {
  it('is fully lit when it is shed', () => {
    expect(sparkAlpha(0)).toBe(1)
  })

  it('holds full brightness for a moment before it starts to go', () => {
    /*
     * The one that matters. Fade from the first frame and the brightest the
     * spark is ever drawn is also the first frame it exists, so nothing reads
     * as a spark appearing - it is a dot that was always on its way out.
     */
    expect(sparkAlpha(0.1)).toBe(1)
    expect(sparkAlpha(0.3)).toBeLessThan(1)
  })

  it('is out by the end of its life, and stays out', () => {
    expect(sparkAlpha(1)).toBe(0)
    /* A spark asked about past its death is dead, not negative: a negative
       alpha would light the additive blend from the other side. */
    expect(sparkAlpha(1.5)).toBe(0)
  })

  it('never brightens as it ages', () => {
    let last = Infinity
    for (let t = 0; t <= 1; t += 0.05) {
      const now = sparkAlpha(t)
      expect(now).toBeLessThanOrEqual(last)
      expect(now).toBeGreaterThanOrEqual(0)
      last = now
    }
  })
})

describe('when a trail is shed at all', () => {
  it('needs him to be actually moving, not shuffling', () => {
    /*
     * A threshold above nothing. At zero every nudge of the stick would
     * leave sparks, so standing still and turning on the spot would print a
     * ring of them round his feet.
     */
    expect(MIN_SPEED).toBeGreaterThan(0)
  })
})
