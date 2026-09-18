import type { Npc } from '../types'

/**
 * The people in Kitsos House.
 *
 * His parents stand downstairs in the basement, where the table is and the
 * photographs are. His brothers and his sister are not down there with them —
 * each one has the room that belongs to him or her, so meeting the family
 * means walking the whole house rather than reading one wall of it:
 *
 *   living room  Amalia, his wife
 *   basement     his father and his mother
 *   lab          Kostis, the brother he built everything with
 *   garage       Rafail, the brother who broke everything first
 *   library      Alexis, the older one, the dentist
 *   landing      Alexandra, the youngest
 *
 * These are real people, so the lines are written in the voice each of them
 * actually uses rather than in a narrator's. The parents are addressed by
 * relation, which is what a son calls them.
 */

/** Warm lamplight downstairs, so the palette runs a shade deeper than up. */
const SKIN = {
  light: '#f0c39a',
  tan: '#d99e6f',
  deep: '#b5794a',
}

/**
 * Both parents, standing at either end of the long table in the basement.
 *
 * They stand rather than sit, and they stay standing: the table is laid for
 * seven because it always was, not because everyone is still in the room.
 */
export const PARENTS: Npc[] = [
  {
    id: 'family-father',
    name: 'Father',
    role: 'Head of the table',
    area: 'house-basement',
    position: [-5.4, -5],
    facing: Math.PI / 2,
    colors: {
      skin: SKIN.tan,
      /** White, and has been for years. */
      hair: '#e6e1d6',
      shirt: '#4a6079',
      pants: '#3a3f4a',
    },
    prop: 'glasses',
    lines: [
      'Two degrees, and then a doctorate I crossed an ocean to New York for.',
      'Ask me which of them I am proudest of and I will point at this table instead.',
      'You were never the one who waited to be asked. Something was broken and you already had it open on the floor.',
      'Five children teaches you that nobody is coming to do it for you. You learned that earlier than the others did.',
    ],
    feast: [-1.2, -9.2],
    feastWear: {
      shirt: '#2f3542',
      pants: '#242830',
      suit: { bowTie: '#8f2f22', buttonhole: '#c8402c' },
    },
    feastLines: [
      'Sit, sit. Everyone is here, both sides of the table, and the food is going cold while I talk.',
      'Christmas and your nameday on the same day. Your mother and I did not plan that, and we have never once complained about it.',
    ],
    journal: {
      title: 'The head of the table',
      body: 'His father. Two bachelor degrees and a doctorate he went to New York for, and he will tell you the family is the part he is proud of.',
    },
  },
  {
    id: 'family-mother',
    name: 'Mother',
    role: 'The one who held it together',
    area: 'house-basement',
    position: [5.4, -5],
    facing: -Math.PI / 2,
    colors: {
      skin: SKIN.light,
      /** Black, and she has never dyed it. */
      hair: '#1f1c1a',
      shirt: '#c2566b',
      pants: '#4a3a52',
    },
    lines: [
      'Have you eaten? Do not answer that, I can see that you have not.',
      'Five children and one house. I did not keep hours, I kept a list, and the list is how everybody got where they were going.',
      'You helped without being asked, every time. I never had to say it out loud for it to be counted.',
    ],
    feast: [1.2, -9.2],
    feastWear: { shirt: '#8e2f3a', dress: '#8e2f3a', dressTrim: '#d9b25c' },
    feastLines: [
      'Ten of us, and I have counted the plates three times. Sit down before I count them again.',
      'Every year in this basement, since before any of you were tall enough to carry a dish.',
    ],
    journal: {
      title: 'The one who held it together',
      body: 'His mother, in the basement of the old house. A big family is a small organisation, and she ran it, and looked after every one of them while she did.',
    },
  },
]

/**
 * The four of them, one to a room. Nobody sits in the basement any more; you
 * have to walk the house to find them.
 */
