/**
 * The trailer, shot by shot, and the music and the words that go with it.
 *
 * Everything is measured in bars of the island's own soundtrack (see cut.ts),
 * and the four pieces it uses change on bar lines that are also cuts: the
 * island's airy opening under the title, its own tune through the day, the
 * party for the night and the games, and the flight deck's fanfare for the
 * lighthouse. The fanfare resolves on the bar the end card comes up on.
 *
 * A shot sets the island up the way it wants it, from a clean slate — the
 * director stops whatever the last shot left running — and then either
 * flies its own camera or leaves the lens to the game, which is how the
 * dialogue, the map, the games and his own eyes are shown as they play.
 */
import type { Cue } from '../radio/music'
import { ACTOR_POS } from '../npc/actors'
import { BOARD } from '../arcade/minigames'
import { BUILDINGS, KEYS } from '../island/world'
import { MOTO, pointAt } from '../moto/motoLogic'
import { BALLOON } from '../balloon/balloonLogic'
import { RESCUE } from '../rescue/rescue'
import { PODIUM } from '../lecture/lecture'
import { NOTICE } from '../launch/revealLogic'
import { PLAYER_POS } from '../player/playerLogic'
import { useGame } from '../../shared/state/store'
import type { Vec2 } from '../../types'
import { BAR } from './cut'
import {
  follow,
  glide,
  mix,
  orbit,
  watch,
  type Move,
  type Subject,
  type Vec3,
} from './moves'
import {
  face,
  hold,
  once,
  press,
  put,
  steer,
  stick,
  walk,
  type Memo,
} from './direct'

export interface Shot {
  /** Names it in the recorder's log and on its stills. */
  id: string
  /** How long it holds, in bars of the music. */
  bars: number
  /** After dark, and with the square dancing, or not. Day and quiet unless said. */
  night?: boolean
  party?: boolean
  /** Puts the island in order for it, once, before the lead. */
  setup?: () => void
  /**
   * Seconds the island runs before the shot is recorded, so it opens on
   * something already moving rather than on a standing start.
   */
  lead?: number
  /** A move of the director's, or nothing to leave the lens to the game. */
  camera?: Move
  /**
   * What the camera keeps in shot, when it is not him on foot: the bike, the
   * basket, the boat. Their headings live with them, not with him.
   */
  subject?: () => Subject
  /** Every frame: seconds into the shot (negative through the lead). */
  act?: (time: number, memo: Memo) => void
  /** How much of the game's own interface stays on screen. */
  ui?: 'clean' | 'talk' | 'keys' | 'map'
}

export interface Card {
  id: string
  kind: 'title' | 'caption' | 'end'
  /** Bars, on the trailer's own clock rather than any one shot's. */
  from: number
  to: number
  kicker?: string
  text?: string
  /** Captions sit low unless the shot has something of its own down there. */
  place?: 'top'
}

const ALL_KEYS = Object.fromEntries(KEYS.map((k) => [k.id, true as const]))
/** Every key but the one he is about to find. */
const FOUR_KEYS = Object.fromEntries(
  KEYS.filter((k) => k.id !== 'key-house').map((k) => [k.id, true as const]),
)
const ALL_FOUND = Object.fromEntries(
  BUILDINGS.map((b) => [b.id, true as const]),
)

const game = () => useGame.getState()

/**
 * Where the Mayor turned out to be when his shot came round, and the side he
 * was walked up to from. He walks a loop of the square all day, so his shot
 * is set up wherever he has got to rather than at a spot fixed in advance.
 */
const meeting = { at: [8, 10] as Vec2, side: [1, 0] as Vec2 }

/** The two of them side on, closing in a little as he talks. */
const twoShot: Move = (t) => {
  const [mx, mz] = meeting.at
  const [sx, sz] = meeting.side
  const cx = mx + sx * 1
  const cz = mz + sz * 1
  const d = mix(7, 5.4, t)
  return {
    position: [cx - sz * d + sx * 1.2, 2.5, cz + sx * d + sz * 1.2],
    target: [cx, 1.25, cz],
    fov: 38,
  }
}

/**
 * How far into the lighthouse coming apart the trailer lets it get: the mark
 * going up over his head, and not a frame of what follows. The hull is drawn
 * from the very first instant of the shed, bands or no bands, so the only
 * safe place to stop is inside the moment he notices.
 */
const NOTICED = NOTICE - 0.05

