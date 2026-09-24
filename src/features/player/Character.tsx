import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'
import type {
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  SpotLight,
} from 'three'
import { partyBeat } from '../party/partyLogic'
import { RING } from '../party/partyData'
import { starShape } from '../launch/starShape'
import type { HandLight, Npc } from '../../types'

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
  /** 0 to 1: standing about in a conversation rather than just standing. */
  chat?: number
  /** 0 to 1: hands over the head, running from whatever just went off. */
  fright?: number
  /** 0 to 1: one arm straight out — stop where you are. */
  halt?: number
  /** 0 to 1: both arms up over the head, cheering. */
  cheer?: number
  /** 0 to 1: chest-deep in the sea and pulling, rather than standing. */
  swimming?: number
  /**
   * 0 to 1: weightless, and pulling at nothing.
   *
   * Apart from `swimming` because the arms are the only half the two share.
   * A swimmer lies flat along the surface and goes somewhere; a man in orbit
   * hangs upright-ish in the middle of the air with his knees drawn up and
   * sculls to stay put. Feeding this through `swimming` would lay him out
   * face-down in a cabin, which is the one pose that reads as drowning
   * rather than floating.
   */
  floating?: number
  /**
   * 0 to 1: under the cape, and going somewhere.
   *
   * Its own channel rather than `floating` or `swimming`, for the same
   * reason those two are apart. A man in orbit hangs upright and sculls to
   * stay put; a swimmer lies flat and pulls. This one lies flat like the
   * swimmer but with everything trailing straight behind him and nothing
   * stroking at all - the cape is doing the work, not his arms.
   */
  flying?: number
  /** -1 diving to 1 climbing: which way the cape is taking him. */
  climb?: number
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
  /** A pose that overrides the idle stance: astride a bike, or on one knee. */
  pose?: 'ride' | 'kneel'
  /** A ring, held out in the free hand — or worn on it, once it is hers. */
  ring?: boolean
  /** Carried in the off hand. Nothing else about him gives off any light. */
  hand?: HandLight
  /** Long hair, falling down the back, instead of the cropped default. */
  hair?: 'short' | 'long'
  /** A skirt in this colour over the legs, with a trim if one is given. */
  dress?: string
  dressTrim?: string
  /** A tailored jacket, over a blouse. Straightens a `dress` into a pencil skirt. */
  blazer?: string
  /** The blouse under it. Off-white if not given. */
  blouse?: string
  /** A mouth, turned up. Nobody else on the island has one. */
  smile?: boolean
  /** Overrides the dance step the seed would have picked. */
  danceStyle?: number
  /** A dinner jacket over a white shirt, with a bow tie. */
  suit?: boolean
  /** The bow tie, if not the near-black one that goes with a black tuxedo. */
  bowTie?: string
  /** What is in the buttonhole: a flower to match hers, or a holly berry. */
  buttonhole?: string
  /** A bunch of flowers, in whichever hand is free. */
  bouquet?: boolean
  /** A crash helmet in this colour, over the hair. Nobody rides without one. */
  helmet?: string
  /** Match kit in a team colour: a bib over the shirt and a mask over the eyes. */
  kit?: string
  /**
   * Dressed for vacuum: a bubble helmet over the whole head, a life-support
   * pack on the back, and the hard collar the two meet at.
   *
   * Its own flag rather than a colour, because unlike a crash helmet none of
   * it is a matter of taste — a pressure suit is the same suit for everybody
   * who goes up, and what varies is only whether you are wearing one.
   */
  spacesuit?: boolean
  /**
   * The shirt they give you for having gone up: deep blue, with a gold star
   * across the chest, gold cuffs and collar, and a mission patch on the arm.
   *
   * Its own flag for the same reason the suit is. It is not a colour scheme
   * somebody chose — it is the one thing on the island that has to be earned,
   * and it has to look like it from across a field.
   */
  starShirt?: boolean
  /**
   * The officer's kit at the camp: a disruptive pattern over the olive, and
   * a second lieutenant's single star on each shoulder. The colours come in
   * through `colors` like anybody's; this is only the pattern and the rank.
   */
  camo?: boolean
}

const IDLE: CharacterMotion = { moving: false, speed: 0, airborne: false }

/**
 * Swimming, which is the one thing he does lying down.
 *
 * The pitch lays him on his front a few degrees head-up; the lift and the
 * shift put the middle of his body back over his own feet, since the rig
 * turns about the soles of his boots and nothing else would leave him in the
 * water he is meant to be in.
 */
const SWIM_PITCH = 1.36
const SWIM_LIFT = 1.02
const SWIM_SHIFT = -0.78

/**
 * The same three for the cape, and for the same reason: the rig turns about
 * the soles of his boots, so laying him flat without putting his middle back
 * over his feet would swing him round his own ankles.
 *
 * Pitched a shade past the swimmer's - he is driving through the air rather
 * than lying on water - and lifted further, because nothing is holding him
 * up at the waist.
 */
const FLY_PITCH = 1.46
const FLY_LIFT = 1.12
const FLY_SHIFT = -0.82
/** The arch of the torso in flight. The cape hangs inside it, and subtracts
    it back off to sit level with the world. */
const FLY_ARCH = -0.16

/** Leg measurements, shared by the rig and the crouch that folds it. */
const HIP = 0.85
const THIGH = 0.42
const SHIN = 0.43

/**
 * On one knee: how far the hips have to come down for the back knee to
 * reach the ground with the thigh hanging straight. It is the length of the
 * thigh and nothing else, which is why it is written as one.
 */
