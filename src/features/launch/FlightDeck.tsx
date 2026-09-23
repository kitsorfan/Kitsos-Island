import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { DoubleSide } from 'three'
import type {
  Group,
  Mesh,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
} from 'three'
import { launchPhase } from './launch'
import { useGame } from '../../shared/state/store'
import { CONSOLE, CONSOLE_TOP, HOLOGRAM, SUIT_RACK } from './deck'
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
      <Hologram />
      <Bulkheads />
      <Viewport />
      {!flying && <SuitRack />}
      {!flying && <LaunchButton />}
      {flying && <Shake />}
    </group>
  )
}

/**
 * The hologram on the plinth in the middle of the room: the Old Lighthouse,
 * turning slowly, with its shell peeled away to show the ship inside it.
 *
 * This is the reveal, and it is why the room reads as a flight deck the
 * moment he walks in rather than at the moment he presses anything. The tower
 * he has been looking at from the outside all game is standing here in blue
 * light with engines under it, and nothing has to say so in words.
 *
 * It is drawn twice over: the painted tower in translucent bands, and the
 * ship inside it in wireframe, so the one is plainly the skin over the other.
 */
function Hologram() {
  const t = useT()
  const launch = useGame((s) => s.launch)
  const spin = useRef<Group>(null)
  const glow = useRef<Group>(null)
  /* The painted shell, which lifts away and fades as the count runs out. */
  const shell = useRef<Group>(null)
  /* The ship inside it, which is what climbs. */
  const ship = useRef<Group>(null)
  /* The exhaust under it, lit only while the engines are. */
  const burn = useRef<Group>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    /* It breathes, the way a projection that is costing power does. */
    if (glow.current)
      glow.current.scale.setScalar(1 + Math.sin(time * 1.6) * 0.012)

    const phase = launch ? launchPhase(launch, performance.now() / 1000) : null

    /*
     * Idling, it turns slowly and shows the cutaway. That is the diagram,
     * and it is what the room says before anything happens.
     */
    if (!phase) {
      if (spin.current) spin.current.rotation.y = time * 0.32
      if (shell.current) {
        shell.current.position.y = 0
        shell.current.visible = true
        shell.current.scale.setScalar(1)
      }
      if (ship.current) ship.current.position.y = 0
      if (burn.current) burn.current.visible = false
      return
    }

    /*
     * And once the button is pressed it stops being a diagram and flies the
     * flight, in miniature, a couple of metres from the man doing it. The
     * hologram is the only place the launch can actually be watched from the
     * outside - he is strapped in behind the window for the whole of it - so
     * this is where the ship is seen to leave the tower.
     */
    /* The turn slows to a stop as the count runs out: a model still
       revolving through its own launch reads as a display, not an event. */
    const settle = Math.max(0, 1 - phase.t * 3)
    if (spin.current) spin.current.rotation.y += settle * 0.32 * 0.016

    /* The shell lifts off and thins away through the hold, so by ignition
       the ship is standing clear of it. */
    const shed = Math.min(1, phase.stage === 'hold' ? phase.stageT : 1)
    if (shell.current) {
      shell.current.position.y = shed * 1.4
      shell.current.scale.setScalar(1 + shed * 0.5)
      shell.current.visible = shed < 0.98
    }

    /* The ship climbs on the same altitude the window is reading, so the
       model and the view out of the glass agree. */
    if (ship.current) ship.current.position.y = phase.altitude * 3.4

    /* The engines, lit from ignition and out again at the top. */
    if (burn.current) {
      const lit = phase.stage === 'ignition' || phase.stage === 'climb'
      burn.current.visible = lit
      if (lit) {
        /* Flickering, and longest at ignition where the thrust is. */
        const flare = 0.6 + phase.shake * 0.8 + Math.sin(time * 40) * 0.12
        burn.current.scale.set(1, flare, 1)
        burn.current.position.y = phase.altitude * 3.4
      }
    }
  })

  return (
    <group position={[HOLOGRAM[0], 0, HOLOGRAM[1]]}>
      {/* The plinth it is thrown from. */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.35, 1.55, 0.32, 20]} />
        <meshStandardMaterial color="#2b333c" flatShading roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.05, 20]} />
        <meshStandardMaterial
          color="#6fc3ff"
          emissive="#3aa0ff"
          emissiveIntensity={1.4}
        />
      </mesh>
      {/* The cone of light between the plinth and the image. */}
      <mesh position={[0, 1.5, 0]}>
        <coneGeometry args={[1.15, 2.3, 20, 1, true]} />
        <meshBasicMaterial
          color="#5fb4ff"
          transparent
          opacity={0.07}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      <group ref={glow} position={[0, 0.34, 0]}>
        <group ref={spin}>
          {/* The tower as it looks from outside: the painted bands, in light
              rather than paint. This is the part that lifts away. */}
          <group ref={shell}>
            {[0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[0, 0.5 + i * 0.42, 0]}>
                <cylinderGeometry
                  args={[0.52 - i * 0.05, 0.57 - i * 0.05, 0.42, 14, 1, true]}
                />
                <meshBasicMaterial
                  color={i % 2 === 0 ? '#bfe4ff' : '#ff9b8a'}
                  transparent
                  opacity={0.22}
                  depthWrite={false}
                  side={DoubleSide}
                />
              </mesh>
            ))}
            {/* The lantern room at the top of it. */}
            <mesh position={[0, 2.78, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.34, 12, 1, true]} />
              <meshBasicMaterial
                color="#ffe9a8"
                transparent
                opacity={0.45}
                depthWrite={false}
                side={DoubleSide}
              />
            </mesh>
          </group>

          {/* And the ship inside the shell: a hull up the middle, a nose on
              it, fins at the base and the bells of the engines under it.
              This is the part that climbs. */}
          <group ref={ship}>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.3, 0.38, 2.5, 12]} />
              <meshBasicMaterial
                color="#8fd4ff"
                wireframe
                transparent
                opacity={0.75}
              />
            </mesh>
            <mesh position={[0, 3.05, 0]}>
              <coneGeometry args={[0.3, 0.6, 12]} />
              <meshBasicMaterial
                color="#8fd4ff"
                wireframe
                transparent
                opacity={0.75}
              />
            </mesh>
            {[0, 1, 2].map((i) => {
              const a = (i / 3) * Math.PI * 2
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * 0.42, 0.42, Math.sin(a) * 0.42]}
                  rotation={[0, -a, 0]}
                >
                  <boxGeometry args={[0.04, 0.72, 0.36]} />
                  <meshBasicMaterial
                    color="#8fd4ff"
                    wireframe
                    transparent
                    opacity={0.75}
                  />
                </mesh>
              )
            })}
            {[0, 1, 2].map((i) => {
              const a = (i / 3) * Math.PI * 2 + Math.PI / 3
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * 0.19, 0.14, Math.sin(a) * 0.19]}
                >
                  <coneGeometry args={[0.15, 0.3, 10, 1, true]} />
                  <meshBasicMaterial
                    color="#ffb36a"
                    transparent
                    opacity={0.5}
                    depthWrite={false}
                    side={DoubleSide}
                  />
                </mesh>
              )
            })}
          </group>

          {/*
            The exhaust, which only exists while the engines are lit. It
            hangs off the bottom of the ship and stretches with the thrust,
            so the plume is longest at ignition and thins as the air does.
          */}
          <group ref={burn} visible={false}>
            <mesh position={[0, -0.36, 0]}>
              <coneGeometry args={[0.26, 0.9, 12, 1, true]} />
              <meshBasicMaterial
                color="#ffd08a"
                transparent
                opacity={0.55}
                depthWrite={false}
                side={DoubleSide}
              />
            </mesh>
            <mesh position={[0, -0.62, 0]}>
              <coneGeometry args={[0.15, 1.5, 12, 1, true]} />
              <meshBasicMaterial
                color="#ff8a4a"
                transparent
                opacity={0.3}
                depthWrite={false}
                side={DoubleSide}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* The label on the deck under it, which is where the reveal is put
          into words for anybody who wants it spelled out. */}
      <TextPlane
        text={t(
          launch ? 'DEPARTURE IN PROGRESS' : 'THE OLD LIGHTHOUSE - CUTAWAY',
        )}
        position={[0, 0.42, 1.55]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2.4}
        aspect={12}
        color="#9fdcff"
      />
    </group>
  )
}

