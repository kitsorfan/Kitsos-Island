import { Shape } from 'three'

/**
 * A five-pointed star, as ten alternating points round a centre.
 *
 * It lives in its own module so it can be tested. The star is the emblem on
 * the reward shirt and on the mission patch, and the one thing about it that
 * is easy to get silently wrong is which way up it is: shape space has +Y
 * upwards, so the quarter turn that stands a point at the top has to be
 * added. Subtract it instead and the badge comes out as a pentagram, which
 * renders perfectly happily and is not what anybody wants on a shirt.
 */
export function starShape(outer: number, inner: number): Shape {
  const shape = new Shape()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  shape.closePath()
  return shape
}
