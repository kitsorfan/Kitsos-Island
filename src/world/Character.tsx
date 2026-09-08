import { useEffect, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'
import type { Group, Object3D, PointLight, SpotLight } from 'three'
import { partyBeat } from '../game/party'
import type { HandLight, Npc } from '../types'

export interface CharacterMotion {
  moving: boolean
  /** Units per second; drives the stride frequency. */
  speed: number
  /** Off the ground, so the legs tuck instead of striding. */
  airborne?: boolean
  /** Ducked down under incoming paint. */
  crouching?: boolean
  /** Seconds of marker kick left, set the moment a round leaves. */
  recoil?: number
  /** 0 to 1: how much of him is dancing rather than standing. */
  dance?: number
  /** 0 to 1: hands over the head, running from whatever just went off. */
  fright?: number
  /** 0 to 1: one arm straight out — stop where you are. */
  halt?: number
}

interface CharacterProps {
  colors: Npc['colors']
  prop?: Npc['prop']
  /** Live motion, read every frame so movement never re-renders React. */
  motion?: RefObject<CharacterMotion>
  /** Phase offset so a crowd does not breathe in unison. */
  seed?: number
  scale?: number
  /** Raises one arm and waves it — used by the greeting portrait. */
  wave?: boolean
  /** Where to look, in -1..1 screen space. Overrides the idle head sway. */
  look?: RefObject<{ x: number; y: number }>
  /** Holds a paintball marker in the right hand, aimed straight ahead. */
  gun?: boolean
  /** Paint colour on the marker's hopper and body. */
  gunColor?: string
  /** Paint on the chest, for someone who has been hit out. */
  paint?: string
  /** A pose that overrides the idle stance — sitting on a bike, so far. */
  pose?: 'ride'
  /** Carried in the off hand. Nothing else about him gives off any light. */
  hand?: HandLight
  /** Long hair, falling down the back, instead of the cropped default. */
  hair?: 'short' | 'long'
  /** A skirt in this colour over the legs, with a trim if one is given. */
  dress?: string
  dressTrim?: string
  /** A mouth, turned up. Nobody else on the island has one. */
  smile?: boolean
  /** Overrides the dance step the seed would have picked. */
  danceStyle?: number
  /** A dinner jacket over a white shirt, with a bow tie. */
  suit?: boolean
  /** A bunch of flowers, in whichever hand is free. */
  bouquet?: boolean
}

const IDLE: CharacterMotion = { moving: false, speed: 0, airborne: false }

/** Leg measurements, shared by the rig and the crouch that folds it. */
const HIP = 0.85
const THIGH = 0.42
const SHIN = 0.43

export function Character({
  colors,
  prop,
  motion,
  seed = 0,
  scale = 1,
  wave = false,
  look,
  gun = false,
  gunColor = '#e8442f',
  paint,
  pose,
  hand,
  hair = 'short',
  dress,
  dressTrim,
  smile = false,
  danceStyle,
  suit = false,
  bouquet = false,
}: CharacterProps) {
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const legL = useRef<Group>(null)
  const legR = useRef<Group>(null)
  const kneeL = useRef<Group>(null)
  const kneeR = useRef<Group>(null)
  const torso = useRef<Group>(null)
  const armL = useRef<Group>(null)
  const armR = useRef<Group>(null)
  const head = useRef<Group>(null)
  const phase = useRef(0)
  /** Eased gaze, so the head glides after the cursor instead of snapping. */
  const gaze = useRef({ x: 0, y: 0 })
  /** Eased crouch, 0 standing to 1 fully ducked. */
  const duck = useRef(0)
  /** Eased seat, 0 standing to 1 sitting astride a bike. */
  const seat = useRef(0)
  /** Eased dance, so joining in and stopping are not a snap. */
  const groove = useRef(0)
  /** Eased fright, likewise: nobody goes from calm to bolting in one frame. */
  const alarm = useRef(0)
  /** Eased halt, for the arm a sentry puts out. */
  const bar = useRef(0)
  /** The wrist that whatever he is carrying hangs in, and a torch's flame. */
  const gripRef = useRef<Group>(null)
  /** The other wrist, for the flowers. */
  const bouquetRef = useRef<Group>(null)
  const flame = useRef<Group>(null)
  const flameLight = useRef<PointLight>(null)

  useFrame((state, delta) => {
    const m = motion?.current ?? IDLE
    const t = state.clock.elapsedTime + seed

    if (m.moving) {
      phase.current += delta * Math.min(14, 3 + m.speed * 1.6)
    } else {
      // Ease the stride back to neutral instead of snapping.
      phase.current += delta * 2
    }

    const wanted = m.crouching ? 1 : 0
    duck.current += (wanted - duck.current) * Math.min(1, delta * 12)
    const crouch = duck.current

    seat.current += ((pose === 'ride' ? 1 : 0) - seat.current) *
      Math.min(1, delta * 10)
    const sit = seat.current

    groove.current += ((m.dance ?? 0) - groove.current) * Math.min(1, delta * 6)
    alarm.current += ((m.fright ?? 0) - alarm.current) * Math.min(1, delta * 9)
    bar.current += ((m.halt ?? 0) - bar.current) * Math.min(1, delta * 10)

    if (m.recoil !== undefined && m.recoil > 0) m.recoil -= delta
    const kick = Math.max(0, m.recoil ?? 0) * 3

    const swing = m.airborne
      ? 0
      : m.moving
        ? Math.sin(phase.current) * 0.62
        : Math.sin(t * 1.6) * 0.06

    // A crouch folds the knees, drops the hips by exactly as much as the fold
    // raised the feet, and leans the torso in over them. Nothing above the
    // waist is scaled, so the marker keeps its shape all the way down.
    // Riding folds the legs the same way a crouch does, but the hips stay
    // where they are: the bike is holding him up, not his own knees.
    const fold = crouch * 1.5 + sit * 1.3
    const bend = crouch * 2.6 + sit * 1.5
    const lean = crouch * 0.65 + sit * 0.4
    const stand = crouch * 1.5
    const standBend = crouch * 2.6
    const sink =
      HIP - (THIGH * Math.cos(stand) + SHIN * Math.cos(standBend - stand))

    const stride = Math.max(0, 1 - crouch - sit)
    if (legL.current) {
      legL.current.rotation.x = m.airborne ? -0.55 : swing * stride - fold
    }
    if (legR.current) {
      legR.current.rotation.x = m.airborne ? 0.3 : -swing * stride - fold
    }
    if (kneeL.current) kneeL.current.rotation.x = bend
    if (kneeR.current) kneeR.current.rotation.x = bend
    if (torso.current) torso.current.rotation.x = lean
    if (armL.current) {
      // A held marker is braced with the off hand, so both arms come up.
      // Held level in the world: the lean is cancelled out, so ducking does
      // not tip the barrel at the ground.
      armL.current.rotation.x = gun
        ? -1.36 - lean + kick * 0.2
        : hand === 'torch'
          ? -0.95 - lean + Math.sin(phase.current) * 0.05
          : hand === 'flashlight'
            ? -1.18 - lean + Math.sin(phase.current) * 0.05
            : -swing * 0.85 * (1 - sit) + (-1.22 - lean) * sit
      armL.current.rotation.z = gun
        ? -0.44
        : hand === 'torch'
          ? -0.36
          : hand === 'flashlight'
            ? -0.16
            : (m.airborne ? 0.9 : 0) * (1 - sit) - 0.28 * sit
    }
    if (armR.current) {
      armR.current.rotation.x = gun
        ? -1.48 - lean + kick * 0.3
        : wave
          ? 0
          : bouquet
            ? -0.88 - lean + Math.sin(phase.current) * 0.05
            : swing * 0.85 * (1 - sit) + (-1.22 - lean) * sit
      // Swings up and outward from the shoulder, not across the chest.
      armR.current.rotation.z = gun
        ? 0.12
        : wave
          ? 2.35 + Math.sin(t * 7) * 0.28
          : bouquet
            ? 0.14
            : (m.airborne ? -0.9 : 0) * (1 - sit) + 0.28 * sit
    }

    const bounce = m.moving
      ? Math.abs(Math.sin(phase.current)) * 0.07
      : Math.sin(t * 1.8) * 0.02
    const target = look?.current
    if (target) {
      const ease = Math.min(1, delta * 6)
      gaze.current.x += (target.x - gaze.current.x) * ease
      gaze.current.y += (target.y - gaze.current.y) * ease
    }

    if (body.current) {
      body.current.position.y = bounce * (1 - crouch) - sink
      body.current.rotation.z = m.moving ? Math.sin(phase.current) * 0.04 : 0
      // The shoulders follow a little, so it is not just a swivelling head.
      body.current.rotation.y = target ? gaze.current.x * 0.3 : 0
    }
    if (flame.current) {
      // Two fast waves plus a little noise: never quite the same shape twice.
      const lick =
        0.86 +
        Math.sin(t * 11) * 0.08 +
        Math.sin(t * 23.3) * 0.05 +
        Math.random() * 0.03
      flame.current.scale.set(1 + (1 - lick) * 0.5, lick, 1 + (1 - lick) * 0.5)
      flame.current.rotation.y = t * 2.4
      flame.current.position.x = Math.sin(t * 7.3) * 0.015
      if (flameLight.current) flameLight.current.intensity = 22 * lick
    }

    if (head.current) {
      head.current.rotation.y = target
        ? gaze.current.x * 0.8
        : m.moving || wave
          ? 0
          : Math.sin(t * 0.6) * 0.28
      // Looking ahead rather than at his own boots.
      head.current.rotation.x = (target ? gaze.current.y * 0.32 : 0) - lean * 0.7
      head.current.rotation.z = target
        ? gaze.current.x * -0.08
        : Math.sin(t * 1.1) * 0.03
    }

    /* --------------------------------- dance -------------------------- */

    if (groove.current > 0.01) {
      const mix = groove.current
      // One beat shared by the whole square — that is what makes it a party —
      // with the step itself picked per dancer so it is not a chorus line.
      const beat = partyBeat()
      const hop = Math.abs(Math.sin(beat * Math.PI))
      const swing = Math.sin(beat * Math.PI)
      const slow = Math.sin(beat * Math.PI * 0.5)
      const style = danceStyle ?? Math.floor(Math.abs(seed) * 1.7 + 0.3) % 3

      const blend = (current: number, wanted: number) =>
        current * (1 - mix) + wanted * mix

      if (style === 0) {
        // Hands up, bouncing on the beat.
        if (armL.current) {
          armL.current.rotation.x = blend(armL.current.rotation.x, -2.5 - hop * 0.4)
          armL.current.rotation.z = blend(armL.current.rotation.z, -0.5)
        }
        if (armR.current) {
          armR.current.rotation.x = blend(armR.current.rotation.x, -2.5 - hop * 0.4)
          armR.current.rotation.z = blend(armR.current.rotation.z, 0.5)
        }
        if (legL.current) legL.current.rotation.x = blend(legL.current.rotation.x, hop * 0.2)
        if (legR.current) legR.current.rotation.x = blend(legR.current.rotation.x, -hop * 0.2)
      } else if (style === 1) {
        // Arms out, swaying from the waist.
        if (armL.current) {
          armL.current.rotation.x = blend(armL.current.rotation.x, -0.3 + swing * 0.5)
          armL.current.rotation.z = blend(armL.current.rotation.z, -1.35)
        }
        if (armR.current) {
          armR.current.rotation.x = blend(armR.current.rotation.x, -0.3 - swing * 0.5)
          armR.current.rotation.z = blend(armR.current.rotation.z, 1.35)
        }
        if (legL.current) legL.current.rotation.x = blend(legL.current.rotation.x, swing * 0.28)
        if (legR.current) legR.current.rotation.x = blend(legR.current.rotation.x, -swing * 0.28)
      } else if (style === 3) {
        // Hers: both arms high, and turning the whole time.
        if (armL.current) {
          armL.current.rotation.x = blend(armL.current.rotation.x, -2.75 - hop * 0.3)
          armL.current.rotation.z = blend(armL.current.rotation.z, -0.42)
        }
        if (armR.current) {
          armR.current.rotation.x = blend(armR.current.rotation.x, -2.75 - hop * 0.3)
          armR.current.rotation.z = blend(armR.current.rotation.z, 0.42)
        }
        if (legL.current) legL.current.rotation.x = blend(legL.current.rotation.x, swing * 0.34)
        if (legR.current) legR.current.rotation.x = blend(legR.current.rotation.x, -swing * 0.34)
      } else {
        // Step and touch, turning a quarter at a time.
        if (armL.current) {
          armL.current.rotation.x = blend(armL.current.rotation.x, -1.5 - swing * 0.6)
          armL.current.rotation.z = blend(armL.current.rotation.z, -0.7)
        }
        if (armR.current) {
          armR.current.rotation.x = blend(armR.current.rotation.x, -1.5 + swing * 0.6)
          armR.current.rotation.z = blend(armR.current.rotation.z, 0.7)
        }
        if (legL.current) legL.current.rotation.x = blend(legL.current.rotation.x, swing * 0.55)
        if (legR.current) legR.current.rotation.x = blend(legR.current.rotation.x, -swing * 0.55)
      }

      if (body.current) {
        body.current.position.y += hop * (style === 3 ? 0.2 : 0.13) * mix
        body.current.rotation.z += slow * 0.14 * mix
        body.current.rotation.y +=
          (style === 3
            ? beat * 0.9
            : style === 2
              ? slow * 0.5
              : swing * 0.16) * mix
      }
      if (head.current) {
        head.current.rotation.x += hop * 0.16 * mix
        head.current.rotation.z += slow * 0.1 * mix
      }
    }

    /* -------------------------------- fright ---------------------------- */

    // Hands over the head and leaning into the run. The legs are already
    // going: whoever is frightened is being walked away at a fair pace.
    if (alarm.current > 0.01) {
      const mix = alarm.current
      const flap = Math.sin(phase.current * 1.7)
      const blend = (current: number, wanted: number) =>
        current * (1 - mix) + wanted * mix

      if (armL.current) {
        armL.current.rotation.x = blend(armL.current.rotation.x, -2.72 + flap * 0.32)
        armL.current.rotation.z = blend(armL.current.rotation.z, -0.55)
      }
      if (armR.current) {
        armR.current.rotation.x = blend(armR.current.rotation.x, -2.72 - flap * 0.32)
        armR.current.rotation.z = blend(armR.current.rotation.z, 0.55)
      }
      if (torso.current) {
        torso.current.rotation.x = blend(torso.current.rotation.x, 0.34)
      }
      if (body.current) body.current.rotation.z += flap * 0.06 * mix
      if (head.current) head.current.rotation.x += 0.2 * mix
    }

    /* --------------------------------- halt ----------------------------- */

    // One arm straight out at whoever is coming. Only the right one moves:
    // the other may be holding a torch, and a sentry does not put that down.
    if (bar.current > 0.01) {
      const mix = bar.current
      if (armR.current) {
        armR.current.rotation.x =
          armR.current.rotation.x * (1 - mix) + -1.62 * mix
        armR.current.rotation.z =
          armR.current.rotation.z * (1 - mix) + 0.14 * mix
      }
      if (head.current) head.current.rotation.x -= 0.08 * mix
    }

    // Wrists, last of all, so they read whatever the arms finally settled on
    // — including the dance. Cancelling the arm and the lean above it is what
    // keeps a torch upright, a beam on the road and the flowers pointing up.
    if (gripRef.current && armL.current) {
      gripRef.current.rotation.x =
        -(lean + armL.current.rotation.x) + (hand === 'flashlight' ? 0.12 : 0)
      gripRef.current.rotation.z = -armL.current.rotation.z
    }
    if (bouquetRef.current && armR.current) {
      bouquetRef.current.rotation.x = -(lean + armR.current.rotation.x)
      bouquetRef.current.rotation.z = -armR.current.rotation.z
    }
  })

  return (
    <group ref={root} scale={scale}>
      <group ref={body}>
        {/* Legs: a hip that strides, and a knee that only bends to crouch */}
        {[
          { ref: legL, knee: kneeL, x: -0.17 },
          { ref: legR, knee: kneeR, x: 0.17 },
        ].map((leg) => (
          <group key={leg.x} ref={leg.ref} position={[leg.x, HIP, 0]}>
            <mesh position={[0, -THIGH / 2, 0]} castShadow>
              <boxGeometry args={[0.22, THIGH, 0.24]} />
              <meshStandardMaterial
                color={colors.pants}
                flatShading
                roughness={0.9}
              />
            </mesh>
            <group ref={leg.knee} position={[0, -THIGH, 0]}>
              <mesh position={[0, -SHIN / 2, 0]} castShadow>
                <boxGeometry args={[0.22, SHIN, 0.24]} />
                <meshStandardMaterial
                  color={colors.pants}
                  flatShading
                  roughness={0.9}
                />
              </mesh>
            </group>
          </group>
        ))}

        {/* A skirt, over the legs and under the waist */}
        {dress && (
          <group position={[0, 0.66, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.56, 0.78, 14, 1, true]} />
              <meshStandardMaterial
                color={dress}
                flatShading
                roughness={0.75}
                side={DoubleSide}
              />
            </mesh>
            {dressTrim && (
              <mesh position={[0, -0.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.54, 0.035, 6, 18]} />
                <meshStandardMaterial color={dressTrim} roughness={0.5} />
              </mesh>
            )}
          </group>
        )}

        {/* Above the waist, on a pivot at the hip so a crouch can fold the
            torso forward without dragging the feet with it. */}
        <group ref={torso} position={[0, HIP, 0]}>
          <group position={[0, -HIP, 0]}>
            {/* Torso */}
            <mesh position={[0, 1.05, 0]} castShadow>
              <boxGeometry args={[0.62, 0.72, 0.38]} />
              <meshStandardMaterial color={colors.shirt} flatShading roughness={0.9} />
            </mesh>

            {/* A dinner jacket: white shirt, lapels, bow tie */}
            {suit && (
              <group>
                <mesh position={[0, 1.02, 0.196]}>
                  <boxGeometry args={[0.24, 0.56, 0.02]} />
                  <meshStandardMaterial color="#fbf6ec" roughness={0.7} />
                </mesh>
                {[-0.145, 0.145].map((lx) => (
                  <mesh
                    key={lx}
                    position={[lx, 1.1, 0.202]}
                    rotation={[0, 0, lx > 0 ? -0.13 : 0.13]}
                  >
                    <boxGeometry args={[0.13, 0.44, 0.03]} />
                    <meshStandardMaterial color="#25282f" flatShading roughness={0.5} />
                  </mesh>
                ))}
                <group position={[0, 1.31, 0.215]}>
                  {[-0.075, 0.075].map((bx) => (
                    <mesh key={bx} position={[bx, 0, 0]} rotation={[0, 0, bx > 0 ? -0.5 : 0.5]}>
                      <boxGeometry args={[0.11, 0.09, 0.04]} />
                      <meshStandardMaterial color="#1c1f26" flatShading roughness={0.5} />
                    </mesh>
                  ))}
                  <mesh>
                    <boxGeometry args={[0.05, 0.05, 0.05]} />
                    <meshStandardMaterial color="#0f1115" roughness={0.5} />
                  </mesh>
                </group>
                {/* A flower in the buttonhole, to match hers */}
                <mesh position={[0.2, 1.2, 0.2]}>
                  <sphereGeometry args={[0.045, 8, 6]} />
                  <meshStandardMaterial color="#ffd7e6" roughness={0.6} />
                </mesh>
              </group>
            )}

            {/* Paint, for anyone who has been hit out */}
            {paint && (
              <group position={[0, 1.12, 0.2]}>
                <mesh position={[0.05, 0.06, 0]}>
                  <sphereGeometry args={[0.17, 8, 6]} />
                  <meshStandardMaterial color={paint} roughness={0.4} />
                </mesh>
                <mesh position={[-0.13, -0.08, 0.02]}>
                  <sphereGeometry args={[0.1, 8, 6]} />
                  <meshStandardMaterial color={paint} roughness={0.4} />
                </mesh>
                <mesh position={[0.19, -0.14, 0.01]}>
                  <sphereGeometry args={[0.07, 8, 6]} />
                  <meshStandardMaterial color={paint} roughness={0.4} />
                </mesh>
              </group>
            )}

            {/* Arms, pivoting at the shoulder */}
            {[
              { ref: armL, x: -0.38 },
              { ref: armR, x: 0.38 },
            ].map((arm) => (
              <group key={arm.x} ref={arm.ref} position={[arm.x, 1.38, 0]}>
                {/* Shoulder cap, so a raised arm never leaves a gap */}
                <mesh castShadow>
                  <boxGeometry args={[0.18, 0.18, 0.2]} />
                  <meshStandardMaterial
                    color={colors.shirt}
                    flatShading
                    roughness={0.9}
                  />
                </mesh>
                <mesh position={[0, -0.31, 0]} castShadow>
                  <boxGeometry args={[0.17, 0.62, 0.2]} />
                  <meshStandardMaterial
                    color={colors.shirt}
                    flatShading
                    roughness={0.9}
                  />
                </mesh>
                {gun && arm.ref === armR && <Marker accent={gunColor} />}
            {bouquet && !gun && arm.ref === armR && (
              <group ref={bouquetRef} position={[0, -0.6, 0]}>
                <Bouquet />
              </group>
            )}
            {hand && arm.ref === armL && (
              <group ref={gripRef} position={[0, -0.6, 0]}>
                {hand === 'torch' ? (
                  <Torch flame={flame} light={flameLight} />
                ) : (
                  <Flashlight />
                )}
              </group>
            )}
              </group>
            ))}

            {/* Head */}
            <group ref={head} position={[0, 1.72, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.56, 0.54, 0.52]} />
                <meshStandardMaterial color={colors.skin} flatShading roughness={0.85} />
              </mesh>
              {/* Hair */}
              <mesh position={[0, 0.2, -0.03]} castShadow>
                <boxGeometry args={[0.6, 0.24, 0.56]} />
                <meshStandardMaterial color={colors.hair} flatShading roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.03, -0.28]}>
                <boxGeometry args={[0.58, 0.34, 0.1]} />
                <meshStandardMaterial color={colors.hair} flatShading roughness={0.9} />
              </mesh>
              {hair === 'long' && (
                <group>
                  {/* Down the back, past the shoulders */}
                  <mesh position={[0, -0.52, -0.28]} castShadow>
                    <boxGeometry args={[0.54, 0.98, 0.16]} />
                    <meshStandardMaterial
                      color={colors.hair}
                      flatShading
                      roughness={0.9}
                    />
                  </mesh>
                  <mesh position={[0, -1.02, -0.24]}>
                    <boxGeometry args={[0.42, 0.22, 0.14]} />
                    <meshStandardMaterial
                      color={colors.hair}
                      flatShading
                      roughness={0.9}
                    />
                  </mesh>
                  {/* And a strand either side of her face */}
                  {[-0.3, 0.3].map((hx) => (
                    <mesh key={hx} position={[hx, -0.22, -0.02]} castShadow>
                      <boxGeometry args={[0.12, 0.56, 0.4]} />
                      <meshStandardMaterial
                        color={colors.hair}
                        flatShading
                        roughness={0.9}
                      />
                    </mesh>
                  ))}
                </group>
              )}
              {/* Eyes */}
              <mesh position={[-0.14, 0, 0.27]}>
                <boxGeometry args={[0.08, 0.12, 0.04]} />
                <meshStandardMaterial color="#221c1a" />
              </mesh>
              <mesh position={[0.14, 0, 0.27]}>
                <boxGeometry args={[0.08, 0.12, 0.04]} />
                <meshStandardMaterial color="#221c1a" />
              </mesh>
              {smile && (
                <group position={[0, -0.17, 0.26]}>
                  <mesh>
                    <boxGeometry args={[0.12, 0.035, 0.03]} />
                    <meshStandardMaterial color="#8c3a34" />
                  </mesh>
                  {[-0.085, 0.085].map((mx) => (
                    <mesh key={mx} position={[mx, 0.035, 0]}>
                      <boxGeometry args={[0.06, 0.035, 0.03]} />
                      <meshStandardMaterial color="#8c3a34" />
                    </mesh>
                  ))}
                </group>
              )}
              <Accessory prop={prop} />
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

/** A bunch of flowers, wrapped, held stems down. */
function Bouquet() {
  return (
    <group>
      {/* Paper wrap, narrow at the bottom */}
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.05, 0.34, 9]} />
        <meshStandardMaterial color="#f7ece0" flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.075, 0.018, 6, 12]} />
        <meshStandardMaterial color="#e0346f" roughness={0.6} />
      </mesh>
      {/* Leaves */}
      {[0.6, 2.7, 4.5].map((a) => (
        <mesh
          key={a}
          position={[Math.sin(a) * 0.11, 0.2, Math.cos(a) * 0.11]}
          rotation={[0.5, a, 0]}
        >
          <boxGeometry args={[0.09, 0.02, 0.2]} />
          <meshStandardMaterial color="#4f7a3a" flatShading roughness={0.9} />
        </mesh>
      ))}
      {/* Six blooms, in a bunch */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        const petal = ['#ffd7e6', '#fff4d0', '#ffb3c8'][i % 3]
        const r = i % 2 === 0 ? 0.11 : 0.05
        return (
          <group
            key={i}
            position={[Math.sin(a) * r, 0.26 + (i % 2) * 0.05, Math.cos(a) * r]}
          >
            {[0, 1, 2, 3].map((j) => {
              const pa = (j / 4) * Math.PI * 2
              return (
                <mesh
                  key={j}
                  position={[Math.sin(pa) * 0.045, 0, Math.cos(pa) * 0.045]}
                >
                  <sphereGeometry args={[0.045, 6, 5]} />
                  <meshStandardMaterial color={petal} roughness={0.6} />
                </mesh>
              )
            })}
            <mesh>
              <sphereGeometry args={[0.032, 6, 5]} />
              <meshStandardMaterial color="#ffd166" roughness={0.5} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/**
 * A torch: a stick, a wrapped head, and a flame that is the only thing
 * lighting the ground he walks on after dark. Built pointing straight up out
 * of the fist — the grip it hangs in keeps it that way.
 */
function Torch({
  flame,
  light,
}: {
  flame: RefObject<Group | null>
  light: RefObject<PointLight | null>
}) {
  return (
    <group>
      {/* Handle, gripped in the middle */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.62, 7]} />
        <meshStandardMaterial color="#6b4526" flatShading roughness={0.95} />
      </mesh>
      {/* Rag binding at the head */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.075, 0.16, 8]} />
        <meshStandardMaterial color="#3c2a18" flatShading roughness={1} />
      </mesh>
      {/* Embers under the flame */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.075, 8, 6]} />
        <meshBasicMaterial color="#ff7a1a" />
      </mesh>

      <group ref={flame} position={[0, 0.44, 0]}>
        <mesh>
          <coneGeometry args={[0.11, 0.34, 7]} />
          <meshBasicMaterial color="#ffb03a" transparent opacity={0.92} />
        </mesh>
        <mesh position={[0, 0.05, 0]} scale={0.62}>
          <coneGeometry args={[0.11, 0.34, 7]} />
          <meshBasicMaterial color="#fff0b8" />
        </mesh>
        {/* Glow, so the flame reads before its light does */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.34, 10, 8]} />
          <meshBasicMaterial
            color="#ff9a3c"
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* The light comes off the flame, not off him. */}
      <pointLight
        ref={light}
        position={[0, 0.48, 0]}
        intensity={22}
        distance={24}
        decay={1.4}
        color="#ffab52"
      />
    </group>
  )
}