/**
 * What turns a stone room into a hull: ribbed bulkheads round the wall, a lit
 * strip at the floor, and the deck lit cool where the lighthouse was warm.
 *
 * Cheap geometry doing the work an interior texture would do. The room is the
 * lighthouse's own round summit, and these are what say it has been refitted
 * rather than merely furnished.
 */
function Bulkheads() {
  /* Ribs round the wall, skipping the arcs the window and the airlock have
     already taken. */
  const ribs = useMemo(() => {
    const out: { at: [number, number]; turn: number }[] = []
    const count = 16
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      const x = Math.cos(a) * 9.5
      const z = Math.sin(a) * 9.5
      if (z < -6.5 || x < -7.5) continue
      out.push({ at: [x, z], turn: -a })
    }
    return out
  }, [])

  return (
    <group>
      {ribs.map((rib, i) => (
        <mesh
          key={i}
          position={[rib.at[0], 1.7, rib.at[1]]}
          rotation={[0, rib.turn, 0]}
        >
          <boxGeometry args={[0.16, 3.4, 0.5]} />
          <meshStandardMaterial
            color="#4a545f"
            flatShading
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* A lit strip round the floor: the running lights of the deck. */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.1, 9.35, 40]} />
        <meshStandardMaterial
          color="#6fc3ff"
          emissive="#3aa0ff"
          emissiveIntensity={0.9}
          side={DoubleSide}
        />
      </mesh>

      <pointLight
        position={[0, 4.2, -1]}
        intensity={22}
        distance={22}
        decay={2}
        color="#bcdcff"
      />
      <pointLight
        position={[HOLOGRAM[0], 2.2, HOLOGRAM[1]]}
        intensity={14}
        distance={10}
        decay={2}
        color="#5fb4ff"
      />
    </group>
  )
}

