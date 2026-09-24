import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, type Group } from 'three'
import { useGame } from '../../shared/state/store'
import { useT } from '../../shared/i18n/useT'
import { TextPlane } from '../../shared/engine/TextSign'
import { Character, type CharacterMotion } from '../player/Character'
import { ACTOR_POS } from '../npc/actors'
import {
  DUTY_BELL,
  FATIGUES,
  INSPECTION_REPORT,
  OFFICER_UNIFORM,
  PRIVATES,
  REPORT_AT,
  UNIFORM_LOCKER,
  marchAt,
} from './army'

/**
 * The barracks' own pieces: his kit hanging on the locker, the duty bell on
 * the wall, and the evening inspection the bell calls in.
 *
 * Drawn here rather than as props because each of them answers to the store
 * — the kit is gone from the hook while he is wearing it, the bell swings
 * when it is rung, and the privates exist only between the bell and his
 * walking out of the room.
 */
export function Barracks() {
  return (
    <>
      <KitOnLocker />
      <DutyBell />
      <Inspection />
    </>
  )
}

/**
 * The officer's uniform on a hanger over the front of his locker, beret on
 * the hook above it. Empty hook while it is on him.
 */
function KitOnLocker() {
  const t = useT()
  const wearing = useGame((s) => s.outfit === 'officer')
  return (
    <group position={[UNIFORM_LOCKER[0], 0, UNIFORM_LOCKER[1] + 0.44]}>
      {/* The hook, which stays whether or not anything is on it. */}
      <mesh position={[0, 2.02, 0.03]}>
        <boxGeometry args={[0.08, 0.14, 0.06]} />
        <meshStandardMaterial color="#b7b0a0" metalness={0.5} roughness={0.4} />
      </mesh>
      {!wearing && (
        <group>
          {/* Hanger bar. */}
          <mesh position={[0, 1.88, 0.06]}>
            <boxGeometry args={[0.72, 0.04, 0.03]} />
            <meshStandardMaterial color="#6b4a2f" roughness={0.8} />
          </mesh>
          {/* The jacket, with the pattern on it. */}
          <mesh position={[0, 1.5, 0.07]} castShadow>
            <boxGeometry args={[0.66, 0.72, 0.06]} />
            <meshStandardMaterial
              color={OFFICER_UNIFORM.shirt}
              flatShading
              roughness={0.9}
            />
          </mesh>
          {(
            [
              [-0.17, 1.66, 0.2, 0.12, '#3f4a2a'],
              [0.14, 1.58, 0.22, 0.1, '#8a7a4f'],
              [-0.06, 1.4, 0.18, 0.12, '#4a3c2a'],
              [0.18, 1.28, 0.16, 0.1, '#3f4a2a'],
              [-0.2, 1.24, 0.14, 0.09, '#8a7a4f'],
            ] as const
          ).map(([x, y, w, h, color], i) => (
            <mesh key={i} position={[x, y, 0.101 + i * 0.0004]}>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
          ))}
          {/* Trousers folded over the bar of the hanger, hanging below. */}
          <mesh position={[0, 0.98, 0.06]} castShadow>
            <boxGeometry args={[0.5, 0.34, 0.05]} />
            <meshStandardMaterial
              color={OFFICER_UNIFORM.pants}
              flatShading
              roughness={0.9}
            />
          </mesh>
          {/* And the beret, on the hook. */}
          <mesh position={[0.02, 2.12, 0.1]} rotation={[Math.PI / 2, 0, 0.2]}>
            <cylinderGeometry args={[0.2, 0.17, 0.08, 12]} />
            <meshStandardMaterial
              color="#2f4a26"
              flatShading
              roughness={0.95}
            />
          </mesh>
        </group>
      )}
      <TextPlane
        text={t(wearing ? 'ON PARADE' : 'OFFICER KIT')}
        width={2}
        aspect={5}
        color={wearing ? '#b6f0c6' : '#ffe9c4'}
        outline="rgba(0,0,0,0.6)"
        position={[0, 2.55, 0.1]}
      />
    </group>
  )
}

