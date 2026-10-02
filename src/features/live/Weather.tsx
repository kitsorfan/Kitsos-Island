import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Object3D,
  Vector3,
} from 'three'
import type { HemisphereLight, InstancedMesh, Mesh } from 'three'
import { useGame } from '../../shared/state/store'
import * as sfx from '../../shared/engine/audio'
import { WATER_LEVEL } from '../island/terrainLogic'
import { hazeColor } from './haze'
import { gloom, overcast, windward } from './weatherLogic'
import type { Conditions } from './weatherLogic'

/**
 * The weather Live brings to the island: cloud, rain, snow and lightning.
 *
 * The camera mostly looks down at the island rather than up at the sky, so
 * the weather has to be seen from where he is standing. The cloud is high
 * enough to sit in the sky, and low enough to throw its shadow across the
 * island as it goes over; the rain and the snow fall in a box carried along
 * in front of the camera, so it is always falling wherever anybody is
 * looking, at a cost that does not grow with the island.
 *
 * Everything here is drawn off amounts worked out in weatherLogic.ts, and
 * none of it is drawn at all under the island's own fair sky.
 */
export function Weather({
  weather,
  night,
}: {
  weather: Conditions
  night: boolean
}) {
  // A machine that has had its shadows taken away gets half the weather.
  const share = useGame((s) =>
    s.quality === 'low' || (s.quality === 'auto' && s.autoDropped) ? 0.5 : 1,
  )
  return (
    <>
      {weather.cloud > 0.08 && (
        <Clouds weather={weather} night={night} share={share} />
      )}
      {overcast(weather) > 0 && <Veil weather={weather} night={night} />}
      {weather.rain > 0 && (
        <Rain weather={weather} night={night} share={share} />
      )}
      {weather.snow > 0 && <Snow weather={weather} share={share} />}
      {weather.storm && <Lightning night={night} />}
    </>
  )
}

/** mulberry32: the same sky every time for the same amount of cloud. */
function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* --------------------------------- cloud -------------------------------- */

/**
 * How far out the cloud field runs from the middle of the island. Not far
 * past the shore: the cloud is mostly seen by its shadow, and a shadow
 * thrown on the open sea is one nobody is standing in.
 */
const FIELD = 300
/** Where a cloud fades out near the edge of the field, before it wraps. */
const FADE = 70
/** Clouds over the field when the sky is all cloud. */
const MOST_CLOUDS = 60

interface Puff {
  /** Which cloud it belongs to, and where in it. */
  cloud: number
  dx: number
  dy: number
  dz: number
  size: number
}

