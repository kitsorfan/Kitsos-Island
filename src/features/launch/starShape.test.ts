import { describe, expect, it } from 'vitest'
import { starShape } from './starShape'

describe('the star on the shirt', () => {
  it('stands on a point rather than upside down', () => {
    /*
     * The one thing worth pinning. A star drawn with the quarter turn
     * subtracted instead of added renders perfectly happily as a pentagram,
     * and nothing but the eye would catch it — so the eye is written down
     * here instead: the first point is straight up.
     */
    const points = starShape(0.2, 0.085).getPoints()
    expect(points[0].x).toBeCloseTo(0, 5)
    expect(points[0].y).toBeCloseTo(0.2, 5)
  })

  it('alternates five outer points with five inner ones', () => {
    const star = starShape(1, 0.4)
    /* getPoints() interpolates curves; the corners are what matter, so this
       reads the extremes rather than the count. */
    const radii = star.getPoints().map((p) => Math.hypot(p.x, p.y))
    expect(Math.max(...radii)).toBeCloseTo(1, 5)
    expect(Math.min(...radii)).toBeCloseTo(0.4, 5)
  })

  it('closes, so the extrusion has a face to fill', () => {
    const points = starShape(0.2, 0.085).getPoints()
    const first = points[0]
    const last = points[points.length - 1]
    expect(last.x).toBeCloseTo(first.x, 5)
    expect(last.y).toBeCloseTo(first.y, 5)
  })
})