/** The lighthouse door, and the way it faces: out towards the square. */
const DOOR: Vec2 = [-62.5, -59]
const OUT: Vec2 = [Math.SQRT1_2, Math.SQRT1_2]
const doorstep = (out: number, across = 0): Vec2 => [
  DOOR[0] + OUT[0] * out + OUT[1] * across,
  DOOR[1] + OUT[1] * out - OUT[0] * across,
]
/** The same, off the ground. */
const byDoor = (out: number, across: number, y: number): Vec3 => {
  const [x, z] = doorstep(out, across)
  return [x, y, z]
}

/** The bike, the basket and the boat, as something a camera can follow. */
const riding = (heading: () => number) => (): Subject => ({
  x: PLAYER_POS.x,
  y: PLAYER_POS.y,
  z: PLAYER_POS.z,
  facing: heading(),
})

/**
 * Rides the circuit flat out, steering for a point a little way down the
 * line the way the other riders do. The bars turn the bike the opposite way
 * to the heading's sign, hence the minus.
 */
function ride() {
  const ahead = pointAt(MOTO.progress + 16)
  let off = Math.atan2(ahead.x - MOTO.x, ahead.z - MOTO.z) - MOTO.heading
  while (off > Math.PI) off -= Math.PI * 2
  while (off < -Math.PI) off += Math.PI * 2
  stick(Math.max(-1, Math.min(1, -off * 2.4)), 0)
  hold.ride.gas = true
}

