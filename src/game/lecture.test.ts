import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEAN_SPOT,
  LECTURE,
  LECTURE_LENGTH,
  PODIUM,
  SEATS,
  SLIDES,
  classPresent,
  emptyHall,
  facingPodium,
  hallFurniture,
  slideAt,
  stillFilingOut,
} from './lecture'

/**
 * The thesis defence: eight slides, a hall that fills and empties, and a
 * clock. `slideAt` is the piece everything else hangs off — the slide on the
 * screen, the line being read, and when the dean stands up are all one
 * question about where the clock has got to.
 */

beforeEach(() => {
  emptyHall()
})

describe('slideAt', () => {
  it('opens on the first slide', () => {
    expect(slideAt(0)).toBe(0)
  })

  it('never names a slide the deck has not got', () => {
    for (let t = -5; t <= LECTURE_LENGTH + 20; t += 0.25) {
      const slide = slideAt(t)
      expect(slide).toBeGreaterThanOrEqual(0)
      expect(slide).toBeLessThan(SLIDES.length)
      expect(Number.isInteger(slide)).toBe(true)
    }
  })

  it('works through the deck without ever going back', () => {
    let last = -1
    for (let t = 0; t <= LECTURE_LENGTH; t += 0.1) {
      const slide = slideAt(t)
      expect(slide).toBeGreaterThanOrEqual(last)
      last = slide
    }
  })

  it('stays on each slide for exactly as long as it says', () => {
    let at = 0
    for (let i = 0; i < SLIDES.length; i++) {
      // A hair after this slide begins, and a hair before it ends.
      expect(slideAt(at + 0.01)).toBe(i)
      expect(slideAt(at + SLIDES[i].hold - 0.01)).toBe(i)
      at += SLIDES[i].hold
    }
  })

  it('reaches the last slide by the end of the talk', () => {
    expect(slideAt(LECTURE_LENGTH)).toBe(SLIDES.length - 1)
  })

  it('holds on the last slide once the talk has run out', () => {
    expect(slideAt(LECTURE_LENGTH + 100)).toBe(SLIDES.length - 1)
  })

  it('treats a clock before the start as the start', () => {
    expect(slideAt(-10)).toBe(0)
  })
})

describe('the deck', () => {
  it('runs for as long as its slides add up to', () => {
    const total = SLIDES.reduce((sum, s) => sum + s.hold, 0)
    expect(LECTURE_LENGTH).toBeCloseTo(total, 9)
  })

  it('is a defence rather than a lecture course', () => {
    // Forty-odd seconds for the whole thing: long enough to be a talk, short
    // enough that nobody standing in the hall is trapped in it.
    expect(LECTURE_LENGTH).toBeGreaterThan(20)
    expect(LECTURE_LENGTH).toBeLessThan(90)
  })

  it('gives every slide something to say and time to say it', () => {
    for (const slide of SLIDES) {
      expect(slide.title.length).toBeGreaterThan(0)
      expect(slide.lines.length).toBeGreaterThan(0)
      expect(slide.hold).toBeGreaterThan(0)
    }
  })
})

describe('facingPodium', () => {
  it('turns somebody in the hall to look at the front', () => {
    const facing = facingPodium([PODIUM[0], PODIUM[1] + 10])
    // Straight down the hall at the podium: the angle points the short way.
    expect(facing).toBeCloseTo(Math.PI, 6)
  })

  it('turns the two sides of the hall inwards', () => {
    const left = facingPodium([PODIUM[0] - 6, PODIUM[1] + 5])
    const right = facingPodium([PODIUM[0] + 6, PODIUM[1] + 5])
    expect(Math.sign(left)).toBe(-Math.sign(right))
  })

  it('gives a real angle from anywhere at all', () => {
    for (const at of [
      [0, 0],
      [-14, 8],
      [14, -8],
      [0, -20],
    ] as [number, number][]) {
      expect(Number.isFinite(facingPodium(at))).toBe(true)
    }
  })
})

describe('the seats', () => {
  it('has one for every desk in the hall', () => {
    expect(SEATS.length).toBeGreaterThan(0)
  })

  it('sends each row in by the door on its own side', () => {
    for (const seat of SEATS) {
      expect(Math.sign(seat.from[0])).toBe(Math.sign(seat.position[0]))
    }
  })

  it('staggers them in, so nobody walks through anybody', () => {
    const delays = SEATS.map((s) => s.delay)
    expect(new Set(delays).size).toBe(delays.length)
    for (const d of delays) expect(d).toBeGreaterThan(0)
  })

  it('seats everybody behind their desk, not on it', () => {
    for (const seat of SEATS) {
      expect(seat.position[1]).toBeGreaterThan(PODIUM[1])
    }
  })
})

describe('the hall', () => {
  it('is empty before anybody comes in', () => {
    expect(classPresent()).toBe(false)
    expect(stillFilingOut()).toBe(false)
  })

  it('has the class in while the defence is running', () => {
    LECTURE.active = true
    expect(classPresent()).toBe(true)
  })

  it('still has them in while they are filing out', () => {
    // The slides stop and the HUD goes, but the room is not empty: everybody
    // who was in it is walking to a door and is still somebody to walk round.
    LECTURE.active = false
    LECTURE.leaving = true
    LECTURE.gone.clear()
    expect(stillFilingOut()).toBe(true)
    expect(classPresent()).toBe(true)
  })

  it('is empty again once the last of them is through the door', () => {
    LECTURE.active = false
    LECTURE.leaving = true
    LECTURE.gone.clear()
    for (let i = 0; i < SEATS.length; i++) LECTURE.gone.add(String(i))
    expect(stillFilingOut()).toBe(false)
    expect(classPresent()).toBe(false)
  })

  it('has furniture to walk round', () => {
    const furniture = hallFurniture()
    expect(furniture.length).toBeGreaterThan(0)
    for (const c of furniture) {
      expect(c.hx).toBeGreaterThan(0)
      expect(c.hz).toBeGreaterThan(0)
    }
  })

  it('empties back to nothing', () => {
    LECTURE.active = true
    emptyHall()
    expect(classPresent()).toBe(false)
  })

  it('stands the dean where they can be seen from the floor', () => {
    expect(Number.isFinite(DEAN_SPOT[0])).toBe(true)
    expect(Number.isFinite(DEAN_SPOT[1])).toBe(true)
  })
})
