import { useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import type { HandLight, Interior, InteriorLink } from '../../types'
import { useFrame, useThree } from '@react-three/fiber'
import { type Group, type Mesh } from 'three'
import { INTERIOR_BY_ID } from '../interior/interiors'
import { BOARD } from '../arcade/minigames'
import { AMALIA, PARTY_BUTTON, TUXEDO } from '../party/partyData'
import { LAUNCH_AREA, SPACESUIT, STAR_SHIRT } from '../launch/launch'
import { StarTrail } from '../launch/StarTrail'
import { CONSOLE, SUIT_RACK } from '../launch/deck'
import {
  BUILDINGS,
  BUILDING_BY_ID,
  DOCK_WALK,
  ISLAND_WALK_RADIUS,
  KEY_BY_ID,
  MISSION_BY_ID,
  PLAYER_COLORS,
  PLAYER_START,
  SIGNS,
} from '../island/world'
import {
  PROP_COLLIDERS,
  STATIC_COLLIDERS,
  TREE_COLLIDERS,
  groundHeight,
  probeCamera,
} from '../island/terrainLogic'
import type { Collider } from '../island/terrainLogic'
import { resolveCollisions, type Bounds } from '../../shared/engine/collision'
import { examine } from '../interior/examine'
import {
  AUTO_DOOR_REACH,
  DOOR_ADMIT,
  autoOpens,
  doorShut,
} from '../interior/doors'
import {
  INTERIOR_MARGIN,
  TECH_WALL_REACH,
  doorwayReached,
  interiorColliders,
  interiorFloor,
  linkArrival,
  linkFacing,
  linkReached,
  wayBack,
} from '../interior/interiorLogic'
import { ACTOR_POS } from '../npc/actors'
import {
  FEAST,
  FEAST_AREA,
  HOST_BOW_TIE,
  HOST_BUTTONHOLE,
  HOST_SUIT,
  clearFeast,
  residentsOf,
  stepFeast,
  wholeTable,
} from '../party/feast'
import {
  LECTURE,
  LECTURE_AREA,
  LECTURE_LOOK,
  emptyHall,
  stepLecture,
} from '../lecture/lecture'
import { PLAYER_POS, PLAYER_VIEW } from './playerLogic'
import {
  cameraZoom,
  consumeFire,
  consumeInteract,
  consumeJump,
  consumeTripleJump,
  isCrouching,
  readCameraTurn,
  readMove,
  readZoomHold,
  zoomBy,
} from './input'
import {
  ARENA,
  HIP_MUZZLE,
  PAINT,
  aimAt,
  canFire,
  playerFire,
} from '../paintball/paintballLogic'
import { GUARD, challenge, holdTheLine } from '../npc/guard'
import { HIDE } from '../hide/hideLogic'
import { PARTY, atCentre, onFloor } from '../party/partyLogic'
import { PROPOSE, together } from '../proposal/propose'
import {
  ASHORE,
  DIVE_SPRING,
  SWIM,
  SWIM_BOUNDS,
  SWIM_SPEED,
  SWIM_SPRINT,
  deepEnough,
  diveIn,
  dryOff,
  overWater,
  waterFloor,
} from '../rescue/swimLogic'
import { isInteractive, keyCount, useGame } from '../../shared/state/store'
import type { Nearby } from '../../shared/state/store'
import {
  Character,
  HandLightRig,
  Marker,
  type CharacterMotion,
} from './Character'
import * as sfx from '../../shared/engine/audio'

const WALK_SPEED = 10
const RUN_SPEED = 19
const INDOOR_SPEED = 6.5
/** Ducked under fire you barely move, which is the trade for not being hit. */
const CROUCH_SPEED = 3.4
const PLAYER_RADIUS = 0.5
/**
 * Where his eyes are above his feet, for the view out of them. The head box
 * the third-person rig draws is centred at 1.72, and this is a shade over it
 * so you are looking out of the top of the face rather than the middle.
 */
const EYE_HEIGHT = 1.78
/**
 * And where they are when he is lying in the water rather than standing in
 * it. His feet ride well under the surface out there, so the standing figure
 * would put his eyes a good half metre above his own head.
 */
const SWIM_EYE = 1.4

/**
 * The lens, per view.
 *
 * The canvas is set up for the third-person camera, which sits twenty-odd
 * metres back: a two-metre near plane costs it nothing and buys depth
 * precision. Out of his own eyes it is ruinous — it clips away everything
 * inside arm's reach, which is exactly what you have come close to look at.
 * Amalia dances at 1.45m and was never drawn at all; anybody who walked up to
 * you disappeared at two paces and tagged you from inside the clip plane.
 *
 * The far plane comes in with it, so the depth buffer is not asked to span
 * four orders of magnitude to pay for it.
 */
/**
 * Where the marker's muzzle ends up once it is drawn to the camera, relative
 * to the eye. The view model and the shot both measure off these, so paint
 * leaves the barrel you can see rather than his chest.
 */
const FP_GUN = { right: 0.16, drop: 0.22, ahead: 1.1 }

const LENS = {
  third: { fov: 40, near: 2, far: 2200 },
  first: { fov: 68, near: 0.12, far: 1500 },
}
/**
 * How far the head rises and falls on each footfall, and how far it rolls
 * from side to side over the whole step.
 *
 * Both are deliberately small. A head bob is read out of the corner of the
 * eye rather than looked at, and anything you can actually see yourself is
 * already enough to make somebody queasy — the roll especially, which at a
 * couple of degrees tips the horizon far more than it sounds like it would.
 */
const BOB = 0.016
const SWAY = 0.012

/**
 * How far what he is carrying swings with each stride, in radians.
 *
 * A light gets its own, much smaller: the marker only moves itself, but a
 * flashlight aims a beam, and every degree the thing turns drags the whole
 * lit patch of the island across your view with it. The two were sharing a
 * twenty-degree swing, which is fine on a gun and seasickness on a torch.
 */
const HELD_SWING = { x: 0.14, z: 0.05 }
const LIGHT_SWING = { x: 0.05, z: 0.02 }
const JUMP_SPEED = 9.2
const GRAVITY = 26

const OUTDOOR_CAM = { distance: 22, height: 15.5 }
/** A match needs to see further out than a stroll does. */
const FIGHT_CAM = { distance: 27, height: 18 }

/** `doorShut`, asked by building id, which is all a target carries. */
function shutDoor(
  id: string,
  state: { night: boolean; lighthouseOpen: boolean },
): boolean {
  const building = BUILDING_BY_ID.get(id)
  return building ? doorShut(building, state) : false
}

interface Target extends Nearby {
  x: number
  z: number
  range: number
  /** Recomputed each frame for characters that move. */
  live?: string
  /**
   * How near you have to get before it fires by itself, in metres, for the
   * few things that do — a sliding office door and nothing else so far.
   * Tighter than `range`, so the prompt radius is not also the trip wire:
   * the door should open as you reach it, not as you wander past the plaza.
   */
  auto?: number
  trigger: () => void
}

/**
 * How long after arriving somewhere before a way through can fire again, in
 * seconds. See `settling` in the controller for why it exists.
 */
const ARRIVAL_SETTLE = 0.6

/**
 * How fast he walks a step he is taking by himself — into a lift car, and
 * back out of it. A little under a walk, because it is a short distance and
 * being marched at full speed into a box reads as a shove.
 */
const STRIDE_SPEED = 2.2

/** Near enough the mark to call the step finished, in metres. */
const STRIDE_REACHED = 0.06

/**
 * How long a step he takes by himself may run before it is called done
 * wherever he has got to, in seconds.
 *
 * A mark he cannot quite reach — set a few centimetres inside a wall, say —
 * would otherwise leave him walking on the spot with the controls out of his
 * hands, which is the one failure here that cannot be recovered from.
 *
 * Generous against the steps this actually drives — a couple of metres, about
 * a second — because it is a backstop and not a schedule. Anything near it is
 * already a bug; the cap only decides whether you can keep playing after one.
 */
const STRIDE_TIMEOUT = 6

/**
 * Through a link into the next room. You arrive just inside the link on the
 * far side that points back here, facing into the room — or, when the far
 * room has no such link, wherever this one says, or failing that its spawn.
 */
function takeLink(interior: Interior, link: InteriorLink) {
  const state = useGame.getState()
  /* A lift is the exception to every other way through: it has no single
     destination, because the panel inside it serves the whole building. */
  if (link.kind !== 'lift') {
    if (!link.to) return
    if (!INTERIOR_BY_ID.has(link.to)) return
  }
  sfx.confirm()
  /* A lift does not go anywhere on its own: walking in puts him in the car
     with the panel up, and the floor he presses is what starts the ride —
     see ui/LiftPanel.tsx and ui/LiftRide.tsx, which own the two halves. */
  if (link.kind === 'lift') {
    if (link.journal) {
      state.record({
        id: link.id,
        title: link.journal.title,
        body: link.journal.body,
        source: interior.name,
      })
    }
    state.callLift({
      linkId: link.id,
      room: interior.id,
      floor: link.floor ?? 0,
      stops: link.serves ?? [],
    })
    return
  }
  if (link.journal) {
    state.record({
      id: link.id,
      title: link.journal.title,
      body: link.journal.body,
      source: interior.name,
    })
  }
  if (!link.to) return
  const dest = INTERIOR_BY_ID.get(link.to)
  if (!dest) return
  const back = wayBack(dest, interior.id)
  if (link.arrive) state.goRoom(link.to, link.arrive)
  else if (back) state.goRoom(link.to, linkArrival(back), linkFacing(back))
  else state.goRoom(link.to, dest.spawn)
}

export function Player() {
  const group = useRef<Group>(null)
  /** Whether he has stepped clear of every threshold since he last arrived. */
  const offThreshold = useRef(false)
  /**
   * The same, for the doors outside that open by themselves.
   *
   * Kept apart from `offThreshold` because the two are cleared by different
   * things: that one by the links of a room, this one by the doorstep he is
   * put back on when he walks out of a building. Sharing a flag would have
   * stepping out of the lobby count as stepping clear of the glass, and the
   * glass would take him straight back in.
   */
  const offDoorstep = useRef(false)
  /**
   * Seconds left of the pause after arriving somewhere, during which no way
   * through will fire.
   *
   * Stepping clear of a threshold is not enough on its own. Arriving at the
   * top of a flight puts him a couple of strides from the well that goes
   * straight back down, and the camera is still swinging round to face the
   * new room — so a held W can read as "forward" into the well before he has
   * seen where he is, and the floor he just climbed to flickers past. The
   * pause is short enough not to feel like a lock and long enough that the
   * shot has settled before anything can take him anywhere.
   */
  const settling = useRef(0)
  const camera = useThree((s) => s.camera)
  const viewport = useThree((s) => s.size)
  const area = useGame((s) => s.area)
  /** Only a re-render can put the marker in his hand, so subscribe to it. */
  const armed = useGame((s) => s.paintball !== null)
  const night = useGame((s) => s.night)
  /** The five locks: whether the lighthouse has given, which one door reads. */
  const lighthouseOpen = useGame((s) => s.lighthouseOpen)
  const firstPerson = useGame((s) => s.firstPerson)
  const handLight = useGame((s) => s.handLight)
  /** Her prompt only exists once she is down there, so it is subscribed. */
  const amaliaHere = useGame((s) => s.amaliaHere)
  /** The knee he is on and the ring in his hand are both renders, not frames. */
  const proposal = useGame((s) => s.proposal)
  const outfit = useGame((s) => s.outfit)
  /* Read here rather than in the trigger: the rack's prompt says "Put on"
     or "Hang up", so the target list has to change when the suit does. */
  const suited = useGame((s) => s.suited)
  /** Nothing stays alight out there, so the hand it was in is a render. */
  const swimming = useGame((s) => s.swimming)
  /** Who is in the room, and what is in it to walk into, both turn on it. */
  const christmas = useGame((s) => s.christmas)
  /**
   * In the decorated basement: the only place the meal can be called, and
   * the only place he is in a dinner jacket without having proposed to
   * anybody. Read by the clothes, the colliders, the roster and the frame.
   */
  const feasting = christmas && area === FEAST_AREA
  /**
   * In the lecture hall, where stepping up to the lectern gives the defence.
   * Read by the frame, which owns the slides, and by the roster, which is
   * where the class comes from.
   */
  const lecturing = area === LECTURE_AREA

  const position = useRef<[number, number]>([...PLAYER_START])
  const facing = useRef(Math.PI)
  const yaw = useRef(0)
  const motion = useRef<CharacterMotion>({ moving: false, speed: 0 })
  const camReady = useRef(false)
  const boom = useRef(1)
  /** Eased 0 to 1: how much of the shot belongs to the defence. */
  const podium = useRef(0)
  const spawnToken = useRef(-1)
  /** How long the current step-by-himself has been going. */
  const striding = useRef(0)
  /** Height above the ground, and its rate of change. */
  const hop = useRef({ y: 0, vy: 0 })
  /**
   * Where he has drifted to in orbit, and how fast, in world units.
   *
   * Its own thing rather than the walking position, because none of the
   * walking rules apply out here: there is no ground to stand on, no
   * collider to be pushed out of, and nothing to stop him. The stick is a
   * thruster - it adds velocity - and what slows him is a light drag rather
   * than the friction of feet on a floor.
   */
  const orbit = useRef({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 })
  /** Where his feet ride while he is in the water, eased as he wades out. */
  const swimFloor = useRef(0)
  /** The walk cycle the first-person head and hand ride on. */
  const stride = useRef(0)
  /** Eased 0 to 1: how much of a walk is in the view at this instant. */
  const gait = useRef(0)
  const hand = useRef<Group>(null)
  const handSwing = useRef<Group>(null)
  const lightSwing = useRef<Group>(null)
  /** Keeps the empty-hopper click from firing every frame. */
  const dryGap = useRef(0)
  const shadow = useRef<Mesh>(null)

  /**
   * What he is wearing.
   *
   * The tuxedo belongs to the proposal and wins over everything. On Christmas
   * Day in the decorated basement he is in the good suit — bottle green, red
   * bow tie, holly in the buttonhole — because he is the one hosting it, and
   * he is back in the red shirt the moment he leaves the room.
   */
  const wearing =
    outfit === 'tuxedo'
      ? { colors: TUXEDO, suit: true }
      : /* The pressure suit beats the good shirt: he is going up, and what
           he is wearing under it is nobody's business. */
        outfit === 'spacesuit'
        ? { colors: SPACESUIT, suit: false, spacesuit: true }
        : outfit === 'star'
          ? { colors: STAR_SHIRT, suit: false, starShirt: true }
          : feasting
            ? {
                colors: HOST_SUIT,
                suit: true,
                bowTie: HOST_BOW_TIE,
                buttonhole: HOST_BUTTONHOLE,
              }
            : { colors: PLAYER_COLORS, suit: false }

  const indoors = area !== 'island'
  const interior = indoors ? INTERIOR_BY_ID.get(area) : undefined

  /**
   * What he is carrying to see by, if anything. Both views read this.
   *
   * Nothing at all indoors: every room has its own lamps on after dark, and
   * a man who walks into his own kitchen holding a burning stick over his
   * head is a man with a problem no amount of light will fix.
   */
  const carrying =
    night &&
    !indoors &&
    outfit !== 'tuxedo' &&
    !swimming &&
    handLight !== 'none'
      ? handLight
      : undefined

  /** Rooms vary a lot in size, so the indoor lens scales with the floor. */
  const indoorCam = useMemo(() => {
    if (!interior) return null
    const reach = Math.max(interior.half[0], interior.half[1])
    return { distance: 12 + reach * 0.5, height: 11 + reach * 0.42 }
  }, [interior])

  // The bike, the basket and the boat all take the camera off us and none of
  // them knows about the first-person lens, so it goes back the way it was
  // found on the way out. Coming back remounts this and re-applies it.
  useEffect(
    () => () => {
      if (!('isPerspectiveCamera' in camera)) return
      camera.fov = LENS.third.fov
      camera.near = LENS.third.near
      camera.far = LENS.third.far
      camera.updateProjectionMatrix()
    },
    [camera],
  )

  /* ----------------------------- colliders ---------------------------- */

  const staticColliders = useMemo<Collider[]>(() => {
    if (interior) return interiorColliders(interior, christmas)
    return [...STATIC_COLLIDERS, ...PROP_COLLIDERS, ...TREE_COLLIDERS]
  }, [interior, christmas])

  /**
   * The day lasts as long as he is standing in the room. Walk out of the
   * basement and the calendar goes back to his birthday, so the egg is
   * something you find rather than something you leave switched on — and so
   * the rest of the house is never quietly empty because everybody is
   * downstairs at a meal you walked away from.
   */
  useEffect(() => {
    if (feasting) return
    clearFeast()
    const state = useGame.getState()
    if (state.christmas) state.resetCalendar()
  }, [feasting])

  /**
   * And the defence only lasts as long as he is in the hall. Walk out of it
   * mid-slide and the room empties, so coming back is giving it again from
   * the top rather than picking a lecture up halfway through.
   */
  useEffect(() => {
    if (lecturing) return
    // Out of the room altogether: nobody files anywhere, the hall is simply
    // empty again the next time it is walked into.
    emptyHall()
    useGame.getState().endLecture()
  }, [lecturing])

  const bounds = useMemo<Bounds>(
    () =>
      interior
        ? {
            kind: 'rect',
            hx: interior.half[0] - INTERIOR_MARGIN,
            hz: interior.half[1] - INTERIOR_MARGIN,
          }
        : {
            kind: 'circle',
            radius: ISLAND_WALK_RADIUS,
            // The one place the island lets him walk off the end of itself.
            jetty: DOCK_WALK,
          },
    [interior],
  )

  /** Characters standing in this area, so you cannot walk through them. */
  const actorIds = useMemo(
    () => residentsOf(area, christmas).map((n) => n.id),
    [area, christmas],
  )
  const actorColliders = useRef<Collider[]>([])
  /** Anyone on a night shift, who stops being solid while they square up. */
  const onWatch = useMemo(
    () =>
      new Set(
        residentsOf(area, christmas)
          .filter((n) => n.shift === 'night')
          .map((n) => n.id),
      ),
    [area, christmas],
  )

  /* --------------------------- interactions --------------------------- */

  const targets = useMemo<Target[]>(() => {
    const store = useGame.getState()
    const list: Target[] = []

    for (const npc of residentsOf(area, christmas)) {
      if (npc.shift && npc.shift !== (night ? 'night' : 'day')) continue
      list.push({
        id: npc.id,
        kind: 'npc',
        label: npc.name,
        verb: 'Talk to',
        x: npc.position[0],
        z: npc.position[1],
        live: npc.id,
        // A sentry holds you at arm's length and then some, so they have to
        // be worth talking to from where they put you.
        range: npc.shift ? 4.8 : 3.4,
        trigger: () => {
          const state = useGame.getState()
          sfx.confirm()
          const mission = npc.gives ? MISSION_BY_ID.get(npc.gives) : undefined
          const started = mission && state.missions[mission.id] === 'idle'
          const ongoing =
            mission &&
            state.missions[mission.id] === 'active' &&
            npc.missionLines

          // Somebody with a question asks it after their lines, until it is
          // answered right; from then on they go straight to the answer.
          const quiz = npc.quiz
          const settled = quiz && state.secrets[quiz.id]
          const asking = quiz && !settled && !ongoing
          const lines = ongoing
            ? npc.missionLines!
            : settled
              ? quiz.right
              : asking
                ? [...npc.lines, quiz.question]
                : npc.lines

          state.talk({
            speaker: npc.name,
            role: npc.role,
            lines,
            choices: asking
              ? quiz.choices.map((c) => ({
                  text: c.text,
                  lines: c.right ? quiz.right : quiz.wrong,
                  reveals:
                    c.right && quiz.journal
                      ? { id: quiz.id, ...quiz.journal }
                      : c.right
                        ? { id: quiz.id, title: npc.name, body: c.text }
                        : undefined,
                  journal:
                    c.right && quiz.journal
                      ? { id: quiz.id, ...quiz.journal, source: npc.name }
                      : undefined,
                }))
              : undefined,
          })
          if (npc.journal) {
            state.record({
              id: npc.id,
              title: npc.journal.title,
              body: npc.journal.body,
              source: npc.name,
            })
          }
          if (started) state.activateMission(mission.id)
        },
      })
    }

    if (!indoors) {
      for (const b of BUILDINGS) {
        /* The glass only slides while it would have let him in anyway — see
           game/doors.ts, which owns the rule and the reason for it. */
        const opens = autoOpens(b, { night, lighthouseOpen })
        list.push({
          id: b.id,
          kind: 'door',
          label: b.name,
          verb: 'Enter',
          x: b.door[0],
          z: b.door[1],
          range: b.sentries ? 7 : 4.2,
          auto: opens ? AUTO_DOOR_REACH : undefined,
          trigger: () => {
            const state = useGame.getState()
            if (b.closesAtNight && state.night) {
              if (b.sentries) {
                sfx.whistle()
                challenge(PLAYER_POS.x, PLAYER_POS.z)
              } else {
                sfx.cancel()
              }
              state.talk({
                speaker: b.name,
                role: 'Closed for the night',
                lines: b.closesAtNight,
              })
              return
            }
            if (b.locksWith && !state.lighthouseOpen) {
              const have = keyCount(state.keys)
              if (have < b.locksWith) {
                sfx.cancel()
                state.talk({
                  speaker: b.name,
                  role: 'Locked',
                  lines: [
                    `Five heavy locks, one for each district. ${have} of ${b.locksWith} keys turned.`,
                    'Every district building hides one. Ask the people who work there.',
                  ],
                })
                return
              }
              sfx.jingle()
              state.unlockLighthouse()
              state.talk({
                speaker: b.name,
                role: 'Unlocked',
                lines: [
                  'All five locks turn at once. The door gives with a long, dry groan.',
                  'Stairs spiral up into the light. Step inside.',
                ],
              })
              state.discover(b.id)
              return
            }
            sfx.confirm()
            state.enterBuilding(b.id)
          },
        })
      }

      // Aimed at the middle of the board rather than one face of it, so it
      // reads from whichever side you walk up on.
      list.push({
        id: 'games-board',
        kind: 'board',
        label: BOARD.label,
        verb: 'Read',
        x: BOARD.position[0],
        z: BOARD.position[1],
        range: 4.8,
        // Readable at any hour: three of the four want daylight and the
        // fourth wants the dark, and the board says which is which.
        trigger: () => useGame.getState().openArcade(),
      })

      // Only once she is actually down there, and tracked live: she does not
      // stay where she landed.
      if (amaliaHere) {
        list.push({
          id: AMALIA.id,
          kind: 'npc',
          label: AMALIA.name,
          verb: 'Talk to',
          x: AMALIA.position[0],
          z: AMALIA.position[1],
          live: AMALIA.id,
          range: 2.6,
          trigger: () => {
            const state = useGame.getState()
            sfx.confirm()
            // She has something else on her mind once there is a ring on
            // her hand, and it is not the dancefloor.
            const engaged = state.proposal === 'done'
            state.talk({
              speaker: AMALIA.name,
              role: engaged ? 'Engaged' : AMALIA.role,
              lines: engaged ? AMALIA.engaged : AMALIA.lines,
            })
          },
        })
      }

      list.push({
        id: 'party-button',
        kind: 'board',
        label: PARTY_BUTTON.label,
        verb: 'Press',
        x: PARTY_BUTTON.position[0],
        z: PARTY_BUTTON.position[1],
        range: 3.4,
        trigger: () => {
          const state = useGame.getState()
          if (!state.night) {
            sfx.cancel()
            state.talk({
              speaker: PARTY_BUTTON.label,
              role: 'Dead in daylight',
              lines: [
                'The dome lights, hums, and does nothing at all.',
                'A plate under it reads: AFTER DARK ONLY. Come back when the lamps are on.',
              ],
            })
            return
          }
          if (state.hide) {
            sfx.cancel()
            state.talk({
              speaker: PARTY_BUTTON.label,
              role: 'Not in the middle of a game',
              lines: [
                'Press it now and the whole island walks into the square to dance, which rather gives the game away.',
                'Finish the hide and seek first.',
              ],
            })
            return
          }
          state.toggleParty()
        },
      })

      for (const s of SIGNS) {
        list.push({
          id: s.id,
          kind: 'sign',
          label: s.label,
          verb: 'Read',
          x: s.position[0],
          z: s.position[1],
          range: 3,
          trigger: () => {
            sfx.confirm()
            const state = useGame.getState()
            state.talk({
              speaker: s.label,
              role: 'Signpost',
              lines: s.lines,
            })
            if (s.journal)
              state.record({
                id: s.id,
                title: s.journal.title,
                body: s.journal.body,
                source: s.label,
              })
          },
        })
      }
    }

    if (interior) {
      // A cellar has no front door of its own, so the accent comes off the
      // building it sits under rather than off a lookup that misses.
      const building = BUILDING_BY_ID.get(interior.building ?? interior.id)
      const accent = building?.accent ?? interior.accent

      /*
       * The suit on its rack. It is a target rather than an exhibit because
       * it opens no panel and files no journal entry - but it has to be in
       * this list all the same, because this list is what the keyboard
       * reaches. A thing you can only click is a thing half the visitors
       * cannot use.
       */
      if (interior.id === LAUNCH_AREA) {
        list.push({
          id: 'suit-rack',
          kind: 'exhibit',
          label: 'the pressure suit',
          /* The reactive value, not getState(): read through the store here
             and the verb would be frozen at whatever it was when the list
             was last built, so the rack would go on offering to put on a
             suit he is already wearing. */
          verb: suited ? 'Hang up' : 'Put on',
          x: SUIT_RACK[0],
          z: SUIT_RACK[1],
          /* Wide: the rack stands in an alcove set into the wall, so the
             floor he can actually reach it from starts a stride out. */
          range: 3.6,
          trigger: () => useGame.getState().toggleSuit(),
        })

        /*
         * And the button under the glass, for the same reason: it is the
         * whole point of the room, and a thing you can only click is a thing
         * half the visitors cannot press.
         *
         * It is offered whether or not he is suited. `beginLaunch` is what
         * refuses a man in shirtsleeves, and it refuses him out loud - so
         * the prompt appears, he presses it, and the deck tells him why not.
         * Hiding the prompt instead would leave him standing at a console
         * that does not admit the button is there.
         */
        list.push({
          id: 'launch-button',
          kind: 'exhibit',
          label: 'the launch button',
          verb: 'Press',
          x: CONSOLE[0],
          /* The button sits half a metre proud of the console's centre, on
             the side he stands at. */
          z: CONSOLE[1] + 0.5,
          range: 2.8,
          trigger: () => useGame.getState().beginLaunch(),
        })
      }

      for (const exhibit of interior.exhibits) {
        if (exhibit.kind === 'key') {
          list.push({
            id: exhibit.id,
            kind: 'key',
            label: exhibit.label,
            verb: 'Search',
            x: exhibit.position[0],
            z: exhibit.position[1],
            range: 2.8,
            trigger: () => {
              const state = useGame.getState()
              const key = exhibit.keyId
                ? KEY_BY_ID.get(exhibit.keyId)
                : undefined
              if (!key) return
              if (state.keys[key.id]) {
                sfx.cancel()
                state.talk({
                  speaker: 'Empty',
                  role: interior.name,
                  lines: ['You already took the key from here.'],
                })
                return
              }
              sfx.jingle()
              state.takeKey(key.id)
              state.talk({
                speaker: key.name,
                role: 'Key found',
                lines: [
                  `You lift the ${key.name.toLowerCase()} from ${exhibit.label}.`,
                  `${keyCount(state.keys) + 1} of 5 locks on the Old Lighthouse can turn now.`,
                ],
              })
            },
          })
          continue
        }

        // The calendar is not read, it is turned: taking it off the wall
        // opens the card that sets the day, and nothing else happens here.
        if (exhibit.kind === 'calendar') {
          list.push({
            id: exhibit.id,
            kind: 'exhibit',
            label: exhibit.label,
            verb: 'Check',
            x: exhibit.position[0],
            z: exhibit.position[1],
            range: 2.9,
            trigger: () => useGame.getState().openCalendar(),
          })
          continue
        }

        const toy = exhibit.kind === 'toy'
        list.push({
          id: exhibit.id,
          kind: toy ? 'toy' : 'exhibit',
          label: exhibit.label,
          verb: toy ? 'Look at' : 'Examine',
          x: exhibit.position[0],
          z: exhibit.position[1],
          // The technology wall is a wall, not an object: it runs most of the
          // room, so it answers from anywhere along its length rather than
          // only from the one point its position names.
          range: exhibit.kind === 'techWall' ? TECH_WALL_REACH : 2.9,
          trigger: () => examine(exhibit, accent, interior.name),
        })
      }

      // Doors and stairs are walked through rather than pressed — see the
      // thresholds in the frame loop. The one that does not open is the one
      // thing here worth a prompt: you try the handle.
      for (const link of interior.links ?? []) {
        if (link.kind !== 'locked') continue
        list.push({
          id: link.id,
          kind: 'door',
          label: link.label,
          verb: 'Try',
          x: link.position[0],
          z: link.position[1],
          range: 2.9,
          trigger: () => {
            sfx.cancel()
            useGame.getState().talk({
              speaker: 'Locked',
              role: interior.name,
              lines: link.lines ?? ['It does not open.'],
            })
          },
        })
      }
    }

    void store
    return list
  }, [
    area,
    indoors,
    interior,
    amaliaHere,
    night,
    lighthouseOpen,
    christmas,
    /* The rack's own verb reads off this, so the prompt has to be rebuilt
       when it changes: otherwise it offers to put on a suit he is wearing. */
    suited,
  ])

  /* ------------------------------- frame ------------------------------ */

  useFrame((frame, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05)
    // The clock the water is drawn off, so the swell he floats on and the
    // swell you can see him floating on are the same swell.
    const clock = frame.clock.elapsedTime
    const store = useGame.getState()
    const active = isInteractive(store.mode)

    // Teleports: entering a building, leaving one, or travelling from the map.
    if (store.spawn.token !== spawnToken.current) {
      spawnToken.current = store.spawn.token
      position.current[0] = store.spawn.position[0]
      position.current[1] = store.spawn.position[1]
      camReady.current = false
      boom.current = 1
      // However he got somewhere else — a door, the map — he arrives dry.
      dryOff()
      // And on a threshold he has to step off before it can take him back,
      // with a moment's grace on top while the camera comes round.
      offThreshold.current = false
      offDoorstep.current = false
      settling.current = ARRIVAL_SETTLE
      if (store.area !== 'island') {
        yaw.current = 0
        facing.current = store.spawn.facing ?? Math.PI
      }
    }

    /** True only while a paintball match is actually being fought. */
    const fight = ARENA.active && store.paintball?.status === 'playing'
    /** And while a game of hide and seek is out there in the dark. */
    const hunting = HIDE.active && store.hide?.status === 'playing'
    const crouching = fight && active && isCrouching()
    motion.current.crouching = crouching
    dryGap.current = Math.max(0, dryGap.current - delta)

    const cam = indoorCam ?? (fight ? FIGHT_CAM : OUTDOOR_CAM)

    const turn = active ? readCameraTurn() : 0
    yaw.current += turn * delta * 1.8

    const move = active ? readMove() : { x: 0, y: 0, run: false }
    const magnitude = Math.hypot(move.x, move.y)
    const speed = crouching
      ? CROUCH_SPEED
      : SWIM.afloat
        ? move.run
          ? SWIM_SPRINT
          : SWIM_SPEED
        : indoors
          ? INDOOR_SPEED
          : move.run
            ? RUN_SPEED
            : WALK_SPEED

    // Live colliders for anyone walking around this area. A sentry stepping
    // into your path is not a wall to be shoved along — the line they are
    // holding does that, and two of them jostling would walk you backwards
    // out of range of everything worth talking to.
    actorColliders.current = actorIds.flatMap((id) => {
      if (GUARD.left > 0 && onWatch.has(id)) return []
      const p = ACTOR_POS.get(id)
      return p ? [{ x: p.x, z: p.z, hx: 0.7, hz: 0.7, circle: true }] : []
    })

    /*
     * A step he takes by himself: into the lift car, and out of it again.
     *
     * It runs ahead of the ordinary walk and returns, so the controls stay
     * out of his hands for the length of it — `isInteractive` is already
     * false in lift mode, so there is no input to fight with, but the walk
     * cycle and the facing still have to be driven or he slides in rigid.
     */
    if (store.stride) {
      const [tx, tz] = store.stride.to
      const dx = tx - position.current[0]
      const dz = tz - position.current[1]
      const gap = Math.hypot(dx, dz)
      striding.current += delta

      if (gap <= STRIDE_REACHED || striding.current >= STRIDE_TIMEOUT) {
        /* Only snap onto the mark if he actually got there; a step given up
           on leaves him where he stands rather than through a wall. */
        if (gap <= STRIDE_REACHED) {
          position.current[0] = tx
          position.current[1] = tz
        }
        striding.current = 0
        motion.current.moving = false
        motion.current.speed = 0
        if (store.stride.facing !== undefined) {
          let diff = store.stride.facing - facing.current
          while (diff > Math.PI) diff -= Math.PI * 2
          while (diff < -Math.PI) diff += Math.PI * 2
          facing.current += diff * Math.min(1, delta * 10)
        }
        store.endStride()
      } else {
        const step = Math.min(gap, STRIDE_SPEED * delta)
        position.current[0] += (dx / gap) * step
        position.current[1] += (dz / gap) * step

        /* He faces the way he is walking, which on the way in is the back of
           the car and on the way out is the room. */
        const desired = Math.atan2(dx, dz)
        let diff = desired - facing.current
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        facing.current += diff * Math.min(1, delta * 12)

        motion.current.moving = true
        motion.current.speed = STRIDE_SPEED
      }
    } else if (magnitude > 0.02) {
      const sin = Math.sin(yaw.current)
      const cos = Math.cos(yaw.current)
      const dx = cos * move.x - sin * move.y
      const dz = -sin * move.x - cos * move.y

      position.current[0] += dx * speed * delta
      position.current[1] += dz * speed * delta
      resolveCollisions(
        position.current,
        PLAYER_RADIUS,
        [...staticColliders, ...actorColliders.current],
        // In the water the island's edge is not his edge any more.
        SWIM.active ? SWIM_BOUNDS : bounds,
        hop.current.y,
      )

      const desired = Math.atan2(dx, dz)
      let diff = desired - facing.current
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      facing.current += diff * Math.min(1, delta * 14)

      motion.current.moving = true
      motion.current.speed = speed * magnitude
      if (!store.hasMoved) store.markMoved()
    } else {
      motion.current.moving = false
      motion.current.speed = 0
    }

    // In the candles he is looking at her: he turns to watch her come up
    // the beach, stays facing her on one knee, and keeps facing her while
    // the two of them stand in the ring afterwards.
    //
    // Out of the candles he stops, and this is why: out there her station is
    // his own shoulder, so turning to face her moves it, which turns him
    // again. A man who keeps facing the woman at his shoulder is a man
    // walking in circles with her going round him.
    if (PROPOSE.active && !together() && !motion.current.moving) {
      const look = Math.atan2(
        PROPOSE.her.x - position.current[0],
        PROPOSE.her.z - position.current[1],
      )
      let turn = look - facing.current
      while (turn > Math.PI) turn -= Math.PI * 2
      while (turn < -Math.PI) turn += Math.PI * 2
      facing.current += turn * Math.min(1, delta * 3)
    }

    // A guarded gate is held whether you are moving or not — walk up on one
    // after dark and they whistle; keep pushing and they keep pushing back.
    if (!indoors && holdTheLine(position.current, delta, store.night)) {
      sfx.whistle()
    }

    // He hosts the Christmas meal, so he is the one who starts it: walking up
    // to the head of the table calls everybody out of their conversations and
    // lays it. Walking away puts the room back to people talking.
    if (feasting) {
      if (stepFeast(position.current[0], position.current[1])) {
        if (!FEAST.seated) sfx.blip()
      }
      // And once the last of them is actually standing at their place, the
      // toast. Both of these guard themselves, so asking every frame is free.
      if (wholeTable()) store.cheerFeast()
      else store.endCheer()
    }

    // The thesis defence. Stepping up behind the lectern brings the class in
    // and starts the slides; stepping away from it empties the hall again.
    if (lecturing) {
      if (stepLecture(position.current[0], position.current[1], delta)) {
        if (LECTURE.active) sfx.confirm()
        else store.endLecture()
      }
      if (LECTURE.active) store.setLecture(LECTURE.slide, LECTURE.applauding)
    }

    // Stand still on the floor with the music on and he joins in.
    motion.current.dance =
      PARTY.active &&
      !indoors &&
      !motion.current.moving &&
      onFloor(position.current[0], position.current[1])
        ? 1
        : 0

    // Walking into the middle of the floor calls her down.
    if (
      PARTY.active &&
      !indoors &&
      !store.amaliaHere &&
      atCentre(position.current[0], position.current[1])
    ) {
      store.callAmalia()
    }

    const [px, pz] = position.current

    // --- Jump, and the one way off the end of the jetty ----------------
    // Three quick taps of it while he is stood over water and the third one
    // goes over the side instead of straight back up. Not mid-match, and
    // not mid-game of hide and seek: the sea is not a hiding place.
    if (
      active &&
      !fight &&
      !hunting &&
      !SWIM.active &&
      consumeTripleJump() &&
      overWater(px, pz)
    ) {
      // That third tap is the dive, not another hop.
      consumeJump()
      // And the dive is handed to the hop: his feet are already a way above
      // the water, so it only has to be told how far above, and gravity
      // does the rest of the arc for nothing.
      const landing = waterFloor(px, pz, clock)
      hop.current.y = groundHeight(px, pz) + hop.current.y - landing
      hop.current.vy = DIVE_SPRING
      swimFloor.current = landing
      diveIn()
      store.record({
        id: 'dock-swim',
        title: 'Off the end of the jetty',
        body: 'Two hops on the planks and the third one over the side. The water is colder than it looks, the whole coast is yours to swim, and any beach will take you back.',
        source: 'The dock',
      })
    }
    // Space throws paint during a match, so hopping sits it out. So does
    // being out of your depth, where there is nothing to jump off.
    if (
      active &&
      !fight &&
      !SWIM.afloat &&
      consumeJump() &&
      hop.current.y <= 0.001
    ) {
      hop.current.vy = JUMP_SPEED
      sfx.hop()
    }
    if (hop.current.vy !== 0 || hop.current.y > 0) {
      hop.current.vy -= GRAVITY * delta
      hop.current.y += hop.current.vy * delta
      if (hop.current.y <= 0) {
        hop.current.y = 0
        hop.current.vy = 0
        // The end of a dive is the only landing that is not on something.
        if (SWIM.falling) {
          SWIM.falling = false
          sfx.splash()
        }
      }
    }

    /* ---------------------- where his feet are ---------------------- */

    let floor: number
    if (interior) {
      floor = interiorFloor(interior, px, pz)
    } else if (SWIM.active) {
      // The sea bed rather than the ground, so the jetty overhead is not a
      // floor he can surface through — the way out of the water is a beach.
      SWIM.afloat = deepEnough(px, pz) && !SWIM.falling
      // Standing up out of the shallows takes a moment rather than a frame,
      // which is the whole of wading ashore.
      const wanted = waterFloor(px, pz, clock)
      swimFloor.current += SWIM.falling
        ? wanted - swimFloor.current
        : (wanted - swimFloor.current) * Math.min(1, delta * 5)
      floor = swimFloor.current
      if (!SWIM.afloat && Math.hypot(px, pz) <= ASHORE) dryOff()
    } else {
      floor = groundHeight(px, pz)
    }
    motion.current.airborne = hop.current.y > 0.02 && !SWIM.afloat
    motion.current.swimming = SWIM.afloat ? 1 : 0
    // Twice a swim, so what is in his hand can be a render rather than a
    // frame: there is nothing in it out here.
    if (store.swimming !== SWIM.afloat) store.setSwimming(SWIM.afloat)

    const py = floor + hop.current.y
    PLAYER_POS.set(px, py, pz)
    PLAYER_VIEW.yaw = yaw.current
    PLAYER_VIEW.facing = facing.current

    /* --------------------------- paintball -------------------------- */

    if (fight) {
      // Standing still he squares up with the camera, so Q and R aim him
      // without having to walk a circle first.
      if (!motion.current.moving) {
        let square = yaw.current + Math.PI - facing.current
        while (square > Math.PI) square -= Math.PI * 2
        while (square < -Math.PI) square += Math.PI * 2
        facing.current += square * Math.min(1, delta * 6)
      }

      const game = store.paintball!
      if (game.reloadAt !== null && Date.now() >= game.reloadAt) {
        store.finishReload()
        sfx.reload()
      }

      // Down behind cover you cannot shoot out of it, and nothing leaves a
      // marker until the whistle goes.
      if (active && consumeFire() && ARENA.fireGap <= 0 && canFire(crouching)) {
        if (game.ammo > 0 && game.reloadAt === null) {
          // The marker leads the nearest enemy inside the aim cone, so a
          // third-person camera does not need a mouse to aim.
          const shot = aimAt(px, pz, facing.current)
          playerFire(
            px,
            pz,
            shot.angle,
            firstPerson
              ? {
                  y: py + EYE_HEIGHT - FP_GUN.drop,
                  ahead: FP_GUN.ahead,
                  lateral: FP_GUN.right,
                }
              : HIP_MUZZLE,
          )
          facing.current = shot.angle
          store.fireRound()
          sfx.pop()
          motion.current.recoil = 0.14
        } else if (dryGap.current <= 0) {
          sfx.dry()
          dryGap.current = 0.6
        }
      }
    }

    if (group.current) {
      /*
       * In orbit there is no floor and no down. He comes off the deck and
       * turns slowly with nothing holding him, which is the whole of what
       * says the engines are out - and the stick pushes him about the cabin
       * while the credits play, because being held still through a credits
       * roll is the difference between an ending and a cutscene.
       */
      if (store.mode === 'orbit') {
        const o = orbit.current
        const since = clock - (store.launch?.started ?? clock)

        /*
         * The stick is a thruster: it adds speed rather than setting it.
         *
         * Read here rather than taken from `move` above, which is zeroed
         * out of `explore` - the walk is not his in orbit and should not
         * be, but the drift is, and this is the one place that distinction
         * has to be made by hand.
         */
        const stick = readMove()
        const push = 2.6 * delta
        /* Screen-relative rather than facing-relative: he is tumbling, and
           steering by the way his feet happen to be pointing is unusable. */
        o.vx += stick.x * push
        o.vz += stick.y * push
        /* Run takes him up. There is nothing to sprint towards out here and
           the key is otherwise idle, so it is the one that rises. */
        if (stick.run) o.vy += push

        /* A light drag, so a nudge coasts a long way and he still comes to
           rest eventually. Nothing here is frame-rate dependent: the decay
           is raised to the elapsed time rather than multiplied by it. */
        const drag = Math.pow(0.22, delta)
        o.vx *= drag
        o.vy *= drag
        o.vz *= drag

        o.x += o.vx * delta
        o.y += o.vy * delta
        o.z += o.vz * delta

        /* Held inside the cabin. He is in a room, however weightless. */
        const REACH = 3.4
        o.x = Math.max(-REACH, Math.min(REACH, o.x))
        o.z = Math.max(-REACH, Math.min(REACH, o.z))
        o.y = Math.max(-0.6, Math.min(2.6, o.y))

        group.current.position.set(
          px + o.x + Math.sin(since * 0.31) * 0.28,
          py + 0.9 + o.y + Math.sin(since * 0.43) * 0.2,
          pz + o.z + Math.cos(since * 0.26) * 0.24,
        )
        /* A slow tumble on all three axes, leaned into whichever way he is
           thrusting. A man with nothing under his feet does not stay
           upright, and holding him level is the one thing that would make
           the float read as standing on glass. */
        group.current.rotation.set(
          Math.sin(since * 0.23) * 0.22 - o.vz * 0.12,
          facing.current + since * 0.16,
          Math.sin(since * 0.19) * 0.3 - o.vx * 0.12,
        )
      } else {
        /* Back on the ground: forget where he floated to, so a second
           flight does not start half a room out of position. */
        if (orbit.current.x !== 0) {
          orbit.current = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 }
        }
        group.current.position.set(px, py, pz)
        group.current.rotation.set(0, facing.current, 0)
      }
    }
    // The blob shadow stays on the ground and shrinks as he rises. In the
    // water there is nothing under him for it to fall on. Weightless there
    // is nothing under him at all.
    if (shadow.current) {
      shadow.current.visible = !SWIM.afloat && store.mode !== 'orbit'
      shadow.current.position.y = 0.03 - hop.current.y
      const shrink = Math.max(0.45, 1 - hop.current.y * 0.28)
      shadow.current.scale.setScalar(shrink)
    }

    // Walking near a building counts as finding it, for fast travel.
    if (!indoors) {
      for (const b of BUILDINGS) {
        if (Math.hypot(px - b.position[0], pz - b.position[1]) < 34) {
          store.discover(b.id)
        }
      }
    }

    /* ---------------------------- camera ---------------------------- */

    // Out of his eyes. The boom, the occlusion probe and the framing are all
    // answers to "where do I stand to see him", and none of them apply when
    // the answer is "inside his head" — so this takes the whole block.
    if (group.current) group.current.visible = !firstPerson
    if (hand.current) hand.current.visible = firstPerson

    const lens = firstPerson ? LENS.first : LENS.third
    if (
      'isPerspectiveCamera' in camera &&
      (camera.fov !== lens.fov || camera.near !== lens.near)
    ) {
      camera.fov = lens.fov
      camera.near = lens.near
      camera.far = lens.far
      camera.updateProjectionMatrix()
    }

    if (firstPerson) {
      // The walk cycle. Two footfalls to a stride, so the head rises and
      // falls at twice the rate it swings side to side, which is what stops
      // a bob reading as a bounce on a pogo stick.
      const pace = motion.current.moving ? motion.current.speed : 0
      stride.current += delta * pace * 0.62
      // Eased, and slower settling than starting. Reading the speed straight
      // off meant that stopping stopped the swing dead in whatever position
      // the stride happened to have reached, which is the one moment you are
      // standing still enough to notice it.
      const want = Math.min(1, pace / WALK_SPEED)
      gait.current +=
        (want - gait.current) *
        Math.min(1, delta * (want > gait.current ? 7 : 3.2))
      const walk = gait.current
      const heave = Math.sin(stride.current * 2) * BOB * walk
      const roll = Math.sin(stride.current) * SWAY * walk

      const eye = py + (SWIM.afloat ? SWIM_EYE : EYE_HEIGHT) + heave
      // The third-person camera sits behind him at +yaw and looks back, so
      // his own view runs the other way down the same axis.
      const look = yaw.current
      camera.position.set(px, eye, pz)
      // Level, and only the eye height moves. Pitching the aim as well as
      // lifting the head doubled the same motion up and read as swimming.
      camera.lookAt(px - Math.sin(look) * 12, eye, pz - Math.cos(look) * 12)
      // A step lands and the horizon tips a little with it.
      camera.rotateZ(roll)

      // What he is carrying, held where you would hold it: out of the way of
      // the middle of the screen, and riding the same stride.
      if (hand.current) {
        hand.current.position.copy(camera.position)
        hand.current.quaternion.copy(camera.quaternion)
      }
      const swing = Math.sin(stride.current) * walk
      const lean = Math.cos(stride.current) * walk
      if (handSwing.current) {
        handSwing.current.rotation.x = swing * HELD_SWING.x
        handSwing.current.rotation.z = lean * HELD_SWING.z
      }
      if (lightSwing.current) {
        lightSwing.current.rotation.x = swing * LIGHT_SWING.x
        lightSwing.current.rotation.z = lean * LIGHT_SWING.z
      }

      // So that stepping back out of his eyes cuts rather than sweeps.
      camReady.current = false
    } else {
      // A zoom key or button being leaned on runs the boom in or out. The
      // tap that starts it has already moved one notch on the way down.
      if (active) zoomBy(readZoomHold(delta))

      const zoom = cameraZoom.level
      const dolly = cam.distance * zoom
      const rise = cam.height * zoom

      let span = 1
      if (!indoors) {
        const probe = probeCamera(
          px,
          py + 1.5,
          pz,
          Math.sin(yaw.current) * dolly,
          rise - 1.5,
          Math.cos(yaw.current) * dolly,
        )
        span = probe.span
        if (probe.blocker && turn === 0) {
          const ax = px - probe.blocker.x
          const az = pz - probe.blocker.z
          const len = Math.hypot(ax, az)
          if (len > 0.05) {
            let swing = Math.atan2(ax / len, az / len) - yaw.current
            while (swing > Math.PI) swing -= Math.PI * 2
            while (swing < -Math.PI) swing += Math.PI * 2
            yaw.current +=
              Math.sign(swing) * Math.min(Math.abs(swing), delta * 2.6)
          }
        }
      }
      boom.current +=
        (span - boom.current) *
        Math.min(1, delta * (span < boom.current ? 9 : 3))

      const aspect = viewport.width / Math.max(1, viewport.height)
      const framing = Math.min(1.32, Math.max(1, 1 + (1.15 - aspect) * 0.42))

      // Giving the defence, the camera stops being about him.
      //
      // The whole of what is happening is in front of him — a class at its
      // desks, and at the end of it a room on its feet — and a lens trained
      // on the back of the speaker's head puts all of it off the bottom of
      // the screen. So while he is at the lectern the camera pulls back and
      // looks at the middle of the room instead, far enough up the hall to
      // hold the board behind him and the back row in the same frame. It
      // eases in and out with everything else, so stepping up to the lectern
      // is a shot opening out rather than a cut.
      const stage = LECTURE.active ? 1 : 0
      podium.current += (stage - podium.current) * Math.min(1, delta * 2)
      const show = podium.current

      const reach = dolly * framing * boom.current * (1 + show * 0.5)
      const targetX = px + Math.sin(yaw.current) * reach
      const targetZ = pz + Math.cos(yaw.current) * reach
      // Track the ground, not the hop, so the camera does not bounce.
      const targetY =
        py -
        hop.current.y +
        rise * framing * (0.72 + 0.28 * boom.current) * (1 + show * 0.34)

      if (!camReady.current) {
        camera.position.set(targetX, targetY, targetZ)
        camReady.current = true
      }
      const ease = 1 - Math.pow(0.0015, delta)
      camera.position.x += (targetX - camera.position.x) * ease
      camera.position.y += (targetY - camera.position.y) * ease
      camera.position.z += (targetZ - camera.position.z) * ease
      // And what it is pointed at slides off him and down the hall, to a
      // point between the lectern and the back of the class.
      const aimZ = pz + show * (LECTURE_LOOK - pz)
      camera.lookAt(px, py - hop.current.y + 1.4, aimZ)
    }

    /* -------------------------- thresholds -------------------------- */

    // Indoors, doors and stairs are taken by walking into them: into the
    // reveal of a door, onto the head of a flight, into the well of a
    // stairwell, or out through the front doorway. A threshold only fires
    // once he has stepped clear of every threshold since he arrived, so
    // coming out of one door never drops him straight back through it.
    if (settling.current > 0) settling.current -= delta
    if (interior && active && !fight && !hunting && settling.current <= 0) {
      let through: InteriorLink | 'out' | null = null
      for (const link of interior.links ?? []) {
        /* Shut is shut: a way that has to be opened is only walkable while
           it is standing open on this visit, which is what the wall in front
           of you is already showing. */
        if (link.needs && store.swung[link.needs] !== store.spawn.token)
          continue
        if (linkReached(link, px, pz)) {
          through = link
          break
        }
      }
      if (!through && !interior.building && doorwayReached(interior, px, pz))
        through = 'out'

      if (!through) offThreshold.current = true
      else if (offThreshold.current) {
        offThreshold.current = false
        if (through === 'out') {
          sfx.cancel()
          store.leaveBuilding()
        } else {
          takeLink(interior, through)
        }
        return
      }
    }

    /* -------------------------- interaction ------------------------- */

    // Nobody stops mid-match to read a signpost, and nobody ducks indoors
    // in the middle of hide and seek — every door on the island is shut for
    // the duration, and a face in a doorway would give the game away.
    if (fight || hunting) {
      store.setNearby(null)
      consumeInteract()
      return
    }

    let best: Target | null = null
    let bestDist = Infinity
    for (const t of targets) {
      const live = t.live ? ACTOR_POS.get(t.live) : undefined
      const tx = live?.x ?? t.x
      const tz = live?.z ?? t.z
      const d = Math.hypot(px - tx, pz - tz)
      if (d < t.range && d < bestDist) {
        best = t
        bestDist = d
      }
    }

    if (active) {
      /*
       * A door on a sensor opens, and that is the whole of what it does.
       *
       * It used to take him in as well: walk inside the reach and the lobby
       * replaced the plaza, with a scripted step across the threshold in
       * between. Both halves of that are gone. The sensor's only job now is
       * to stand the glass open — the walk through it is his, on the controls
       * he already had — so the reach is read here purely to mark the door as
       * sensing, and `silent` carries that to the leaves and the prompt.
       *
       * He is still admitted at the doorstep rather than at sensor range, and
       * still held to the two rules the thresholds indoors are held to: he
       * must have stepped clear since he last arrived, and the camera must
       * have settled. Coming out of a building puts him squarely on its
       * doorstep, and without them the lobby would swallow him straight back.
       */
      const sensing =
        best !== null && best.auto !== undefined && bestDist < best.auto
      /* Inside the glass itself, not merely inside the sensor's notice. */
      const crossing = sensing && bestDist < DOOR_ADMIT
      if (!crossing) offDoorstep.current = true
      else if (offDoorstep.current && settling.current <= 0) {
        offDoorstep.current = false
        store.setNearby(null)
        consumeInteract()
        best!.trigger()
        return
      }

      store.setNearby(
        best
          ? {
              id: best.id,
              kind: best.kind,
              label: best.label,
              verb: best.verb,
              blocked: best.kind === 'door' && shutDoor(best.id, store),
              /* Nothing to press, and the leaves read this to know to open:
                 only a door actually within its own reach is sensing. */
              silent: sensing || undefined,
            }
          : null,
      )
      if (consumeInteract() && best) best.trigger()
    } else {
      consumeInteract()
    }
  })

  return (
    <>
      {/* The wake the star shirt leaves. Outside the player's own group on
          purpose: a spark that has been shed belongs to the island, so it
          stays where it fell rather than being carried along and swung round
          as he turns. It reads `group` for where to shed the next one. */}
      <StarTrail motion={motion} at={group} on={outfit === 'star'} />

      <group ref={group}>
        <Character
          {...wearing}
          motion={motion}
          // Down on one knee from the moment she arrives until she has
          // answered; the ring is in his hand until it is on hers.
          pose={
            proposal === 'asking' || proposal === 'yes' ? 'kneel' : undefined
          }
          ring={proposal === 'asking'}
          gun={armed}
          gunColor={PAINT.player}
          kit={armed ? PAINT.player : undefined}
          bouquet={outfit === 'tuxedo'}
          // Happy, from the moment she is called down.
          smile={amaliaHere}
          // Both hands are full at his own dance.
          hand={carrying}
          danceStyle={amaliaHere ? 3 : undefined}
        />
        {/* Soft blob shadow so the player never looks like it floats. */}
        <mesh
          ref={shadow}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.03, 0]}
        >
          <circleGeometry args={[0.55, 16]} />
          <meshBasicMaterial color="#2a4a22" transparent opacity={0.22} />
        </mesh>
      </group>
      <FirstPersonHeld
        root={hand}
        swing={handSwing}
        lightSwing={lightSwing}
        carrying={carrying}
        armed={armed}
      />
    </>
  )
}