export const SHOTS: Shot[] = [
  /* ------------------------------ the title ------------------------------ */

  {
    id: 'opening',
    bars: 2,
    setup: () => put('island', [0, 30]),
    camera: orbit({
      center: [0, 0, -4],
      radius: [330, 268],
      height: [215, 152],
      from: 0.15,
      to: 0.6,
      aim: [0, -6],
    }),
  },

  /* ------------------------------- the day ------------------------------- */

  {
    id: 'plaza',
    bars: 2,
    setup: () => put('island', [-1, 42]),
    lead: 0.6,
    act: (_t, memo) =>
      walk(
        memo,
        [
          [0, 26],
          [-3, 8],
          [-6, -4],
        ],
        { pace: 0.75 },
      ),
    camera: glide({
      from: { position: [36, 27, 54], target: [0, 1, 4] },
      to: { position: [22, 9, 38], target: [-2, 2, 6] },
      fov: 42,
      softness: 0.5,
    }),
  },
  {
    id: 'sprint',
    bars: 1,
    setup: () => put('island', [0, -21]),
    lead: 0.5,
    act: (t, memo) => {
      walk(memo, [[0, -68]], { run: true })
      once(memo, 'hop', 0.9, t, press.jump)
    },
    camera: follow({
      distance: 6.5,
      height: 1.4,
      angle: [2.1, 1.1],
      aim: 1.2,
      fov: 42,
    }),
  },
  {
    id: 'mayor',
    bars: 2,
    setup: () => {
      const m = ACTOR_POS.get('mayor') ?? { x: 8, z: 10 }
      // From the side away from the games board, or the press meant for
      // him is taken by the board.
      let sx = m.x - BOARD.position[0]
      let sz = m.z - BOARD.position[1]
      const len = Math.hypot(sx, sz)
      if (len < 0.5) [sx, sz] = [1, 0]
      else [sx, sz] = [sx / len, sz / len]
      meeting.at = [m.x, m.z]
      meeting.side = [sx, sz]
      put('island', [m.x + sx * 5, m.z + sz * 5])
    },
    lead: 1.2,
    act: (t, memo) => {
      const [mx, mz] = meeting.at
      const [sx, sz] = meeting.side
      walk(memo, [[mx + sx * 2, mz + sz * 2]], { pace: 0.5 })
      once(memo, 'hello', -0.25, t, press.interact)
    },
    camera: twoShot,
    ui: 'talk',
  },
  {
    id: 'academy',
    bars: 1,
    setup: () => put('island', [-4.5, -50]),
    lead: 0.4,
    act: (_t, memo) => walk(memo, [[-2.5, -66]], { pace: 0.55 }),
    // Down the middle of the road, which is the one line in with no trees
    // on it, with him to one side of it and clear of the caption.
    camera: glide({
      from: { position: [0.6, 2.6, -40], target: [-1, 8, -78] },
      to: { position: [0.6, 3, -47.5], target: [-1, 9, -79] },
      fov: 44,
    }),
  },
  {
    /*
     * The thesis defence: up to the lectern, the class files in, the slides
     * come up on the board. Looked down on from beyond the back wall, as the
     * game looks at its rooms — steep enough that the top of the frame stays
     * on the far wall, since the rooms have no ceilings and above the walls
     * is nothing.
     */
    id: 'defence',
    bars: 1,
    setup: () => put('university', [2.6, -4.6], Math.PI),
    lead: 6,
    act: (_t, memo) => walk(memo, [[2.4, -9], PODIUM], { pace: 0.6 }),
    camera: glide({
      from: { position: [0, 17, 15.5], target: [0, 0, -3] },
      to: { position: [0, 15, 12.5], target: [0, 0.5, -4] },
      fov: 40,
    }),
  },
  {
    id: 'key',
    bars: 2,
    setup: () => {
      useGame.setState({ keys: FOUR_KEYS })
      put('house', [9, -3.4], Math.PI)
    },
    lead: 0.8,
    act: (t, memo) => {
      walk(
        memo,
        [
          [12.2, -4.4],
          [12.2, -7.3],
        ],
        { pace: 0.8 },
      )
      once(memo, 'search', 0.55, t, press.interact)
      once(memo, 'count', 2.9, t, () => game().advance())
    },
    camera: watch({
      from: [6, 10.5, 1.5],
      to: [7.2, 9.6, 0.4],
      aim: 0.4,
      fov: 40,
    }),
    ui: 'keys',
  },
  {
    id: 'map',
    bars: 1,
    setup: () => {
      useGame.setState({ keys: ALL_KEYS, discovered: ALL_FOUND })
      put('island', [-6, 2])
      game().openMap()
    },
    lead: 0.8,
    ui: 'map',
  },

  /* ------------------------ after dark, and the games -------------------- */

  {
    id: 'party',
    bars: 2,
    night: true,
    party: true,
    setup: () => put('island', [-3, 8]),
    lead: 3,
    camera: orbit({
      center: [0, 0, 0],
      radius: [19, 15.5],
      height: [6.5, 5],
      from: -1.2,
      to: -0.3,
      aim: 1.4,
      fov: 46,
    }),
  },
  {
    id: 'moto',
    bars: 1,
    setup: () => {
      game().openMoto()
      game().beginMoto()
    },
    // The lights take three seconds; this is a second and a half of race.
    lead: 4.5,
    act: ride,
    subject: riding(() => MOTO.heading),
    camera: follow({
      distance: [7, 5.6],
      height: [1.7, 1.3],
      angle: [Math.PI - 0.55, Math.PI + 0.25],
      relative: true,
      aim: 0.9,
      fov: 50,
    }),
  },
  {
    id: 'balloon',
    bars: 1,
    setup: () => {
      game().openBalloon()
      game().beginBalloon()
    },
    lead: 1.5,
    act: () => {
      hold.lift.up = true
    },
    subject: riding(() => BALLOON.heading),
    camera: follow({
      distance: [24, 19],
      height: [3, 5],
      angle: [0.8, 0.45],
      aim: 2.5,
      fov: 46,
    }),
  },
  {
    id: 'paintball',
    bars: 1,
    setup: () => {
      game().openPaintball()
      game().beginPaintball()
    },
    // Five seconds to the whistle, and a moment for the paint to fly.
    lead: 6,
    act: (t, memo) => {
      walk(memo, [[0, 4]], { pace: 0.7 })
      once(memo, `fire-${Math.floor(t / 0.28)}`, -9, t, press.fire)
    },
    camera: follow({
      distance: [7.5, 6],
      height: [3.2, 2.6],
      angle: [Math.PI - 0.5, Math.PI - 0.2],
      relative: true,
      aim: 1.1,
      fov: 48,
    }),
  },
  {
    id: 'rescue',
    bars: 1,
    setup: () => {
      game().openRescue()
      game().beginRescue()
    },
    lead: 2,
    act: () => stick(0, 1),
    subject: riding(() => RESCUE.heading),
    camera: follow({
      distance: [15, 12.5],
      height: [4.2, 3.4],
      angle: [Math.PI + 0.95, Math.PI + 0.5],
      relative: true,
      aim: 1.4,
      fov: 46,
    }),
  },
  {
    id: 'torch',
    bars: 2,
    night: true,
    setup: () => {
      useGame.setState({ firstPerson: true })
      put('island', [-14, -12])
    },
    lead: 0.9,
    act: (_t, memo) => {
      face(Math.PI / 4)
      walk(memo, [[-52, -50]], { pace: 0.8 })
    },
  },

  /* ---------------------------- the lighthouse --------------------------- */

  {
    id: 'cape',
    bars: 1,
    setup: () => {
      useGame.setState({ keys: ALL_KEYS })
      put('island', [-34, -32])
    },
    lead: 0.4,
    act: (_t, memo) => walk(memo, [doorstep(3)], { run: true }),
    camera: follow({
      distance: [8, 6.5],
      height: [1.3, 1.1],
      angle: [1.15, 0.9],
      aim: [2.6, 4],
      fov: 54,
    }),
  },
  {
    id: 'unlock',
    bars: 1,
    setup: () => {
      useGame.setState({ keys: ALL_KEYS })
      put('island', doorstep(2.2))
    },
    lead: 0.6,
    act: (t, memo) => {
      steer(doorstep(1.6), { pace: 0.3, near: 0.2 })
      once(memo, 'unlock', -0.25, t, press.interact)
    },
    camera: glide({
      from: { position: byDoor(6.5, -4.2, 2.4), target: byDoor(1, 0, 1.7) },
      to: { position: byDoor(5.2, -3.4, 2.1), target: byDoor(1, 0, 1.8) },
      fov: 40,
    }),
    ui: 'talk',
  },
  {
    /*
     * Up to the open door, slowly, and the lens creeping in behind him. He
     * stops, the mark goes up over his head — and the trailer is over. The
     * cut is timed off the cutscene's own clock, so it lands before anything
     * comes off the tower: what the lighthouse turns out to be is the
     * island's to show, not the trailer's.
     */
    id: 'doorstep',
    bars: 2,
    setup: () => {
      useGame.setState({ keys: ALL_KEYS, lighthouseOpen: true })
      put('island', doorstep(6.5))
    },
    lead: 0.5,
    act: (t, memo) => {
      walk(memo, [doorstep(1.3)], { pace: 0.22 })
      once(memo, 'door', 2 * BAR - NOTICED, t, () =>
        game().enterBuilding('lighthouse'),
      )
    },
    camera: glide({
      from: { position: byDoor(24, 4, 2), target: [-67, 11, -63] },
      to: { position: byDoor(17.5, 2.5, 2.3), target: [-67, 9, -63] },
      fov: 48,
    }),
  },

  /* ------------------------------- the end ------------------------------- */

  {
    id: 'end',
    bars: 3,
    setup: () => put('island', [0, 30]),
    camera: orbit({
      center: [0, 0, 0],
      radius: [250, 275],
      height: [150, 170],
      from: 2.7,
      to: 3.1,
    }),
  },
]

