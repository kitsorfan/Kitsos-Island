import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { DoubleSide, Vector2 } from 'three'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import { PLAYER_COLORS } from '../data/world'
import {
  BALLOON,
  BURST_RADIUS,
  CALLS,
  PAYLOAD_COLOR,
  aimPoint,
  nearestCall,
  stepBalloon,
} from '../game/balloon'
import { REACTIONS } from '../game/actors'
import type { Bystander, Call, Payload } from '../game/balloon'
import { consumeDrop, isCrouching, readMove } from '../game/input'
import { groundHeight } from '../game/terrain'
import { isInteractive, useGame } from '../state/store'
import { Character, type CharacterMotion } from './Character'
import { PLAYER_POS, PLAYER_VIEW } from '../game/player'
import * as sfx from '../game/audio'

const WATER = PAYLOAD_COLOR.water
const CONFETTI = PAYLOAD_COLOR.confetti

/* --------------------------------- the calls ------------------------------ */

/** Height the marker floats at, above the ring it stands on. */
const MARKER_LIFT = 7.5
/**
 * Signs are drawn several times life size. From fifty units up a thing the
 * size of a party hat is two pixels, and the whole game is knowing which of
 * these is which before you are over the top of it.
 */
const MARKER_SCALE = 2.4
/** Colours a confetti burst throws about. */
const FLECKS = [
  '#ff5fa8',
  '#f5c33b',
  '#3ecf6e',
  '#3f7bd6',
  '#ff8c1a',
  '#b95fd0',
]

/**
 * The fourteen gatherings, each with a ring on the grass, a column of colour
 * standing in it and a sign floating over the top. All three are needed: from
 * sixty units up a ring alone is a smudge.
 */
function Calls() {
  const marks = useRef<(Group | null)[]>([])
  const signs = useRef<(Group | null)[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < CALLS.length; i++) {
      const mark = marks.current[i]
      if (!mark) continue
      const served = Boolean(BALLOON.served[CALLS[i].id])
      mark.visible = !served
      if (served) continue
      const sign = signs.current[i]
      if (!sign) continue
      sign.position.y = MARKER_LIFT + Math.sin(t * 1.8 + i * 1.7) * 0.55
      sign.rotation.y = t * 0.9 + i
    }
  })

  return (
    <group>
      {CALLS.map((call, i) => {
        const color = PAYLOAD_COLOR[call.want]
        return (
          <group
            key={call.id}
            ref={(el) => {
              marks.current[i] = el
            }}
            position={[call.x, call.y, call.z]}
          >
            {/* A pale disc and a hard ring: the disc carries at distance, the
                ring says exactly how much room the burst has to hit. */}
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[BURST_RADIUS[call.want], 24]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.16}
                depthWrite={false}
              />
            </mesh>
            <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry
                args={[
                  BURST_RADIUS[call.want] - 0.8,
                  BURST_RADIUS[call.want],
                  32,
                ]}
              />
              <meshBasicMaterial color={color} transparent opacity={0.95} />
            </mesh>

            {/* The column, so a gathering behind a tree still shows. */}
            <mesh position={[0, 4.2, 0]}>
              <cylinderGeometry args={[0.9, 2.1, 8.4, 14, 1, true]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.3}
                depthWrite={false}
                side={DoubleSide}
              />
            </mesh>

            <group
              ref={(el) => {
                signs.current[i] = el
              }}
              position={[0, MARKER_LIFT, 0]}
              scale={MARKER_SCALE}
            >
              {call.want === 'water' ? <Droplet /> : <PartyCone />}
            </group>
          </group>
        )
      })}
    </group>
  )
}

/** Wants cooling down: a fat drop of water, point up. */
function Droplet() {
  return (
    <group>
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.78, 12, 10]} />
        <meshStandardMaterial
          color={WATER}
          flatShading
          roughness={0.25}
          emissive={WATER}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <coneGeometry args={[0.62, 1.1, 12]} />
        <meshStandardMaterial
          color={WATER}
          flatShading
          roughness={0.25}
          emissive={WATER}
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  )
}