/**
 * A flashlight: a body, a lens, the beam it throws and the light that goes
 * with it. Built pointing along its own +z, which the wrist it hangs in keeps
 * aimed down the road ahead.
 */
function Flashlight() {
  const light = useRef<SpotLight>(null)
  const aim = useRef<Object3D>(null)

  // A spot light points at an object rather than in a direction, so it is
  // given one out in front of the lens. Being in the tree, it moves with it.
  useEffect(() => {
    if (light.current && aim.current) light.current.target = aim.current
  }, [])

  return (
    <group>
      {/* Body, gripped across the fist */}
      <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.085, 0.42, 10]} />
        <meshStandardMaterial color="#2f3542" flatShading roughness={0.55} />
      </mesh>
      {/* Ribbed grip */}
      {[-0.02, -0.1].map((z) => (
        <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.092, 0.092, 0.035, 10]} />
          <meshStandardMaterial color="#20242e" flatShading roughness={0.8} />
        </mesh>
      ))}
      {/* Head, widening to the lens */}
      <mesh position={[0, 0, 0.19]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.085, 0.16, 12]} />
        <meshStandardMaterial color="#3c4552" flatShading roughness={0.5} />
      </mesh>
      {/* Lens, and a glow so it reads as lit before the beam lands */}
      <mesh position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.125, 0.125, 0.03, 12]} />
        <meshBasicMaterial color="#fff6d8" />
      </mesh>
      <mesh position={[0, 0, 0.3]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshBasicMaterial
          color="#ffe9b0"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>

      {/* The beam: apex at the lens, opening out down the road. */}
      <mesh position={[0, 0, 4.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[1.5, 8, 14, 1, true]} />
        <meshBasicMaterial
          color="#fff2ce"
          transparent
          opacity={0.075}
          depthWrite={false}
        />
      </mesh>

      <spotLight
        ref={light}
        position={[0, 0, 0.3]}
        angle={0.52}
        penumbra={0.65}
        intensity={150}
        distance={38}
        decay={1.3}
        color="#fff3d0"
      />
      <object3D ref={aim} position={[0, 0, 8]} />
    </group>
  )
}

