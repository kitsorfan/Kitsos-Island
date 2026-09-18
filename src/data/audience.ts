import type { Npc } from '../types'
import { SEATS } from '../game/lecture'

/**
 * The class at the thesis defence.
 *
 * Eight students, one to a desk, who exist for exactly as long as he is
 * standing behind the lectern — they file in when he steps up and are gone
 * when he steps down. They are the only people on the island who are not
 * somebody real: a defence is given to a room, and the room has to have
 * people in it.
 *
 * So none of them has a journal entry, and none of them is a puzzle. They
 * sit, they listen, they applaud, and the two lines each of them has are the
 * two lines a classmate actually says to you afterwards.
 */

const SKIN = {
  light: '#f0c39a',
  tan: '#d99e6f',
  deep: '#a2683f',
}

/** What the class looked like: a lecture hall in a Greek polytechnic. */
const LOOK: {
  name: string
  skin: string
  hair: string
  shirt: string
  pants: string
  long?: boolean
  dress?: string
  prop?: Npc['prop']
  lines: string[]
}[] = [
  {
    name: 'Stelios',
    skin: SKIN.light,
    hair: '#2d2018',
    shirt: '#3f6fa8',
    pants: '#2f3646',
    lines: [
      'I sat through five years of these with him. This is the one I remember.',
      'Very strong coding skills and a solution-oriented mindset. I wrote that down for him later, and I meant it.',
    ],
  },
  {
    name: 'Eleni',
    skin: SKIN.light,
    hair: '#4a2f1e',
    shirt: '#b5646f',
    pants: '#46394f',
    long: true,
    dress: '#7c3f52',
    lines: [
      'Levenshtein distance on a movement. I would never have thought to look there.',
      'He explains it as if you already knew it, which is the only kind of explaining that works.',
    ],
  },
  {
    name: 'Dimitris',
    skin: SKIN.tan,
    hair: '#1f1a17',
    shirt: '#4f7c5a',
    pants: '#333a44',
    prop: 'glasses',
    lines: [
      'Running the whole thing on the phone. No server, no upload, no video of anybody.',
      'That is the part the committee asked about twice.',
    ],
  },
  {
    name: 'Katerina',
    skin: SKIN.deep,
    hair: '#231c18',
    shirt: '#c07a3e',
    pants: '#3b3340',
    long: true,
    lines: [
      'The Dean supervised it. He does not supervise many.',
      'Distinction, and three years later a paper out of it.',
    ],
  },
  {
    name: 'Nikos',
    skin: SKIN.tan,
    hair: '#3b2a1c',
    shirt: '#6a5fb0',
    pants: '#2c3242',
    lines: [
      'We took Operating Systems together. He was the one who had actually read the manual.',
      'Physiotherapy, of all things. He picked a problem somebody has.',
    ],
  },
  {
    name: 'Maria',
    skin: SKIN.light,
    hair: '#6b4a2f',
    shirt: '#5b8fa8',
    pants: '#3c4350',
    long: true,
    dress: '#3f6376',
    lines: [
      'Five years. Most of us took seven.',
      'And he was running the students’ representation the whole time. Ask him where the hours came from; he will not tell you.',
    ],
  },
  {
    name: 'Giorgos',
    skin: SKIN.tan,
    hair: '#241a14',
    shirt: '#a85748',
    pants: '#39404c',
    prop: 'cap',
    lines: [
      'Pose estimation, frame by frame, and then you score the sequence. Simple once he says it.',
      'It never sounds simple when anybody else says it.',
    ],
  },
  {
    name: 'Sofia',
    skin: SKIN.light,
    hair: '#8a6a45',
    shirt: '#7fa05e',
    pants: '#414a54',
    long: true,
    lines: [
      'A model is only as good as the pipeline feeding it. He said that in second year too.',
      'He was right then as well; nobody listened then either.',
    ],
  },
]

/**
 * The class, seated. Their `position` is their desk, which is where the
 * lecture puts them; they come in from the doors, and `game/lecture.ts`
 * walks them there.
 */
export const CLASS: Npc[] = LOOK.map((look, i) => {
  const seat = SEATS[i]
  return {
    id: `class-${i}`,
    name: look.name,
    role: 'ECE student',
    area: 'university',
    position: seat.position,
    facing: Math.PI,
    colors: {
      skin: look.skin,
      hair: look.hair,
      shirt: look.shirt,
      pants: look.pants,
    },
    hair: look.long ? 'long' : undefined,
    dress: look.dress,
    prop: look.prop,
    lectureOnly: true,
    lecture: seat.position,
    lines: look.lines,
  }
})
