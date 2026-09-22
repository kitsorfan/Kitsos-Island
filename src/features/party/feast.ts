import { INTERIOR_BY_ID } from '../interior/interiors'
import { NPCS } from '../island/world'
import { interiorColliders } from '../interior/interiorLogic'
import { LECTURE, classPresent } from '../lecture/lecture'
import type { Collider } from '../island/terrainLogic'
import type { Npc, Vec2 } from '../../types'

/**
 * Christmas Day, in the one room it happens in.
 *
 * The rest of the year the family is spread through Kitsos House, a person to
 * a room. Turn the calendar on the basement wall to the twenty-fifth of
 * December and they all come downstairs: everyone with a `feast` seat is in
 * here instead of in their own room, the in-laws exist at all, and every one
 * of them has something else to say.
 *
 * The day has two halves. Before the meal is called they are standing about
 * in knots talking, which is what a family Christmas actually looks like for
 * most of its length. He is the host, so the meal begins when he walks up to
 * the head of the table: everybody leaves their conversation, comes and takes
 * their place, and the table lays itself. Walk away again and it goes back to
 * a room full of people talking.
 *
 * Both the render and the interaction pass go through `residentsOf`, so the
 * person you can see and the person you can talk to are never in two
 * different places.
 */

/** The room the meal is in, and has always been in. */
export const FEAST_AREA = 'house-basement'

/** The middle of the long table, which is what everyone sat at it looks at. */
export const TABLE: Vec2 = [0, -5]

/**
 * The head of the table, and his chair. Nobody else is ever given it: the six
 * seats and four standing places below leave it empty, so walking into it is
 * the host sitting down.
 */
export const HOST_SEAT: Vec2 = [-6.2, -5]

/**
 * Close enough to the head of the table to be taking your place at it, and
 * far enough from it to have left. Two thresholds rather than one, so
 * standing on the line does not call ten people to the table and back twice
 * a second.
 */
const CALL_IN = 3.6
const CALL_OUT = 7.4

/**
 * Whether the meal has been called. Mutated from the player's frame loop and
 * read by every character's, the same way the party and the gate are — a
 * living scene should not be re-rendering React to move somebody's feet.
 */
export const FEAST = {
  seated: false,
  /** Seconds on the wall clock when the meal was called, for the stagger. */
  calledAt: 0,
  /**
   * Who has actually reached their place, by id. Each character adds itself
   * and takes itself out again, so the toast waits for the last of them
   * rather than for the moment the meal was called.
   */
  atTable: new Set<string>(),
}

/** How many places the table is laid for. */
export const FEAST_COUNT = NPCS.filter((n) => n.feast).length

/** Everybody called to the table is standing at it. */
export const wholeTable = () =>
  FEAST.seated && FEAST.atTable.size >= FEAST_COUNT

/** Puts everyone back on their feet, for a calendar turned off the day. */
export function clearFeast() {
  FEAST.seated = false
  FEAST.atTable.clear()
}

/**
 * Reads the host's position and decides whether the meal is on. Returns true
 * on the frame it changes, which is the frame worth making a sound on.
 */
export function stepFeast(x: number, z: number): boolean {
  const gap = Math.hypot(x - HOST_SEAT[0], z - HOST_SEAT[1])
  const wanted = FEAST.seated ? gap < CALL_OUT : gap < CALL_IN
  if (wanted === FEAST.seated) return false
  FEAST.seated = wanted
  if (wanted) FEAST.calledAt = performance.now() / 1000
  // Getting up empties the table; everyone re-enters it on the way back.
  if (!wanted) FEAST.atTable.clear()
  return true
}

/** How fast somebody crosses the room when the meal is called. */
export const FEAST_WALK = 2.9