const GUN_BODY = '#39404f'
const GUN_DARK = '#20242e'
const GUN_STEEL = '#8e99ab'

/**
 * A paintball marker, held at the end of the raised right arm.
 *
 * The arm it hangs from is rotated forward about x, which turns the hand's
 * axes: in here **-y points down the barrel** and **+z is up**. Everything is
 * laid out along those two, so no rotation of its own is needed.
 */
function Marker({ accent }: { accent: string }) {
  return (
    <group position={[0, -0.5, 0.02]}>
      {/* Receiver */}
      <mesh position={[0, -0.11, 0.06]} castShadow>
        <boxGeometry args={[0.13, 0.36, 0.15]} />
        <meshStandardMaterial color={GUN_BODY} flatShading roughness={0.55} />
      </mesh>
      {/* Team colour down the side of the body */}
      <mesh position={[0, -0.17, 0.06]}>
        <boxGeometry args={[0.142, 0.13, 0.1]} />
        <meshStandardMaterial color={accent} flatShading roughness={0.4} />
      </mesh>

      {/* Barrel, then the wider muzzle at the end of it */}
      <mesh position={[0, -0.46, 0.07]} castShadow>
        <cylinderGeometry args={[0.038, 0.042, 0.42, 10]} />
        <meshStandardMaterial color={GUN_STEEL} flatShading roughness={0.42} />
      </mesh>
      <mesh position={[0, -0.68, 0.07]}>
        <cylinderGeometry args={[0.052, 0.048, 0.07, 10]} />
        <meshStandardMaterial color={GUN_DARK} flatShading roughness={0.5} />
      </mesh>

      {/* Sight rail along the top */}
      <mesh position={[0, -0.15, 0.145]}>
        <boxGeometry args={[0.07, 0.24, 0.03]} />
        <meshStandardMaterial color={GUN_DARK} flatShading roughness={0.6} />
      </mesh>

      {/* Hopper: the neck, then the ball of paint sitting on top */}
      <mesh position={[0, -0.02, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.1, 8]} />
        <meshStandardMaterial color={GUN_DARK} flatShading roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.02, 0.26]} castShadow>
        <sphereGeometry args={[0.105, 12, 9]} />
        <meshStandardMaterial color={accent} roughness={0.35} />
      </mesh>

      {/* Air tank, angled down behind the grip, with a domed cap */}
      <mesh position={[0, 0.18, -0.05]} rotation={[0.3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.056, 0.056, 0.26, 10]} />
        <meshStandardMaterial color={GUN_STEEL} flatShading roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.31, -0.09]}>
        <sphereGeometry args={[0.056, 10, 8]} />
        <meshStandardMaterial color={GUN_DARK} roughness={0.5} />
      </mesh>

      {/* Grip, dropping into the fist */}
      <mesh position={[0, 0.02, -0.07]} rotation={[-0.22, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.19, 0.1]} />
        <meshStandardMaterial color={GUN_DARK} flatShading roughness={0.75} />
      </mesh>
      {/* Trigger guard */}
      <mesh position={[0, -0.1, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.055, 0.014, 5, 10]} />
        <meshStandardMaterial color={GUN_DARK} flatShading roughness={0.7} />
      </mesh>
    </group>
  )
}

