import { INTERIOR_BY_ID } from '../interior/interiors'
import { interiorColliders } from '../interior/interiorLogic'
import type { Collider } from '../island/terrainLogic'
import type { Vec2 } from '../../types'

/**
 * The thesis defence, in the room it was actually given in.
 *
 * The lecture hall stands empty the rest of the time: the Dean by the desks,
 * a demonstrator by the east wall, and eight school desks nobody is sitting
 * at. Walk up to the lectern and it fills — a room of students comes in and
 * takes the desks, the blackboard behind him turns into the slide, and he
 * gives the defence a slide at a time. Reach the end of it and the whole
 * room comes to its feet and applauds.
 *
 * Walk away from the lectern at any point and it empties again, the way the
 * feast puts the basement back to a room full of people talking. Nothing here
 * is a mode you get stuck in: the lectern is the switch, in both directions.
 *
 * Both the render pass and the frame loop read this module, so the students
 * you can see, the slide on the board and the clapping are never three
 * different opinions about how far through the defence we are.
 */

/** The one room it happens in. */
export const LECTURE_AREA = 'university'

/**
 * Where he stands to give it: behind the lectern, between it and the board.
 *
 * The lectern is the thing you stand behind to speak — it holds your notes
 * and it is what the room is looking at. So he goes round it and takes it,
 * with the blackboard at his back and the whole hall in front of him.
 *
 * The prop is solid and sits at [0, -7.5] with a 0.6 half-depth, so the far
 * side of it starts at -8.1; this is a stride beyond that, and well clear of
 * the board at -12.4 and of the room's own wall margin at -11.4.
 */
export const PODIUM: Vec2 = [0, -9]

/**
 * Where the camera looks while the defence is on: down the hall, between the
 * lectern and the back row, so the board behind him and the class in front of
 * him are in the same shot. Him alone is not what is happening.
 */
export const LECTURE_LOOK = 2.5

/**
 * Close enough to the lectern to be giving the defence, and far enough from
 * it to have walked off. Two thresholds rather than one, so standing on the
 * line does not seat and dismiss a lecture hall twice a second.
 */
const TAKE_IN = 1.8
const TAKE_OUT = 4.8

/**
 * The slides, in the order he gave them.
 *
 * Forty-odd seconds for the whole defence rather than the twenty minutes the
 * real one took. It is read standing still, so every second of it is a second
 * somebody is not playing — long enough to be a talk with a shape, short
 * enough that the applause at the end of it is a reward rather than a release.
 */
export interface Slide {
  /** Chalked across the top of the board. */
  title: string
  /** The two or three lines under it. */
  lines: string[]
  /** How long it stays up. Longer for the slides with more on them. */
  hold: number
}

export const SLIDES: Slide[] = [
  {
    title: 'Compliance analysis of movement exercises',
    lines: [
      'Diploma thesis · NTUA, School of ECE, 2022',
      'Kitsos Orfanopoulos',
      'Supervisor: Prof. Panagiotis Tsanakas, Dean of the School',
    ],
    hold: 5,
  },
  {
    title: 'The problem',
    lines: [
      'A physiotherapy exercise is prescribed once and then performed',
      'a hundred times, alone, with nobody in the room to correct it.',
      'Done wrong, it is at best wasted and at worst an injury.',
    ],
    hold: 5.5,
  },
  {
    title: 'The question',
    lines: [
      'Not "which exercise is this?" — that is recognition, and solved.',
      'But "how well was it performed?", against how it should be.',
      'Compliance, not classification.',
    ],
    hold: 5.5,
  },
  {
    title: 'The approach',
    lines: [
      'Pose estimation off the phone camera: joints, frame by frame.',
      'The movement becomes a sequence; the reference is another.',
      'A modified Levenshtein distance scores one against the other.',
    ],
    hold: 6,
  },
  {
    title: 'Why not a bigger model',
    lines: [
      'It runs on the client, on the phone in the patient’s hand.',
      'No upload, no server, no video of anybody leaving the room.',
      'A model is only as good as the pipeline feeding it.',
    ],
    hold: 6,
  },
  {
    title: 'Results',
    lines: [
      'Real time, on ordinary hardware, judged against physiotherapists.',
      'Graded with distinction — "scientific soundness and',
      'technological originality".',
    ],
    hold: 5.5,
  },
  {
    title: 'Afterwards',
    lines: [
      'Three years on, the work became a published paper:',
      '"An M-Health Algorithmic Approach to Identify and Assess',
      'Physiotherapy Exercises in Real Time" · arXiv, December 2025.',
    ],
    hold: 6,
  },
  {
    title: 'Thank you',
    lines: ['Questions?'],
    hold: 3.5,
  },
]