export const SIBLINGS: Npc[] = [
  {
    id: 'family-kostis',
    name: 'Kostis',
    role: 'Brother, mechanical engineer',
    area: 'house-lab',
    position: [-6.2, -2.8],
    facing: 0,
    colors: {
      skin: SKIN.tan,
      hair: '#33261c',
      shirt: '#4f8a5b',
      pants: '#2f3846',
    },
    lines: [
      'Mechanical here, electrical over there. Between the two of us there was nothing in this house we could not take apart.',
      'You did the wiring and the code, I built the thing they went inside. We never once agreed on the schedule and it worked every time.',
      'The first machine we put together out of parts nobody else wanted ran for years. It is probably still running somewhere.',
    ],
    feast: [-3.6, -9.2],
    feastWear: {
      shirt: '#1f4f3a',
      pants: '#2b303a',
      suit: { bowTie: '#b5232b', buttonhole: '#c8402c' },
    },
    feastLines: [
      'The lights on that tree are on a timer I built. If they go out, say nothing.',
      'Chronia polla. Both of them on the same day. You always did like doing two things at once.',
    ],
    journal: {
      title: 'Kostis, in the lab',
      body: 'His brother, a mechanical engineer. The two of them built things together from the start, one on the mechanics, the other on the wiring and the computers.',
    },
  },
  {
    id: 'family-rafail',
    name: 'Rafail',
    role: 'Brother, PE teacher and coach',
    area: 'house-garage',
    position: [3.6, -4.4],
    facing: 0,
    colors: {
      skin: SKIN.deep,
      hair: '#2b2119',
      shirt: '#d9853f',
      pants: '#33405c',
    },
    prop: 'cap',
    lines: [
      'Football until it was too dark to see the ball, and then we argued about the score in the kitchen.',
      'I coach it for a living now. The same job as when we were ten, better shoes.',
      'I was the one who broke things. You were the one who checked nothing was broken and fixed it before anybody noticed. That is why nobody ever noticed.',
    ],
    feast: [3.6, -9.2],
    feastWear: {
      shirt: '#7a2430',
      pants: '#2b303a',
      suit: { bowTie: '#1d4235', buttonhole: '#c8402c' },
    },
    feastLines: [
      'We are playing in the street after we eat. You are on my side, and no arguing about the score this year.',
      'Chronia polla, brother. Eat something before you start explaining what you are working on.',
    ],
    journal: {
      title: 'Rafail, in the garage',
      body: 'His brother, a PE teacher and a coach. The one who got everybody outside and playing, and the reason half the things in this house needed looking at afterwards.',
    },
  },
  {
    id: 'family-alexis',
    name: 'Alexis',
    role: 'Brother, dentist',
    area: 'house-library',
    position: [4.8, -3.2],
    facing: 0,
    colors: {
      skin: SKIN.light,
      hair: '#453324',
      shirt: '#5566b5',
      pants: '#2c3242',
    },
    prop: 'glasses',
    lines: [
      'I am a dentist, so take it from me: you have always been smiling. Even in the years there was not much to smile about.',
      'Two high school teachers for parents. Other children got help with the homework. We got a syllabus, and they taught it themselves.',
      'I am the older one. It never stopped you challenging me about anything, and it never once stopped you winning.',
    ],
    feast: [6.6, -7.4],
    feastWear: {
      shirt: '#33415c',
      pants: '#232833',
      suit: { bowTie: '#8a6a2a', buttonhole: '#c8402c' },
    },
    feastLines: [
      'Chronia polla. Enjoy every course of it, and then come and see me in January like everybody else.',
      'Two families in one basement and not one raised voice yet. Give it an hour.',
    ],
    journal: {
      title: 'Alexis, in the library',
      body: 'His older brother, a dentist. Both parents taught in a high school and took their own children’s education personally, and being the older one never spared Alexis an argument.',
    },
  },
  {
    id: 'family-alexandra',
    name: 'Alexandra',
    role: 'Sister, PE teacher and basketball coach',
    area: 'house-upstairs',
    position: [4.2, -3.6],
    facing: 0,
    colors: {
      skin: SKIN.light,
      hair: '#3c2a1c',
      shirt: '#c9a0d4',
      pants: '#41364d',
    },
    hair: 'long',
    smile: true,
    lines: [
      'Basketball, and then coaching it. The youngest of five gets very good at holding her ground.',
      'You helped me with everything. And if anybody gave me trouble you would suddenly become extremely interested in who exactly they were.',
      'You used to act dumb on purpose, just to make me laugh. I miss that more than I planned to.',
    ],
    feast: [0, -0.6],
    feastWear: { shirt: '#6b2f52', dress: '#6b2f52', dressTrim: '#d9b25c' },
    feastLines: [
      'Chronia polla! I put you next to me, and I do not care what the plates say.',
      'This is the one day I stop being the youngest of five and go back to being the youngest of everybody.',
    ],
    journal: {
      title: 'Alexandra, upstairs',
      body: 'His youngest sister, a PE teacher who coaches basketball. The one he looked after, stood in front of, and played the fool for.',
    },
  },
]

