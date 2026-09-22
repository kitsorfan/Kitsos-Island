import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  ConeGeometry,
  CylinderGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  type Group,
  type Mesh,
  type PointLight,
} from 'three'
import { AMALIA } from '../party/partyData'
import { ACTOR_POS } from '../npc/actors'
import {
  CANDLES,
  PROPOSE,
  candleLit,
  candleSpot,
  herFacing,
  step,
  together,
} from './propose'
import { deepEnough, swimLine } from '../rescue/swimLogic'
import { groundHeight } from '../island/terrainLogic'
import { useGame } from '../../shared/state/store'
import { Character, type CharacterMotion } from '../player/Character'
import { Heart } from './Amalia'
import { PLAYER_POS, PLAYER_VIEW } from '../player/playerLogic'
import { SwimWake } from '../rescue/Swim'
import type { Swimmer } from '../rescue/swimLogic'

/** How many hearts go up once she has said it. */
const HEARTS = 7

/** Candle wax, and the flame over it. */
const WAX = 0.26
const FLAME_AT = WAX + 0.055

/**
 * The beach proposal: the candles, and her.
 *
 * The scene is a small state machine and this is the thing that turns it:
 * she walks up out of the dark, and when she arrives he goes down on one
 * knee; from there each phase waits for him to be out of the dialogue box
 * before it moves on, so the pace of it is his.
 *
 * Only mounted while there is a proposal on, and everything it needs to
 * rebuild itself — where the candles are, how far up the beach she has come
 * — lives in the module rather than in here, so walking into a building and
 * back out again finds the candles still burning.
 */
