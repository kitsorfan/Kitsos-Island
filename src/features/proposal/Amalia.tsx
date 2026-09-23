import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import type { Group, Mesh, MeshBasicMaterial, Object3D, SpotLight } from 'three'
import { AMALIA } from '../party/partyData'
import {
  PARTY,
  entranceHeight,
  partnerSpot,
  partyBeat,
  stepEntrance,
} from '../party/partyLogic'
import { ACTOR_POS } from '../npc/actors'
import { groundHeight } from '../island/terrainLogic'
import { Character, type CharacterMotion } from '../player/Character'
import { PLAYER_POS } from '../player/playerLogic'
import { TextPlane } from '../../shared/engine/TextSign'

const PINK = '#ff3d81'
/** How many hearts are in the air over her at any time. */
const HEARTS = 5
/** Petals falling around her on the way down. */
const PETALS = 14

/** A heart: two lobes and a point, small enough to read at a distance. */
export function Heart({ color = PINK }: { color?: string }) {
  return (
    <group>
      {[-0.085, 0.085].map((x) => (
        <mesh key={x} position={[x, 0.07, 0]}>
          <sphereGeometry args={[0.105, 10, 8]} />
          <meshBasicMaterial color={color} transparent opacity={1} />
        </mesh>
      ))}
      <mesh position={[0, -0.09, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.15, 0.28, 10]} />
        <meshBasicMaterial color={color} transparent opacity={1} />
      </mesh>
    </group>
  )
}

/**
 * Amalia. She is not on the island until he walks into the middle of the
 * floor; then she comes down out of the sky, and dances with him.
 *
 * Her place in the party is structural rather than decorative: every dancer's
 * spot faces the middle of the floor, and that is where she lands. Once she
 * is down she takes station on him instead, an arm's length away and turning,
 * so the pair of them are dancing together and the ring is dancing round
 * them. The light and the hearts only say out loud what the geometry is
 * already doing.
 */