/** How long the whole defence runs, in seconds. */
export const LECTURE_LENGTH = SLIDES.reduce((sum, s) => sum + s.hold, 0)

/**
 * Where the defence is up to.
 *
 * Mutated from the player's frame loop and read by every student's, the same
 * way the feast and the party are — a room of twenty people should not be
 * re-rendering React to clap.
 */
export const LECTURE = {
  /** He is at the lectern and the room is listening. */
  active: false,
  /** Seconds on the wall clock when he stepped up, for the slide timing. */
  startedAt: 0,
  /** Seconds into the defence, held at the end rather than wrapping. */
  elapsed: 0,
  /** Index of the slide on the board. */
  slide: 0,
  /** The defence is over and the room is on its feet. */
  applauding: false,
  /**
   * He has stepped away and the class is filing out.
   *
   * A room does not empty the instant a talk ends: people get up and walk to
   * a door. So stepping down from the lectern does not delete eight people
   * where they stand — it turns them round and sends them out the way they
   * came in, and each leaves the roster as they reach a door.
   */
  leaving: false,
  /** Seconds on the wall clock when he stepped down, for the stagger out. */
  leftAt: 0,
  /** Who is out of the room already, by id, so they stop being drawn. */
  gone: new Set<string>(),
}

/**
 * Ends the defence and starts the class filing out.
 *
 * `active` goes false — the slides stop, the board clears, the HUD goes — but
 * the room is not empty yet: everybody who was in it is now walking to a
 * door, and `stillFilingOut` is what keeps them in the roster until they get
 * there.
 */
export function clearLecture() {
  if (LECTURE.active) {
    LECTURE.leaving = true
    LECTURE.leftAt = performance.now() / 1000
    LECTURE.gone.clear()
  }
  LECTURE.active = false
  LECTURE.elapsed = 0
  LECTURE.slide = 0
  LECTURE.applauding = false
}

/**
 * Empties the hall outright, with nobody walking anywhere.
 *
 * For leaving the room rather than the lectern: there is no point animating
 * eight people out of a hall the camera is no longer in, and coming back to
 * find them still trooping out of a defence you did not give would be worse.
 */
export function emptyHall() {
  LECTURE.active = false
  LECTURE.elapsed = 0
  LECTURE.slide = 0
  LECTURE.applauding = false
  LECTURE.leaving = false
  LECTURE.gone.clear()
}

/** Somebody from the class is still in the room, on their way out of it. */
export const stillFilingOut = () =>
  LECTURE.leaving && LECTURE.gone.size < SEATS.length

/** The class is in the room at all: listening to the defence, or leaving it. */
export const classPresent = () => LECTURE.active || stillFilingOut()

/** Which slide is up this many seconds in, and how far into it we are. */
export function slideAt(elapsed: number): number {
  let run = 0
  for (let i = 0; i < SLIDES.length; i++) {
    run += SLIDES[i].hold
    if (elapsed < run) return i
  }
  return SLIDES.length - 1
}

/**
 * Reads his position and decides whether the defence is on, then advances it.
 * Returns true on the frame the room fills or empties, which is the frame
 * worth making a sound on.
 */
export function stepLecture(x: number, z: number, delta: number): boolean {
  const gap = Math.hypot(x - PODIUM[0], z - PODIUM[1])
  const wanted = LECTURE.active ? gap < TAKE_OUT : gap < TAKE_IN
  const changed = wanted !== LECTURE.active

  if (changed) {
    if (wanted) {
      // Back at the lectern, so it starts again from the first slide.
      //
      // Including from halfway out: step down, change your mind and step
      // back up while the class is still filing out, and they turn round in
      // the aisle and go back to their desks. So the leaving phase is
      // cancelled outright, and anybody who had already reached a door comes
      // back in through it — `gone` is cleared, which puts them back in the
      // roster at the doorway they left by, and they walk in from there.
      LECTURE.leaving = false
      LECTURE.gone.clear()
      LECTURE.active = true
      LECTURE.startedAt = performance.now() / 1000
      LECTURE.elapsed = 0
      LECTURE.slide = 0
      LECTURE.applauding = false
    } else {
      clearLecture()
    }
    return true
  }

  if (LECTURE.active) {
    LECTURE.elapsed = Math.min(LECTURE_LENGTH, LECTURE.elapsed + delta)
    LECTURE.slide = slideAt(LECTURE.elapsed)
    LECTURE.applauding = LECTURE.elapsed >= LECTURE_LENGTH
  }

  // Once the last of them is out of the door the hall is simply empty again,
  // and the Dean is back at his own spot rather than still walking to it.
  if (LECTURE.leaving && LECTURE.gone.size >= SEATS.length) {
    LECTURE.leaving = false
  }

  return false
}