/**
 * The way round the table, for the three of them who stand north of it
 * before the meal and sit south of it after.
 *
 * There is eight feet of solid table in between, and walking somebody into
 * it and letting the collision resolver push them out again leaves them
 * shuffling against the edge for ever: the push-out is exactly opposite the
 * step, so they never get anywhere and never pick a side. So they are given
 * the end of the table to go round first, and head for their place once they
 * are past it. Both waypoints sit south of every chair, so the walk along is
 * clear.
 */
const WEST_WAY: Vec2 = [-7.6, -9.2]
const EAST_WAY: Vec2 = [8.6, -9.2]

const VIA: Record<string, Vec2> = {
  'family-kostis': WEST_WAY,
  'family-father': WEST_WAY,
  'family-mother': EAST_WAY,
  'family-rafail': EAST_WAY,
}

/** The corner they have to get round on the way to their place, if any. */
export const viaFor = (id: string): Vec2 | undefined => VIA[id]

/** How close counts as having got round it. */
export const VIA_REACHED = 0.8

/**
 * How long after the meal is called each of them sets off.
 *
 * Ten people leaving a conversation on the same frame is a parade-ground
 * turn, not a family sitting down, so they go in ones and twos. It is also
 * what keeps the lane along the far side of the table passable: it is a body
 * and a half wide, and four of them have places along it — so whoever sits
 * furthest down it walks first and the next one stops short of them, rather
 * than the two of them meeting halfway and both stopping for good.
 */
const SET_OFF: Record<string, number> = {
  /* Round the west end and along it: the further place first. */
  'family-father': 0,
  'family-kostis': 1,
  /* Round the east end, likewise. */
  'family-mother': 0.2,
  'family-rafail': 3.4,
  /* Everybody else has a clear walk, and just takes a moment first. */
  'inlaw-father': 0.5,
  'family-alexis': 0.7,
  'amalia-home': 0.9,
  'inlaw-mother': 1.1,
  'family-alexandra': 1.4,
  'inlaw-angelica': 1.6,
}

export const setOffFor = (id: string) => SET_OFF[id] ?? 0

/**
 * The basement's furniture, as things to walk round rather than through.
 *
 * Built once and kept: the room never changes shape, and this is read ten
 * times a frame while the family is crossing it. The decorated set, so the
 * tree and the hearth are in it too.
 */
let furniture: Collider[] | null = null
export function feastFurniture(): Collider[] {
  if (!furniture) {
    const room = INTERIOR_BY_ID.get(FEAST_AREA)
    furniture = room ? interiorColliders(room, true) : []
  }
  return furniture
}

/**
 * What the host wears to it: a bottle-green dinner jacket over a white shirt,
 * black trousers, a red bow tie and a holly berry in the buttonhole.
 *
 * It is not an outfit he picks. Anybody hosting Christmas dinner in this
 * family is dressed for it, so it goes on when he walks into the decorated
 * room and comes off when he walks out — the tuxedo, which belongs to the
 * proposal, still wins over it.
 */
export const HOST_SUIT = {
  skin: '#f0c39a',
  hair: '#3a2a1d',
  /** The jacket. The lapels the rig draws over it stay black. */
  shirt: '#1d4235',
  pants: '#191c22',
} as const

export const HOST_BOW_TIE = '#b5232b'
export const HOST_BUTTONHOLE = '#c8402c'

/**
 * Who is talking to whom before the meal is called, and where they are
 * standing to do it. Four knots rather than one crowd: a family this size
 * never has one conversation, and a ring of ten facing inward would read as
 * a meeting.
 *
 * Every centre is clear of the furniture with a body's width to spare —
 * there is a check for it in the repo's scratch scripts, and the clusters
 * were moved twice to satisfy it.
 */
