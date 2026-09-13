import type { Vec2 } from '../types'

/** The floor that goes down over the compass rose in the middle of the square. */
export const DANCEFLOOR = { x: 0, z: 0, radius: 9 }

/**
 * The button, on the far side of Collaboration Road from the games board. It
 * out in the square all year; it just has nothing to switch on until dark.
 */
export const PARTY_BUTTON = {
  position: [-4.5, 9] as Vec2,
  /** Y-rotation: the face of it looks in at the floor. */
  facing: 2.68,
  half: [1.1, 1.1] as Vec2,
  label: 'The Big Red Button',
}

/** Five colours, chased around the floor and the rig. */
export const PARTY_COLORS = [
  '#ff3d81',
  '#3dd6ff',
  '#ffd166',
  '#8f5bff',
  '#3ecf6e',
] as const

/** Where the speaker stacks stand, as angles around the floor. */
export const STACK_ANGLES = [0.6, 2.2, 3.8, 5.4]

/**
 * Amalia, in the middle of the floor. She is not one of the islanders — she
 * only turns up when the button is pressed — so she lives here with the party
 * rather than in the world's cast, and the ring of dancers faces her by
 * construction: they all face the middle, and the middle is where she dances.
 */
export const AMALIA = {
  id: 'amalia',
  name: 'Amalia',
  role: 'The dancing queen',
  /** Dead centre of the floor. */
  position: [DANCEFLOOR.x, DANCEFLOOR.z] as Vec2,
  colors: {
    skin: '#f2c49b',
    /** Long, and brown. */
    hair: '#5b3a20',
    /** White, with a gold trim at the hem. */
    shirt: '#fbf6ec',
    /** Her legs, under the hem. */
    pants: '#f2c49b',
  },
  dress: '#fbf6ec',
  trim: '#ffd166',
  lines: [
    'There you are. They can all wait — this one is ours.',
    'You built a whole island, and put a dancefloor in the middle of it.',
    'Come on, Kitso. Dance with me.',
  ],
  /**
   * And what she says afterwards, on the beach, with the candles still going
   * and something new on her hand.
   */
  engaged: [
    'I am going to be looking at this every five minutes for the rest of my life.',
    'The whole island knew before I did, did it not. Every one of them knew.',
    'Come and sit with me. The candles have hours in them yet.',
  ],
  /** What he asks her, down on one knee with the sea behind her. */
  question: [
    'The candles were the easy part. This next bit I have gone over on every road on this island.',
    'Amalia. You have put up with the late commits, the louder ideas, and every version of me there has ever been.',
    'So: will you marry me?',
  ],
  /** And what she says back, before he is even properly finished. */
  answer: [
    'You built a whole island to ask me that.',
    'Yes. Of course it is yes. Get up here.',
  ],
}

/** The ring: a plain gold band and one stone, which is all it needs to be. */
export const RING = { band: '#f0c04a', stone: '#eaf6ff' } as const

/**
 * What he changes into when she comes down: a dinner jacket, and flowers in
 * the hand that would otherwise be empty.
 */
export const TUXEDO = {
  skin: '#f0c39a',
  hair: '#3a2a1d',
  shirt: '#1c1f26',
  pants: '#15171c',
} as const
