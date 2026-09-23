import { useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import type { BufferAttribute, Group, Points } from 'three'
import type { CharacterMotion } from '../player/Character'
import { EVERY, LIFE, MIN_SPEED, SPARKS, sparkAlpha } from './trailLogic'

/**
 * The wake the star shirt leaves: a scatter of gold sparks that fall off him
 * as he walks and fade where they land.
 *
 * The shirt is the one thing on the island that has to be earned, and a
 * static badge on the chest only says so to somebody standing in front of
 * him. This says it while he walks away, which is most of the time.
 *
 * It is a single `Points` cloud with its own small pool of sparks rather than
 * a particle per mesh: the whole thing is one draw call, it allocates nothing
 * after mount, and the frame loop only ever writes numbers into two typed
 * arrays. Nothing here re-renders React.
 *
 * The cloud sits in world space rather than on the player, which is the whole
 * trick of it. Parent it to him and every spark is carried along as he walks
 * and swung round as he turns - so the wake follows him about like a swarm
 * instead of being left behind, and a quarter turn drags the lot of it across
 * the grass. A spark that has been shed belongs to the island, not to him.
 */

export function StarTrail({
  motion,
  /** Where he is right now, in world space, read every frame. */
  at,
  /** True only while the star shirt is actually on. */
  on,
}: {
  motion?: RefObject<CharacterMotion>
  at: RefObject<Group | null>
  on: boolean
}) {
  const points = useRef<Points>(null)
  /* Since the last spark was shed. */
  const due = useRef(0)
  /* The next slot to reuse: the pool is a ring, so the oldest spark is the
     one that gets recycled and nothing has to be sorted or spliced. */
  const next = useRef(0)

  /* The pool. Positions go to the GPU; the rest is bookkeeping this keeps to
     itself. All of it is allocated once. */
  const pool = useMemo(
    () => ({
      position: new Float32Array(SPARKS * 3),
      /* Per-spark opacity, which the shader reads as a colour channel. */
      alpha: new Float32Array(SPARKS),
      age: new Float32Array(SPARKS).fill(LIFE),
      drift: new Float32Array(SPARKS * 3),
    }),
    [],
  )

  useFrame((_state, delta) => {
    const cloud = points.current
    if (!cloud) return

    /* Hidden rather than unmounted while the shirt is off, so the pool and
       its buffers survive a change of clothes. */
    cloud.visible = on
    if (!on) return

    const step = Math.min(delta, 0.05)
    const him = at.current
    const m = motion?.current
    const speed = m?.moving && him ? (m.speed ?? 0) : 0

    /* Shed a spark on a timer while he is actually moving. The faster he
       goes the more often, so a sprint leaves a denser wake than a walk. */
    if (him && speed > MIN_SPEED) {
      due.current -= step
      if (due.current <= 0) {
        due.current = EVERY * Math.max(0.45, 3 / Math.max(1, speed))
        const i = next.current
        next.current = (i + 1) % SPARKS

        /* Off his feet, scattered across the width of him, in world space:
           where he is standing at the instant it is shed, and there it
           stays. */
        pool.position[i * 3] = him.position.x + (Math.random() - 0.5) * 0.5
        pool.position[i * 3 + 1] = him.position.y + 0.12 + Math.random() * 0.24
        pool.position[i * 3 + 2] = him.position.z + (Math.random() - 0.5) * 0.35
        /* A little lift and a lot of backward drift, so the wake trails
           behind rather than following him along. */
        pool.drift[i * 3] = (Math.random() - 0.5) * 0.22
        pool.drift[i * 3 + 1] = 0.22 + Math.random() * 0.3
        pool.drift[i * 3 + 2] = (Math.random() - 0.5) * 0.22
        pool.age[i] = 0
      }
    }

    /* Age every spark, drift the living ones, fade them as they go. */
    for (let i = 0; i < SPARKS; i++) {
      if (pool.age[i] >= LIFE) {
        pool.alpha[i] = 0
        continue
      }
      pool.age[i] += step
      const t = Math.min(1, pool.age[i] / LIFE)
      pool.position[i * 3] += pool.drift[i * 3] * step
      pool.position[i * 3 + 1] += pool.drift[i * 3 + 1] * step
      pool.position[i * 3 + 2] += pool.drift[i * 3 + 2] * step
      /* Slowing as it rises, the way something weightless settles. */
      pool.drift[i * 3 + 1] -= 0.35 * step
      pool.alpha[i] = sparkAlpha(t)
    }

    const geo = cloud.geometry
    const pos = geo.getAttribute('position') as BufferAttribute
    const alpha = geo.getAttribute('aAlpha') as BufferAttribute
    pos.needsUpdate = true
    alpha.needsUpdate = true
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[pool.position, 3]}
        />
        <bufferAttribute attach="attributes-aAlpha" args={[pool.alpha, 1]} />
      </bufferGeometry>
      {/*
        A tiny shader rather than a PointsMaterial, because the fade has to
        be per-spark and a material's opacity is per-draw. Each spark is a
        soft round dot, brightest in the middle, added to what is behind it
        so it reads as light rather than as a gold pebble.
      */}
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
      />
    </points>
  )
}

const VERTEX = /* glsl */ `
  attribute float aAlpha;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    /* Scaled by distance, so a spark is the same size on screen wherever
       he is standing rather than growing as the camera comes in. */
    gl_PointSize = 26.0 / -view.z;
    gl_Position = projectionMatrix * view;
  }
`

const FRAGMENT = /* glsl */ `
  varying float vAlpha;
  void main() {
    if (vAlpha <= 0.0) discard;
    /* Round, and soft at the rim. */
    vec2 d = gl_PointCoord - vec2(0.5);
    float r = length(d);
    if (r > 0.5) discard;
    float core = smoothstep(0.5, 0.0, r);
    vec3 gold = mix(vec3(1.0, 0.72, 0.18), vec3(1.0, 0.95, 0.72), core);
    gl_FragColor = vec4(gold, vAlpha * core);
  }
`