/** Wants confetti: a party hat with a pom-pom on the point. */
function PartyCone() {
  return (
    <group>
      <mesh position={[0, -0.1, 0]}>
        <coneGeometry args={[0.72, 1.5, 10]} />
        <meshStandardMaterial
          color={CONFETTI}
          flatShading
          roughness={0.4}
          emissive={CONFETTI}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.3, 10, 8]} />
        <meshStandardMaterial color="#f5c33b" flatShading roughness={0.4} />
      </mesh>
    </group>
  )
}

/* -------------------------------- the crowd ------------------------------- */

/**
 * The people standing at a gathering.
 *
 * Six boxes each rather than the full islander rig: there are forty-two of
 * them, they are only ever seen from a basket a long way up, and what has to
 * read at that distance is what they are doing rather than what they look
 * like. What they are doing is one of three things — waiting, watching the
 * balloon; cheering a faceful of confetti; or getting away from a water bomb
 * as fast as their legs will carry them.
 */
const SHIRTS = [
  '#e8442f',
  '#3f7bd6',
  '#f0a33c',
  '#2fb59a',
  '#b95fd0',
  '#e6a63c',
]
const PANTS = ['#2a3f78', '#3a3f4a', '#6f7f4a', '#7d5228']
const SKINS = ['#f0c39a', '#d9a173', '#a9764c', '#8a5a34']

/** How fast a frightened bystander runs, and how far they get. */
const FLEE_SPEED = 6.5
const FLEE_MAX = 8

