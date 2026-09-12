import type { Npc } from '../types'

/**
 * The family he grew up in, round the table in the basement: father, mother,
 * three brothers and a sister.
 *
 * NAMES ARE PLACEHOLDERS. Every one of these people is real, so nothing here
 * invents a name for them — they are addressed by relation until the real
 * names go in. To personalise: change `name` (and the `lines`, which are
 * written in a voice I had to guess at). Nothing else in the codebase reads
 * these fields, so the rest of the room stays where it is.
 */

const AREA = 'house-basement'

/** Warm lamplight downstairs, so the palette runs a shade deeper than up. */
const SKIN = {
  light: '#f0c39a',
  tan: '#d99e6f',
  deep: '#b5794a',
}

export const OLD_FAMILY: Npc[] = [
  {
    id: 'family-father',
    name: 'Father',
    role: 'Head of the table',
    area: AREA,
    position: [-5.4, -5],
    facing: Math.PI / 2,
    colors: {
      skin: SKIN.tan,
      hair: '#4a4038',
      shirt: '#4a6079',
      pants: '#3a3f4a',
    },
    prop: 'glasses',
    lines: [
      'Sit down, we were about to start. There is always another chair.',
      'Five children and one salary teaches you arithmetic nobody puts on a certificate.',
      'You were the one who took things apart. Your mother and I decided early that was cheaper to encourage than to forbid.',
    ],
    journal: {
      title: 'The head of the table',
      body: 'Seven at the table in the house he grew up in — his father, his mother, three brothers, his sister and him. Where the responsibility came from.',
    },
  },
  {
    id: 'family-mother',
    name: 'Mother',
    role: 'The one who held it together',
    area: AREA,
    position: [5.4, -5],
    facing: -Math.PI / 2,
    colors: {
      skin: SKIN.light,
      hair: '#6b4a2e',
      shirt: '#c2566b',
      pants: '#4a3a52',
    },
    lines: [
      'Have you eaten? Do not answer that, I can see that you have not.',
      'Six of you in this house and every single one certain they were the reasonable one.',
      'I am glad you kept the noise. A quiet house is a house with nobody in it.',
    ],
    journal: {
      title: 'The one who held it together',
      body: 'His mother, in the basement of the old house. A big family is a small organisation, and she ran it.',
    },
  },
  {
    id: 'family-brother-1',
    name: 'Brother',
    role: 'Brother',
    area: AREA,
    position: [-2.6, -7.2],
    facing: 0,
    colors: {
      skin: SKIN.tan,
      hair: '#33261c',
      shirt: '#4f8a5b',
      pants: '#2f3846',
    },
    lines: [
      'You are in my chair. You have been in my chair since 1998.',
      'Remember the summer we built the cart and it had no brakes? You did the design.',
      'Everything I know about arguing I learned in this room, and I learned it from you.',
    ],
  },
  {
    id: 'family-brother-2',
    name: 'Brother',
    role: 'Brother',
    area: AREA,
    position: [0, -7.2],
    facing: 0,
    colors: {
      skin: SKIN.deep,
      hair: '#2b2119',
      shirt: '#d9853f',
      pants: '#33405c',
    },
    prop: 'cap',
    lines: [
      'Nobody in this family has ever finished a sentence. It is not a flaw, it is a dialect.',
      'You went off and made a career out of fixing things. We are not surprised, we are just loud about it.',
    ],
  },
  {
    id: 'family-brother-3',
    name: 'Brother',
    role: 'Brother',
    area: AREA,
    position: [2.6, -7.2],
    facing: 0,
    colors: {
      skin: SKIN.light,
      hair: '#453324',
      shirt: '#5566b5',
      pants: '#2c3242',
    },
    lines: [
      'The youngest gets the smallest room and the best deal. I have made peace with the first part.',
      'You always let me win at chess up to about the age of ten. I worked it out eventually.',
    ],
  },
  {
    id: 'family-sister',
    name: 'Sister',
    role: 'Sister',
    area: AREA,
    position: [-1.3, -2.8],
    facing: Math.PI,
    colors: {
      skin: SKIN.light,
      hair: '#3c2a1c',
      shirt: '#c9a0d4',
      pants: '#41364d',
    },
    prop: 'flowers',
    lines: [
      'One sister, four brothers. I was outnumbered and I still ran the place.',
      'You were the one who came and found me when it went wrong. I have not forgotten which one of you did that.',
      'Bring your wife down here sometime. She should see where the noise started.',
    ],
    journal: {
      title: 'One sister, four brothers',
      body: 'His sister, at the table downstairs. Outnumbered, and still the one who ran the place.',
    },
  },
]

/**
 * Amalia, at home. She turns up on the dancefloor when the button is pressed,
 * but she lives here — this is the family he has now, upstairs, above the one
 * he came from.
 */
export const HOME_FAMILY: Npc[] = [
  {
    id: 'amalia-home',
    name: 'Amalia',
    role: 'Wife',
    area: 'house',
    position: [-3, 4.6],
    facing: Math.PI,
    colors: {
      skin: '#f2c49b',
      /** Long, and brown — the same as she wears on the dancefloor. */
      hair: '#5b3a20',
      /** The bodice of the dress; the skirt below it matches. */
      shirt: '#7e9bb3',
      /** Her legs, under the hem. */
      pants: '#f2c49b',
    },
    /* A plain house dress, one colour and no hem. The white and gold is the
       one she wears on the dancefloor, and it would be odd in her own
       kitchen. */
    hair: 'long',
    dress: '#7e9bb3',
    smile: true,
    lines: [
      'You built an island. A whole island, with a lighthouse on it.',
      'There is a door down the hall you have not finished yet. I am not going to mention it again after this.',
      'Go on down and say hello to everyone. They are all still down there.',
    ],
    journal: {
      title: 'Home',
      body: 'Amalia, in the living room. The family he has now, one floor above the one he grew up in.',
    },
  },
]