const KNEEL_SINK = HIP - THIGH

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
  blazer,
  blouse,
  smile = false,
  danceStyle,
  suit = false,
  bowTie,
  buttonhole,
  bouquet = false,
  helmet,
  spacesuit,
  starShirt,
  camo = false,
  kit,
  ring = false,
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
  /** Eased kneel, 0 standing to 1 down on one knee. */
  const knelt = useRef(0)
  /** Eased dance, so joining in and stopping are not a snap. */
  const groove = useRef(0)
  /** Eased chatter, likewise — a conversation is joined, not switched on. */
  const natter = useRef(0)
  /** Eased fright, likewise: nobody goes from calm to bolting in one frame. */
  const alarm = useRef(0)
  /** Eased halt, for the arm a sentry puts out. */
  const bar = useRef(0)
  /** Eased ovation, so a room comes to its feet rather than snapping to it. */
  const ovation = useRef(0)
  /** Eased swim, so going in and wading out are both a settle, not a snap. */
  const paddle = useRef(0)
  /** Eased flight, likewise: the cape takes him and gives him back slowly. */
  const soar = useRef(0)
  /** Eased climb, -1 diving to 1 climbing. */
  const tilt = useRef(0)
  /** Eased, like the paddle: how weightless he is. */
  const adrift = useRef(0)
  /** The wrist that whatever he is carrying hangs in, and a torch's flame. */
  const gripRef = useRef<Group>(null)
  /** The other wrist, for the flowers. */
  const bouquetRef = useRef<Group>(null)

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

    seat.current +=
      ((pose === 'ride' ? 1 : 0) - seat.current) * Math.min(1, delta * 10)
    const sit = seat.current

    knelt.current +=
      ((pose === 'kneel' ? 1 : 0) - knelt.current) * Math.min(1, delta * 6)
    const kneel = knelt.current

    groove.current += ((m.dance ?? 0) - groove.current) * Math.min(1, delta * 6)
    natter.current += ((m.chat ?? 0) - natter.current) * Math.min(1, delta * 4)
    alarm.current += ((m.fright ?? 0) - alarm.current) * Math.min(1, delta * 9)
    bar.current += ((m.halt ?? 0) - bar.current) * Math.min(1, delta * 10)
    ovation.current +=
      ((m.cheer ?? 0) - ovation.current) * Math.min(1, delta * 5)
    paddle.current +=
      ((m.swimming ?? 0) - paddle.current) * Math.min(1, delta * 5)
    /* Slower than the swim: going into a dive and pulling out of one are
       both a long change of shape, not a snap. */
    soar.current += ((m.flying ?? 0) - soar.current) * Math.min(1, delta * 3)
    /* And the climb angle eases on its own, so pointing up and levelling
       off do not jerk the whole body round. */
    tilt.current += ((m.climb ?? 0) - tilt.current) * Math.min(1, delta * 2.5)
    adrift.current +=
      ((m.floating ?? 0) - adrift.current) * Math.min(1, delta * 2.5)

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

    const stride = Math.max(0, 1 - crouch - sit - kneel)
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
        : ring
          ? -1.22 - lean + Math.sin(t * 1.4) * 0.02
          : hand === 'torch'
            ? -0.95 - lean + Math.sin(phase.current) * 0.05
            : hand === 'flashlight'
              ? -1.18 - lean + Math.sin(phase.current) * 0.05
              : -swing * 0.85 * (1 - sit) + (-1.22 - lean) * sit
      armL.current.rotation.z = gun
        ? -0.44
        : ring
          ? -0.12
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
      // Upright and over his own feet, unless something below lays him down.
      body.current.position.z = 0
      body.current.rotation.x = 0
      body.current.rotation.z = m.moving ? Math.sin(phase.current) * 0.04 : 0
      // The shoulders follow a little, so it is not just a swivelling head.
      body.current.rotation.y = target ? gaze.current.x * 0.3 : 0
    }
    if (head.current) {
      head.current.rotation.y = target
        ? gaze.current.x * 0.8
        : m.moving || wave
          ? 0
          : Math.sin(t * 0.6) * 0.28
      // Looking ahead rather than at his own boots.
      head.current.rotation.x =
        (target ? gaze.current.y * 0.32 : 0) - lean * 0.7
      head.current.rotation.z = target
        ? gaze.current.x * -0.08
        : Math.sin(t * 1.1) * 0.03
    }

    /* --------------------------------- kneel ---------------------------- */

    // Down on one knee. The back thigh hangs straight and its knee takes the
    // ground — which is the whole reason the hips drop by exactly a thigh —
    // while the front one comes up level with its shin under it. Chin up:
    // whoever he is asking is standing in front of him, not on the sand.
    if (knelt.current > 0.01) {
      const mix = knelt.current
      const blend = (current: number, wanted: number) =>
        current * (1 - mix) + wanted * mix

      if (legL.current) {
        legL.current.rotation.x = blend(legL.current.rotation.x, 0)
      }
      if (kneeL.current) {
        kneeL.current.rotation.x = blend(kneeL.current.rotation.x, 1.75)
      }
      if (legR.current) {
        legR.current.rotation.x = blend(legR.current.rotation.x, -1.55)
      }
      if (kneeR.current) {
        kneeR.current.rotation.x = blend(kneeR.current.rotation.x, 1.55)
      }
      if (torso.current) {
        torso.current.rotation.x = blend(torso.current.rotation.x, 0.06)
      }
      if (head.current) {
        head.current.rotation.x = blend(head.current.rotation.x, -0.2)
        head.current.rotation.y = blend(head.current.rotation.y, 0)
      }
      if (body.current) {
        body.current.position.y = blend(body.current.position.y, -KNEEL_SINK)
        body.current.rotation.z = blend(body.current.rotation.z, 0)
      }
    }

    /* -------------------------------- chatting ------------------------ */

    // Standing in a conversation rather than standing still: the weight goes
    // from one foot to the other, the near hand comes up to make a point and
    // drops again, and the head nods at whoever is making theirs.
    //
    // Three clocks at prime-ish rates, all offset by the seed. A crowd on one
    // clock reads as a chorus line, and a gesture that never stops is
    // semaphore rather than talk — so the hand rises on the cube of a slow
    // sine, which is mostly zero and occasionally emphatic.
    if (natter.current > 0.01) {
      const mix = natter.current
      const sway = Math.sin(t * 0.83)
      const nod = Math.sin(t * 2.3)
      const point = Math.max(0, Math.sin(t * 0.61)) ** 3
      const blend = (current: number, wanted: number) =>
        current * (1 - mix) + wanted * mix

      if (body.current) {
        body.current.rotation.z = blend(body.current.rotation.z, sway * 0.055)
        // Turning a shoulder in and out of the circle, which is most of what
        // somebody listening actually does.
        body.current.rotation.y = blend(body.current.rotation.y, sway * 0.17)
      }
      if (armR.current) {
        armR.current.rotation.x = blend(
          armR.current.rotation.x,
          -point * (0.95 + nod * 0.3),
        )
        armR.current.rotation.z = blend(armR.current.rotation.z, point * 0.55)
      }
      if (armL.current) {
        armL.current.rotation.x = blend(armL.current.rotation.x, -point * 0.2)
      }
      if (head.current) {
        head.current.rotation.x = blend(
          head.current.rotation.x,
          nod * 0.075 - 0.03,
        )
        head.current.rotation.y = blend(head.current.rotation.y, sway * 0.32)
        head.current.rotation.z = blend(head.current.rotation.z, sway * 0.05)
      }
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
          armL.current.rotation.x = blend(
            armL.current.rotation.x,
            -2.5 - hop * 0.4,
          )
          armL.current.rotation.z = blend(armL.current.rotation.z, -0.5)
        }
        if (armR.current) {
          armR.current.rotation.x = blend(
            armR.current.rotation.x,
            -2.5 - hop * 0.4,
          )
          armR.current.rotation.z = blend(armR.current.rotation.z, 0.5)
        }
        if (legL.current)
          legL.current.rotation.x = blend(legL.current.rotation.x, hop * 0.2)
        if (legR.current)
          legR.current.rotation.x = blend(legR.current.rotation.x, -hop * 0.2)
      } else if (style === 1) {
        // Arms out, swaying from the waist.
        if (armL.current) {
          armL.current.rotation.x = blend(
            armL.current.rotation.x,
            -0.3 + swing * 0.5,
          )
          armL.current.rotation.z = blend(armL.current.rotation.z, -1.35)
        }
        if (armR.current) {
          armR.current.rotation.x = blend(
            armR.current.rotation.x,
            -0.3 - swing * 0.5,
          )
          armR.current.rotation.z = blend(armR.current.rotation.z, 1.35)
        }
        if (legL.current)
          legL.current.rotation.x = blend(legL.current.rotation.x, swing * 0.28)
        if (legR.current)
          legR.current.rotation.x = blend(
            legR.current.rotation.x,
            -swing * 0.28,
          )
      } else if (style === 3) {
        // Hers: both arms high, and turning the whole time.
        if (armL.current) {
          armL.current.rotation.x = blend(
            armL.current.rotation.x,
            -2.75 - hop * 0.3,
          )
          armL.current.rotation.z = blend(armL.current.rotation.z, -0.42)
        }
        if (armR.current) {
          armR.current.rotation.x = blend(
            armR.current.rotation.x,
            -2.75 - hop * 0.3,
          )
          armR.current.rotation.z = blend(armR.current.rotation.z, 0.42)
        }
        if (legL.current)
          legL.current.rotation.x = blend(legL.current.rotation.x, swing * 0.34)
        if (legR.current)
          legR.current.rotation.x = blend(
            legR.current.rotation.x,
            -swing * 0.34,
          )
      } else {
        // Step and touch, turning a quarter at a time.
        if (armL.current) {
          armL.current.rotation.x = blend(
            armL.current.rotation.x,
            -1.5 - swing * 0.6,
          )
          armL.current.rotation.z = blend(armL.current.rotation.z, -0.7)
        }
        if (armR.current) {
          armR.current.rotation.x = blend(
            armR.current.rotation.x,
            -1.5 + swing * 0.6,
          )
          armR.current.rotation.z = blend(armR.current.rotation.z, 0.7)
        }
        if (legL.current)
          legL.current.rotation.x = blend(legL.current.rotation.x, swing * 0.55)
        if (legR.current)
          legR.current.rotation.x = blend(
            legR.current.rotation.x,
            -swing * 0.55,
          )
      }

      if (body.current) {
        body.current.position.y += hop * (style === 3 ? 0.2 : 0.13) * mix
        body.current.rotation.z += slow * 0.14 * mix
        body.current.rotation.y +=
          (style === 3 ? beat * 0.9 : style === 2 ? slow * 0.5 : swing * 0.16) *
          mix
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
        armL.current.rotation.x = blend(
          armL.current.rotation.x,
          -2.72 + flap * 0.32,
        )
        armL.current.rotation.z = blend(armL.current.rotation.z, -0.55)
      }
      if (armR.current) {
        armR.current.rotation.x = blend(
          armR.current.rotation.x,
          -2.72 - flap * 0.32,
        )
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

    /* -------------------------------- ovation --------------------------- */

    // A room cheering: both arms thrown up over the head, bouncing.
    //
    // Not clapping. Two hands meeting in front of a chest is a small, precise
    // gesture, and this camera looks down on the room from the back of the
    // hall — at that angle the hands disappear into the body and the whole
    // thing reads as a twitch. Arms straight up read from anywhere, which is
    // why a crowd in a stadium is drawn this way and a crowd in a drawing
    // room is not.
    //
    // Everyone is on their own rhythm, off their own seed: a room cheering in
    // unison is a chorus line, and that is a different thing entirely.
    if (ovation.current > 0.01) {
      const mix = ovation.current
      // Roughly two to three bounces a second each, and each of them starting
      // somewhere different in the cycle.
      const rate = 2.1 + (Math.abs(seed) % 1) * 0.9
      const cycle = t * rate + seed * 1.7
      // Up fast, down slow — the pump of a raised arm, not a metronome.
      const pump = Math.pow((Math.sin(cycle) + 1) / 2, 0.7)
      // A slower sway underneath it, so nobody is a piston.
      const sway = Math.sin(cycle * 0.41 + seed)

      const blend = (current: number, wanted: number) =>
        current * (1 - mix) + wanted * mix

      // Straight up and a little out, punching higher on the beat. Past
      // vertical at the top, which is what makes it a cheer rather than a
      // stretch.
      if (armL.current) {
        armL.current.rotation.x = blend(
          armL.current.rotation.x,
          -2.42 - pump * 0.55,
        )
        armL.current.rotation.z = blend(
          armL.current.rotation.z,
          -0.34 + sway * 0.12,
        )
      }
      if (armR.current) {
        armR.current.rotation.x = blend(
          armR.current.rotation.x,
          -2.42 - pump * 0.55,
        )
        armR.current.rotation.z = blend(
          armR.current.rotation.z,
          0.34 + sway * 0.12,
        )
      }

      // The body goes up with the arms and rolls a little with the sway, and
      // the chin comes up — you cheer at somebody, not at the floor.
      if (body.current) {
        body.current.position.y += pump * 0.11 * mix
        body.current.rotation.z += sway * 0.07 * mix
      }
      if (torso.current) {
        torso.current.rotation.x = blend(torso.current.rotation.x, -pump * 0.1)
      }
      if (head.current) {
        head.current.rotation.x -= (0.1 + pump * 0.12) * mix
        head.current.rotation.z += sway * 0.06 * mix
      }
    }

    /* --------------------------------- swim ----------------------------- */

    // Laid out flat on the water and pulling: the body pitches over on to
    // its front, the arms take alternate strokes over the head, the legs
    // flutter behind and the whole of him rolls with the stroke.
    //
    // He is drawn from the feet up, so tipping him forward alone would swing
    // him round his own ankles and stand his head a body's length in front
    // of where he is. The lift and the shift back are what put the middle of
    // him back over the middle of him, lying along the surface.
    /*
     * Weightless.
     *
     * Slower than a stroke and going nowhere: he sculls with his forearms to
     * hold himself where he is, one arm lazily out of time with the other so
     * it never reads as a jumping jack. The legs hang with the knees drawn
     * up, which is what a body does with nothing under it - a man in orbit
     * standing to attention is a man standing on something.
     */
    if (adrift.current > 0.01) {
      const mix = adrift.current
      /* `t` is the character's own clock, already in scope: elapsed time
         plus the per-character seed, so two people floating side by side
         are not sculling in lockstep. */
      const blend = (current: number, wanted: number) =>
        current * (1 - mix) + wanted * mix

      /* Two rates that do not divide into one another, so the arms never
         come back into step. */
      const sculLeft = Math.sin(t * 0.9)
      const sculRight = Math.sin(t * 0.73 + 1.1)

      if (armL.current) {
        armL.current.rotation.x = blend(
          armL.current.rotation.x,
          -0.75 + sculLeft * 0.5,
        )
        armL.current.rotation.z = blend(
          armL.current.rotation.z,
          -0.55 - sculLeft * 0.22,
        )
      }
      if (armR.current) {
        armR.current.rotation.x = blend(
          armR.current.rotation.x,
          -0.75 + sculRight * 0.5,
        )
        armR.current.rotation.z = blend(
          armR.current.rotation.z,
          0.55 + sculRight * 0.22,
        )
      }
      /* Knees drawn up and drifting, the way they hang with no floor. */
      const tuck = Math.sin(t * 0.55)
      if (legL.current) {
        legL.current.rotation.x = blend(
          legL.current.rotation.x,
          -0.5 + tuck * 0.16,
        )
        legL.current.rotation.z = blend(legL.current.rotation.z, -0.12)
      }
      if (legR.current) {
        legR.current.rotation.x = blend(
          legR.current.rotation.x,
          -0.38 - tuck * 0.14,
        )
        legR.current.rotation.z = blend(legR.current.rotation.z, 0.14)
      }
      if (kneeL.current) {
        kneeL.current.rotation.x = blend(
          kneeL.current.rotation.x,
          0.85 + tuck * 0.2,
        )
      }
      if (kneeR.current) {
        kneeR.current.rotation.x = blend(
          kneeR.current.rotation.x,
          0.7 - tuck * 0.18,
        )
      }
      /* A lean back off the vertical, so he is not stood to attention. */
      if (body.current) {
        body.current.rotation.x = blend(
          body.current.rotation.x,
          -0.22 + Math.sin(t * 0.47) * 0.1,
        )
      }
    }

    if (paddle.current > 0.01) {
      const mix = paddle.current
      // Half the stride rate: an arm that swings like a walk is not a stroke.
      const pull = phase.current * 0.5
      const stroke = Math.sin(pull)
      const blend = (current: number, wanted: number) =>
        current * (1 - mix) + wanted * mix

      if (armL.current) {
        // From stretched out over the head to back past the hip, which is
        // one whole stroke of a crawl.
        armL.current.rotation.x = blend(
          armL.current.rotation.x,
          -1.85 + stroke * 1.3,
        )
        armL.current.rotation.z = blend(armL.current.rotation.z, -0.3)
      }
      if (armR.current) {
        armR.current.rotation.x = blend(
          armR.current.rotation.x,
          -1.85 - stroke * 1.3,
        )
        armR.current.rotation.z = blend(armR.current.rotation.z, 0.3)
      }
      const kick = Math.sin(pull * 3.2)
      if (legL.current) {
        legL.current.rotation.x = blend(legL.current.rotation.x, kick * 0.26)
      }
      if (legR.current) {
        legR.current.rotation.x = blend(legR.current.rotation.x, -kick * 0.26)
      }
      // Barely bent: a flutter kick is not a stride.
      if (kneeL.current) {
        kneeL.current.rotation.x = blend(
          kneeL.current.rotation.x,
          0.18 + kick * 0.16,
        )
      }
      if (kneeR.current) {
        kneeR.current.rotation.x = blend(
          kneeR.current.rotation.x,
          0.18 - kick * 0.16,
        )
      }
      if (torso.current) {
        torso.current.rotation.x = blend(torso.current.rotation.x, -0.1)
      }
      if (head.current) {
        // Face in the water, chin lifted enough to see where he is going.
        head.current.rotation.x = blend(head.current.rotation.x, -0.62)
        head.current.rotation.y = blend(head.current.rotation.y, 0)
        head.current.rotation.z = blend(head.current.rotation.z, 0)
      }
      if (body.current) {
        // Flat on the water, a few degrees head-up the way a swimmer lies.
        body.current.rotation.x = blend(body.current.rotation.x, SWIM_PITCH)
        // The roll of the stroke, about his own long axis — applied before
        // the pitch by the default Euler order, which is what makes it one.
        body.current.rotation.z = blend(body.current.rotation.z, stroke * 0.26)
        body.current.position.y = blend(
          body.current.position.y,
          SWIM_LIFT + Math.sin(t * 1.7) * 0.05,
        )
        body.current.position.z = blend(body.current.position.z, SWIM_SHIFT)
      }
    }

    /*
     * Under the cape.
     *
     * The whole pose is one idea: everything trails. One arm forward and one
     * back is the picture everybody has of this, and it beats both arms out
     * front because it tells you which way is forward even in silhouette.
     * The legs go straight out behind with the knees all but locked - a
     * flying man with his knees up is a man sitting in an invisible chair.
     *
     * Last of the body poses, so it wins over the swim and the stride: he
     * can leave the water flying, and the two must not average out into a
     * man doing the crawl through the air.
     */
    if (soar.current > 0.01) {
      const mix = soar.current
      const blend = (current: number, wanted: number) =>
        current * (1 - mix) + wanted * mix
      /* A slow wallow, so holding a hover is never perfectly still. */
      const wallow = Math.sin(t * 1.4)
      const climb = tilt.current

      if (armL.current) {
        /* The leading arm, straight out past his head. Pulled a little
           wider as he climbs, which is what makes a climb read as effort. */
        armL.current.rotation.x = blend(
          armL.current.rotation.x,
          -2.85 + climb * 0.12 + wallow * 0.05,
        )
        armL.current.rotation.z = blend(armL.current.rotation.z, -0.16)
      }
      if (armR.current) {
        /* And the trailing arm, back along his side. */
        armR.current.rotation.x = blend(
          armR.current.rotation.x,
          0.28 - climb * 0.1 - wallow * 0.05,
        )
        armR.current.rotation.z = blend(armR.current.rotation.z, 0.2)
      }
      /* Legs together and trailing, with the faintest scissor so he is not
         a mannequin. */
      if (legL.current) {
        legL.current.rotation.x = blend(
          legL.current.rotation.x,
          -0.12 + wallow * 0.045,
        )
      }
      if (legR.current) {
        legR.current.rotation.x = blend(
          legR.current.rotation.x,
          -0.12 - wallow * 0.045,
        )
      }
      if (kneeL.current) {
        kneeL.current.rotation.x = blend(kneeL.current.rotation.x, 0.06)
      }
      if (kneeR.current) {
        kneeR.current.rotation.x = blend(kneeR.current.rotation.x, 0.06)
      }
      if (torso.current) {
        /* Arched, the way a body held up by its chest is. Named, because
           the cape hangs inside this pivot and has to take it back off. */
        torso.current.rotation.x = blend(torso.current.rotation.x, FLY_ARCH)
      }
      if (head.current) {
        /* Chin up and looking where he is going. Flat out he is face-down,
           so the neck has to lift most of the pitch back off. */
        head.current.rotation.x = blend(
          head.current.rotation.x,
          -0.72 + climb * 0.18,
        )
        head.current.rotation.y = blend(head.current.rotation.y, 0)
        head.current.rotation.z = blend(head.current.rotation.z, 0)
      }
      if (body.current) {
        /* Flat out, less the climb: pointing up at the sky takes pitch off
           the same angle that laid him down in the first place. */
        body.current.rotation.x = blend(
          body.current.rotation.x,
          FLY_PITCH - climb * 0.42,
        )
        /* A slow bank, so a hover drifts rather than hangs. */
        body.current.rotation.z = blend(body.current.rotation.z, wallow * 0.1)
        body.current.position.y = blend(
          body.current.position.y,
          FLY_LIFT + Math.sin(t * 1.2) * 0.06,
        )
        body.current.position.z = blend(body.current.position.z, FLY_SHIFT)
      }
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
              {spacesuit && <MoonBoot />}
            </group>
            {spacesuit && <KneePad />}
          </group>
        ))}

        {/* A skirt, over the legs and under the waist. Under a blazer it is
            a pencil skirt — narrow, to the knee — and everywhere else the
            flared one the village and the feast wear. */}
        {dress && (
          <group position={[0, blazer ? 0.78 : 0.66, 0]}>
            <mesh castShadow>
              <cylinderGeometry
                args={
                  blazer
                    ? [0.28, 0.32, 0.62, 14, 1, true]
                    : [0.22, 0.56, 0.78, 14, 1, true]
                }
              />
              <meshStandardMaterial
                color={dress}
                flatShading
                roughness={blazer ? 0.6 : 0.75}
                side={DoubleSide}
              />
            </mesh>
            {dressTrim && (
              <mesh
                position={[0, blazer ? -0.31 : -0.39, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry
                  args={blazer ? [0.315, 0.018, 6, 18] : [0.54, 0.035, 6, 18]}
                />
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
              <meshStandardMaterial
                color={colors.shirt}
                flatShading
                roughness={0.9}
              />
            </mesh>
            {/* What makes the blue shirt the prize rather than a blue shirt:
                a gold star on the chest, gold at the collar and cuffs, and
                the mission patch on the sleeve. */}
            {starShirt && !spacesuit && <StarKit motion={motion} />}
            {camo && !spacesuit && <CamoKit />}

            {/* The pack on his back, and the chest rig that answers it. */}
            {spacesuit && (
              <group position={[0, 1.05, 0]}>
                <LifeSupport />
                {/* A control box on the chest, where a pilot's is. It does
                    not cast either, for the reason the star does not: flat
                    trim worn on the front throws its own hard shape onto the
                    ground, and the torso behind it is already casting. */}
                <mesh position={[0, 0.04, 0.21]}>
                  <boxGeometry args={[0.3, 0.2, 0.06]} />
                  <meshStandardMaterial
                    color="#c3ccd6"
                    flatShading
                    roughness={0.6}
                  />
                </mesh>
                <mesh position={[-0.07, 0.04, 0.25]}>
                  <boxGeometry args={[0.05, 0.05, 0.02]} />
                  <meshStandardMaterial
                    color="#6fd08a"
                    emissive="#6fd08a"
                    emissiveIntensity={0.9}
                  />
                </mesh>
                <mesh position={[0.05, 0.04, 0.25]}>
                  <boxGeometry args={[0.05, 0.05, 0.02]} />
                  <meshStandardMaterial
                    color="#f0a33c"
                    emissive="#f0a33c"
                    emissiveIntensity={0.7}
                  />
                </mesh>
                {/* Amber bands at the shoulders, matching the collar. */}
                {[-0.31, 0.31].map((x) => (
                  <mesh key={x} position={[x, 0.22, 0]}>
                    <boxGeometry args={[0.04, 0.16, 0.39]} />
                    <meshStandardMaterial color="#f0a33c" flatShading />
                  </mesh>
                ))}
                {/* A dial under the lights, and a stripe of blue down the
                    front of the box so it reads as kit, not a pocket. */}
                <mesh
                  position={[0, -0.03, 0.245]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.035, 0.035, 0.02, 10]} />
                  <meshStandardMaterial
                    color="#4a5260"
                    metalness={0.5}
                    roughness={0.35}
                  />
                </mesh>
                <mesh position={[0.11, 0.04, 0.242]}>
                  <boxGeometry args={[0.04, 0.16, 0.01]} />
                  <meshStandardMaterial color="#3d7fd6" />
                </mesh>
                {/* The utility belt, a dark band round the waist with a
                    steel buckle at the front. */}
                <mesh position={[0, -0.32, 0]}>
                  <boxGeometry args={[0.65, 0.09, 0.41]} />
                  <meshStandardMaterial
                    color="#3a4150"
                    flatShading
                    roughness={0.6}
                  />
                </mesh>
                <mesh position={[0, -0.32, 0.21]}>
                  <boxGeometry args={[0.12, 0.08, 0.02]} />
                  <meshStandardMaterial
                    color="#c9d2dc"
                    metalness={0.7}
                    roughness={0.25}
                  />
                </mesh>
                {/* The mission patch on the left shoulder: a blue disc with
                    an amber ring and a star in it. */}
                <group
                  position={[-0.316, 0.08, 0.02]}
                  rotation={[0, -Math.PI / 2, 0]}
                >
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.085, 0.085, 0.01, 16]} />
                    <meshStandardMaterial color="#f0a33c" />
                  </mesh>
                  <mesh position={[0, 0, 0.004]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.068, 0.068, 0.01, 16]} />
                    <meshStandardMaterial color="#1f3f78" />
                  </mesh>
                  <mesh position={[0, 0, 0.01]}>
                    <circleGeometry args={[0.03, 5]} />
                    <meshStandardMaterial
                      color="#ffe28a"
                      emissive="#ffd34d"
                      emissiveIntensity={0.4}
                    />
                  </mesh>
                </group>
              </group>
            )}

            {/* Match kit: a team bib over whatever they turned up in */}
            {kit && (
              <group>
                <mesh position={[0, 1.06, 0]} castShadow>
                  <boxGeometry args={[0.66, 0.58, 0.42]} />
                  <meshStandardMaterial
                    color={kit}
                    flatShading
                    roughness={0.7}
                  />
                </mesh>
                {/* A dark panel down the front, and a shoulder stripe each side */}
                <mesh position={[0, 1.04, 0.213]}>
                  <boxGeometry args={[0.2, 0.5, 0.02]} />
                  <meshStandardMaterial color="#22262e" roughness={0.6} />
                </mesh>
                {[-0.33, 0.33].map((sx) => (
                  <mesh key={sx} position={[sx, 1.26, 0]}>
                    <boxGeometry args={[0.04, 0.16, 0.44]} />
                    <meshStandardMaterial color="#22262e" roughness={0.6} />
                  </mesh>
                ))}
              </group>
            )}

            {/* A tailored jacket, open over a blouse: the office answer to
                the dinner jacket below. Squared shoulders, a notch lapel
                each side, and a hem that sits below the torso box. */}
            {blazer && (
              <group>
                {/* The blouse, in the opening */}
                <mesh position={[0, 1.04, 0.196]}>
                  <boxGeometry args={[0.22, 0.6, 0.02]} />
                  <meshStandardMaterial
                    color={blouse ?? '#f4f1ea'}
                    roughness={0.8}
                  />
                </mesh>
                {/* The jacket, a shade proud of the torso on every side */}
                <mesh position={[0, 1.04, 0]} castShadow>
                  <boxGeometry args={[0.66, 0.78, 0.42]} />
                  <meshStandardMaterial
                    color={blazer}
                    flatShading
                    roughness={0.7}
                  />
                </mesh>
                {/* Cut away down the front, so the blouse shows through */}
                <mesh position={[0, 1.0, 0.208]}>
                  <boxGeometry args={[0.28, 0.7, 0.02]} />
                  <meshStandardMaterial
                    color={blouse ?? '#f4f1ea'}
                    roughness={0.8}
                  />
                </mesh>
                {/* Notch lapels, falling open from the collar */}
                {[-0.15, 0.15].map((lx) => (
                  <mesh
                    key={lx}
                    position={[lx * 1.35, 1.16, 0.214]}
                    rotation={[0, 0, lx > 0 ? -0.2 : 0.2]}
                  >
                    <boxGeometry args={[0.16, 0.42, 0.025]} />
                    <meshStandardMaterial
                      color={blazer}
                      flatShading
                      roughness={0.55}
                    />
                  </mesh>
                ))}
                {/* Collar, standing at the back of the neck */}
                <mesh position={[0, 1.4, -0.02]}>
                  <boxGeometry args={[0.44, 0.12, 0.44]} />
                  <meshStandardMaterial
                    color={blazer}
                    flatShading
                    roughness={0.55}
                  />
                </mesh>
              </group>
            )}

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
                    <meshStandardMaterial
                      color="#25282f"
                      flatShading
                      roughness={0.5}
                    />
                  </mesh>
                ))}
                <group position={[0, 1.31, 0.215]}>
                  {[-0.075, 0.075].map((bx) => (
                    <mesh
                      key={bx}
                      position={[bx, 0, 0]}
                      rotation={[0, 0, bx > 0 ? -0.5 : 0.5]}
                    >
                      <boxGeometry args={[0.11, 0.09, 0.04]} />
                      <meshStandardMaterial
                        color={bowTie ?? '#1c1f26'}
                        flatShading
                        roughness={0.5}
                      />
                    </mesh>
                  ))}
                  {/* The knot, a shade darker than whatever the wings are. */}
                  <mesh>
                    <boxGeometry args={[0.05, 0.05, 0.05]} />
                    <meshStandardMaterial
                      color={bowTie ? '#000000' : '#0f1115'}
                      opacity={bowTie ? 0.55 : 1}
                      transparent={Boolean(bowTie)}
                      roughness={0.5}
                    />
                  </mesh>
                </group>
                {/* In the buttonhole: a flower to match hers, or a berry. */}
                <mesh position={[0.2, 1.2, 0.2]}>
                  <sphereGeometry args={[0.045, 8, 6]} />
                  <meshStandardMaterial
                    color={buttonhole ?? '#ffd7e6'}
                    roughness={0.6}
                  />
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
                    color={blazer ?? colors.shirt}
                    flatShading
                    roughness={blazer ? 0.7 : 0.9}
                  />
                </mesh>
                {/* A blazer sleeve runs to a cuff and lets the blouse finish
                    the arm; every other sleeve is the one piece it always
                    was. */}
                {blazer ? (
                  <>
                    <mesh position={[0, -0.24, 0]} castShadow>
                      <boxGeometry args={[0.18, 0.48, 0.21]} />
                      <meshStandardMaterial
                        color={blazer}
                        flatShading
                        roughness={0.7}
                      />
                    </mesh>
                    <mesh position={[0, -0.55, 0]} castShadow>
                      <boxGeometry args={[0.17, 0.14, 0.2]} />
                      <meshStandardMaterial
                        color={blouse ?? '#f4f1ea'}
                        flatShading
                        roughness={0.85}
                      />
                    </mesh>
                  </>
                ) : (
                  <mesh position={[0, -0.31, 0]} castShadow>
                    <boxGeometry args={[0.17, 0.62, 0.2]} />
                    <meshStandardMaterial
                      color={colors.shirt}
                      flatShading
                      roughness={0.9}
                    />
                  </mesh>
                )}
                {spacesuit && <SpaceGlove />}
                {gun && arm.ref === armR && <Marker accent={gunColor} />}
                {bouquet && !gun && arm.ref === armR && (
                  <group ref={bouquetRef} position={[0, -0.6, 0]}>
                    <Bouquet />
                  </group>
                )}
                {(hand || ring) && arm.ref === armL && (
                  <group ref={gripRef} position={[0, -0.6, 0]}>
                    {hand ? <HandLightRig kind={hand} /> : <RingBand />}
                  </group>
                )}
              </group>
            ))}

            {/* Head */}
            <group ref={head} position={[0, 1.72, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.56, 0.54, 0.52]} />
                <meshStandardMaterial
                  color={colors.skin}
                  flatShading
                  roughness={0.85}
                />
              </mesh>
              {/* Hair, unless a helmet or a bubble has swallowed it */}
              {!helmet && !spacesuit && (
                <group>
                  <mesh position={[0, 0.2, -0.03]} castShadow>
                    <boxGeometry args={[0.6, 0.24, 0.56]} />
                    <meshStandardMaterial
                      color={colors.hair}
                      flatShading
                      roughness={0.9}
                    />
                  </mesh>
                  <mesh position={[0, 0.03, -0.28]}>
                    <boxGeometry args={[0.58, 0.34, 0.1]} />
                    <meshStandardMaterial
                      color={colors.hair}
                      flatShading
                      roughness={0.9}
                    />
                  </mesh>
                </group>
              )}
              {hair === 'long' && !helmet && !spacesuit && (
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
              {spacesuit && <SpaceHelmet />}
              {helmet && !spacesuit && <Helmet color={helmet} />}
              {kit && !helmet && !spacesuit && <Mask color={kit} />}
              {!helmet && !spacesuit && <Accessory prop={prop} />}
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

/**
 * The gold on the blue: star, cape, collar, cuffs and the patch on the arm.
 *
 * Takes `motion` because the cape is the one part of the kit that has to know
 * how fast he is going - a cape that hangs dead still while he runs is a
 * towel pinned to his back.
 */
/**
 * The blotches, as [x, y, width, height, colour] on the chest's own face.
 * Laid out by hand rather than at random, so every officer on the island
 * wears the same pattern and it never shimmers from one render to the next.
 */
const CAMO_PATCHES: [number, number, number, number, string][] = [
  [-0.17, 0.2, 0.2, 0.13, '#3f4a2a'],
  [0.12, 0.12, 0.24, 0.1, '#8a7a4f'],
  [-0.05, -0.06, 0.18, 0.12, '#4a3c2a'],
  [0.18, -0.2, 0.16, 0.12, '#3f4a2a'],
  [-0.2, -0.22, 0.14, 0.1, '#8a7a4f'],
  [0.02, 0.28, 0.12, 0.06, '#4a3c2a'],
]

/**
 * Pattern on the front and back of the jacket, a name tape over the right
 * breast, and the rank on the shoulders. Nothing here casts, for the reason
 * the star shirt's trim does not: flat patches on the chest throw their own
 * hard shapes onto the ground beside the body that is already casting.
 */
function CamoKit() {
  return (
    <group position={[0, 1.05, 0]}>
      {[1, -1].map((face) => (
        <group key={face} rotation={[0, face > 0 ? 0 : Math.PI, 0]}>
          {CAMO_PATCHES.map(([x, y, w, h, color], i) => (
            <mesh key={i} position={[x, y, 0.192 + i * 0.0004]}>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial color={color} roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}
      {/* The name tape, pale on the olive. */}
      <mesh position={[-0.15, 0.2, 0.196]}>
        <planeGeometry args={[0.2, 0.05]} />
        <meshStandardMaterial color="#d9d2b0" roughness={0.9} />
      </mesh>
      {/* One gold star on each shoulder strap: a second lieutenant. */}
      {[-0.2, 0.2].map((x) => (
        <group key={x} position={[x, 0.365, 0]}>
          <mesh>
            <boxGeometry args={[0.1, 0.012, 0.2]} />
            <meshStandardMaterial color="#4c5238" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.012, 0.03]}>
            <boxGeometry args={[0.05, 0.012, 0.05]} />
            <meshStandardMaterial
              color="#e2b53c"
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function StarKit({ motion }: { motion?: RefObject<CharacterMotion> }) {
  /* Big. This is the only thing on the island that has to be earned, and it
     is read from across a green at the camera's usual distance, so the star
     is most of the width of the chest rather than a badge on it. */
  const star = useMemo(() => starShape(0.3, 0.128), [])
  const patch = useMemo(() => starShape(0.07, 0.03), [])
  const glow = useRef<Mesh>(null)

  /* It catches the light as he turns, the way a metal thread does. The pulse
     is slow and shallow - a shirt that blinks is a hazard light. */
  useFrame((state) => {
    if (!glow.current) return
    const m = glow.current.material as MeshStandardMaterial
    m.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 1.3) * 0.22
  })

  return (
    <group position={[0, 1.05, 0]}>
      <Cape motion={motion} />

      {/* A darker field behind the star, so the gold has something to sit on
          rather than floating on the blue. */}
      <mesh position={[0, 0.05, 0.192]}>
        <circleGeometry args={[0.305, 24]} />
        <meshStandardMaterial color="#12306b" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.05, 0.194]}>
        <ringGeometry args={[0.3, 0.318, 24]} />
        <meshStandardMaterial
          color="#f2c230"
          metalness={0.5}
          roughness={0.35}
        />
      </mesh>

      {/* The star itself, bevelled so its arms catch the light separately
          rather than reading as one flat shape. */}
      {/*
        No castShadow on any of this.

        The star is a raised badge a couple of centimetres off the chest, and
        a shadow-casting one throws a sharp five-pointed star onto the ground
        beside the player's own soft blob - so he walks the island trailing
        stars across the grass. Trim on a shirt is not a thing that casts;
        the body under it already does.
      */}
      <mesh ref={glow} position={[0, 0.05, 0.196]}>
        <extrudeGeometry
          args={[
            star,
            {
              depth: 0.03,
              bevelEnabled: true,
              bevelThickness: 0.012,
              bevelSize: 0.012,
              bevelSegments: 2,
            },
          ]}
        />
        <meshStandardMaterial
          color="#ffd23f"
          emissive="#f0a33c"
          emissiveIntensity={0.5}
          metalness={0.65}
          roughness={0.22}
        />
      </mesh>

      {/* A chevron under the star, which is what turns a decorated shirt into
          a uniform somebody was given. */}
      {[0, 1].map((i) => (
        <mesh
          key={i}
          position={[0, -0.26 + i * 0.06, 0.193]}
          rotation={[0, 0, 0]}
        >
          {/* A partial ring, centred on straight down so the chevron is
              symmetric about the middle of the chest. 270 degrees is down in
              ring space, and the span is taken off either side of it -
              picking a start angle by eye lands it lopsided. */}
          <ringGeometry
            args={[0.16 - i * 0.03, 0.185 - i * 0.03, 20, 1, 4.012, 1.4]}
          />
          <meshStandardMaterial
            color="#f2c230"
            metalness={0.45}
            roughness={0.35}
          />
        </mesh>
      ))}

      {/* Gold at the collar, standing slightly proud of the neck. */}
      <mesh position={[0, 0.355, 0]}>
        <boxGeometry args={[0.645, 0.08, 0.405]} />
        <meshStandardMaterial
          color="#f2c230"
          flatShading
          metalness={0.45}
          roughness={0.35}
        />
      </mesh>
      {/* And a second, thinner line under it: a placket, so the collar reads
          as tailoring rather than as a stripe. */}
      <mesh position={[0, 0.29, 0.192]}>
        <boxGeometry args={[0.2, 0.04, 0.01]} />
        <meshStandardMaterial color="#f2c230" metalness={0.4} />
      </mesh>

      {/* No separate gold hem band any more: it sat at the same height as
          the belt below and the two z-fought through each other. The belt
          does that job now, and does it better - a buckle says waist where
          a stripe only said edge-of-shirt. */}

      {/* Cuffs, at the end of each sleeve. */}
      {[-0.33, 0.33].map((x) => (
        <mesh key={x} position={[x, 0.24, 0]}>
          <boxGeometry args={[0.07, 0.13, 0.405]} />
          <meshStandardMaterial color="#f2c230" flatShading metalness={0.4} />
        </mesh>
      ))}

      {/* Shoulders.

          Flat gold bars along the top of each arm were tried once and cut:
          with the collar and cuffs already gold, a fourth horizontal line
          turned the silhouette into stripes. These are not that. They are
          pauldrons - caps that sit over the top of the shoulder joint and
          square off the top of him, so the shape reads as armour at the
          distance the camera actually sits at.

          Placed at the arm's own pivot, x +-0.38 and y 0.33 in this group's
          space (the arms hang at y 1.38 and this whole kit is a group at
          1.05), and a shade wider than the 0.18 shoulder cap underneath so
          they cover it rather than sink into it. They do not swing with the
          arm - they are armour strapped to the shoulder, and the joint
          rotates under them, which is what a real pauldron does. */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.38, 0.33, 0]}>
          <mesh castShadow rotation={[0, 0, side * -0.16]}>
            <boxGeometry args={[0.22, 0.12, 0.24]} />
            <meshStandardMaterial
              color="#1b4694"
              flatShading
              metalness={0.35}
              roughness={0.5}
            />
          </mesh>
          {/* Gold only on the top bevel, so it catches the light from above
              without drawing another line across the front of him. */}
          <mesh position={[0, 0.07, 0]} rotation={[0, 0, side * -0.16]}>
            <boxGeometry args={[0.23, 0.035, 0.25]} />
            <meshStandardMaterial
              color="#f2c230"
              flatShading
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* The belt: a gold buckle on a dark band at the waist, which is what
          finally separates the shirt from the trousers instead of letting
          the blue run all the way down. */}
      <group position={[0, -0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.648, 0.1, 0.408]} />
          <meshStandardMaterial color="#14224a" flatShading roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.2]}>
          <boxGeometry args={[0.16, 0.13, 0.03]} />
          <meshStandardMaterial
            color="#f2c230"
            flatShading
            metalness={0.55}
            roughness={0.28}
          />
        </mesh>
        <mesh position={[0, 0, 0.218]}>
          <boxGeometry args={[0.07, 0.06, 0.01]} />
          <meshStandardMaterial color="#12306b" roughness={0.6} />
        </mesh>
      </group>

      {/* The mission patch on the left arm: a disc with its own star. */}
      <group position={[-0.325, 0.06, 0.02]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <circleGeometry args={[0.105, 16]} />
          <meshStandardMaterial color="#0f2c5c" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.003]}>
          <ringGeometry args={[0.095, 0.105, 16]} />
          <meshStandardMaterial color="#f2c230" metalness={0.45} />
        </mesh>
        <mesh position={[0, 0, 0.006]}>
          <extrudeGeometry
            args={[patch, { depth: 0.008, bevelEnabled: false }]}
          />
          <meshStandardMaterial
            color="#ffd23f"
            emissive="#f0a33c"
            emissiveIntensity={0.4}
            metalness={0.45}
          />
        </mesh>
      </group>
    </group>
  )
}

/**
 * The cape.
 *
 * Hung from a yoke across the shoulders and built as a lathe of stacked
 * rings rather than a flat plane, so it wraps the back and falls away from
 * him instead of reading as a rectangle stuck on with tape.
 *
 * Two conventions decide every number in here, and getting either backwards
 * puts the cape on his chest:
 *
 * - Negative Z is behind him (the life-support pack is built the same way).
 * - In cylinder space theta runs from +Z toward +X, so the arc that covers
 *   his back is the half centred on PI - a window of PI/2 to 3*PI/2.
 * - A positive `rotation.x` on something hanging swings its bottom edge
 *   backward. So streaming the cape out behind him is a POSITIVE angle;
 *   negative drapes it forward over his front.
 *
 * Every frame it does two things. It swings back by how fast he is going, so
 * a sprint streams it out behind him and standing still lets it drop; and it
 * breathes on a slow sine whatever he is doing, because a cape that is
 * perfectly still whenever he stops moving is a plank.
 */
function Cape({ motion }: { motion?: RefObject<CharacterMotion> }) {
  const swing = useRef<Group>(null)
  /* Eased, so setting off and pulling up are a settle rather than a snap:
     the cape has weight and arrives a moment after he does. */
  const lift = useRef(0)
  /* Eased flight, on the cape's own clock rather than read raw: the body
     pitches over a good half second and a cape that snapped upright on the
     first frame of a launch would arrive before he did. */
  const aloft = useRef(0)

  useFrame((state, delta) => {
    const g = swing.current
    if (!g) return
    const m = motion?.current
    const fly = m?.flying ?? 0
    aloft.current += (fly - aloft.current) * Math.min(1, delta * 3)
    const air = aloft.current

    /* On the ground the wake is all about how fast he is walking. In the
       air it is not: a hover is still flying, and a cape that drops the
       moment he stops pushing a direction reads as the thing switching off.
       So flight floors it - most of the way out at a standstill, the rest
       of the way as he actually travels. */
    const speed = m?.moving ? (m.speed ?? 0) : 0
    const walked = Math.min(1, speed / 5)
    const wanted = air > 0.01 ? Math.max(0.72 + air * 0.2, walked) : walked
    lift.current += (wanted - lift.current) * Math.min(1, delta * 4)

    const t = state.clock.elapsedTime

    /*
     * The counter-rotation, which is the whole of why this needs to know
     * about flight at all.
     *
     * The cape hangs inside the body, and in the air the body is pitched
     * face-down by FLY_PITCH. Everything this computes is relative to that,
     * so the swing that streams the cape out behind him on the grass points
     * it at the ground once he is flying. Taking the body's own pitch back
     * off puts the cape level with the world again, which is where a cape
     * held out by the air it is moving through actually sits.
     *
     * Two rotations to undo, not one: the body's pitch, and the torso arch
     * of FLY_ARCH on the pivot this hangs inside. Both stack onto the cape
     * before it gets a say.
     *
     * Not quite the whole of it either - 0.92 of the pitch rather than all
     * of it, so the cape still rides a few degrees off level and reads as
     * trailing from his shoulders rather than as a plank bolted on square.
     */
    const climb = m?.climb ?? 0
    const upright = (-(FLY_PITCH - climb * 0.42) * 0.92 - FLY_ARCH) * air

    /* Positive, so it lifts BEHIND him. At rest it hangs a few degrees off
       his back rather than clipping into it; at a sprint it is most of the
       way to horizontal. The billow is faster and deeper the harder he is
       going, the way cloth loaded with air behaves. */
    g.rotation.x =
      0.06 +
      lift.current * 1.15 +
      upright +
      Math.sin(t * (1.6 + lift.current * 4)) * (0.03 + lift.current * 0.09)
    /* And a lazy side-to-side, so it is never a flat pendulum. In the air
       it ripples harder and faster: there is a great deal more wind in it
       up there than there is on a walk. */
    g.rotation.z =
      Math.sin(t * (0.9 + air * 1.6) + 1.1) *
      (0.02 + lift.current * 0.06 + air * 0.1)
    /* A slow roll along its own length while flying, which is the thing
       that stops a big flat sheet reading as cardboard. */
    g.rotation.y = Math.sin(t * 1.15 + 0.4) * air * 0.09
  })

  /* The back half, centred on PI. Shared by all three layers so the cape,
     its lining and its hem are the same sheet of cloth and cannot part
     company at the edges. */
  const FROM = Math.PI * 0.5
  const SPAN = Math.PI

  return (
    /* Pivoting at the top edge, high on his back, so it swings from the
       shoulders the way it is fastened rather than from his middle. */
    <group position={[0, 0.33, -0.17]} ref={swing}>
      {/* The clasp: a gold bar across the shoulders holding the thing on.
          Without it the cape floats a centimetre off his back and the eye
          goes straight to the gap. */}
      <mesh position={[0, 0.01, 0.05]}>
        <boxGeometry args={[0.42, 0.055, 0.1]} />
        <meshStandardMaterial
          color="#f2c230"
          flatShading
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      <group position={[0, -0.62, 0]}>
        {/* The cape proper: a half-open cone, widening as it falls. Drawn
            on both sides, because once it lifts you see the inside of it. */}
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.66, 1.24, 18, 1, true, FROM, SPAN]} />
          <meshStandardMaterial
            color="#b3202e"
            flatShading
            roughness={0.82}
            side={DoubleSide}
          />
        </mesh>
        {/* The lining, a shade darker and a hair OUTSIDE the cape rather
            than inside it: inside, it sits between the cloth and the camera
            and you see the lining instead of the cape. */}
        <mesh>
          <cylinderGeometry
            args={[0.312, 0.672, 1.235, 18, 1, true, FROM, SPAN]}
          />
          <meshStandardMaterial
            color="#6d1420"
            flatShading
            roughness={0.9}
            side={DoubleSide}
          />
        </mesh>
        {/* A gold hem at the bottom, which is what ties the red back to the
            rest of the kit rather than leaving it a separate garment. */}
        <mesh position={[0, -0.605, 0]}>
          <cylinderGeometry
            args={[0.662, 0.674, 0.07, 18, 1, true, FROM, SPAN]}
          />
          <meshStandardMaterial
            color="#f2c230"
            flatShading
            metalness={0.45}
            roughness={0.35}
            side={DoubleSide}
          />
        </mesh>
      </group>
    </group>
  )
}

