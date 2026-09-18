import type { Vec2 } from '../types'

/**
 * The board in the plaza that every one of the minigames is signed up at.
 *
 * It stands south-east of the fountain, four units clear of the nearest lamp
 * in the ring and off the lines the seven roads take across the square — its
 * first spot put it inside a lamp post. It is read from either side, so the
 * whole board is the thing you walk up to rather than one face of it.
 *
 * It is small. A board that fitted every notice on one row was three times a
 * person wide and stood over the whole square; the notices are stacked two
 * deep instead and the pop-up does the explaining.
 */
export const PANEL_WIDTH = 2.9
const PANEL_DEPTH = 0.7
const FACING = -0.62

export const BOARD = {
  position: [5, 10] as Vec2,
  /** Y-rotation; a face squares up to the road you walk in on. */
  facing: FACING,
  /**
   * Half-extents for collision. A collider cannot be turned, so this is the
   * axis-aligned box that contains the turned panel.
   */
  half: [
    (PANEL_WIDTH / 2) * Math.abs(Math.cos(FACING)) +
      (PANEL_DEPTH / 2) * Math.abs(Math.sin(FACING)),
    (PANEL_WIDTH / 2) * Math.abs(Math.sin(FACING)) +
      (PANEL_DEPTH / 2) * Math.abs(Math.cos(FACING)),
  ] as Vec2,
  label: 'Games Board',
  /** The panel the 3D board is built to, so the two never drift apart. */
  width: PANEL_WIDTH,
}

export type MinigameId = 'paintball' | 'moto' | 'balloon' | 'hide' | 'rescue'

export interface MinigameEntry {
  id: MinigameId
  emoji: string
  title: string
  /** One line for the board. */
  blurb: string
  /** Three short lines on how it is played, for the pop-up. */
  rules: string[]
  accent: string
  /** Daylight game or a night one. Nothing is played at both hours. */
  when: 'day' | 'night'
  /** A building that has to be open before this is on the board at all. */
  needs?: string
}

export const MINIGAMES: MinigameEntry[] = [
  {
    id: 'paintball',
    emoji: '🎯',
    title: 'Paintball',
    blurb:
      'The island splits in two for an afternoon. Two locals stand with you; everyone else wants you painted.',
    rules: [
      'Five rounds per hopper, then a six-second refill.',
      'Three lives. A ball to the chest costs one.',
      'Get down and their paint sails over you, but you cannot fire back.',
    ],
    accent: '#e63c58',
    when: 'day',
  },
  {
    id: 'rescue',
    emoji: '🚤',
    title: 'Sea Rescue',
    blurb:
      'A boat went down in the night. Find the flares and get her people out of the water before the flares burn out.',
    rules: [
      'Get alongside a raft and take the way off her. Nobody climbs a net at speed.',
      'Every flare burns down on its own clock, so the order you pick is the game.',
      'Let one burn out and the run is over.',
    ],
    accent: '#2f6fa8',
    when: 'day',
  },
  {
    id: 'moto',
    emoji: '🏍️',
    title: 'Island Circuit',
    blurb:
      'Three laps of the ring road that circles the town, against three islanders who ride it every week.',
    rules: [
      'You start at the back of a grid of four.',
      'Tuck in behind somebody and the tow carries you past.',
      'Every sector has to be passed, so cutting the middle gains nothing.',
    ],
    accent: '#f0a33c',
    when: 'day',
  },
  {
    id: 'balloon',
    emoji: '🎈',
    title: 'Balloon drop',
    blurb:
      'Fourteen gatherings are waiting on something from the sky: half a water bomb, half confetti.',
    rules: [
      'Water for the ones out in the sun, confetti for the ones celebrating.',
      'Confetti floats, so it lands further downwind than a bomb does.',
      'The breeze pushes the whole time; the burner is all that holds you up.',
    ],
    accent: '#3fa9e8',
    when: 'day',
  },
  {
    id: 'hide',
    emoji: '🔦',
    title: 'Hide and seek',
    blurb:
      'Every light on the island goes out, and the only one left is the one somebody is carrying.',
    rules: [
      'Seeking: they hide in the dark, and only a hand on them counts as found.',
      'Hiding: fifteen seconds, then all of them come looking with torches.',
      'Crouch and you are hard to be sure of. Light your torch and you are the easiest thing on the island to find.',
    ],
    accent: '#8a9ad6',
    when: 'night',
  },
]

export const MINIGAME_BY_ID = new Map(MINIGAMES.map((m) => [m.id, m]))