/** Seconds a stroke of the bell keeps it swinging. */
const SWING_FOR = 1.8

/** The duty bell: brass, on an iron bracket, with its rope. */
function DutyBell() {
  const swing = useRef<Group>(null)
  const rung = useGame((s) => s.inspection)
  useFrame(() => {
    if (!swing.current) return
    /* Never rung: hang still. Infinity here would make sin() NaN, and a NaN
       rotation takes the whole bell out of the picture. */
    if (rung === null) {
      swing.current.rotation.x = 0
      return
    }
    const since = performance.now() / 1000 - rung
    const left = Math.max(0, 1 - since / SWING_FOR)
    swing.current.rotation.x = Math.sin(since * 14) * 0.45 * left
  })
  return (
    <group position={[DUTY_BELL[0], 0, DUTY_BELL[1]]}>
      {/* The bracket off the wall. */}
      <mesh position={[0, 2.6, 0.02]}>
        <boxGeometry args={[0.3, 0.3, 0.06]} />
        <meshStandardMaterial color="#2e2a26" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.62, 0.3]}>
        <boxGeometry args={[0.06, 0.06, 0.6]} />
        <meshStandardMaterial color="#2e2a26" metalness={0.4} roughness={0.6} />
      </mesh>
      <group ref={swing} position={[0, 2.6, 0.58]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.24, 0.36, 14, 1, true]} />
          <meshStandardMaterial
            color="#d8a948"
            metalness={0.75}
            roughness={0.28}
            side={DoubleSide}
          />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshStandardMaterial
            color="#d8a948"
            metalness={0.75}
            roughness={0.28}
          />
        </mesh>
        {/* The clapper, and the rope off it. */}
        <mesh position={[0, -0.42, 0]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshStandardMaterial color="#6b5a3a" metalness={0.5} />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.7, 6]} />
          <meshStandardMaterial color="#c9b48a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * The evening inspection: five privates at a march, one to each bunk, and
 * the orderly's report once the last of them is standing still.
 *
 * There for as long as `inspection` is set, which the store clears the
 * moment he leaves the room — so walking out is dismissing them.
 */
function Inspection() {
  const rung = useGame((s) => s.inspection)
  const reported = useRef<number | null>(null)
  useFrame(() => {
    if (rung === null || reported.current === rung) return
    if (performance.now() / 1000 - rung < REPORT_AT) return
    const state = useGame.getState()
    /* The orderly waits for him to finish whatever he is reading: a report
       is made to somebody who is listening. */
    if (state.mode !== 'explore') return
    reported.current = rung
    state.talk({ ...INSPECTION_REPORT })
  })
  if (rung === null) return null
  return (
    <group>
      {PRIVATES.map((p, i) => (
        <Private key={`${rung}-${i}`} index={i} rung={rung} look={p} />
      ))}
    </group>
  )
}

function Private({
  index,
  rung,
  look,
}: {
  index: number
  rung: number
  look: (typeof PRIVATES)[number]
}) {
  const group = useRef<Group>(null)
  const motion = useRef<CharacterMotion>({ moving: false, speed: 0 })
  const id = `private-${index}`

  useEffect(
    () => () => {
      ACTOR_POS.delete(id)
    },
    [id],
  )

  useFrame(() => {
    if (!group.current) return
    const step = marchAt(index, performance.now() / 1000 - rung)
    group.current.visible = step.entered
    group.current.position.set(step.x, 0, step.z)
    group.current.rotation.y = step.facing
    motion.current.moving = step.entered && !step.arrived
    motion.current.speed = motion.current.moving ? 3.4 : 0
    /* Something to walk round only once he is actually in the room. */
    if (step.entered) ACTOR_POS.set(id, { x: step.x, z: step.z })
  })

  return (
    <group ref={group} visible={false}>
      <Character
        colors={{ skin: look.skin, hair: look.hair, ...FATIGUES }}
        prop="cap"
        seed={index * 1.3}
        motion={motion}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.5, 14]} />
        <meshBasicMaterial color="#2a4a22" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}