function Reveller({ call, who }: { call: Call; who: Bystander }) {
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const armL = useRef<Group>(null)
  const armR = useRef<Group>(null)
  const legL = useRef<Group>(null)
  const legR = useRef<Group>(null)
  /** How far they have got from where they were standing. */
  const flee = useRef<[number, number]>([0, 0])
  const phase = useRef(0)

  const home = useMemo(() => {
    const x = call.x + who.dx
    const z = call.z + who.dz
    return { x, z, y: groundHeight(x, z) }
  }, [call, who])

  const look = useMemo(() => {
    const pick = (list: string[], n: number) =>
      list[Math.floor(Math.abs(Math.sin(who.seed * n) * 1000)) % list.length]
    return {
      shirt: pick(SHIRTS, 12.9),
      pants: pick(PANTS, 78.2),
      skin: pick(SKINS, 43.7),
    }
  }, [who.seed])

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const t = state.clock.elapsedTime + who.seed
    const r = REACTIONS.get(call.id)
    const scared = r !== undefined && r.kind === 'fright'
    const cheering = r !== undefined && r.kind === 'cheer'

    /* ------------------------------- the run ----------------------------- */

    if (scared) {
      // Straight away from the splash, from wherever they have got to.
      const awayX = home.x + flee.current[0] - r.x
      const awayZ = home.z + flee.current[1] - r.z
      const len = Math.hypot(awayX, awayZ) || 1
      flee.current[0] += (awayX / len) * FLEE_SPEED * delta
      flee.current[1] += (awayZ / len) * FLEE_SPEED * delta
      const out = Math.hypot(flee.current[0], flee.current[1])
      if (out > FLEE_MAX) {
        flee.current[0] = (flee.current[0] / out) * FLEE_MAX
        flee.current[1] = (flee.current[1] / out) * FLEE_MAX
      }
      phase.current += delta * 17
    } else {
      // Then sheepishly back to where they were standing.
      const ease = Math.min(1, delta * 1.6)
      flee.current[0] -= flee.current[0] * ease
      flee.current[1] -= flee.current[1] * ease
      phase.current += delta * (cheering ? 9 : 2)
    }

    const x = home.x + flee.current[0]
    const z = home.z + flee.current[1]
    if (root.current) {
      root.current.position.set(x, groundHeight(x, z), z)
      // Running, they face the way out. Otherwise they are watching the
      // balloon, which is the whole reason anybody is standing here.
      const facing =
        r && r.kind === 'fright'
          ? Math.atan2(x - r.x, z - r.z)
          : Math.atan2(BALLOON.x - x, BALLOON.z - z)
      let turn = facing - root.current.rotation.y
      while (turn > Math.PI) turn -= Math.PI * 2
      while (turn < -Math.PI) turn += Math.PI * 2
      root.current.rotation.y += turn * Math.min(1, delta * (scared ? 12 : 3))
    }

    const step = Math.sin(phase.current)
    if (legL.current)
      legL.current.rotation.x = scared ? step * 0.95 : step * 0.06
    if (legR.current)
      legR.current.rotation.x = scared ? -step * 0.95 : -step * 0.06

    /* -------------------------- arms, and the mood ----------------------- */

    if (body.current) {
      body.current.position.y = cheering
        ? Math.abs(Math.sin(phase.current)) * 0.34
        : scared
          ? Math.abs(step) * 0.1
          : 0
      body.current.rotation.x = scared ? 0.28 : 0
      body.current.rotation.z = cheering ? Math.sin(t * 3.4) * 0.14 : 0
    }
    if (armL.current && armR.current) {
      if (scared) {
        // Both hands over the head, flapping.
        armL.current.rotation.x = -2.7 + Math.sin(phase.current * 1.6) * 0.3
        armR.current.rotation.x = -2.7 - Math.sin(phase.current * 1.6) * 0.3
        armL.current.rotation.z = -0.55
        armR.current.rotation.z = 0.55
      } else if (cheering) {
        // Both hands up, waving at whoever threw it.
        armL.current.rotation.x = -2.5 - Math.abs(step) * 0.4
        armR.current.rotation.x = -2.5 - Math.abs(step) * 0.4
        armL.current.rotation.z = -0.45 + Math.sin(t * 8) * 0.3
        armR.current.rotation.z = 0.45 - Math.sin(t * 8) * 0.3
      } else {
        armL.current.rotation.x = step * 0.08
        armR.current.rotation.x = -step * 0.08
        armL.current.rotation.z = -0.1
        armR.current.rotation.z = 0.1
      }
    }
  })

  return (
    <group ref={root} position={[home.x, home.y, home.z]}>
      <group ref={body}>
        {/* Legs, hung from the hips so they swing rather than slide */}
        <group ref={legL} position={[-0.16, 0.62, 0]}>
          <mesh position={[0, -0.31, 0]} castShadow>
            <boxGeometry args={[0.22, 0.62, 0.22]} />
            <meshStandardMaterial
              color={look.pants}
              flatShading
              roughness={0.9}
            />
          </mesh>
        </group>
        <group ref={legR} position={[0.16, 0.62, 0]}>
          <mesh position={[0, -0.31, 0]} castShadow>
            <boxGeometry args={[0.22, 0.62, 0.22]} />
            <meshStandardMaterial
              color={look.pants}
              flatShading
              roughness={0.9}
            />
          </mesh>
        </group>

        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.54, 0.76, 0.32]} />
          <meshStandardMaterial
            color={look.shirt}
            flatShading
            roughness={0.85}
          />
        </mesh>

        {/* Arms and head do not cast: forty-two of these are on the island
            at once, and nobody is picking their shadows out from up there. */}
        <group ref={armL} position={[-0.36, 1.3, 0]}>
          <mesh position={[0, -0.28, 0]}>
            <boxGeometry args={[0.17, 0.58, 0.17]} />
            <meshStandardMaterial
              color={look.skin}
              flatShading
              roughness={0.9}
            />
          </mesh>
        </group>
        <group ref={armR} position={[0.36, 1.3, 0]}>
          <mesh position={[0, -0.28, 0]}>
            <boxGeometry args={[0.17, 0.58, 0.17]} />
            <meshStandardMaterial
              color={look.skin}
              flatShading
              roughness={0.9}
            />
          </mesh>
        </group>

        <mesh position={[0, 1.62, 0]}>
          <boxGeometry args={[0.42, 0.42, 0.4]} />
          <meshStandardMaterial
            color={look.skin}
            flatShading
            roughness={0.85}
          />
        </mesh>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.4, 10]} />
        <meshBasicMaterial color="#2a4a22" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

/** Everyone out on the island, waiting for something to be dropped on them. */
function Crowds() {
  return (
    <group>
      {CALLS.map((call) =>
        call.crowd.map((who) => (
          <Reveller key={`${call.id}-${who.seed}`} call={call} who={who} />
        )),
      )}
    </group>
  )
}

/* -------------------------------- the balloon ----------------------------- */

/** Half the envelope, from the mouth up to the crown, turned on the lathe. */
const PROFILE = [
  [1.5, 0],
  [2.4, 1.0],
  [3.4, 2.3],
  [4.1, 3.8],
  [4.35, 5.4],
  [4.1, 7.0],
  [3.3, 8.4],
  [2.0, 9.5],
  [0.7, 10.2],
  [0, 10.4],
] as const

