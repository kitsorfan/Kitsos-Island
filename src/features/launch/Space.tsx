import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, DoubleSide } from 'three'
import type { Group, Mesh } from 'three'
import { Player } from '../player/Player'

/**
 * Out of the ship, and out over the island.
 *
 * This replaces the flight deck the moment the engines cut, and it is the
 * reason he can move at all out here: he was in a cabin, and a cabin is a
 * room with walls in it. Nothing about free movement makes sense inside one.
 * So once the climb is over he is outside, on a tether of nothing, with the
 * ship behind him and the island a long way down.
 *
 * Everything is drawn rather than lit: at this distance there is no sun to
 * model, only a very bright one off to the side, and nothing to cast onto.
 * The whole area is a starfield, a globe, a sun and a ship - four things,
 * all of them cheap, which is what keeps a scene with no ground in it from
 * costing more than the island did.
 */
export function Space() {
  return (
    <>
      {/* Black, and properly black: this is the one place on the island
          where the background is not a sky. */}
      <color attach="background" args={['#05070f']} />

      {/* A little fill so he is not a silhouette, and one hard key light
          standing in for the sun. */}
      <ambientLight intensity={0.78} color="#9fb6d8" />
      <directionalLight
        position={[18, 10, 14]}
        intensity={2.4}
        color="#fff6e2"
      />
      {/* Bounce off the planet below, which is what actually lights an
          astronaut in low orbit - cold on top, blue-green underneath. */}
      <directionalLight
        position={[-6, -14, -4]}
        intensity={1.15}
        color="#6fd4c0"
      />
      {/*
        A cold rim from behind.
        
        Vacuum has no air to scatter light, so anything facing away from the
        sun goes to the background colour exactly - which out here is almost
        black. With only a key and the planet's bounce, the whole shadowed
        half of the ship and of him disappeared into the starfield and the
        silhouette stopped closing. This is not physical; it is the standard
        cheat for the same reason film crews use it, and it costs one light.
      */}
      <directionalLight
        position={[-14, 6, -16]}
        intensity={0.85}
        color="#93b6e8"
      />

      <Starfield />
      <Sun />
      <Planet />
      <Ship />
      <Player />
    </>
  )
}

/**
 * The stars: a sphere of points around everything, far enough out that
 * nothing he can do reaches them.
 *
 * Generated once from a fixed seed, so the sky is the same sky every flight
 * rather than reshuffling itself on a re-render.
 */
function Starfield() {
  const field = useMemo(() => {
    const count = 1400
    const out = new Float32Array(count * 3)
    let seed = 20260923
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 0x100000000
    }
    for (let i = 0; i < count; i++) {
      /* Spread evenly over a sphere rather than over latitude and longitude,
         which would bunch them at the poles. */
      const u = rand() * 2 - 1
      const a = rand() * Math.PI * 2
      const r = Math.sqrt(1 - u * u)
      const d = 300 + rand() * 120
      out[i * 3] = Math.cos(a) * r * d
      out[i * 3 + 1] = u * d
      out[i * 3 + 2] = Math.sin(a) * r * d
    }
    return out
  }, [])

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[field, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={1.5}
        sizeAttenuation
        color="#ffffff"
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  )
}

/** The sun: a disc with a haze round it, a long way off to one side. */
function Sun() {
  return (
    <group position={[150, 80, 120]}>
      <mesh>
        <sphereGeometry args={[9, 20, 16]} />
        <meshBasicMaterial color="#fffdf2" />
      </mesh>
      <mesh>
        <sphereGeometry args={[18, 20, 16]} />
        <meshBasicMaterial
          color="#ffe9b0"
          transparent
          opacity={0.18}
          blending={AdditiveBlending}
          depthWrite={false}
          side={BackSide}
        />
      </mesh>
    </group>
  )
}

/**
 * Kitsos Island from orbit: the sea, the island on it, and the thin band of
 * air round the edge that says it is a world rather than a marble.
 *
 * It turns, slowly. That is what makes the shot feel like orbit rather than
 * a painted backdrop, and it is one line.
 */
