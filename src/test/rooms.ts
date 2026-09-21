import type { Interior, InteriorLink } from '../types'

/**
 * Rooms and links to test against.
 *
 * A real `Interior` carries a good deal that has nothing to do with whether
 * you can walk through a door — a kicker, four colours, a rug — and spelling
 * all of that out in every test would bury the one field the test is actually
 * about. These fill in the rest so a test can name only what it cares about,
 * and they are typed rather than cast, so a change to the shape of a room is
 * a compile error here instead of a puzzle at run time.
 */

export function testLink(over: Partial<InteriorLink> = {}): InteriorLink {
  return {
    id: 'a-way-through',
    label: 'A door',
    kind: 'door',
    position: [0, 0],
    to: 'somewhere',
    ...over,
  }
}

export function testRoom(over: Partial<Interior> = {}): Interior {
  return {
    id: 'test-room',
    name: 'A room',
    kicker: 'Somewhere',
    half: [8, 10],
    floor: '#3b3b3b',
    rug: '#7a4a3a',
    wall: '#e8e2d8',
    accent: '#ff8c1a',
    spawn: [0, 0],
    props: [],
    exhibits: [],
    ...over,
  }
}
