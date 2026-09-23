import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type {
  Group,
  Mesh,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
} from 'three'
import { launchPhase } from './launch'
import { useGame } from '../../shared/state/store'
import { TextPlane } from '../../shared/engine/TextSign'
import { useT } from '../../shared/i18n/useT'

/**
 * What the summit room turns out to be: a flight deck, with the big button
 * under glass and a window that stops showing the sea once it is pressed.
 *
 * Drawn here rather than declared as furniture in `interiors.ts` because
 * none of it is furniture — the button is the one prop on the island that
 * changes the mode of the game, and the window is a shader-less bit of
 * animation that has to read the launch clock every frame. Both want the
 * frame loop, and the furniture kit deliberately does not have it.
 */

/** Where the console stands in the room, and how high its top sits. */
const CONSOLE: [number, number] = [0, -6.2]
const CONSOLE_TOP = 1.05

/**
 * How close he has to be to press it. Generous: the console is wide, and a
 * button that is the whole point of the room should not need to be hunted.
 */
const REACH = 3.6

export function FlightDeck() {
  const launch = useGame((s) => s.launch)
  const flying = Boolean(launch)

  return (
    <group>
      <Console />
      <Viewport />
      {!flying && <LaunchButton />}
      {flying && <Shake />}
    </group>
  )
}