/**
 * Amalia's side, who are in the house on the twenty-fifth of December and on
 * no other day of the year. `feastOnly` is what keeps them out of the room
 * the rest of the time — they have a `feast` position and nowhere else to be.
 *
 * Her parents are addressed by relation, the same as his. Her sister has a
 * name because that is what he calls her.
 */
export const IN_LAWS: Npc[] = [
  {
    id: 'inlaw-father',
    name: 'Father-in-law',
    role: 'Physicist',
    area: 'house-basement',
    position: [4.4, -1],
    facing: Math.PI,
    colors: {
      skin: SKIN.tan,
      hair: '#6e6a63',
      shirt: '#3f5f6b',
      pants: '#39404c',
    },
    prop: 'glasses',
    feastOnly: true,
    feast: [7.8, -5],
    lines: [
      'A physicist and an engineer at the same table. We agree on more than either of us lets on.',
      'You explain your work the way somebody explains it who actually understands it. That is rarer than you think.',
      'Chronia polla. And well done on the island. I looked at the whole thing twice.',
    ],
    feastWear: {
      shirt: '#2e3f4a',
      pants: '#242a30',
      suit: { bowTie: '#6b2233', buttonhole: '#c8402c' },
    },
    journal: {
      title: 'Her father, at the table',
      body: 'Amalia’s father, a physicist. In the house for the Christmas meal, and pleased to have somebody to argue about first principles with.',
    },
  },
  {
    id: 'inlaw-mother',
    name: 'Mother-in-law',
    role: 'English teacher',
    area: 'house-basement',
    position: [6.6, -1.8],
    facing: Math.PI,
    colors: {
      skin: SKIN.light,
      hair: '#7a6350',
      shirt: '#b5646f',
      pants: '#46394f',
    },
    hair: 'long',
    dress: '#b5646f',
    smile: true,
    feastOnly: true,
    feast: [6.6, -2.6],
    lines: [
      'I taught English for thirty years, so you will forgive me for reading every word on this island twice.',
      'You write the way you talk, which is the hardest thing to teach anybody.',
      'Chronia polla. Sit down and eat, and we can talk about the rest of it afterwards.',
    ],
    feastWear: { shirt: '#4a2f58', dress: '#4a2f58', dressTrim: '#d9b25c' },
    journal: {
      title: 'Her mother, at the table',
      body: 'Amalia’s mother, an English teacher. Thirty years of it, and she has read every word on this island twice.',
    },
  },
  {
    id: 'inlaw-angelica',
    name: 'Angelica',
    role: 'Sister-in-law, architect',
    area: 'house-basement',
    position: [-4.6, -1.2],
    facing: Math.PI,
    colors: {
      skin: SKIN.light,
      hair: '#2f2419',
      shirt: '#5f8f7a',
      pants: '#3d3548',
    },
    hair: 'long',
    smile: true,
    feastOnly: true,
    feast: [2.4, -0.6],
    lines: [
      'I am an architect, so I have opinions about your island. The lighthouse is right. The plaza wants one more tree.',
      'You and Kostis build. I draw first and then argue with whoever has to build it. Same family of problem.',
      'Chronia polla! And happy Christmas, in that order, since the nameday is the one people forget.',
    ],
    feastWear: { shirt: '#1f4f45', dress: '#1f4f45', dressTrim: '#d9b25c' },
    journal: {
      title: 'Angelica, at the table',
      body: 'Amalia’s sister, an architect. She has walked the whole island once and has notes on the plaza.',
    },
  },
]

/** Everyone from the house he grew up in, wherever they are standing now. */
export const OLD_FAMILY: Npc[] = [...PARENTS, ...SIBLINGS]

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
      'Everything that actually matters is inside this house. The rest of it is a very good job, and only that.',
      'Go and find them. Your mother and father are downstairs, and your brothers and your sister are each in their own corner of the place.',
      'I am happy. Write that down somewhere on this island of yours, since you are building one anyway.',
    ],
    feast: [-2.4, -0.6],
    feastWear: { shirt: '#9c2b38', dress: '#9c2b38', dressTrim: '#e6c877' },
    feastLines: [
      'Chronia polla, my love. Your nameday, and both our families in one room for it.',
      'My mother and father are here, and my sister. Go on. They have been waiting all year to see you.',
      'This is the happiest day of the year in this house. It is the same every year, and I would not change a thing about it.',
    ],
    journal: {
      title: 'Home',
      body: 'Amalia, in the living room. The family he has now, one floor above the one he grew up in.',
    },
  },
]