function Clouds({
  weather,
  night,
  share,
}: {
  weather: Conditions
  night: boolean
  share: number
}) {
  const count = Math.max(
    3,
    Math.round(weather.cloud * MOST_CLOUDS * (0.6 + 0.4 * share)),
  )
  const { centres, puffs } = useMemo(() => {
    const random = seeded(7)
    const centres: { x: number; y: number; z: number }[] = []
    const puffs: Puff[] = []
    for (let c = 0; c < count; c++) {
      centres.push({
        x: (random() * 2 - 1) * FIELD,
        y: 95 + random() * 55,
        z: (random() * 2 - 1) * FIELD,
      })
      // A cloud is a handful of lumps, longer than it is wide, and big:
      // the size of a district, so its shadow takes a whole street at once.
      const lumps = 5 + Math.floor(random() * 4)
      for (let i = 0; i < lumps; i++) {
        puffs.push({
          cloud: c,
          dx: (random() * 2 - 1) * 30,
          dy: (random() * 2 - 1) * 4,
          dz: (random() * 2 - 1) * 14,
          size: 11 + random() * 10,
        })
      }
    }
    return { centres, puffs }
  }, [count])

  const mesh = useRef<InstancedMesh>(null)
  const drift = useRef(0)
  const dummy = useMemo(() => new Object3D(), [])
  const [wx, wz] = windward(weather)
  /** Faster in a wind, but never quite still: cloud always moves. */
  const speed = 0.8 + Math.min(weather.wind, 20) * 0.4
  const color = useMemo(() => {
    if (night) return new Color('#2c3446')
    return new Color('#ffffff').lerp(new Color('#7c838d'), gloom(weather))
  }, [night, weather])

  const place = (offset: number) => {
    const m = mesh.current
    if (!m) return
    /** Where each cloud is now, wrapped back round the field. */
    const wrap = (v: number) =>
      ((((v + FIELD) % (2 * FIELD)) + 2 * FIELD) % (2 * FIELD)) - FIELD
    puffs.forEach((p, i) => {
      const c = centres[p.cloud]
      const x = wrap(c.x + wx * offset)
      const z = wrap(c.z + wz * offset)
      // Shrinks to nothing near the edge, so the wrap is never seen.
      const edge = Math.min(FIELD - Math.abs(x), FIELD - Math.abs(z))
      const fade = Math.max(0, Math.min(1, edge / FADE))
      dummy.position.set(x + p.dx, c.y + p.dy, z + p.dz)
      dummy.scale.set(p.size * fade, p.size * 0.55 * fade, p.size * fade)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => place(drift.current))

  useFrame((_, delta) => {
    drift.current += Math.min(delta, 0.1) * speed
    place(drift.current)
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, puffs.length]}
      // Its shadow is the point of it: a grey patch going over the island.
      castShadow
      frustumCulled={false}
    >
      <icosahedronGeometry args={[1, 1]} />
      <meshLambertMaterial color={color} flatShading />
    </instancedMesh>
  )
}

/* --------------------------------- veil --------------------------------- */

/**
 * A lid of grey drawn over the sky shader, which has no way to be told
 * there is cloud in it. Only seen when the camera looks up, which is mostly
 * from his own eyes; looking down at the island, the light says it instead.
 */
function Veil({ weather, night }: { weather: Conditions; night: boolean }) {
  const ref = useRef<Mesh>(null)
  const color = useMemo(() => hazeColor(weather, night), [weather, night])
  const opacity = Math.min(0.95, overcast(weather) * 0.82 + weather.fog * 0.15)

  useFrame(({ camera }) => {
    ref.current?.position.copy(camera.position)
  })

  return (
    <mesh ref={ref} renderOrder={-1}>
      <sphereGeometry args={[1500, 24, 12]} />
      <meshBasicMaterial
        color={color}
        side={BackSide}
        transparent
        opacity={opacity}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}

/* --------------------------------- rain --------------------------------- */

/** The box the rain falls in, in island units, carried with the camera. */
const RAIN_SPAN = 70
const RAIN_HEIGHT = 50
/** How far the box sits out in front of the camera. */
const AHEAD = 18
/** Units a second. Faster than life, which is what reads as rain. */
const RAIN_FALL = 42
/** How long a streak is, as the distance a drop falls in this long. */
const STREAK = 0.028

/** Puts v back into the span centred on c. */
function around(v: number, c: number, span: number) {
  const half = span / 2
  return c + ((((v - c + half) % span) + span) % span) - half
}

function Rain({
  weather,
  night,
  share,
}: {
  weather: Conditions
  night: boolean
  share: number
}) {
  const count = Math.round((500 + weather.rain * 2700) * share)
  const { geometry, drops } = useMemo(() => {
    const random = seeded(11)
    const drops = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      drops[i * 3] = (random() - 0.5) * RAIN_SPAN
      drops[i * 3 + 1] = random() * RAIN_HEIGHT
      drops[i * 3 + 2] = (random() - 0.5) * RAIN_SPAN
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(count * 6), 3),
    )
    return { geometry, drops }
  }, [count])
  useEffect(() => () => geometry.dispose(), [geometry])

  const ahead = useMemo(() => new Vector3(), [])
  const [wx, wz] = windward(weather)
  /** The wind carries the rain sideways, and a gale carries it a long way. */
  const sideways = Math.min(weather.wind, 16) * 0.9
  const vx = wx * sideways
  const vz = wz * sideways

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05)
    camera.getWorldDirection(ahead)
    const cx = camera.position.x + ahead.x * AHEAD
    const cz = camera.position.z + ahead.z * AHEAD
    // Never below the sea: the water is see-through, and rain falling on
    // under it looks like nothing at all.
    const floor = Math.max(
      WATER_LEVEL,
      camera.position.y + ahead.y * AHEAD - RAIN_HEIGHT / 2,
    )
    const out = geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      const k = i * 3
      const x = around(drops[k] + vx * dt, cx, RAIN_SPAN)
      let y = drops[k + 1] - RAIN_FALL * dt
      if (y < floor || y > floor + RAIN_HEIGHT) {
        y = floor + ((((y - floor) % RAIN_HEIGHT) + RAIN_HEIGHT) % RAIN_HEIGHT)
      }
      const z = around(drops[k + 2] + vz * dt, cz, RAIN_SPAN)
      drops[k] = x
      drops[k + 1] = y
      drops[k + 2] = z
      const j = i * 6
      out[j] = x
      out[j + 1] = y
      out[j + 2] = z
      out[j + 3] = x - vx * STREAK
      out[j + 4] = y + RAIN_FALL * STREAK
      out[j + 5] = z - vz * STREAK
    }
    geometry.attributes.position.needsUpdate = true
  })

  return (
    <lineSegments geometry={geometry} frustumCulled={false} renderOrder={2}>
      <lineBasicMaterial
        color={night ? '#7d90ad' : '#d6e4f0'}
        transparent
        opacity={0.35 + weather.rain * 0.3}
        depthWrite={false}
      />
    </lineSegments>
  )
}