/** Where the envelope's mouth sits above the basket floor. */
const MOUTH = 3.5
/**
 * The whole rig is built full size and then stood down, because a balloon
 * drawn to scale next to its own basket cannot be framed with the ground it
 * is aiming at. He is scaled back up inside it so he stays islander-sized.
 */
const RIG = 0.72
const CREAM = '#fdf7e9'
const GORES = ['#e8442f', '#3f7bd6']

function Envelope({ flame }: { flame: React.RefObject<Group | null> }) {
  const profile = useMemo(() => PROFILE.map(([r, y]) => new Vector2(r, y)), [])

  return (
    <group position={[0, MOUTH, 0]}>
      <mesh castShadow>
        <latheGeometry args={[profile, 22]} />
        <meshStandardMaterial
          color={CREAM}
          flatShading
          roughness={0.75}
          side={DoubleSide}
        />
      </mesh>

      {/* Six gores in two colours, laid on every other twelfth of the turn. */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} scale={1.012}>
          <latheGeometry
            args={[profile, 4, (i / 6) * Math.PI * 2, Math.PI / 6]}
          />
          <meshStandardMaterial
            color={GORES[i % 2]}
            flatShading
            roughness={0.7}
            side={DoubleSide}
          />
        </mesh>
      ))}

      {/* Mouth ring, and a skirt closing it off so it is not hollow below. */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.13, 6, 20]} />
        <meshStandardMaterial color="#2b2f38" flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 20]} />
        <meshStandardMaterial
          color="#c9b287"
          side={DoubleSide}
          roughness={0.9}
        />
      </mesh>

      {/* Crown ring at the top. */}
      <mesh position={[0, 10.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.11, 6, 16]} />
        <meshStandardMaterial color="#2b2f38" flatShading roughness={0.8} />
      </mesh>

      {/* The burner flame, hanging in the mouth, sized by the ref each frame. */}
      <group ref={flame} position={[0, -0.7, 0]}>
        <mesh>
          <coneGeometry args={[0.34, 1.5, 8]} />
          <meshBasicMaterial color="#ffb03a" transparent opacity={0.85} />
        </mesh>
        <mesh scale={0.55} position={[0, -0.15, 0]}>
          <coneGeometry args={[0.34, 1.5, 8]} />
          <meshBasicMaterial color="#fff2c4" />
        </mesh>
      </group>
    </group>
  )
}

function Basket({ rider }: { rider: React.RefObject<CharacterMotion> }) {
  return (
    <group>
      {/* Four lines up to the mouth ring. */}
      {[
        [-0.95, -0.95],
        [0.95, -0.95],
        [-0.95, 0.95],
        [0.95, 0.95],
      ].map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, MOUTH / 2 + 0.7, z]}>
          <boxGeometry args={[0.07, MOUTH - 0.4, 0.07]} />
          <meshStandardMaterial color="#8b6a3f" roughness={0.9} />
        </mesh>
      ))}

      {/* The basket: wicker, with a padded rim and a burner frame over it. */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.5, 2.4]} />
        <meshStandardMaterial color="#b0793f" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.32, 0]}>
        <boxGeometry args={[2.55, 0.2, 2.55]} />
        <meshStandardMaterial color="#7d5228" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2.48, 0.22, 2.48]} />
        <meshStandardMaterial color="#c9924f" flatShading roughness={0.9} />
      </mesh>

      {/* Two sandbags over the side, and the propane bottle inside. */}
      {[-1.32, 1.32].map((x) => (
        <mesh key={x} position={[x, 0.5, 0.5]}>
          <boxGeometry args={[0.42, 0.62, 0.42]} />
          <meshStandardMaterial color="#a9a184" flatShading roughness={1} />
        </mesh>
      ))}
      <mesh position={[0.72, 1.6, -0.72]}>
        <cylinderGeometry args={[0.26, 0.26, 0.8, 10]} />
        <meshStandardMaterial color="#e8442f" flatShading roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[0.5, 0.34, 0.5]} />
        <meshStandardMaterial color="#3a3f4a" flatShading roughness={0.7} />
      </mesh>

      {/* Him, over at the rail so the burner is not coming out of his head.
          His legs are inside the basket, which is a solid box, so only his
          top half clears the rim — exactly what standing in one looks like. */}
      <group position={[-0.62, 0, 0.28]} scale={0.9 / RIG}>
        <Character colors={PLAYER_COLORS} motion={rider} prop="cap" />
      </group>
    </group>
  )
}