function Planet() {
  const globe = useRef<Group>(null)
  const clouds = useRef<Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (globe.current) globe.current.rotation.y = t * 0.018
    /* The weather runs at its own rate, so the two are never locked. */
    if (clouds.current) clouds.current.rotation.y = t * 0.026
  })

  return (
    <group position={[0, -78, -20]}>
      <group ref={globe}>
        {/* The sea. */}
        <mesh>
          <sphereGeometry args={[62, 48, 32]} />
          <meshStandardMaterial
            color="#1d5f8f"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>

        {/*
          The island itself, sat on the surface as a shallow cap so it reads
          as part of the globe rather than a sticker on it. Turned up towards
          him, because the whole point of being up here is looking at it.
        */}
        <mesh rotation={[-0.5, 0.4, 0]}>
          <sphereGeometry
            args={[62.4, 40, 28, 0, Math.PI / 5, 0, Math.PI / 6]}
          />
          <meshStandardMaterial
            color="#6fae5a"
            roughness={1}
            side={DoubleSide}
          />
        </mesh>
        {/* Its beaches, a shade wider and underneath. */}
        <mesh rotation={[-0.5, 0.4, 0]}>
          <sphereGeometry
            args={[62.2, 40, 28, -0.06, Math.PI / 4.4, -0.05, Math.PI / 5.4]}
          />
          <meshStandardMaterial
            color="#e8d9a8"
            roughness={1}
            side={DoubleSide}
          />
        </mesh>
      </group>

      {/* Weather, on its own shell. */}
      <mesh ref={clouds}>
        <sphereGeometry args={[63.6, 40, 28]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.16}
          roughness={1}
          depthWrite={false}
        />
      </mesh>

      {/* The air, seen edge-on: a shell of light that only shows at the rim
          because it is drawn from the inside. */}
      <mesh>
        <sphereGeometry args={[67, 40, 28]} />
        <meshBasicMaterial
          color="#79c8ff"
          transparent
          opacity={0.14}
          side={BackSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/**
 * The ship he came up in, holding station a little way off.
 *
 * The same shape the hologram showed inside the lighthouse — hull, nose,
 * three fins — so the thing on the plinth and the thing he is floating
 * beside are recognisably one object. It is the only bit of the scene with
 * a hard edge on it, which is what gives the eye a sense of scale.
 */
function Ship() {
  const ship = useRef<Group>(null)

  useFrame((state) => {
    if (!ship.current) return
    const t = state.clock.elapsedTime
    /* Station-keeping: it drifts a little, the way anything untethered
       alongside you does. */
    ship.current.position.y = 1.4 + Math.sin(t * 0.21) * 0.5
    ship.current.rotation.z = 0.4 + Math.sin(t * 0.14) * 0.05
  })

  return (
    <group ref={ship} position={[-7.5, 1.4, -5]} rotation={[0.2, 0.7, 0.4]}>
      {/* Hull. */}
      <mesh castShadow>
        <cylinderGeometry args={[0.85, 1.05, 6.4, 16]} />
        <meshStandardMaterial color="#e8eef4" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* The red band, off the tower it used to be. */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 1.1, 16]} />
        <meshStandardMaterial color="#c0392b" roughness={0.7} />
      </mesh>
      {/* Nose. */}
      <mesh position={[0, 3.9, 0]} castShadow>
        <coneGeometry args={[0.85, 1.6, 16]} />
        <meshStandardMaterial color="#d8e2ea" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Three fins. */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 1.1, -2.6, Math.sin(a) * 1.1]}
            rotation={[0, -a, 0]}
            castShadow
          >
            <boxGeometry args={[0.12, 1.8, 0.95]} />
            <meshStandardMaterial color="#c0392b" roughness={0.8} />
          </mesh>
        )
      })}
      {/* The bells, dark and cold: the burn is over. */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + Math.PI / 3
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.45, -3.5, Math.sin(a) * 0.45]}
          >
            <coneGeometry args={[0.34, 0.8, 12, 1, true]} />
            <meshStandardMaterial
              color="#4a545f"
              roughness={0.7}
              metalness={0.4}
              side={DoubleSide}
            />
          </mesh>
        )
      })}
      {/* A window, lit, so it reads as a thing he was just inside. */}
      <mesh position={[0, 2.2, 0.86]}>
        <circleGeometry args={[0.3, 14]} />
        <meshBasicMaterial color="#ffe9a8" />
      </mesh>
      {/* And a beacon on the nose, still blinking. */}
      <Beacon />
    </group>
  )
}

/** The light on the nose, blinking the way one on a hull does. */
function Beacon() {
  const lamp = useRef<Mesh>(null)

  useFrame((state) => {
    if (!lamp.current) return
    /* A hard on-off rather than a fade: a beacon pulses, it does not
       breathe. */
    const on = Math.sin(state.clock.elapsedTime * 2.4) > 0.72
    lamp.current.visible = on
  })

  return (
    <mesh ref={lamp} position={[0, 4.8, 0]}>
      <sphereGeometry args={[0.16, 10, 8]} />
      <meshBasicMaterial color="#ff6b5a" />
    </mesh>
  )
}