export function Amalia() {
  const root = useRef<Group>(null)
  const motion = useRef<CharacterMotion>({ moving: false, speed: 0, dance: 0 })
  const hearts = useRef<(Group | null)[]>([])
  const petals = useRef<(Mesh | null)[]>([])
  const crown = useRef<Group>(null)
  const beam = useRef<Mesh>(null)
  const spot = useRef<SpotLight>(null)
  const aim = useRef<Object3D>(null)
  /** Eased position, so she settles onto her station rather than snapping. */
  const at = useRef({ x: AMALIA.position[0], z: AMALIA.position[1] })

  // A spot light points at an object, and its default is the world origin.
  // Hers is aimed at her own feet, so she keeps her light as she moves.
  useEffect(() => {
    if (spot.current && aim.current) spot.current.target = aim.current
  }, [])

  // She dances around, so her prompt has to follow her rather than sit where
  // she landed.
  useEffect(
    () => () => {
      ACTOR_POS.delete(AMALIA.id)
    },
    [],
  )

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const t = state.clock.elapsedTime
    const beat = partyBeat()
    const hit = Math.abs(Math.sin(beat * Math.PI))

    stepEntrance(delta)
    const landed = PARTY.entrance >= 1
    const lift = entranceHeight()

    /* ------------------------------ where ------------------------------ */

    // Coming down she holds the middle; once she is down she dances with him.
    const target = landed
      ? partnerSpot(PLAYER_POS.x, PLAYER_POS.z, t)
      : { x: AMALIA.position[0], z: AMALIA.position[1] }
    const ease = Math.min(1, delta * (landed ? 2.6 : 6))
    at.current.x += (target.x - at.current.x) * ease
    at.current.z += (target.z - at.current.z) * ease

    ACTOR_POS.set(AMALIA.id, { x: at.current.x, z: at.current.z })

    const ground = groundHeight(at.current.x, at.current.z)
    if (root.current) {
      root.current.position.set(at.current.x, ground + lift, at.current.z)
      // Turning slowly on the way down, then facing him once she is here.
      const facing = landed
        ? Math.atan2(PLAYER_POS.x - at.current.x, PLAYER_POS.z - at.current.z)
        : t * 0.8
      let turn = facing - root.current.rotation.y
      while (turn > Math.PI) turn -= Math.PI * 2
      while (turn < -Math.PI) turn += Math.PI * 2
      root.current.rotation.y += turn * Math.min(1, delta * (landed ? 3 : 6))
    }

    // She dances once her feet are down, not on the way.
    motion.current.dance = landed ? 1 : 0
    motion.current.moving = false

    /* ------------------------------ effects ---------------------------- */

    // The shaft of light she comes down in, gone once she is here.
    if (beam.current) {
      const material = beam.current.material as MeshBasicMaterial
      material.opacity = (1 - PARTY.entrance) * 0.3
      beam.current.visible = !landed
    }

    // Petals, falling past her all the way down and then settling.
    petals.current.forEach((petal, i) => {
      if (!petal) return
      const phase = (((t * 0.4 + i / PETALS) % 1) + 1) % 1
      const spread = 1.1 + (i % 4) * 0.45
      const angle = (i / PETALS) * Math.PI * 2 + t * 0.5
      petal.position.set(
        Math.sin(angle) * spread,
        3.4 - phase * 5,
        Math.cos(angle) * spread,
      )
      petal.rotation.set(t * 2 + i, angle, t * 1.4)
      const material = petal.material as MeshBasicMaterial
      material.opacity = (1 - phase) * (landed ? 0.35 : 0.9)
    })

    // The big heart over her head keeps time, once there is a head to keep it
    // over rather than a shape in the sky.
    if (crown.current) {
      crown.current.visible = landed
      crown.current.position.y = 2.95 + Math.sin(t * 1.6) * 0.08
      crown.current.rotation.y = t * 0.7
      crown.current.scale.setScalar(0.9 + hit * 0.22)
    }

    hearts.current.forEach((heart, i) => {
      if (!heart) return
      heart.visible = landed
      const phase = (((t * 0.28 + i / HEARTS) % 1) + 1) % 1
      heart.position.set(
        Math.sin(t * 0.8 + i * 2.1) * 0.75,
        2.5 + phase * 2.3,
        Math.cos(t * 0.7 + i * 1.7) * 0.75,
      )
      const fade = 1 - phase
      heart.scale.setScalar(0.28 + fade * 0.42)
      heart.traverse((part) => {
        const material = (part as Mesh).material as
          MeshBasicMaterial | MeshBasicMaterial[] | undefined
        if (!material || Array.isArray(material)) return
        material.opacity = fade * 0.85
      })
    })
  })

  return (
    <group ref={root}>
      <Character
        colors={AMALIA.colors}
        motion={motion}
        hair="long"
        dress={AMALIA.dress}
        dressTrim={AMALIA.trim}
        smile
        prop="flowers"
        danceStyle={3}
        scale={1.02}
      />

      {/* Her own light, straight down, so she is lit whatever the rig is
          doing. The floor lights all turn around her anyway. */}
      <spotLight
        ref={spot}
        position={[0, 11, 0.2]}
        angle={0.34}
        penumbra={0.75}
        intensity={320}
        distance={26}
        decay={1.2}
        color="#fff1de"
      />
      <object3D ref={aim} position={[0, 0, 0]} />

      {/* The shaft she comes down in */}
      <mesh ref={beam} position={[0, 9, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[2.1, 18, 18, 1, true]} />
        <meshBasicMaterial
          color="#fff6e2"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Petals, on the way down */}
      {Array.from({ length: PETALS }, (_, i) => (
        <mesh
          key={`petal-${i}`}
          ref={(el) => {
            petals.current[i] = el
          }}
        >
          <boxGeometry args={[0.16, 0.02, 0.1]} />
          <meshBasicMaterial
            color={['#ffd7e6', '#fff4d0', '#ffb3c8'][i % 3]}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* One heart keeping time over her, and a few more going up */}
      <group ref={crown} position={[0, 2.95, 0]}>
        <Heart />
      </group>
      {Array.from({ length: HEARTS }, (_, i) => (
        <group
          key={`heart-${i}`}
          ref={(el) => {
            hearts.current[i] = el
          }}
        >
          <Heart color={i % 2 === 0 ? PINK : '#ff8fb3'} />
        </group>
      ))}

      {/* Her name, turned to whoever is looking */}
      <Billboard position={[0, 3.55, 0]}>
        <TextPlane
          text={AMALIA.name}
          width={1.9}
          aspect={5}
          color="#ffe9f2"
          outline="#7a1338"
        />
      </Billboard>
    </group>
  )
}