const CLUSTERS: { at: Vec2; radius: number; who: string[] }[] = [
  /* The two fathers and the brother who builds things, by the toy box. */
  {
    at: [-8, 3.2],
    radius: 1.45,
    who: ['family-father', 'inlaw-father', 'family-kostis'],
  },
  /* The two mothers and Amalia, nearer the stairs and the food. */
  {
    at: [5.6, 2.6],
    radius: 1.45,
    who: ['family-mother', 'inlaw-mother', 'amalia-home'],
  },
  /* The younger two, out of the way of both. */
  { at: [-5.6, 7], radius: 1.25, who: ['family-alexandra', 'inlaw-angelica'] },
  /* And the brothers who are still arguing about the football. */
  { at: [9.6, -6], radius: 1.25, who: ['family-rafail', 'family-alexis'] },
]

/**
 * Where somebody stands before the meal, and which way they are turned.
 *
 * Evenly round their own cluster facing its middle, so a knot of three reads
 * as three people talking to each other rather than three people who happen
 * to be near each other.
 */
function mingleSpot(id: string): { position: Vec2; facing: number } | null {
  for (const cluster of CLUSTERS) {
    const seat = cluster.who.indexOf(id)
    if (seat < 0) continue
    const angle = (seat / cluster.who.length) * Math.PI * 2 + 0.7
    return {
      position: [
        cluster.at[0] + Math.sin(angle) * cluster.radius,
        cluster.at[1] + Math.cos(angle) * cluster.radius,
      ],
      // Facing the middle is facing the opposite way to standing out of it.
      facing: angle + Math.PI,
    }
  }
  return null
}

/** Which way to turn to look at the table, from anywhere round it. */
export const facingTable = (position: Vec2) =>
  Math.atan2(TABLE[0] - position[0], TABLE[1] - position[1])

/**
 * Where somebody stands in `area` right now, or null if they are not in it.
 *
 * A feasting NPC comes back as a copy standing where they start the day —
 * in their conversation — with the day's lines already swapped in. Their seat
 * stays on `feast`, and their own frame loop walks them to it and back as the
 * meal is called and left.
 */
export function placed(npc: Npc, area: string, christmas: boolean): Npc | null {
  if (christmas && npc.feast) {
    if (area !== FEAST_AREA) return null
    const spot = mingleSpot(npc.id)
    const wear = npc.feastWear
    return {
      ...npc,
      area: FEAST_AREA,
      position: spot ? spot.position : npc.feast,
      facing: spot ? spot.facing : facingTable(npc.feast),
      lines: npc.feastLines ?? npc.lines,
      // Everybody in this family dresses for Christmas dinner — and nobody
      // wears a baseball cap to it, not even Rafail.
      colors: {
        ...npc.colors,
        shirt: wear?.shirt ?? npc.colors.shirt,
        pants: wear?.pants ?? npc.colors.pants,
      },
      dress: wear?.dress ?? npc.dress,
      dressTrim: wear?.dressTrim ?? npc.dressTrim,
      suit: wear?.suit,
      /* Nobody comes to Christmas dinner in the clothes they work in: the
         cap comes off, and so does the hard hat and the site blazer Angelica
         spends the rest of the year in. */
      prop: npc.prop === 'cap' || npc.prop === 'hardhat' ? undefined : npc.prop,
      blazer: undefined,
      blouse: undefined,
    }
  }
  // The in-laws are here for the meal and for nothing else.
  if (npc.feastOnly) return null
  // And the class is in the lecture hall for the defence and nothing else:
  // they file in when he steps up to the lectern and file out again when he
  // steps down. `classPresent` covers both halves of that, so somebody on
  // their way to the door is still somebody in the room; each of them drops
  // out of the roster as they reach one. `game/lecture.ts` owns all of it.
  if (npc.lectureOnly && (!classPresent() || LECTURE.gone.has(npc.id))) {
    return null
  }
  return npc.area === area ? npc : null
}

/** Everyone standing in an area today, in NPCS order. */
export function residentsOf(area: string, christmas: boolean): Npc[] {
  const out: Npc[] = []
  for (const npc of NPCS) {
    const here = placed(npc, area, christmas)
    if (here) out.push(here)
  }
  return out
}