/**
 * The bubble a man wears in vacuum.
 *
 * A sphere rather than a box, which is the whole of why it reads as a space
 * helmet beside a crash helmet built out of the same kit: nothing else on
 * this island is round. The glass is transparent enough to keep his face —
 * losing the face to a mirrored visor loses the person inside the suit, and
 * the point of the suit is that it is still him.
 */
function SpaceHelmet() {
  return (
    <group position={[0, 0.06, 0]}>
      {/* The hard collar the bubble seats on. */}
      <mesh position={[0, -0.36, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.38, 0.12, 14]} />
        <meshStandardMaterial
          color="#f0a33c"
          flatShading
          roughness={0.5}
          metalness={0.25}
        />
      </mesh>
      {/* The glass. Drawn from the inside as well, so the back of it is
          there behind his head rather than an open shell. */}
      <mesh castShadow>
        <sphereGeometry args={[0.46, 18, 16]} />
        <meshStandardMaterial
          color="#cfe6fa"
          transparent
          opacity={0.36}
          roughness={0.08}
          metalness={0.2}
          side={DoubleSide}
        />
      </mesh>
      {/* A gold-tinted sun visor, a band across the front just under the
          shade, so the eyes below it stay clear. */}
      <mesh>
        <sphereGeometry
          args={[0.47, 18, 6, Math.PI * 0.2, Math.PI * 0.6, 0.9, 0.36]}
        />
        <meshStandardMaterial
          color="#e8b04a"
          transparent
          opacity={0.55}
          metalness={0.9}
          roughness={0.15}
          side={DoubleSide}
        />
      </mesh>
      {/* The sunshade over the brow, and the lamp clipped to it. */}
      <mesh position={[0, 0.3, 0.08]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.14, 14]} />
        <meshStandardMaterial color="#eef2f6" flatShading roughness={0.7} />
      </mesh>
      {/* An amber stripe round the shade, answering the collar. */}
      <mesh position={[0, 0.3, 0.08]}>
        <cylinderGeometry args={[0.345, 0.345, 0.04, 14]} />
        <meshStandardMaterial color="#f0a33c" flatShading roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0.36]}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 10]} />
        <meshStandardMaterial
          color="#fff4d0"
          emissive="#ffd98a"
          emissiveIntensity={0.9}
        />
      </mesh>
      {/* A pair of side lamps at the temples. */}
      {[-0.44, 0.44].map((x) => (
        <mesh key={x} position={[x, 0.02, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.07, 10]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#bfe4ff"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * A chunky boot for the suit: an oversized shell over the foot with an amber
 * welt and a dark tread, so the silhouette ends in moon boots rather than
 * in trouser legs.
 */
function MoonBoot() {
  return (
    <group position={[0, -SHIN, 0]}>
      {/* No two faces share a plane: the shell starts inside the sole, the
          sole dips just under the ground, and the shin's own end sits
          buried between them — coplanar faces flicker as they trade places. */}
      <mesh position={[0, 0.16, 0.03]} castShadow>
        <boxGeometry args={[0.29, 0.24, 0.34]} />
        <meshStandardMaterial color="#d3dbe3" flatShading roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.31]} />
        <meshStandardMaterial color="#f0a33c" flatShading />
      </mesh>
      <mesh position={[0, 0.025, 0.04]}>
        <boxGeometry args={[0.31, 0.07, 0.37]} />
        <meshStandardMaterial color="#2f343d" flatShading roughness={0.9} />
      </mesh>
    </group>
  )
}

/** A padded plate over the knee, riding on the thigh so it bends with it. */
function KneePad() {
  return (
    <mesh position={[0, -THIGH + 0.02, 0.125]}>
      <boxGeometry args={[0.18, 0.14, 0.04]} />
      <meshStandardMaterial
        color="#b9c4cf"
        flatShading
        metalness={0.3}
        roughness={0.5}
      />
    </mesh>
  )
}

/** A gauntlet: an amber wrist ring and a dark glove at the end of the arm. */
function SpaceGlove() {
  return (
    <group position={[0, -0.56, 0]}>
      <mesh>
        <boxGeometry args={[0.2, 0.06, 0.23]} />
        <meshStandardMaterial color="#f0a33c" flatShading />
      </mesh>
      <mesh position={[0, -0.08, 0]} castShadow>
        <boxGeometry args={[0.19, 0.13, 0.21]} />
        <meshStandardMaterial color="#3a4150" flatShading roughness={0.7} />
      </mesh>
    </group>
  )
}

/**
 * The life-support pack, and the two hoses that run from it to the collar.
 * Worn on the back, where it is the silhouette that says "spacesuit" from
 * behind — which is the angle this game is played from.
 */
function LifeSupport() {
  return (
    <group position={[0, 0, -0.3]}>
      <mesh position={[0, 0, -0.12]} castShadow>
        <boxGeometry args={[0.6, 0.72, 0.26]} />
        <meshStandardMaterial color="#dbe3ea" flatShading roughness={0.8} />
      </mesh>
      {/* Two tanks down the back of it. */}
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, 0, -0.28]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.62, 10]} />
          <meshStandardMaterial
            color="#b9c4cf"
            flatShading
            metalness={0.35}
            roughness={0.5}
          />
        </mesh>
      ))}
      {/* A live readout, so the pack is running rather than luggage. */}
      <mesh position={[0.18, 0.28, 0.02]}>
        <boxGeometry args={[0.14, 0.08, 0.04]} />
        <meshStandardMaterial
          color="#6fd08a"
          emissive="#6fd08a"
          emissiveIntensity={0.8}
        />
      </mesh>
      {/* A whip antenna off the top corner, tipped with a red beacon. */}
      <mesh position={[-0.22, 0.58, -0.12]}>
        <cylinderGeometry args={[0.012, 0.012, 0.44, 6]} />
        <meshStandardMaterial color="#8d949a" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.22, 0.81, -0.12]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial
          color="#ff5a4a"
          emissive="#ff3b2e"
          emissiveIntensity={1.2}
        />
      </mesh>
      {/* The hoses up to the collar. */}
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.42, -0.02]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.36, 8]} />
          <meshStandardMaterial color="#8d949a" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * A crash helmet: one shell, a dark visor across the front and a chin bar
 * under it. It sits over the head box and hides the hair entirely.
 */
