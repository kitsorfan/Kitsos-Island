import type { InteriorLink, Vec2 } from '../../types'

/**
 * The Army Camp, inside.
 *
 * Two rooms. The barracks behind the front door, where anybody may walk in
 * off the road, and the operations room through the east wall, where only an
 * officer may. The door between them is not locked; it is a matter of what
 * you are wearing. His kit hangs on the locker by the service record, and in
 * it the door opens and the duty bell answers.
 *
 *     [ barracks ]──east──[ operations room ]
 *
 * The uniform belongs to the building. It goes on at the locker, it is worn
 * from room to room, and it stays behind when he walks out of the gate —
 * the store puts him back in his own clothes on the way.
 *
 * The render pass and the player controller both read these, so the locker
 * he is prompted at and the locker the kit is drawn on are the same numbers.
 */

/** The barracks, which is the room behind the gate. */
export const ARMY_AREA = 'army'

/** And the room behind the door that wants a uniform. */
export const OPS_AREA = 'army-ops'

/** Both rooms of the building, which is where the uniform may be worn. */
export const ARMY_ROOMS = new Set([ARMY_AREA, OPS_AREA])

/**
 * The officer's kit: pattern combat uniform, a shade darker in the trouser,
 * and the beret that was earned at Rentina.
 */
export const OFFICER_UNIFORM = {
  skin: '#f0c39a',
  hair: '#3a2a1d',
  shirt: '#6b7446',
  pants: '#555c39',
} as const

/**
 * Whether a door will let him through dressed as he is. Every door that
 * does not care says yes.
 */
export function admits(link: InteriorLink, outfit: string): boolean {
  return !link.dress || link.dress === outfit
}

/**
 * The locker his kit hangs on, against the north wall of the barracks — the
 * one already standing east of the service record. The kit is drawn on its
 * door, and emptied off it while he is wearing it.
 */
export const UNIFORM_LOCKER: Vec2 = [3, -9.8]

/**
 * The duty bell, on its bracket on the north wall, between the painting and
 * the first of the lockers.
 */
export const DUTY_BELL: Vec2 = [-8.2, -10.25]

/* ------------------------------ inspection ----------------------------- */

/**
 * Evening inspection, which is what the bell is for.
 *
 * Five privates come in through the front door at a march, one behind the
 * other, and each one peels off to the foot of his own bunk and turns in to
 * face the room. When the last of them is standing still, the orderly
 * reports. They stay at attention for as long as he is in the room; walk out
 * and the barracks is back to the way he found it.
 */

/** Where they come in: just inside the front doorway. */
const DOORWAY: Vec2 = [0, 9.6]

/**
 * The foot of each bunk, a stride in from the rail, in the order they file
 * in. The bunks stand at x = ±11 with their ends to the wall, so the room
 * side of each is at ±10.05.
 */
export const BUNK_FEET: Vec2[] = [
  [-9, 4],
  [9, 4],
  [-9, -1],
  [9, -1],
  [-9, -6],
]

/** Metres a second at the march. */
export const MARCH_SPEED = 3.4

/** Seconds between one man coming through the door and the next. */
export const MARCH_STAGGER = 0.9

/**
 * Each man's route to his bunk: in through the door, round the table in the
 * middle on his own side of it, up the aisle, and across to the rail.
 *
 * The aisles run a stride clear of the table (x ±1.25), the sandbags by the
 * door on the west (x -3.15 at their nearest) and the weight bench on the
 * east (x 4.55), so nobody marches through the furniture.
 */
export function marchRoute(i: number): Vec2[] {
  const spot = BUNK_FEET[i]
  const side = Math.sign(spot[0])
  const aisle = side * 2.6
  return [DOORWAY, [aisle, 7.8], [aisle, spot[1]], spot]
}

/** How far a route runs, end to end. */
function routeLength(route: Vec2[]): number {
  let total = 0
  for (let k = 1; k < route.length; k++) {
    total += Math.hypot(
      route[k][0] - route[k - 1][0],
      route[k][1] - route[k - 1][1],
    )
  }
  return total
}

export interface MarchStep {
  x: number
  z: number
  /** Y-rotation to face: along the route while walking, into the room once there. */
  facing: number
  /** Through the door yet. Before this he is still outside and is not drawn. */
  entered: boolean
  /** Standing at his bunk. */
  arrived: boolean
}

/**
 * Where the i-th man is, `t` seconds after the bell.
 *
 * Pure, so the inspection has one answer at any moment and the test can ask
 * it the same question the frame loop does.
 */
export function marchAt(i: number, t: number): MarchStep {
  const route = marchRoute(i)
  const spot = BUNK_FEET[i]
  /* Facing the aisle down the middle of the room: +x from the west rail,
     -x from the east. */
  const inward = spot[0] < 0 ? Math.PI / 2 : -Math.PI / 2
  const walked = (t - i * MARCH_STAGGER) * MARCH_SPEED
  if (walked <= 0) {
    return {
      x: route[0][0],
      z: route[0][1],
      facing: Math.PI,
      entered: false,
      arrived: false,
    }
  }
  let left = walked
  for (let k = 1; k < route.length; k++) {
    const [ax, az] = route[k - 1]
    const [bx, bz] = route[k]
    const leg = Math.hypot(bx - ax, bz - az)
    if (left <= leg) {
      const f = leg === 0 ? 1 : left / leg
      return {
        x: ax + (bx - ax) * f,
        z: az + (bz - az) * f,
        facing: Math.atan2(bx - ax, bz - az),
        entered: true,
        arrived: false,
      }
    }
    left -= leg
  }
  return {
    x: spot[0],
    z: spot[1],
    facing: inward,
    entered: true,
    arrived: true,
  }
}

/** Seconds from the bell to the last man standing at his bunk. */
export const MARCH_LENGTH = Math.max(
  ...BUNK_FEET.map(
    (_, i) => i * MARCH_STAGGER + routeLength(marchRoute(i)) / MARCH_SPEED,
  ),
)

/** And the beat after that, standing still, before the orderly speaks. */
export const REPORT_AT = MARCH_LENGTH + 0.8

/**
 * The five of them. Not anybody real — a barracks is a room with people in
 * it, the way the lecture hall is — so none of them files anything.
 */
export const PRIVATES: {
  name: string
  skin: string
  hair: string
}[] = [
  { name: 'Private Karras', skin: '#d99e6f', hair: '#241a14' },
  { name: 'Private Lampros', skin: '#f0c39a', hair: '#3b2a1c' },
  { name: 'Private Vlachos', skin: '#a2683f', hair: '#1f1a17' },
  { name: 'Private Sideris', skin: '#f0c39a', hair: '#6b4a2f' },
  { name: 'Private Dimou', skin: '#d99e6f', hair: '#2d2018' },
]

/** What the privates wear: fatigues, a shade plainer than an officer's. */
export const FATIGUES = { shirt: '#6f7f4a', pants: '#4c5238' } as const

/** The orderly's report, once the last of them is still. */
export const INSPECTION_REPORT = {
  speaker: 'Barracks orderly',
  role: 'Evening inspection',
  lines: [
    'Barracks — attention! Five men, one to a bunk, heels on the line.',
    'Lieutenant, barracks ready for inspection! Beds made, lockers squared, nobody missing.',
    'Permission to turn in once the Lieutenant has walked the line, sir.',
  ],
}