/**
 * The rack in the airlock, and the suit on it.
 *
 * The gate on the whole flight. It is over here against the west wall rather
 * than beside the button on purpose: the walk across the room is the step
 * that makes the launch something he decided to do, and a suit you can reach
 * from the console is a checkbox rather than a preparation.
 *
 * The suit is drawn on the rack while it is hanging and taken off it once he
 * is wearing it, so the empty hanger is the room telling him which of the two
 * states he is in without a word of UI.
 */
function SuitRack() {
  const t = useT()
  const suited = useGame((s) => s.suited)
  const toggleSuit = useGame((s) => s.toggleSuit)
  const mode = useGame((s) => s.mode)
  const halo = useRef<MeshStandardMaterial>(null)

  /* The empty hanger glows until it has been used, and stops afterwards. */
  useFrame((state) => {
    if (!halo.current) return
    halo.current.emissiveIntensity = suited
      ? 0.12
      : 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.28
  })

  const press = () => {
    if (mode !== 'explore') return
    toggleSuit()
  }

  return (
    <group
      position={[SUIT_RACK[0], 0, SUIT_RACK[1]]}
      rotation={[0, Math.PI / 2, 0]}
    >
      {/*
        The alcove: a box of deck plating sunk into the wall, lit from
        inside.

        The back panel has to be deep enough to stand behind the suit and
        tall enough to reach the floor, or the room's own wall shows through
        around the edges of it and the recess reads as a poster of a recess.
        So it is a full-height slab set back behind where the suit hangs,
        with a floor, a lintel and two jambs closing the other four sides.
      */}
      <mesh position={[0, 1.6, -0.62]} receiveShadow>
        <boxGeometry args={[3.2, 3.4, 0.3]} />
        <meshStandardMaterial color="#2a323b" flatShading roughness={0.9} />
      </mesh>
      {/* Floor of the recess, so nothing is standing on the room's carpet. */}
      <mesh position={[0, 0.03, -0.3]} receiveShadow>
        <boxGeometry args={[3.2, 0.06, 0.95]} />
        <meshStandardMaterial color="#3a434e" flatShading roughness={0.9} />
      </mesh>
      {/* Lintel across the top. */}
      <mesh position={[0, 3.22, -0.2]} castShadow>
        <boxGeometry args={[3.2, 0.36, 1.15]} />
        <meshStandardMaterial color="#4a545f" flatShading roughness={0.7} />
      </mesh>
      {/* The two jambs. */}
      {[-1.55, 1.55].map((x) => (
        <mesh key={x} position={[x, 1.6, -0.2]} castShadow>
          <boxGeometry args={[0.24, 3.4, 1.15]} />
          <meshStandardMaterial color="#4a545f" flatShading roughness={0.7} />
        </mesh>
      ))}
      {/* Strip lights down both jambs, and one along the lintel. */}
      {[-1.36, 1.36].map((x) => (
        <mesh key={x} position={[x, 1.55, 0.3]}>
          <boxGeometry args={[0.07, 2.9, 0.06]} />
          <meshStandardMaterial
            color="#6fc3ff"
            emissive="#3aa0ff"
            emissiveIntensity={1.3}
          />
        </mesh>
      ))}
      <mesh position={[0, 3.04, 0.3]}>
        <boxGeometry args={[2.8, 0.07, 0.06]} />
        <meshStandardMaterial
          color="#6fc3ff"
          emissive="#3aa0ff"
          emissiveIntensity={1.3}
        />
      </mesh>
      {/* Tread plate on the floor of it, so the step in is felt. */}
      {[-0.9, -0.3, 0.3, 0.9].map((x) => (
        <mesh key={x} position={[x, 0.07, -0.3]}>
          <boxGeometry args={[0.12, 0.02, 0.85]} />
          <meshStandardMaterial color="#59636f" flatShading />
        </mesh>
      ))}
      <pointLight
        position={[0, 2.2, 0.2]}
        intensity={11}
        distance={7}
        decay={2}
        color="#cfe4f5"
      />

      {/* The rail it hangs off, over head height so the suit hangs clear of
          the floor the way one actually does. */}
      <mesh
        position={[0, 2.62, -0.12]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.05, 0.05, 2.4, 10]} />
        <meshStandardMaterial color="#9aa5ad" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* The hanger, which stays behind when the suit goes. */}
      <mesh position={[0, 2.5, -0.12]}>
        <boxGeometry args={[0.5, 0.05, 0.05]} />
        <meshStandardMaterial color="#9aa5ad" metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.58, -0.12]}>
        <torusGeometry args={[0.07, 0.015, 6, 12]} />
        <meshStandardMaterial color="#9aa5ad" metalness={0.5} />
      </mesh>

      {/* The backboard, which is what lights up. */}
      <mesh position={[0, 1.1, -0.16]}>
        <boxGeometry args={[2.3, 2.2, 0.06]} />
        <meshStandardMaterial
          ref={halo}
          color="#2b333c"
          emissive="#f0a33c"
          emissiveIntensity={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* The suit, while it is still on the rack. */}
      {!suited && (
        <group position={[0, 1.42, 0.02]}>
          {/* Torso */}
          <mesh position={[0, 0.34, 0]} castShadow>
            <boxGeometry args={[0.62, 0.72, 0.3]} />
            <meshStandardMaterial color="#eef2f6" flatShading roughness={0.8} />
          </mesh>
          {/* Collar ring, in the island's amber */}
          <mesh position={[0, 0.76, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.1, 12]} />
            <meshStandardMaterial
              color="#f0a33c"
              emissive="#f0a33c"
              emissiveIntensity={0.35}
            />
          </mesh>
          {/* Helmet, resting on the collar */}
          <mesh position={[0, 0.98, 0]} castShadow>
            <sphereGeometry args={[0.24, 14, 12]} />
            <meshStandardMaterial
              color="#cfe4f5"
              transparent
              opacity={0.55}
              roughness={0.15}
              metalness={0.3}
            />
          </mesh>
          {/* Arms and legs, hanging */}
          {[-0.42, 0.42].map((x) => (
            <mesh key={x} position={[x, 0.3, 0]} castShadow>
              <boxGeometry args={[0.2, 0.66, 0.22]} />
              <meshStandardMaterial color="#e2e8ee" flatShading />
            </mesh>
          ))}
          {[-0.17, 0.17].map((x) => (
            <mesh key={x} position={[x, -0.36, 0]} castShadow>
              <boxGeometry args={[0.24, 0.74, 0.24]} />
              <meshStandardMaterial color="#e2e8ee" flatShading />
            </mesh>
          ))}
        </group>
      )}

      {/* The whole rack is the target, suit on it or not. */}
      <mesh
        position={[0, 1.1, 0.3]}
        visible={false}
        onClick={(e) => {
          e.stopPropagation()
          press()
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <boxGeometry args={[2.4, 2.4, 1.4]} />
      </mesh>

      {/* A lamp over the rack: amber while the suit is hanging, green once
          it is on. The console's button reads the same fact, so the two
          lights agree across the room and neither has to be trusted alone. */}
      <mesh position={[0, 0.62, 0.34]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
        <meshStandardMaterial
          color={suited ? '#6fd08a' : '#f0a33c'}
          emissive={suited ? '#6fd08a' : '#f0a33c'}
          emissiveIntensity={1.2}
        />
      </mesh>

      <TextPlane
        text={t(suited ? 'SUIT ON - GO' : 'PRESSURE SUIT')}
        position={[0, 3.22, 0.46]}
        width={2.4}
        aspect={9}
        color={suited ? '#b6f0c6' : '#ffd9a0'}
      />
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
  /* Dark until he is suited, so the room answers the question "why did that
     do nothing" before he has to ask it. */
  const suited = useGame((s) => s.suited)
  const cap = useRef<Mesh>(null)
  const glow = useRef<MeshStandardMaterial>(null)
  const [x, z] = CONSOLE
  const at: [number, number, number] = [x, CONSOLE_TOP + 0.5, z + 0.5]

  /* It breathes once it is live, and sits dull while the suit is on its
     rack: a button that pulses at a man it is going to refuse is a lie. */
  useFrame((state) => {
    const pulse = suited
      ? 0.65 + Math.sin(state.clock.elapsedTime * 2.4) * 0.35
      : 0.08
    if (glow.current) glow.current.emissiveIntensity = pulse
    if (cap.current)
      cap.current.position.y = at[1] + (suited ? pulse : 0) * 0.01
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
          color={suited ? '#e0483a' : '#7a4a44'}
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
        text={t(suited ? 'LAUNCH' : 'SUIT UP FIRST')}
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