/** The console the button sits in, and the seat in front of it. */
function Console() {
  const t = useT()
  const [x, z] = CONSOLE

  return (
    <group position={[x, 0, z]}>
      {/* The desk itself, canted back the way a console is. */}
      <mesh position={[0, CONSOLE_TOP / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.2, CONSOLE_TOP, 1.5]} />
        <meshStandardMaterial color="#39424c" flatShading roughness={0.7} />
      </mesh>
      <mesh
        position={[0, CONSOLE_TOP + 0.22, 0.12]}
        rotation={[-0.42, 0, 0]}
        castShadow
      >
        <boxGeometry args={[5.2, 0.9, 0.16]} />
        <meshStandardMaterial color="#2b333c" flatShading roughness={0.6} />
      </mesh>

      {/* Instrument lamps across the panel: the deck has been live all along. */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh
          key={i}
          position={[-2.1 + i * 0.52, CONSOLE_TOP + 0.34, 0.24]}
          rotation={[-0.42, 0, 0]}
        >
          <cylinderGeometry args={[0.06, 0.06, 0.04, 8]} />
          <meshStandardMaterial
            color={
              i % 3 === 0 ? '#f0a33c' : i % 3 === 1 ? '#6fd08a' : '#6aa9f0'
            }
            emissive={
              i % 3 === 0 ? '#f0a33c' : i % 3 === 1 ? '#6fd08a' : '#6aa9f0'
            }
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      <TextPlane
        text={t('KITSOS ISLAND · DEPARTURE')}
        position={[0, CONSOLE_TOP + 0.62, -0.2]}
        width={3.4}
        aspect={10}
        color="#cfe0f0"
      />
    </group>
  )
}

/**
 * The button, under a glass cover that is already up.
 *
 * It is a mesh with a pointer handler rather than an `Exhibit`, because an
 * exhibit opens a panel and this does not: it takes the island away. Keeping
 * it out of the exhibit table also keeps it out of the journal, which has
 * nothing useful to say about a thing you press exactly once.
 */
function LaunchButton() {
  const t = useT()
  const beginLaunch = useGame((s) => s.beginLaunch)
  const mode = useGame((s) => s.mode)
  const cap = useRef<Mesh>(null)
  const glow = useRef<MeshStandardMaterial>(null)
  const [x, z] = CONSOLE
  const at: [number, number, number] = [x, CONSOLE_TOP + 0.5, z + 0.5]

  /* It breathes, so the eye finds it in a room full of instruments. */
  useFrame((state) => {
    const pulse = 0.65 + Math.sin(state.clock.elapsedTime * 2.4) * 0.35
    if (glow.current) glow.current.emissiveIntensity = pulse
    if (cap.current) cap.current.position.y = at[1] + pulse * 0.01
  })

  const press = () => {
    /* Only from the deck, and only while the walk is actually his: a click
       that lands through an open panel is a click he did not mean. */
    if (mode !== 'explore') return
    beginLaunch()
  }

  return (
    <group>
      {/* The glass cover, hinged back off the button. */}
      <mesh
        position={[at[0], at[1] + 0.34, at[2] - 0.34]}
        rotation={[-1.1, 0, 0]}
      >
        <boxGeometry args={[0.9, 0.62, 0.03]} />
        <meshStandardMaterial
          color="#bfe4ff"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* The housing, and the cap that is the button. */}
      <mesh position={[at[0], at[1] - 0.12, at[2]]} castShadow>
        <cylinderGeometry args={[0.42, 0.46, 0.22, 16]} />
        <meshStandardMaterial color="#2b333c" flatShading roughness={0.7} />
      </mesh>
      <mesh
        ref={cap}
        position={at}
        castShadow
        onClick={(e) => {
          e.stopPropagation()
          press()
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <cylinderGeometry args={[0.34, 0.34, 0.2, 16]} />
        <meshStandardMaterial
          ref={glow}
          color="#e0483a"
          emissive="#c0392b"
          emissiveIntensity={0.8}
          roughness={0.35}
        />
      </mesh>
      {/* A pad the size of a hand, so it can be pressed without pixel-hunting. */}
      <mesh
        position={at}
        visible={false}
        onClick={(e) => {
          e.stopPropagation()
          press()
        }}
      >
        <boxGeometry args={[REACH * 0.5, 1.4, REACH * 0.5]} />
      </mesh>

      <TextPlane
        text={t('LAUNCH')}
        position={[at[0], at[1] - 0.3, at[2] + 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={1.1}
        aspect={4}
        color="#ffd9a0"
      />
    </group>
  )
}

/**
 * The window over the console: the sea and the sky before the button, and
 * then the island falling away and the stars coming up.
 *
 * Two discs and a starfield rather than a rendered world behind the glass.
 * The room is sealed once the count starts and the camera never leaves the
 * deck, so what is wanted is a convincing view out of one window, and the
 * cheapest honest way to draw that is to draw the window.
 */
function Viewport() {
  const launch = useGame((s) => s.launch)
  const sky = useRef<MeshStandardMaterial>(null)
  const island = useRef<Group>(null)
  const stars = useRef<Points>(null)
  const starMat = useRef<PointsMaterial>(null)

  /* A fixed scatter of stars: generated once, and the same every flight. */
  const field = useMemo(() => {
    const count = 220
    const out = new Float32Array(count * 3)
    /* A small deterministic generator, so the sky does not reshuffle itself
       on every re-render the way Math.random would. */
    let seed = 20260923
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 0x100000000
    }
    for (let i = 0; i < count; i++) {
      out[i * 3] = (rand() - 0.5) * 7.2
      out[i * 3 + 1] = (rand() - 0.5) * 4.2
      out[i * 3 + 2] = -0.02 - rand() * 0.2
    }
    return out
  }, [])

  useFrame(() => {
    const phase = launch
      ? launchPhase(launch, performance.now() / 1000)
      : { altitude: 0 }
    const up = phase.altitude

    /* Daylight blue draining to black as he climbs out of the air. */
    if (sky.current) {
      const c = sky.current.color
      c.setRGB(
        0.42 * (1 - up) + 0.02 * up,
        0.62 * (1 - up) + 0.02 * up,
        0.85 * (1 - up) + 0.06 * up,
      )
    }
    /* The island shrinking and sinking out of the bottom of the frame. */
    if (island.current) {
      const s = Math.max(0.06, 1 - up * 0.94)
      island.current.scale.setScalar(s)
      island.current.position.y = -0.9 - up * 1.1
      island.current.visible = up < 0.995
    }
    /* Stars, which are not there at all until the blue has mostly gone. */
    if (starMat.current) {
      starMat.current.opacity = Math.max(0, up * 1.6 - 0.6)
    }
    if (stars.current) stars.current.rotation.z = up * 0.12
  })

  return (
    <group position={[0, 3.1, -9.86]}>
      {/* Everything in the window is drawn facing into the room. */}
      <group position={[0, 0, 0.01]}>
        {/* The pane: a disc of sky set into the wall. */}
        <mesh>
          <circleGeometry args={[3.4, 40]} />
          <meshStandardMaterial
            ref={sky}
            color="#6b9ed9"
            emissive="#3f6ea8"
            emissiveIntensity={0.35}
          />
        </mesh>

        <points ref={stars} position={[0, 0, 0.02]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[field, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={starMat}
            size={0.05}
            color="#ffffff"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </points>

        {/* The island, seen from above and getting further away. */}
        <group ref={island} position={[0, -0.9, 0.03]}>
          <mesh>
            <circleGeometry args={[2.3, 28]} />
            <meshStandardMaterial color="#6fae5a" />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <circleGeometry args={[2.7, 28]} />
            <meshStandardMaterial color="#e8d9a8" />
          </mesh>
          <mesh position={[-0.9, 0.7, 0.01]}>
            <circleGeometry args={[0.42, 16]} />
            <meshStandardMaterial color="#8d949a" />
          </mesh>
        </group>
      </group>

      {/* The frame, and the bars across it. */}
      <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.42, 0.14, 8, 40]} />
        <meshStandardMaterial color="#39424c" flatShading roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[6.84, 0.1, 0.06]} />
        <meshStandardMaterial color="#39424c" flatShading />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.1, 6.84, 0.06]} />
        <meshStandardMaterial color="#39424c" flatShading />
      </mesh>
    </group>
  )
}

/**
 * The deck moving under him while the engines are lit.
 *
 * The camera is shaken rather than the room, because shaking the room leaves
 * the walls sliding against a fixed horizon and reads as furniture on a boat.
 * The offset is written straight onto the camera each frame and taken off
 * again when the burn ends, so nothing accumulates.
 */
function Shake() {
  const launch = useGame((s) => s.launch)
  const camera = useThree((s) => s.camera)
  const offset = useRef<[number, number]>([0, 0])

  useFrame(() => {
    /* Undo last frame's kick before measuring this one. */
    camera.position.x -= offset.current[0]
    camera.position.y -= offset.current[1]
    offset.current = [0, 0]

    if (!launch || launch.arrived) return
    const phase = launchPhase(launch, performance.now() / 1000)
    if (phase.shake <= 0) return

    const now = performance.now() / 1000
    /* Two incommensurable frequencies, so it never settles into a wobble. */
    const amount = phase.shake * 0.12
    const dx = Math.sin(now * 47) * amount
    const dy = Math.sin(now * 61.7) * amount
    camera.position.x += dx
    camera.position.y += dy
    offset.current = [dx, dy]
  })

  return null
}