export const CARDS: Card[] = [
  { id: 'title', kind: 'title', from: 0.2, to: 1.92, kicker: 'A playable CV' },
  {
    id: 'walk',
    kind: 'caption',
    from: 2.25,
    to: 3.85,
    kicker: 'Seven roads out of the square',
    text: 'Walk the island.',
  },
  {
    id: 'inside',
    kind: 'caption',
    from: 7.1,
    to: 8.85,
    kicker: 'Seven buildings',
    text: 'Step inside.',
  },
  {
    id: 'keys',
    kind: 'caption',
    from: 9.1,
    to: 10.85,
    kicker: 'One in every district',
    text: 'Find the five keys.',
    place: 'top',
  },
  {
    id: 'dark',
    kind: 'caption',
    from: 12.15,
    to: 13.85,
    kicker: 'The island stays up late',
    text: 'Stay after dark.',
  },
  {
    id: 'games',
    kind: 'caption',
    from: 14.1,
    to: 16.9,
    kicker: 'Race, fly, splat and sail',
    text: 'Play the island games.',
  },
  {
    id: 'open',
    kind: 'caption',
    from: 20.05,
    to: 20.97,
    kicker: 'Five keys, five locks',
    text: 'Open the lighthouse.',
    place: 'top',
  },
  {
    id: 'hiding',
    kind: 'caption',
    from: 22.1,
    to: 23.9,
    kicker: 'Sealed for years',
    text: 'What is the lighthouse hiding?',
    place: 'top',
  },
  { id: 'end', kind: 'end', from: 24, to: 27 },
]

/**
 * The score: the island's opening under the title, its tune through the day,
 * the party after dark, and the fanfare from the moment he reaches the cape.
 * Two phrases of the fanfare end on its dominant, and the bar after that is
 * the home chord, which is the bar the end card lands on.
 */
export const SCORE: { cues: Cue[]; bars: number } = {
  cues: [
    { bar: 0, mood: 'orbit' },
    { bar: 2, mood: 'island' },
    { bar: 12, mood: 'party' },
    { bar: 20, mood: 'deck' },
  ],
  bars: 26,
}