export function Proposal() {
  const her = useRef<Group>(null)
  const hearts = useRef<(Group | null)[]>([])
  const flames = useRef<(Mesh | null)[]>([])
  const glow = useRef<PointLight>(null)
  const lamp = useRef<PointLight>(null)
  const motion = useRef<CharacterMotion>({ moving: false, speed: 0 })
  /** Her last position, for a stride that matches the ground she covers. */
  const was = useRef({ x: PROPOSE.her.x, z: PROPOSE.her.z })
  /**
   * Where her feet ride, eased. Walking, it is the ground; out of her depth
   * it is the sea, and the ease is her going in off the end of the planks
   * rather than dropping two metres in a frame.
   */
  const foot = useRef<number | null>(null)
  /** And what the water makes of her, for the foam that hides the seam. */
  const wet = useRef<Swimmer>({ x: 0, z: 0, facing: 0, afloat: false })
  const readHer = useCallback(() => wet.current, [])

  const phase = useGame((s) => s.proposal)
  /** The ring is hers from the moment she says yes. */
  const wearing = phase === 'yes' || phase === 'done'

  /** Where every candle stands. They are laid once and never move. */
  const spots = useMemo(
    () =>
      Array.from({ length: CANDLES }, (_, i) => {
        const { x, z } = candleSpot(i)
        return { x, y: groundHeight(x, z), z }
      }),
    // Laid when the scene begins, which is also when this first mounts.
    [],
  )

  /** One of each, shared by every candle. */
  const parts = useMemo(
    () => ({
      wax: new CylinderGeometry(0.048, 0.058, WAX, 7),
      flame: new ConeGeometry(0.036, 0.12, 6),
      halo: new SphereGeometry(0.1, 8, 6),
      cream: new MeshStandardMaterial({
        color: '#f6eddc',
        roughness: 0.85,
        flatShading: true,
      }),
      fire: new MeshBasicMaterial({ color: '#ffd08a' }),
      soft: new MeshBasicMaterial({
        color: '#ff9d3d',
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    }),
    [],
  )
  useEffect(
    () => () => {
      Object.values(parts).forEach((part) => part.dispose())
    },
    [parts],
  )

  // She has a prompt on her like anyone else, and it has to follow her.
  useEffect(
    () => () => {
      ACTOR_POS.delete(AMALIA.id)
    },
    [],
  )

  useFrame((frame, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    const t = frame.clock.elapsedTime
    if (!PROPOSE.active) return

    const arrived = step(delta, PLAYER_POS.x, PLAYER_POS.z, PLAYER_VIEW.facing)

    /* ------------------------------ the scene ------------------------- */

    // One turn per frame at most, and each reads the state fresh: asking
    // her sets the phase and opens the box in the same breath.
    const state = useGame.getState()
    if (state.proposal === 'arriving' && arrived) {
      state.askAmalia()
    } else if (state.proposal === 'asking' && state.mode === 'explore') {
      state.answerAmalia()
    } else if (state.proposal === 'yes' && state.mode === 'explore') {
      state.finishProposal()
    }

    /* -------------------------------- her ----------------------------- */

    const wentX = PROPOSE.her.x - was.current.x
    const wentZ = PROPOSE.her.z - was.current.z
    const pace = Math.hypot(wentX, wentZ) / delta
    was.current.x = PROPOSE.her.x
    was.current.z = PROPOSE.her.z

    // In the candles it is still an occasion and she dances it. Walked out
    // of them she is simply going somewhere with him: no dance, and no
    // turning on the spot to keep her eyes on him.
    const beside = together()

    motion.current.moving = pace > 0.15
    motion.current.speed = pace
    motion.current.dance = state.proposal === 'done' && !beside ? 1 : 0

    ACTOR_POS.set(AMALIA.id, { x: PROPOSE.her.x, z: PROPOSE.her.z })

    // In the water she swims it, the same as he does: he is not going to
    // strike out for the horizon and leave her walking along the bottom.
    const afloat = deepEnough(PROPOSE.her.x, PROPOSE.her.z)
    motion.current.swimming = afloat ? 1 : 0
    const stands = afloat
      ? swimLine(PROPOSE.her.x, PROPOSE.her.z, t)
      : groundHeight(PROPOSE.her.x, PROPOSE.her.z)
    foot.current =
      foot.current === null
        ? stands
        : foot.current + (stands - foot.current) * Math.min(1, delta * 8)
    const ground = foot.current

    if (her.current) {
      her.current.position.set(PROPOSE.her.x, ground, PROPOSE.her.z)
      // Beside him she looks where she is going, and where he is looking
      // once she has caught up. Before that she looks at him.
      const look = beside
        ? pace > 0.6
          ? Math.atan2(wentX, wentZ)
          : PLAYER_VIEW.facing
        : herFacing(PLAYER_POS.x, PLAYER_POS.z)
      let turn = look - her.current.rotation.y
      while (turn > Math.PI) turn -= Math.PI * 2
      while (turn < -Math.PI) turn += Math.PI * 2
      her.current.rotation.y += turn * Math.min(1, delta * 4)

      wet.current.x = PROPOSE.her.x
      wet.current.z = PROPOSE.her.z
      wet.current.facing = her.current.rotation.y
      wet.current.afloat = afloat
    }

    // Enough light on her to see her by, and it walks in with her.
    if (lamp.current) {
      lamp.current.intensity = 9 + Math.sin(t * 2.3) * 0.5
    }

    /* ------------------------------ the flames ------------------------ */

    flames.current.forEach((flame, i) => {
      if (!flame) return
      const caught = candleLit(i)
      flame.visible = caught > 0.02
      // Every flame on its own clock, or two dozen of them breathe as one.
      const flicker =
        0.86 + Math.sin(t * 9 + i * 2.1) * 0.1 + Math.sin(t * 23 + i) * 0.04
      flame.scale.set(caught * flicker, caught * flicker, caught * flicker)
    })

    if (glow.current) {
      glow.current.intensity = PROPOSE.lit * (26 + Math.sin(t * 6) * 1.6)
    }

    /* ------------------------------- hearts --------------------------- */

    const loved = state.proposal === 'yes' || state.proposal === 'done'
    hearts.current.forEach((heart, i) => {
      if (!heart) return
      heart.visible = loved
      if (!loved) return
      const climb = (((t * 0.3 + i / HEARTS) % 1) + 1) % 1
      const swing = t * 0.7 + i * 1.9
      heart.position.set(
        (PROPOSE.her.x + PLAYER_POS.x) / 2 + Math.sin(swing) * 0.9,
        ground + 1.6 + climb * 2.4,
        (PROPOSE.her.z + PLAYER_POS.z) / 2 + Math.cos(swing * 0.8) * 0.9,
      )
      const fade = 1 - climb
      heart.scale.setScalar(0.25 + fade * 0.4)
      heart.rotation.y = swing
      heart.traverse((part) => {
        const material = (part as Mesh).material as
          MeshBasicMaterial | MeshBasicMaterial[] | undefined
        if (!material || Array.isArray(material)) return
        material.transparent = true
        material.opacity = fade * 0.85
      })
    })
  })

  return (
    <group>
      {/* The candles, in a heart with the two of them inside it */}
      {spots.map((spot, i) => (
        <group key={i} position={[spot.x, spot.y, spot.z]}>
          <mesh
            geometry={parts.wax}
            material={parts.cream}
            position={[0, WAX / 2, 0]}
            castShadow
          />
          <mesh
            ref={(el) => {
              flames.current[i] = el
            }}
            geometry={parts.flame}
            material={parts.fire}
            position={[0, FLAME_AT, 0]}
            visible={false}
          >
            {/* The haze round it, hung off the flame so it lights, gutters
                and goes out with it rather than on its own. */}
            <mesh geometry={parts.halo} material={parts.soft} />
          </mesh>
        </group>
      ))}

      {/* One light for the whole heart of them, rather than two dozen */}
      <pointLight
        ref={glow}
        position={[
          PROPOSE.x,
          groundHeight(PROPOSE.x, PROPOSE.z) + 0.8,
          PROPOSE.z,
        ]}
        intensity={0}
        distance={18}
        decay={1.5}
        color="#ffb46b"
      />

      {/* Her, walking up the beach and then not going anywhere */}
      <group ref={her}>
        <Character
          colors={AMALIA.colors}
          motion={motion}
          hair="long"
          dress={AMALIA.dress}
          dressTrim={AMALIA.trim}
          smile
          danceStyle={3}
          scale={1.02}
          ring={wearing}
        />
        <pointLight
          ref={lamp}
          position={[0, 1.7, 0.35]}
          intensity={9}
          distance={7}
          decay={1.4}
          color="#ffd9a8"
        />
      </group>

      {/* Her own mark on the water, if he has taken her into it */}
      <SwimWake read={readHer} />

      {/* And what goes up when she says it */}
      {Array.from({ length: HEARTS }, (_, i) => (
        <group
          key={`heart-${i}`}
          ref={(el) => {
            hearts.current[i] = el
          }}
          visible={false}
        >
          <Heart color={i % 2 === 0 ? '#ff3d81' : '#ff8fb3'} />
        </group>
      ))}
    </group>
  )
}