/* ------------------------------ the audience ---------------------------- */

/**
 * Where the students sit, one to a desk.
 *
 * The desks are laid out in the room as two rows of four, at z = 1 and z = 5,
 * at x = ±2 and ±6. A student sits a little behind their own desk, facing the
 * lectern, which from back here is very nearly straight down the room.
 */
const DESKS: Vec2[] = [
  [-6, 1],
  [-2, 1],
  [2, 1],
  [6, 1],
  [-6, 5],
  [-2, 5],
  [2, 5],
  [6, 5],
]

/** How far behind their desk they stand, so they are not inside the top. */
const BEHIND = 1.15

/** A seat in the hall: where they stand and how they got there. */
export interface Seat {
  /** Where they end up, behind their desk. */
  position: Vec2
  /** Where they come in from, which is the door they would have used. */
  from: Vec2
  /** Seconds after the defence starts that they are in place. */
  delay: number
}

/**
 * The two doors into the hall, west to the lab and east to the council room.
 * A class filing in uses both, because a class always does.
 */
const WEST_DOOR: Vec2 = [-14.6, 2]
const EAST_DOOR: Vec2 = [14.6, 2]

/**
 * The hall, seat by seat.
 *
 * They come in the nearer of the two doors and take their place in ones and
 * twos rather than all on the same frame — a class arriving in formation is
 * a parade, not a lecture.
 */
export const SEATS: Seat[] = DESKS.map((desk, i) => ({
  position: [desk[0], desk[1] + BEHIND],
  from: desk[0] < 0 ? WEST_DOOR : EAST_DOOR,
  /* The front row settles first, and the two sides interleave. */
  delay: 0.25 + (i % 4) * 0.22 + Math.floor(i / 4) * 0.5,
}))

/** How fast a student crosses the hall to their desk. */
export const SEAT_WALK = 4.2

/**
 * How much of the filing-in stagger is kept on the way out.
 *
 * Less than the way in: a class arriving trickles in over a couple of
 * seconds, a class leaving gets up more or less at once and the delay is
 * only there to stop eight people reaching the same doorway on one frame.
 */
export const LEAVE_STAGGER = 0.45

/* -------------------------------- the Dean ------------------------------- */

/**
 * Where the supervisor stands for it.
 *
 * He does not sit at a desk with the class. He supervised the thesis, so he
 * comes down to the front and stands off the speaker's shoulder, on the
 * board side of the lectern, facing the room with him — which is exactly
 * where a supervisor stands at a defence, close enough to be part of it and
 * far enough not to be giving it.
 *
 * To his left as the room sees him, so he never walks through the lectern
 * or ends up between the speaker and the class.
 */
export const DEAN_SPOT: Vec2 = [-3.4, -9.2]

/**
 * The way out of the desks and down to the front.
 *
 * He stands at [-6, 2], which is on top of the desk at [-6, 1] and in the
 * same square metre as the student who sits behind it — so the first thing
 * he has to do is get out of the furniture, not head for the front. Walking
 * him straight at the lectern from there wedges him between a desk and a
 * classmate and he shuffles against them for the whole defence.
 *
 * So he goes west into the clear aisle between the desks and the bookshelves
 * first, and only then turns down the room. Both legs are well clear of
 * every desk, of the pillars at x = ±12, and of the bookshelves on the west
 * wall at x = -15.7.
 */
const DEAN_OUT: Vec2 = [-9.5, 1.5]
export const DEAN_VIA: Vec2 = [-9.5, -7]

/** The legs of that route, in order. */
export const DEAN_PATH: Vec2[] = [DEAN_OUT, DEAN_VIA]

/** How close counts as having reached a leg of it. */
export const DEAN_VIA_REACHED = 1.1

/** He is not a student; he crosses a room at a professor's pace. */
export const DEAN_WALK = 3.4

/** How long he leaves it before setting off, so he is not first out of the blocks. */
export const DEAN_DELAY = 0.8

/**
 * The hall's furniture, as things to walk round rather than through.
 *
 * Built once and kept: the room never changes shape, and this is read on
 * every frame anybody is crossing it. Undecorated — the lecture hall is not
 * a room Christmas ever reaches.
 */
let furniture: Collider[] | null = null
export function hallFurniture(): Collider[] {
  if (!furniture) {
    const room = INTERIOR_BY_ID.get(LECTURE_AREA)
    furniture = room ? interiorColliders(room) : []
  }
  return furniture
}

/** Which way to turn to look at whoever is at the lectern. */
export const facingPodium = (position: Vec2) =>
  Math.atan2(PODIUM[0] - position[0], PODIUM[1] - position[1])
