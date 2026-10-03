import { describe, expect, it } from 'vitest'
import { FOV, drift, follow, glide, orbit, watch, type Subject } from './moves'

/**
 * A move is a pose for every moment of a shot. What is worth holding them to
 * is where they start and end, which way round they go — the same way the
 * player's own camera measures its yaw — and that the ones meant to keep him
 * in shot actually look at him.
 */

const him: Subject = { x: 10, y: 2, z: -4, facing: 0 }

describe('drift', () => {
  it('runs from nought to one', () => {
    expect(drift(0)).toBe(0)
    expect(drift(1)).toBe(1)
  })

  it('is still moving at both ends', () => {
    // A full ease-in-out would sit still at the cut; this one only slows.
    expect(drift(0.01)).toBeGreaterThan(0.004)
    expect(1 - drift(0.99)).toBeGreaterThan(0.004)
  })

  it('never runs backwards', () => {
    for (let t = 0; t < 1; t += 0.05) {
      expect(drift(t + 0.05)).toBeGreaterThan(drift(t))
    }
  })
})

describe('glide', () => {
  const move = glide({
    from: { position: [0, 10, 0], target: [0, 0, -10] },
    to: { position: [20, 4, 0], target: [5, 0, -10] },
    fov: [40, 30],
  })

  it('starts and ends where it is told to', () => {
    expect(move(0, him).position).toEqual([0, 10, 0])
    expect(move(1, him).position).toEqual([20, 4, 0])
    expect(move(1, him).target).toEqual([5, 0, -10])
  })

  it('sweeps the lens with it', () => {
    expect(move(0, him).fov).toBe(40)
    expect(move(1, him).fov).toBe(30)
  })
})

describe('orbit', () => {
  it('stands due south of the point at an angle of nought', () => {
    const move = orbit({
      center: [0, 0, 0],
      radius: 10,
      height: 5,
      from: 0,
      to: 0,
    })
    const { position, target } = move(0.5, him)
    expect(position[0]).toBeCloseTo(0)
    expect(position[2]).toBeCloseTo(10)
    expect(position[1]).toBe(5)
    expect(target).toEqual([0, 0, 0])
  })

  it('turns towards east as the angle grows', () => {
    const move = orbit({
      center: [0, 0, 0],
      radius: 10,
      height: 5,
      from: Math.PI / 2,
      to: Math.PI / 2,
    })
    expect(move(0, him).position[0]).toBeCloseTo(10)
  })

  it('spirals in when the radius sweeps', () => {
    const move = orbit({
      center: [0, 0, 0],
      radius: [30, 10],
      height: 5,
      from: 0,
      to: 1,
    })
    const reach = (t: number) =>
      Math.hypot(move(t, him).position[0], move(t, him).position[2])
    expect(reach(0)).toBeCloseTo(30)
    expect(reach(1)).toBeCloseTo(10)
  })

  it('looks through the island’s own lens unless told otherwise', () => {
    const move = orbit({
      center: [0, 0, 0],
      radius: 10,
      height: 5,
      from: 0,
      to: 0,
    })
    expect(move(0, him).fov).toBe(FOV)
  })
})

describe('follow', () => {
  it('keeps its distance from him', () => {
    const move = follow({ distance: 6, height: 2, angle: 1.1 })
    const { position } = move(0.3, him)
    expect(Math.hypot(position[0] - him.x, position[2] - him.z)).toBeCloseTo(6)
    expect(position[1]).toBe(him.y + 2)
  })

  it('looks at him', () => {
    const move = follow({ distance: 6, height: 2, angle: 1.1, aim: 1.4 })
    expect(move(0, him).target).toEqual([him.x, him.y + 1.4, him.z])
  })

  it('hangs off his facing when asked, and off the world when not', () => {
    const turned = { ...him, facing: Math.PI / 2 }
    const world = follow({ distance: 6, height: 2, angle: Math.PI })
    const behind = follow({
      distance: 6,
      height: 2,
      angle: Math.PI,
      relative: true,
    })
    // Facing east, the camera behind him is to his west.
    expect(behind(0, turned).position[0]).toBeCloseTo(turned.x - 6)
    // The world's own bearing of pi is due north whichever way he faces.
    expect(world(0, turned).position[2]).toBeCloseTo(turned.z - 6)
  })
})

describe('watch', () => {
  it('stays on its line and turns to keep him in the middle', () => {
    const move = watch({ from: [0, 3, 0], to: [4, 3, 0], aim: 1 })
    expect(move(1, him).position).toEqual([4, 3, 0])
    expect(move(0.5, him).target).toEqual([him.x, him.y + 1, him.z])
  })
})