function Helmet({ color }: { color: string }) {
  return (
    <group position={[0, 0.07, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.66, 0.6, 0.64]} />
        <meshStandardMaterial
          color={color}
          flatShading
          roughness={0.32}
          metalness={0.15}
        />
      </mesh>
      {/* A crown stripe, because every helmet has one */}
      <mesh position={[0, 0.31, 0]}>
        <boxGeometry args={[0.16, 0.03, 0.66]} />
        <meshStandardMaterial color="#fdf7e9" roughness={0.5} />
      </mesh>
      {/* Visor, and the chin bar under it */}
      <mesh position={[0, 0.02, 0.325]}>
        <boxGeometry args={[0.52, 0.24, 0.05]} />
        <meshStandardMaterial
          color="#1b2430"
          roughness={0.12}
          metalness={0.5}
          emissive="#2a4a6a"
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh position={[0, -0.22, 0.3]}>
        <boxGeometry args={[0.56, 0.18, 0.16]} />
        <meshStandardMaterial color={color} flatShading roughness={0.4} />
      </mesh>
    </group>
  )
}

/** A paintball mask: goggles across the eyes and a guard over the mouth. */
function Mask({ color }: { color: string }) {
  return (
    <group>
      {/* A team-coloured crown over the hair. The match camera looks down on
          everybody, so the top of the head is the part that has to say which
          side you are on. */}
      <mesh position={[0, 0.34, 0.01]} castShadow>
        <boxGeometry args={[0.64, 0.13, 0.62]} />
        <meshStandardMaterial color={color} flatShading roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.02, 0.2]} castShadow>
        <boxGeometry args={[0.62, 0.26, 0.2]} />
        <meshStandardMaterial color={color} flatShading roughness={0.45} />
      </mesh>
      {/* The lens, which is the bit you see across a field */}
      <mesh position={[0, 0.02, 0.305]}>
        <boxGeometry args={[0.5, 0.16, 0.04]} />
        <meshStandardMaterial
          color="#171d26"
          roughness={0.1}
          metalness={0.6}
          emissive="#3a6a8a"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Chin guard, and a strap round the back of the head */}
      <mesh position={[0, -0.2, 0.24]}>
        <boxGeometry args={[0.46, 0.16, 0.14]} />
        <meshStandardMaterial color={color} flatShading roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.02, -0.26]}>
        <boxGeometry args={[0.58, 0.13, 0.1]} />
        <meshStandardMaterial color="#22262e" roughness={0.8} />
      </mesh>
    </group>
  )
}

