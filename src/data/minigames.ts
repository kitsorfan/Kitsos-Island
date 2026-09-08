import type { Vec2 } from '../types'

/**
 * The board in the plaza that every one of the minigames is signed up at.
 *
 * It stands south-east of the fountain, four units clear of the nearest lamp
 * in the ring and off the lines the seven roads take across the square — its
 * first spot put it inside a lamp post. It is read from either side, so the
 * whole board is the thing you walk up to rather than one face of it.
 *
 * It was widened when the balloon was signed up: three notices side by side
 * need more panel than two did.
 */
const PANEL_WIDTH = 5.6
const PANEL_DEPTH = 0.9
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
}

export type MinigameId = 'paintball' | 'moto' | 'balloon'

export interface MinigameEntry {
  id: MinigameId
  emoji: string
  title: string
  kicker: string
  /** One line for the board and the card. */
  blurb: string
  rules: string[]
  accent: string
}

export const MINIGAMES: MinigameEntry[] = [
  {
    id: 'paintball',
    emoji: '🎯',
    title: 'Paintball',
    kicker: 'Two on your side',
    blurb:
      'The island splits in two for an afternoon. Two locals stand with you; everyone else wants you painted.',
    rules: [
      'Five rounds per hopper, then a six-second refill.',
      'Three lives — a ball to the chest costs one.',
      'Get down and their paint sails over you.',
    ],
    accent: '#e63c58',
  },
  {
    id: 'moto',
    emoji: '🏍️',
    title: 'Island ride',
    kicker: 'Coins on every road',
    blurb:
      'Take the bike out and ride the island. Coins are laid out along every road, from the plaza to the dock on the far shore.',
    rules: [
      'Ride through a coin to pick it up.',
      'An arrow over the bike points at the nearest one.',
      'No clock and nothing to lose — the timer only counts how long you took.',
    ],
    accent: '#f0a33c',
  },
  {
    id: 'balloon',
    emoji: '🎈',
    title: 'Balloon drop',
    kicker: 'The whole town, from above',
    blurb:
      'Take the balloon up over the town on festival afternoon. Fourteen gatherings below are waiting on something — half of them a water bomb, half of them confetti.',
    rules: [
      'Drop the right one on each: water for the ones in the sun, confetti for the ones celebrating.',
      'Confetti floats, so it lands further downwind than a bomb does. Two rings on the grass say where each would fall.',
      'They scatter from a water bomb and cheer a faceful of confetti, so you can see from the basket what you hit.',
      'The breeze pushes the whole time. The burner is the only thing holding you up.',
    ],
    accent: '#3fa9e8',
  },
]

export const MINIGAME_BY_ID = new Map(MINIGAMES.map((m) => [m.id, m]))