/**
 * What he is holding, drawn straight to the camera when you are behind his
 * eyes: the torch or flashlight he is carrying, and the marker if there is a
 * match on. No arm and no fist — an arm across the bottom of the screen is
 * one of those things that reads as clutter rather than as your own body.
 *
 * It is parented to nothing. The frame loop copies the camera's own position
 * and rotation onto it, and the inner group rides the same stride the head
 * does, so what you are carrying moves as you walk.
 */
function FirstPersonHeld({
  root,
  swing,
  lightSwing,
  carrying,
  armed,
}: {
  root: RefObject<Group | null>
  swing: RefObject<Group | null>
  lightSwing: RefObject<Group | null>
  carrying?: HandLight
  armed: boolean
}) {
  return (
    <group ref={root} visible={false}>
      {/* Two pivots rather than one, so a beam can be given a gentler ride
          than a gun without either of them losing the stride. */}
      {carrying && (
        <group ref={lightSwing}>
          <group
            position={
              carrying === 'torch' ? [0.4, -0.78, -0.5] : [0.34, -0.4, -0.4]
            }
            rotation={carrying === 'torch' ? [0.14, 0, -0.12] : [0, Math.PI, 0]}
          >
            <HandLightRig kind={carrying} />
          </group>
        </group>
      )}
      {armed && (
        <group ref={swing}>
          {/* Turned a quarter forward and rolled upright: the marker is built
              hanging barrel-down off a shoulder, and here it is being aimed. */}
          <group
            position={[FP_GUN.right, -0.3, 0]}
            rotation={[Math.PI / 2, Math.PI, 0]}
          >
            <Marker accent={PAINT.player} />
          </group>
        </group>
      )}
    </group>
  )
}