/* --------------------------------- parcels -------------------------------- */

const PARCEL_POOL = 14

/**
 * Everything in the air. Two pools rather than one, because a water bomb and
 * a paper parcel of confetti are not the same shape and never swap.
 */
function Parcels() {
  const water = useRef<(Mesh | null)[]>([])
  const paper = useRef<(Group | null)[]>([])

  useFrame(() => {
    let w = 0
    let c = 0
    for (const p of BALLOON.parcels) {
      if (p.kind === 'water') {
        const mesh = water.current[w]
        if (mesh) {
          mesh.visible = true
          mesh.position.set(p.x, p.y, p.z)
          // Squashed along the fall, the faster the longer.
          const stretch = 1 + Math.min(0.7, Math.abs(p.vy) * 0.018)
          mesh.scale.set(1 / stretch, stretch, 1 / stretch)
        }
        w++
      } else {
        const group = paper.current[c]
        if (group) {
          group.visible = true
          group.position.set(p.x, p.y, p.z)
          group.rotation.set(p.spin * 0.7, p.spin, p.spin * 0.4)
        }
        c++
      }
    }
    for (let i = w; i < PARCEL_POOL; i++) {
      const mesh = water.current[i]
      if (mesh) mesh.visible = false
    }
    for (let i = c; i < PARCEL_POOL; i++) {
      const group = paper.current[i]
      if (group) group.visible = false
    }
  })

  return (
    <group>
      {Array.from({ length: PARCEL_POOL }, (_, i) => (
        <mesh
          key={`w${i}`}
          ref={(el) => {
            water.current[i] = el
          }}
          visible={false}
        >
          <sphereGeometry args={[0.42, 10, 8]} />
          <meshStandardMaterial
            color={WATER}
            flatShading
            roughness={0.15}
            metalness={0.1}
            emissive={WATER}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      {Array.from({ length: PARCEL_POOL }, (_, i) => (
        <group
          key={`c${i}`}
          ref={(el) => {
            paper.current[i] = el
          }}
          visible={false}
        >
          <mesh>
            <boxGeometry args={[0.62, 0.62, 0.62]} />
            <meshStandardMaterial
              color={CONFETTI}
              flatShading
              roughness={0.6}
            />
          </mesh>
          {/* A ribbon round it, so a tumbling parcel reads as one. */}
          <mesh>
            <boxGeometry args={[0.68, 0.16, 0.68]} />
            <meshStandardMaterial color="#f5c33b" flatShading roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* --------------------------------- bursts --------------------------------- */

const BURST_POOL = 12
const FLECKS_PER_BURST = 7

/**
 * What a parcel leaves on the grass: a ring thrown out to the reach it had,
 * and a handful of pieces flung with it. One pool serves both — the flecks
 * are only ever recoloured, never rebuilt.
 */
function Bursts() {
  const rings = useRef<(Mesh | null)[]>([])
  const bits = useRef<(Mesh | null)[][]>([])

  useFrame(() => {
    for (let i = 0; i < BURST_POOL; i++) {
      const ring = rings.current[i]
      const row = bits.current[i]
      const b = BALLOON.bursts[i]
      const shown = Boolean(b)

      if (ring) ring.visible = shown
      if (row) for (const m of row) if (m) m.visible = shown
      if (!b) continue

      // 0 at the moment of impact, 1 once it has faded out.
      const t = 1 - b.life / 1.5

      if (ring) {
        ring.position.set(b.x, b.y, b.z)
        ring.scale.setScalar(b.radius * (0.25 + t * 0.9))
        const mat = ring.material as MeshBasicMaterial
        mat.color.set(b.good ? '#ffffff' : PAYLOAD_COLOR[b.kind])
        mat.opacity = (1 - t) * 0.75
      }

      if (!row) continue
      for (let f = 0; f < FLECKS_PER_BURST; f++) {
        const mesh = row[f]
        if (!mesh) continue
        const angle = (f / FLECKS_PER_BURST) * Math.PI * 2 + b.x
        const out = b.radius * t * 0.85
        // Thrown up and out, then falling back to the grass.
        mesh.position.set(
          b.x + Math.sin(angle) * out,
          b.y + Math.sin(t * Math.PI) * (b.kind === 'water' ? 2.4 : 3.6),
          b.z + Math.cos(angle) * out,
        )
        mesh.rotation.set(t * 7 + f, t * 5, t * 4)
        mesh.scale.setScalar(1 - t * 0.4)
        const mat = mesh.material as MeshBasicMaterial
        mat.color.set(b.kind === 'water' ? WATER : FLECKS[f % FLECKS.length])
        mat.opacity = 1 - t
      }
    }
  })

  return (
    <group>
      {Array.from({ length: BURST_POOL }, (_, i) => (
        <group key={i}>
          <mesh
            ref={(el) => {
              rings.current[i] = el
            }}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={false}
          >
            <ringGeometry args={[0.74, 1, 24]} />
            <meshBasicMaterial
              color={WATER}
              transparent
              opacity={0.7}
              depthWrite={false}
            />
          </mesh>

          {Array.from({ length: FLECKS_PER_BURST }, (_, f) => (
            <mesh
              key={f}
              ref={(el) => {
                if (!bits.current[i]) bits.current[i] = []
                bits.current[i][f] = el
              }}
              visible={false}
            >
              <boxGeometry args={[0.4, 0.4, 0.12]} />
              <meshBasicMaterial color={WATER} transparent opacity={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/* -------------------------------- the flight ------------------------------ */

/**
 * Everything about the camera scales with how high he is, because what has to
 * fit in the frame — the envelope over his head and the grass a long way
 * under it — grows with the altitude. It sits well back and looks at a point
 * out in front, level with the middle of that span, which puts the balloon
 * near the top of the picture and the two aiming rings near the middle.
 */
const CAM = { back: 20, backPerAlt: 0.55, up: 12, upPerAlt: 0.35, ahead: 10 }

/**
 * Flies the balloon: reads the controls, steps the flight, and owns the
 * camera for as long as you are up there. Mounted in place of <Player/>, the
 * same way the bike is, so nothing else is ever driving the view.
 */
export function BalloonGame() {
  const camera = useThree((s) => s.camera)
  const body = useRef<Group>(null)
  const flame = useRef<Group>(null)
  const shadow = useRef<Mesh>(null)
  const pointer = useRef<Group>(null)
  const waterRing = useRef<Group>(null)
  const confettiRing = useRef<Group>(null)
  const rider = useRef<CharacterMotion>({ moving: false, speed: 0 })
  const camYaw = useRef(BALLOON.heading)
  const camReady = useRef(false)

  useEffect(() => {
    if (body.current) body.current.rotation.order = 'YXZ'
    camReady.current = false
  }, [])

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const store = useGame.getState()
    const flight = store.balloon
    const live =
      flight?.status === 'flying' && BALLOON.active && isInteractive(store.mode)

    const move = live ? readMove() : { x: 0, y: 0, run: false }

    if (live) {
      const events = stepBalloon(delta, {
        throttle: move.y,
        steer: move.x,
        burn: move.run,
        vent: isCrouching(),
        water: consumeDrop('water'),
        confetti: consumeDrop('confetti'),
      })

      for (const kind of events.bursts) {
        if (kind === 'water') sfx.splash()
        else sfx.fizz()
      }
      for (let i = 0; i < events.served.length; i++) sfx.coin()
      for (let i = 0; i < events.wrong; i++) sfx.dry()
      if (events.empty) sfx.dry()
      if (events.finished) store.finishBalloon()
    }

    const ground = groundHeight(BALLOON.x, BALLOON.z)
    const alt = BALLOON.y - ground

    if (body.current) {
      body.current.position.set(BALLOON.x, BALLOON.y, BALLOON.z)
      body.current.rotation.y = BALLOON.heading
      // The basket swings behind the drift, the way one on ropes would.
      body.current.rotation.x = -BALLOON.vz * 0.012
      body.current.rotation.z = BALLOON.vx * 0.012
    }

    if (flame.current) {
      const size = 0.25 + BALLOON.burn * 0.95
      flame.current.scale.set(1, size, 1)
      flame.current.visible = BALLOON.burn > 0.04
    }

    // A shadow on the grass: the higher he goes the wider and fainter it is.
    if (shadow.current) {
      shadow.current.position.set(BALLOON.x, ground + 0.05, BALLOON.z)
      shadow.current.scale.setScalar(2.8 + alt * 0.05)
      const mat = shadow.current.material as MeshBasicMaterial
      mat.opacity = Math.max(0.06, 0.26 - alt * 0.0022)
    }

    // Two rings on the ground: where a bomb would land, and where confetti
    // would. Confetti floats, so it always sits further downwind.
    for (const [ref, kind] of [
      [waterRing, 'water'],
      [confettiRing, 'confetti'],
    ] as [React.RefObject<Group | null>, Payload][]) {
      const ring = ref.current
      if (!ring) continue
      ring.visible = live
      if (!live) continue
      const aim = aimPoint(kind)
      ring.position.set(aim.x, aim.y + 0.09, aim.z)
      ring.rotation.y =
        state.clock.elapsedTime * (kind === 'water' ? 0.6 : -0.6)
    }

    // And an arrow over the crown, pointing at whichever gathering is nearest.
    if (pointer.current) {
      const target = live ? nearestCall() : null
      pointer.current.visible = Boolean(target && target.distance > 12)
      if (target) {
        pointer.current.position.set(
          BALLOON.x,
          BALLOON.y + 12 + Math.sin(state.clock.elapsedTime * 3) * 0.3,
          BALLOON.z,
        )
        pointer.current.rotation.y = Math.atan2(
          target.call.x - BALLOON.x,
          target.call.z - BALLOON.z,
        )
      }
    }

    rider.current.moving = false
    rider.current.speed = 0

    PLAYER_POS.set(BALLOON.x, BALLOON.y, BALLOON.z)
    PLAYER_VIEW.facing = BALLOON.heading

    /* ------------------------------ camera ----------------------------- */

    let swing = BALLOON.heading - camYaw.current
    while (swing > Math.PI) swing -= Math.PI * 2
    while (swing < -Math.PI) swing += Math.PI * 2
    camYaw.current += swing * Math.min(1, delta * 2.6)

    const back = CAM.back + alt * CAM.backPerAlt
    const up = CAM.up + alt * CAM.upPerAlt
    const ahead = CAM.ahead + alt * 0.35
    const targetX = BALLOON.x - Math.sin(camYaw.current) * back
    const targetY = BALLOON.y + up
    const targetZ = BALLOON.z - Math.cos(camYaw.current) * back

    if (!camReady.current) {
      camera.position.set(targetX, targetY, targetZ)
      camReady.current = true
    }
    const ease = 1 - Math.pow(0.0025, delta)
    camera.position.x += (targetX - camera.position.x) * ease
    camera.position.y += (targetY - camera.position.y) * ease
    camera.position.z += (targetZ - camera.position.z) * ease

    // Out in front and halfway down: high enough that the crown clears the
    // top of the frame, low enough that the rings never fall off the bottom.
    camera.lookAt(
      BALLOON.x + Math.sin(camYaw.current) * ahead,
      ground + alt * 0.35,
      BALLOON.z + Math.cos(camYaw.current) * ahead,
    )
  })

  return (
    <group>
      <Calls />
      <Crowds />
      <Parcels />
      <Bursts />

      <group ref={body}>
        <group scale={RIG}>
          <Envelope flame={flame} />
          <Basket rider={rider} />
        </group>
      </group>

      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 20]} />
        <meshBasicMaterial color="#2a4a22" transparent opacity={0.24} />
      </mesh>

      {/* The two aiming rings. Dashed-looking rather than solid, so they read
          as a sight and not as another gathering. */}
      <group ref={waterRing} visible={false}>
        <AimRing color={WATER} radius={BURST_RADIUS.water} />
      </group>
      <group ref={confettiRing} visible={false}>
        <AimRing color={CONFETTI} radius={BURST_RADIUS.confetti} />
      </group>

      <group ref={pointer} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.9, 2.4, 4]} />
          <meshBasicMaterial color="#ffd166" />
        </mesh>
      </group>
    </group>
  )
}

/** One sight on the grass: a rim, four ticks and a pip in the middle. */
function AimRing({ color, radius }: { color: string; radius: number }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.34, radius, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[
              Math.sin(angle) * (radius - 1.5),
              0,
              Math.cos(angle) * (radius - 1.5),
            ]}
            rotation={[-Math.PI / 2, 0, -angle]}
          >
            <planeGeometry args={[0.24, 1.3]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
        )
      })}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