function Accessory({ prop }: { prop?: Npc['prop'] }) {
  switch (prop) {
    case 'cap':
      return (
        <group position={[0, 0.3, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.31, 0.33, 0.18, 10]} />
            <meshStandardMaterial color="#c0392b" flatShading roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.05, 0.3]}>
            <boxGeometry args={[0.46, 0.05, 0.3]} />
            <meshStandardMaterial color="#932c22" flatShading roughness={0.9} />
          </mesh>
        </group>
      )
    case 'beret':
      return (
        <mesh position={[0.06, 0.3, -0.02]} rotation={[0.1, 0, -0.28]} castShadow>
          <cylinderGeometry args={[0.34, 0.28, 0.14, 12]} />
          <meshStandardMaterial color="#3f4a2a" flatShading roughness={0.95} />
        </mesh>
      )
    case 'headset':
      return (
        <group>
          <mesh position={[0, 0.26, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.035, 6, 14, Math.PI]} />
            <meshStandardMaterial color="#2f3542" roughness={0.7} />
          </mesh>
          <mesh position={[-0.3, 0.04, 0]}>
            <boxGeometry args={[0.09, 0.16, 0.16]} />
            <meshStandardMaterial color="#2f3542" roughness={0.7} />
          </mesh>
          <mesh position={[0.3, 0.04, 0]}>
            <boxGeometry args={[0.09, 0.16, 0.16]} />
            <meshStandardMaterial color="#2f3542" roughness={0.7} />
          </mesh>
          <mesh position={[0.2, -0.09, 0.24]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.22, 0.04, 0.04]} />
            <meshStandardMaterial color="#2f3542" roughness={0.7} />
          </mesh>
        </group>
      )
    case 'glasses':
      return (
        <group position={[0, 0, 0.28]}>
          <mesh position={[-0.14, 0, 0]}>
            <boxGeometry args={[0.16, 0.15, 0.02]} />
            <meshStandardMaterial
              color="#cfe6f5"
              transparent
              opacity={0.55}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0.14, 0, 0]}>
            <boxGeometry args={[0.16, 0.15, 0.02]} />
            <meshStandardMaterial
              color="#cfe6f5"
              transparent
              opacity={0.55}
              roughness={0.2}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[0.36, 0.03, 0.02]} />
            <meshStandardMaterial color="#2f3542" />
          </mesh>
        </group>
      )
    case 'flowers':
      return (
        <group position={[0, 0.3, 0]}>
          {/* A circlet, and seven flowers around it */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.31, 0.028, 6, 16]} />
            <meshStandardMaterial color="#4f7a3a" roughness={0.9} />
          </mesh>
          {Array.from({ length: 7 }, (_, i) => {
            const angle = (i / 7) * Math.PI * 2
            const petal = ['#ffd7e6', '#fff4d0', '#ffb3c8'][i % 3]
            return (
              <group
                key={i}
                position={[Math.sin(angle) * 0.31, 0.05, Math.cos(angle) * 0.31]}
              >
                {[0, 1, 2, 3].map((j) => {
                  const a = (j / 4) * Math.PI * 2
                  return (
                    <mesh
                      key={j}
                      position={[Math.sin(a) * 0.045, 0, Math.cos(a) * 0.045]}
                    >
                      <sphereGeometry args={[0.042, 6, 5]} />
                      <meshStandardMaterial color={petal} roughness={0.6} />
                    </mesh>
                  )
                })}
                <mesh>
                  <sphereGeometry args={[0.03, 6, 5]} />
                  <meshStandardMaterial color="#ffd166" roughness={0.5} />
                </mesh>
              </group>
            )
          })}
        </group>
      )
    case 'hardhat':
      return (
        <group position={[0, 0.29, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.31, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f0b429" flatShading roughness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.38, 0.38, 0.04, 12]} />
            <meshStandardMaterial color="#f0b429" flatShading roughness={0.7} />
          </mesh>
        </group>
      )
    default:
      return null
  }
}