/* --------------------------------- snow --------------------------------- */

const SNOW_SPAN = 60
const SNOW_HEIGHT = 40
const SNOW_FALL = 2.2

/** A soft round flake, drawn once: a square point reads as confetti. */
function flake() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 32
  const g = canvas.getContext('2d')
  if (g) {
    const glow = g.createRadialGradient(16, 16, 0, 16, 16, 16)
    glow.addColorStop(0, 'rgba(255,255,255,1)')
    glow.addColorStop(0.45, 'rgba(255,255,255,0.85)')
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = glow
    g.fillRect(0, 0, 32, 32)
  }
  return new CanvasTexture(canvas)
}

function Snow({ weather, share }: { weather: Conditions; share: number }) {
  const count = Math.round((400 + weather.snow * 2200) * share)
  const { geometry, flakes, phases } = useMemo(() => {
    const random = seeded(13)
    const flakes = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      flakes[i * 3] = (random() - 0.5) * SNOW_SPAN
      flakes[i * 3 + 1] = random() * SNOW_HEIGHT
      flakes[i * 3 + 2] = (random() - 0.5) * SNOW_SPAN
      phases[i] = random() * Math.PI * 2
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(count * 3), 3),
    )
    return { geometry, flakes, phases }
  }, [count])
  useEffect(() => () => geometry.dispose(), [geometry])
  const texture = useMemo(() => flake(), [])
  useEffect(() => () => texture.dispose(), [texture])

  const ahead = useMemo(() => new Vector3(), [])
  const [wx, wz] = windward(weather)
  const sideways = Math.min(weather.wind, 12) * 0.35

  useFrame(({ camera, clock }, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = clock.elapsedTime
    camera.getWorldDirection(ahead)
    const cx = camera.position.x + ahead.x * AHEAD
    const cz = camera.position.z + ahead.z * AHEAD
    const floor = Math.max(
      WATER_LEVEL,
      camera.position.y + ahead.y * AHEAD - SNOW_HEIGHT / 2,
    )
    const out = geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      const k = i * 3
      // Each flake wanders on its own, which is what makes it snow rather
      // than fall.
      const sway = Math.sin(t * 0.9 + phases[i]) * 0.8
      const x = around(flakes[k] + (wx * sideways + sway) * dt, cx, SNOW_SPAN)
      let y = flakes[k + 1] - SNOW_FALL * (0.7 + (phases[i] % 1) * 0.6) * dt
      if (y < floor || y > floor + SNOW_HEIGHT) {
        y = floor + ((((y - floor) % SNOW_HEIGHT) + SNOW_HEIGHT) % SNOW_HEIGHT)
      }
      const z = around(
        flakes[k + 2] +
          (wz * sideways + Math.cos(t * 0.7 + phases[i]) * 0.6) * dt,
        cz,
        SNOW_SPAN,
      )
      flakes[k] = out[k] = x
      flakes[k + 1] = out[k + 1] = y
      flakes[k + 2] = out[k + 2] = z
    }
    geometry.attributes.position.needsUpdate = true
  })

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={2}>
      <pointsMaterial
        map={texture}
        size={0.55}
        sizeAttenuation
        transparent
        depthWrite={false}
        color="#ffffff"
      />
    </points>
  )
}

/* ------------------------------- lightning ------------------------------ */

/** The shortest and longest wait between two strikes, in seconds. */
const QUIET = [3.5, 12]

/**
 * A strike: the whole island lit white for a blink, a second flicker after
 * it, and the thunder rolling in a moment later — later the further off it
 * was, which is what makes a storm sound like it has a size.
 */
function Lightning({ night }: { night: boolean }) {
  const light = useRef<HemisphereLight>(null)
  /** When the next one strikes, on the scene clock; set on the first frame. */
  const next = useRef<number | null>(null)
  const struck = useRef(-10)
  const peak = night ? 2.6 : 1.8

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // A storm rolling in is a few seconds' quiet before the first strike,
    // not a flash the moment the forecast lands.
    next.current ??= t + 1.5 + Math.random() * 4
    if (t >= next.current) {
      struck.current = t
      next.current = t + QUIET[0] + Math.random() * (QUIET[1] - QUIET[0])
      sfx.thunder(0.3 + Math.random() * 2.2)
    }
    const since = t - struck.current
    // On, off, on again and fading: the shape of a real strike.
    const flash =
      since < 0.07
        ? 1
        : since < 0.13
          ? 0
          : since < 0.45
            ? 0.75 * (1 - (since - 0.13) / 0.32)
            : 0
    if (light.current) light.current.intensity = flash * peak
  })

  return <hemisphereLight ref={light} args={['#e8efff', '#8a93a8', 0]} />
}