/**
 * The ring, pinched between finger and thumb and held up: a gold band stood
 * on edge with one stone in it, and a glint on the stone that does not need
 * a light in the scene to work. Half of what makes it read at this size is
 * that it is held out on its own, well clear of the body.
 */
function RingBand() {
  return (
    <group position={[0, -0.06, 0.07]}>
      {/* The band stands on edge, the way a ring does between finger and
          thumb, so what you see is the circle of it and the stone on top. */}
      <mesh castShadow>
        <torusGeometry args={[0.052, 0.013, 8, 20]} />
        <meshStandardMaterial
          color={RING.band}
          roughness={0.18}
          metalness={0.85}
        />
      </mesh>
      {/* The setting it sits in, and the stone over that */}
      <mesh position={[0, 0.072, 0]}>
        <cylinderGeometry args={[0.022, 0.03, 0.022, 8]} />
        <meshStandardMaterial
          color={RING.band}
          roughness={0.18}
          metalness={0.85}
        />
      </mesh>
      <mesh position={[0, 0.108, 0]}>
        <octahedronGeometry args={[0.036, 0]} />
        <meshStandardMaterial
          color={RING.stone}
          roughness={0.05}
          metalness={0.35}
          emissive={RING.stone}
          emissiveIntensity={0.6}
        />
      </mesh>
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
 * Whatever he is carrying to see by, on its own. The first-person view mounts
 * this straight onto the camera: the body it normally hangs off is hidden in
 * there, and hiding the body used to take the light with it.
 */
export function HandLightRig({ kind }: { kind: HandLight }) {
  return kind === 'torch' ? <Torch /> : <Flashlight />
}

/**
 * A torch: a stick, a wrapped head, and a flame that is the only thing
 * lighting the ground he walks on after dark. Built pointing straight up out
 * of the fist — the grip it hangs in keeps it that way.
 */
function Torch() {
  const flame = useRef<Group>(null)
  const light = useRef<PointLight>(null)

  // Two fast waves plus a little noise: never quite the same shape twice.
  // It lives here rather than in the rig above so that a torch is a torch
  // wherever it is held — including in a hand drawn straight to the camera.
  useFrame((state) => {
    if (!flame.current) return
    const t = state.clock.elapsedTime
    const lick =
      0.86 +
      Math.sin(t * 11) * 0.08 +
      Math.sin(t * 23.3) * 0.05 +
      Math.random() * 0.03
    flame.current.scale.set(1 + (1 - lick) * 0.5, lick, 1 + (1 - lick) * 0.5)
    flame.current.rotation.y = t * 2.4
    flame.current.position.x = Math.sin(t * 7.3) * 0.015
    if (light.current) light.current.intensity = 22 * lick
  })

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
/**
 * The marker, on its own. Hung off a shoulder in the rig above, and held
 * straight to the camera in the first-person view — which is why it is
 * exported rather than buried in here.
 */
export function Marker({ accent }: { accent: string }) {
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
        <mesh
          position={[0.06, 0.3, -0.02]}
          rotation={[0.1, 0, -0.28]}
          castShadow
        >
          <cylinderGeometry args={[0.34, 0.28, 0.14, 12]} />
          <meshStandardMaterial color="#3f4a2a" flatShading roughness={0.95} />
        </mesh>
      )
    case 'headset':
      return (
        /*
         * Every piece stands clear of the head rather than on it. The band
         * used to lie flat at the hair's own half-width and the boom's front
         * face sat exactly on the face (both at z=0.26); coplanar faces have
         * no depth between them to sort by, so they flickered as the camera
         * moved. Now: the band arches over the hair (top 0.32) from ear to
         * ear, the cups sit outside the long-hair strands (x 0.36), and the
         * boom runs forward outside the cheek and across in front of the
         * mouth at z=0.31, a clear 5cm off the face.
         */
        <group>
          <mesh position={[0, 0.02, 0]}>
            <torusGeometry args={[0.39, 0.03, 6, 16, Math.PI]} />
            <meshStandardMaterial color="#2f3542" roughness={0.7} />
          </mesh>
          {[-0.38, 0.38].map((x) => (
            <mesh key={x} position={[x, 0.02, 0]}>
              <boxGeometry args={[0.08, 0.17, 0.17]} />
              <meshStandardMaterial color="#2f3542" roughness={0.7} />
            </mesh>
          ))}
          {/* The boom: forward off the right cup, then in to the mouth. */}
          <mesh position={[0.39, -0.05, 0.17]}>
            <boxGeometry args={[0.03, 0.03, 0.28]} />
            <meshStandardMaterial color="#2f3542" roughness={0.7} />
          </mesh>
          <mesh position={[0.245, -0.1, 0.31]} rotation={[0, 0, 0.33]}>
            <boxGeometry args={[0.31, 0.03, 0.03]} />
            <meshStandardMaterial color="#2f3542" roughness={0.7} />
          </mesh>
          <mesh position={[0.1, -0.15, 0.31]}>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshStandardMaterial color="#20242e" roughness={0.8} />
          </mesh>
        </group>
      )
    /*
     * The lenses stand clear of the eyes rather than on them.
     *
     * The eyes are a box 0.04 deep centred at z=0.27, so they reach 0.29; the
     * lenses used to be 0.02 deep centred at 0.28 and reached exactly 0.29
     * too. Two coplanar faces with a transparent material in front is the one
     * combination that has to flicker: there is no depth between them to sort
     * by, so which one wins changes with the camera. Moving the frame forward
     * to 0.34 puts a clear 3cm of air in front of the eye, and the lens no
     * longer writes depth, so whatever ends up behind it is simply drawn.
     */
    case 'glasses':
      return (
        <group position={[0, 0, 0.34]}>
          {[-0.14, 0.14].map((lx) => (
            <mesh key={lx} position={[lx, 0, 0]}>
              <boxGeometry args={[0.16, 0.15, 0.02]} />
              <meshStandardMaterial
                color="#cfe6f5"
                transparent
                opacity={0.45}
                roughness={0.2}
                depthWrite={false}
              />
            </mesh>
          ))}
          {/* The bridge, and an arm back to each ear: opaque, so they are
              what actually reads as a pair of glasses from a distance. */}
          <mesh>
            <boxGeometry args={[0.36, 0.03, 0.02]} />
            <meshStandardMaterial color="#2f3542" />
          </mesh>
          {[-0.22, 0.22].map((rx) => (
            <mesh key={rx} position={[rx, 0, -0.04]}>
              <boxGeometry args={[0.04, 0.16, 0.03]} />
              <meshStandardMaterial color="#2f3542" />
            </mesh>
          ))}
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
                position={[
                  Math.sin(angle) * 0.31,
                  0.05,
                  Math.cos(angle) * 0.31,
                ]}
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
            <sphereGeometry
              args={[0.31, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
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
