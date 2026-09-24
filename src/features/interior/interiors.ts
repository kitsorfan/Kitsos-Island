import type { Interior, LiftStop } from '../../types'
import {
  ARMY_SECTIONS,
  CERTIFICATIONS_SECTIONS,
  ELEMENTARY_SECTIONS,
  EVANGELIKI_CLUBS_SECTIONS,
  EVANGELIKI_SECTIONS,
  FAMILY_SECTIONS,
  GARAGE_SECTIONS,
  GLOBE_SECTIONS,
  GUIDE_SECTIONS,
  HOUSE_SECTIONS,
  LAB_SECTIONS,
  LIBRARY_SECTIONS,
  PLAYROOM_SECTIONS,
  CAPABILITIES_SECTIONS,
  IBM_SECTIONS,
  IONIDIOS_SECTIONS,
  LIGHTHOUSE_SECTIONS,
  PLATFORM_SECTIONS,
  PUBLICATION_SECTIONS,
  RADIO_SECTIONS,
  REFERENCE_ACADEMY_SECTIONS,
  REFERENCE_ARMY_SECTIONS,
  REFERENCE_FOUNDATION_SECTIONS,
  REFERENCE_IONIDIOS_SECTIONS,
  SKILLS_SECTIONS,
  STUDENT_LIFE_SECTIONS,
  THESIS_SECTIONS,
  TOY_SHELF_SECTIONS,
  TRANSCRIPT_SECTIONS,
  UNIVERSITY_SECTIONS,
  STUDENT_JOBS_SECTIONS,
  VELTISTON_SECTIONS,
  VELTISTON_STACK_SECTIONS,
  WORK_DIRECTORY_SECTIONS,
  VERNE_SECTIONS,
  VOLUNTEER_SECTIONS,
} from '../cv/profile'

/**
 * The panel inside the Work District lift. Every car has the same one, which
 * is the point of it: from anywhere in the building you can see that there
 * are three floors and that one of them is not built.
 *
 * Listed from the ground up, because that is the order he worked them; the
 * panel turns the list over to draw it, so the buttons stand the way the
 * building does.
 */
const LIFT_PANEL: LiftStop[] = [
  { floor: 0, label: 'Reception', to: 'work' },
  { floor: 1, label: 'IBM', when: '2023–2024', to: 'work-ibm' },
  {
    floor: 2,
    label: 'Veltiston AI',
    when: '2024–present',
    to: 'work-veltiston',
  },
  /*
   * The third floor. The button is the last thing in the building and it is
   * pointed at whoever is reading: the shaft is built, the floor is empty,
   * and the only person who can say what goes on it is the one pressing.
   */
  {
    floor: 3,
    label: '?',
    lines: [
      'You press it. The button does not light — but somewhere above you, something heavy shifts in the shaft.',
      'The floor is there. Poured, wired, empty. The lift was built to reach it.',
      'IBM taught him how large systems actually fail. Veltiston AI taught him how to build one fast enough to matter, for people who feel it on a Monday morning.',
      'So: third floor. Nobody has decided what it is yet.',
      'You could.',
    ],
  },
]

/**
 * The rooms. The one behind each building's door on the island has that door
 * in its +Z wall, so you walk in facing -Z with the way out behind you. The
 * other rooms of a building hang off it through links — a door in a wall, a
 * flight up, a well down — and every link has its partner on the far side, so
 * the room you arrive in has the way back exactly where you came in.
 *
 * Kitsos House, room by room:
 *
 *     first floor    [ landing ]──east──[ lab ]
 *                        ║ well
 *     ground floor   [ library ]──east──[ living room ]──east──[ garage ]
 *                        ║ shelf              ║ well
 *                    [ playroom ]        [ basement ]
 */
export const INTERIORS: Interior[] = [
  {
    id: 'house',
    name: 'Kitsos House',
    kicker: 'Living room',
    half: [13.5, 10.5],
    floor: '#c9a273',
    rug: '#b8474a',
    wall: '#f6f1e4',
    accent: '#e0574a',
    spawn: [0, 5],
    windows: [
      { side: 'west', at: 0.42 },
      { side: 'east', at: -0.2 },
    ],
    props: [
      /* The living half, west of the door. */
      { kind: 'rug', position: [-7, 2], scale: 1.35, solid: false },
      { kind: 'sofa', position: [-7.5, 5.2], rotation: Math.PI },
      { kind: 'armchair', position: [-3.6, 3.4], rotation: -Math.PI / 2 },
      { kind: 'table', position: [-7, 1.6] },
      /* Between the library door and the foot of the stairs. */
      { kind: 'bookshelf', position: [-12.7, -6.8], rotation: Math.PI / 2 },
      { kind: 'lamp', position: [-12.4, 7.4] },
      { kind: 'plant', position: [-12.8, 9] },
      /* On the stretch of north wall between the two staircases, next to
         the trainer card. */
      { kind: 'painting', position: [-4, -10.2] },

      /* The kitchen, and the table they actually eat at. */
      { kind: 'stove', position: [2.6, 9.6], rotation: Math.PI },
      { kind: 'kitchen', position: [6.5, 9.6], rotation: Math.PI },
      { kind: 'kitchen', position: [10.6, 9.6], rotation: Math.PI },
      { kind: 'table', position: [7.5, 3.6] },
      { kind: 'chair', position: [7.5, 1.8] },
      { kind: 'chair', position: [7.5, 5.4], rotation: Math.PI },
      { kind: 'chair', position: [5.4, 3.6], rotation: Math.PI / 2 },
      { kind: 'chair', position: [9.6, 3.6], rotation: -Math.PI / 2 },
      { kind: 'plant', position: [12.9, 6.4] },

      /* And the board that never gets put away. */
      { kind: 'chessTable', position: [10.2, -6.4] },
      { kind: 'chair', position: [10.2, -8.4], rotation: Math.PI },
      { kind: 'chair', position: [8.2, -6.4], rotation: Math.PI / 2 },
    ],
    /**
     * Both staircases stand against the north wall, the flight up along the
     * western end of it and the well down cut into the eastern, with the
     * trainer card on the wall between them. The two doors face each other
     * across the room: library west, garage east.
     */
    links: [
      {
        id: 'house-down',
        kind: 'stairsDown',
        label: 'the stairs to the basement',
        position: [6, -8.6],
        to: 'house-basement',
        journal: {
          title: 'The basement stairs',
          body: 'Under Kitsos House: the basement where his mother and father stand, at the table the seven of them grew up round.',
        },
      },
      {
        id: 'house-up',
        kind: 'stairsUp',
        label: 'the stairs to the landing',
        position: [-9.5, -8.6],
        rotation: Math.PI / 2,
        to: 'house-upstairs',
        journal: {
          title: 'Upstairs',
          body: 'The first floor of Kitsos House: the landing, the lab at the end of it, and a door that does not open yet.',
        },
      },
      {
        id: 'house-library',
        kind: 'door',
        label: 'the door to the library',
        position: [-13.3, -2],
        rotation: Math.PI / 2,
        to: 'house-library',
      },
      /* The garage is off the house, not under it: you go out through the
         east wall at ground level and the shutter opens onto the street. */
      {
        id: 'house-garage',
        kind: 'door',
        label: 'the door to the garage',
        position: [13.3, -2],
        rotation: -Math.PI / 2,
        to: 'house-garage',
      },
    ],
    exhibits: [
      {
        id: 'house-card',
        kind: 'board',
        label: 'the trainer card',
        position: [1.5, -10.1],
        panel: {
          kicker: 'Kitsos House',
          title: 'Who lives here',
          sections: HOUSE_SECTIONS,
        },
        journal: {
          title: 'Kitsos House',
          body: 'Athens-based senior full stack engineer and technical lead: Java, Spring Boot, React and AWS, with the teams to match.',
        },
      },
      {
        id: 'house-key',
        kind: 'key',
        label: 'the shelf by the chessboard',
        position: [12.9, -8.6],
        keyId: 'key-house',
      },
    ],
  },

  /* ---------------------------- downstairs ---------------------------- */

  /**
   * The basement: the long table the seven of them grew up round, the wall of
   * photographs, and the toys nobody threw out. His mother and his father are
   * down here, standing at either end of the table. Nothing else opens off it
   * any more — one staircase, and a room kept the way it was.
   */
  {
    id: 'house-basement',
    name: 'Kitsos House',
    kicker: 'The basement',
    building: 'house',
    half: [15, 11],
    floor: '#9a8f7e',
    rug: '#8a5a3c',
    wall: '#e0d6c4',
    accent: '#c2566b',
    spawn: [13, 5.96],
    /* Lit like any other room in the house rather than as a cellar: the
       joists an underground room hangs from its ceiling are drawn right
       across the one thing you came down here to look at. */
    links: [
      /* The flight back up, along the east wall under the living room's
         well, climbing towards the back of the house. On the east wall
         rather than the south, which the camera fades out from under it:
         a flight against a wall you cannot see stands in the room. */
      {
        id: 'basement-up',
        kind: 'stairsUp',
        label: 'the stairs up to the living room',
        position: [13, 2.6],
        to: 'house',
      },
    ],
    props: [
      /* The table, laid for all seven of them. */
      { kind: 'rug', position: [0, -5], scale: 1.5, solid: false },
      { kind: 'longTable', position: [0, -5] },
      { kind: 'chair', position: [-4.9, -5], rotation: Math.PI / 2 },
      { kind: 'chair', position: [4.9, -5], rotation: -Math.PI / 2 },
      { kind: 'chair', position: [-2.6, -7.2] },
      { kind: 'chair', position: [0, -7.2] },
      { kind: 'chair', position: [2.6, -7.2] },
      { kind: 'chair', position: [-1.3, -2.9], rotation: Math.PI },
      { kind: 'chair', position: [1.3, -2.9], rotation: Math.PI },

      /* And the walls of them, which are the whole point of the room. */
      { kind: 'photoWall', position: [-4, -10.7], solid: false },
      {
        kind: 'photoWall',
        position: [-14.7, -3],
        rotation: Math.PI / 2,
        solid: false,
      },

      /* Nothing down here was ever thrown away. */
      /* Under the calendar, clear of the head of the stairs. */
      { kind: 'toyBox', position: [12.6, -2.6] },
      { kind: 'toyBox', position: [-12.4, -1.4], rotation: -Math.PI / 5 },
      { kind: 'lamp', position: [-12.6, -8.6] },
      { kind: 'plant', position: [12.8, -9.2] },
      { kind: 'shelfUnit', position: [11.8, 9.6] },
      { kind: 'boiler', position: [-13.4, 9.6] },
      /* Stacked against the west wall, where the stairs used to leave room. */
      { kind: 'crate', position: [-13.4, 1.2] },
      { kind: 'crate', position: [-13.2, 3.2] },
      { kind: 'plant', position: [-12.8, 6.4] },
    ],
    /**
     * What goes up when the calendar on the east wall is turned to the
     * twenty-fifth of December, and comes down again when it is turned back.
     * The tree stands clear of the table so ten people can get round it.
     */
    festive: [
      /* The hearth, lit, and most of what the room is lit by on the day. */
      { kind: 'fireplace', position: [-11.6, -10.5] },
      { kind: 'christmasTree', position: [-11.6, -5] },
      /* Laid the moment he reaches the head of it, and cleared when he
         walks away: the prop reads the live state itself. */
      { kind: 'feastTable', position: [0, -5], solid: false },
      /* One over the mantel, where a wreath goes, and one on the bare
         stretch of wall at the other end. */
      { kind: 'wreath', position: [-11.6, -10.2], solid: false },
      { kind: 'wreath', position: [10.6, -10.85], solid: false },
      /* Strung right round the three walls that stay drawn. Nothing goes on
         the south one: props sit outside the group that fades the near wall
         out of your way, so a swag on it would hang in mid air in front of
         the room. */
      { kind: 'garland', position: [0, -10.9], solid: false },
      /* Clear of the chimney breast, which comes forward off this wall. */
      { kind: 'garland', position: [-6.6, -10.9], solid: false },
      { kind: 'garland', position: [10.6, -10.9], solid: false },
      {
        kind: 'garland',
        position: [-14.9, 4],
        rotation: Math.PI / 2,
        solid: false,
      },
      {
        kind: 'garland',
        position: [-14.9, -4],
        rotation: Math.PI / 2,
        solid: false,
      },
      {
        kind: 'garland',
        position: [14.9, 7],
        rotation: -Math.PI / 2,
        solid: false,
      },
      {
        kind: 'garland',
        position: [14.9, 0.4],
        rotation: -Math.PI / 2,
        solid: false,
      },
    ],
    exhibits: [
      {
        id: 'basement-family',
        kind: 'board',
        label: 'the photographs',
        position: [5, -10.6],
        panel: {
          kicker: 'The basement',
          title: 'The house I grew up in',
          sections: FAMILY_SECTIONS,
        },
        journal: {
          title: 'Seven at the table',
          body: 'Father, mother, three brothers, one sister and him. A big family is a small organisation: nobody hands you a role, you find the thing that needs doing.',
        },
      },
      /**
       * It says the eighth of April, which is his birthday, and looks like a
       * thing on a wall. It comes off the nail, and one other date in the
       * year is worth turning it to. No journal entry here: filing one for
       * having looked at a calendar would give the whole thing away.
       */
      {
        id: 'basement-calendar',
        kind: 'calendar',
        label: 'the calendar',
        position: [14.8, -4],
        rotation: -Math.PI / 2,
      },
    ],
  },

  {
    id: 'house-garage',
    name: 'Kitsos House',
    kicker: 'The garage',
    building: 'house',
    half: [13, 9],
    floor: '#7e7a72',
    rug: '#8a5a3c',
    wall: '#cfc9bc',
    accent: '#d9853f',
    spawn: [-9.8, -2],
    /* Ground level, off the side of the house — so it gets a window, and the
       shutter at the back really does open onto the street. */
    windows: [{ side: 'east', at: 0.3 }],
    links: [
      /* The door in from the living room, on the wall the house is on. */
      {
        id: 'garage-house',
        kind: 'door',
        label: 'the door to the living room',
        position: [-12.8, -2],
        rotation: Math.PI / 2,
        to: 'house',
      },
    ],
    props: [
      /* The shutter it all came in through, with the car nosed at it. It
         stands clear of the north wall rather than flush against it: flush,
         the two surfaces fight for the same depth and the door flickers. */
      { kind: 'shutter', position: [-5, -8.7], solid: false },
      { kind: 'car', position: [-5, -3], rotation: Math.PI / 2 },
      /* Leant on the wall past the door, where nobody trips over it. */
      { kind: 'bicycle', position: [-12.2, 4.6], rotation: Math.PI / 2 },

      /* The bench along the back wall, and the board over it. */
      { kind: 'workbench', position: [5.6, -8.2] },
      { kind: 'pegboard', position: [5.6, -8.82], solid: false },
      { kind: 'toolChest', position: [9.6, -8.2] },
      { kind: 'shelfUnit', position: [-11.4, -8.2] },
      { kind: 'crate', position: [11.6, 4] },
      { kind: 'crate', position: [11.4, 6.2] },
      { kind: 'lamp', position: [11.8, -4.4] },
    ],
    exhibits: [
      {
        id: 'garage-bench',
        kind: 'case',
        label: 'the workbench',
        position: [0, -8.3],
        panel: {
          kicker: 'The garage',
          title: 'The garage',
          sections: GARAGE_SECTIONS,
        },
        journal: {
          title: 'The garage',
          body: 'Tools on the board, bench along the back wall, car on one side and the bicycle on the other. Half the furniture upstairs was built here.',
        },
      },
    ],
  },

  {
    id: 'house-lab',
    name: 'Kitsos House',
    kicker: 'The lab',
    building: 'house',
    half: [11, 8],
    floor: '#5f6470',
    rug: '#2f4a6b',
    wall: '#c9cdd4',
    accent: '#3fa9d4',
    spawn: [-7.8, 1],
    windows: [{ side: 'east', at: 0.5 }],
    links: [
      /* Back out onto the landing, through the west wall. */
      {
        id: 'lab-landing',
        kind: 'door',
        label: 'the door to the landing',
        position: [-10.8, 1],
        rotation: Math.PI / 2,
        to: 'house-upstairs',
      },
    ],
    props: [
      /* One small server doing far more jobs than it was ever sold for. */
      { kind: 'serverRack', position: [-9.4, -6] },
      { kind: 'serverRack', position: [-6.4, -6] },
      { kind: 'desk', position: [4, -6.4] },
      { kind: 'monitor', position: [3.2, -7], solid: false },
      { kind: 'monitor', position: [4.8, -7], solid: false },
      { kind: 'chair', position: [4, -4.6], rotation: Math.PI },

      /* And the bench where things get soldered until they blink. */
      { kind: 'desk', position: [9.4, -4.6], rotation: -Math.PI / 2 },
      { kind: 'chair', position: [7.4, -4.6], rotation: -Math.PI / 2 },
      {
        kind: 'monitor',
        position: [10, -5.4],
        rotation: -Math.PI / 2,
        solid: false,
      },
      { kind: 'shelfUnit', position: [-9.2, 6.4] },
      { kind: 'crate', position: [8.8, 6.4] },
      { kind: 'whiteboard', position: [0, -7.8], solid: false },
      { kind: 'lamp', position: [-9.6, 3.8] },
    ],
    exhibits: [
      {
        id: 'lab-server',
        kind: 'terminal',
        label: 'the server',
        position: [-8.2, -2.6],
        rotation: Math.PI / 2,
        panel: {
          kicker: 'The lab',
          title: 'The home lab',
          sections: LAB_SECTIONS,
        },
        journal: {
          title: 'The home lab',
          body: 'A mini server on Linux and a bench of electronics. Everything he knows about running things he learned breaking his own machine at eleven at night, with nobody to escalate to.',
        },
      },
    ],
  },

  {
    id: 'house-library',
    name: 'Kitsos House',
    kicker: 'The library',
    building: 'house',
    half: [11, 8],
    floor: '#8a6a4a',
    rug: '#5d3f6b',
    wall: '#e8dcc2',
    accent: '#8a7233',
    spawn: [7.8, -2],
    windows: [{ side: 'west', at: -0.55 }],
    props: [
      { kind: 'rug', position: [0, 0], solid: false },

      /* The ones he goes back to, west wall, clear of the window. */
      { kind: 'bookshelf', position: [-10.2, -1], rotation: Math.PI / 2 },
      { kind: 'bookshelf', position: [-10.2, 2.4], rotation: Math.PI / 2 },

      /* Verne, east wall, either side of the door in from the living room. */
      { kind: 'bookshelf', position: [10.2, -5.6], rotation: -Math.PI / 2 },
      { kind: 'bookshelf', position: [10.2, 2.2], rotation: -Math.PI / 2 },

      /* And the run along the back, one panel of which is not a shelf. */
      { kind: 'bookshelf', position: [-4, -7.6] },
      { kind: 'bookshelf', position: [4, -7.6] },

      /* The toys, on their own shelf under the window, well away from the
         panel they open. Nobody puts the switch next to the door. */
      { kind: 'toyShelf', position: [-10.2, 5.4], rotation: Math.PI / 2 },

      { kind: 'armchair', position: [0, 1.2], rotation: Math.PI },
      { kind: 'table', position: [-2.8, 1.2], scale: 0.7 },
      { kind: 'lamp', position: [3, 2.2] },
    ],
    links: [
      /* The way in, from the living room next door. */
      {
        id: 'library-house',
        kind: 'door',
        label: 'the door to the living room',
        position: [10.8, -2],
        rotation: -Math.PI / 2,
        to: 'house',
      },
      {
        id: 'library-playroom',
        kind: 'hatch',
        label: 'the shelf that swings',
        /* Dead in line with the two either side of it: a panel standing even
           a few centimetres proud of the run is the one thing that would
           give it away before the helicopter is pressed. */
        position: [0, -7.6],
        to: 'house-playroom',
        needs: 'playroom',
        lines: ['The shelf swings out on a hinge nobody fitted by accident.'],
        journal: {
          title: 'The room that is not on the plans',
          body: 'Behind the middle shelf in the library: a television, a Switch, two beanbags and the posters he never grew out of.',
        },
      },
    ],
    exhibits: [
      {
        id: 'library-shelf',
        kind: 'case',
        label: 'the bookshelf',
        position: [-8.4, -1],
        rotation: Math.PI / 2,
        panel: {
          kicker: 'The library',
          title: 'The shelf downstairs',
          sections: LIBRARY_SECTIONS,
        },
        journal: {
          title: 'The shelf downstairs',
          body: 'Dostoevsky, Hugo, Feynman, Orwell, Remarque, Steinbeck: six books he has gone back to, in a room with one shelf that turns out not to be only a shelf.',
        },
      },
      /*
       * The toys, and the one of them that is wired to something. Pressing
       * the helicopter is what opens the panel at the back of the room — the
       * shelf of books says nothing, because a switch you can find by
       * reading the obvious thing is not a switch.
       */
      {
        id: 'library-toys',
        kind: 'toy',
        /* The prompt names the shelf, never the toy. 'Look at the helicopter'
           hands over the answer from across the room, before a single thing
           has been picked up. */
        label: 'the shelf of toys',
        /* Where you stand to get the prompt: out in the room, off the shelf. */
        position: [-8.4, 5.4],
        rotation: Math.PI / 2,
        /* And where the helicopter actually is, on the middle board of the
           shelf against the west wall — this is what the pointer hits. */
        hitbox: { at: [-10.08, 4.98], y: 1.8, size: 0.5 },
        /*
         * Pressing Enter at the shelf does not open the wall: it brings you
         * close enough to see what is on it. The helicopter is one toy among
         * eight there, and finding it is the easter egg — so the panel is
         * the puzzle and the reveal lives on the toy itself.
         */
        panel: {
          kicker: 'The library',
          title: 'The shelf of toys',
          sections: TOY_SHELF_SECTIONS,
        },
        journal: {
          title: 'The helicopter',
          body: 'A toy shelf in the library, and one toy on it that is a switch. Press the helicopter and the panel at the back of the room lets go.',
        },
        reveals: {
          id: 'playroom',
          title: 'The shelf moves',
          body: 'The helicopter presses down further than a toy should. There is a hinge behind the middle shelf. There is a room behind that.',
        },
      },
      {
        id: 'library-verne',
        kind: 'case',
        label: 'the Verne shelf',
        position: [8.4, 2.2],
        rotation: -Math.PI / 2,
        panel: {
          kicker: 'The library',
          title: 'The Verne shelf',
          sections: VERNE_SECTIONS,
        },
        journal: {
          title: 'The Verne shelf',
          body: 'Five Weeks in a Balloon, Journey to the Centre of the Earth, Twenty Thousand Leagues, The Mysterious Island, A Captain at Fifteen, and A Drama in Livonia. Mostly people somewhere impossible, building their way out, which turned out to be a career.',
        },
      },
    ],
  },

  {
    id: 'house-upstairs',
    name: 'Kitsos House',
    kicker: 'The landing',
    building: 'house',
    half: [11, 8],
    floor: '#bda276',
    rug: '#4a6b8a',
    wall: '#f4ecdc',
    accent: '#2f6fa8',
    spawn: [0, 2.8],
    windows: [{ side: 'north', at: 0.55 }],
    props: [
      { kind: 'rug', position: [-1, -0.6], scale: 1.1, solid: false },
      { kind: 'table', position: [-9.2, -3.4], rotation: Math.PI / 2 },
      { kind: 'plant', position: [-9.4, -6] },
      { kind: 'armchair', position: [-6.2, 1.6], rotation: -Math.PI / 2 },
      { kind: 'lamp', position: [-9.2, 0.6] },
      { kind: 'bookshelf', position: [3.4, -7.6] },
      { kind: 'painting', position: [-4.6, -7.8], solid: false },
      { kind: 'chair', position: [6.4, 4.4], rotation: Math.PI },
    ],
    links: [
      /* The well you came up through, against the south wall: the flight
         below it runs up the living room's north wall, so the landing sits
         over the back of the house. */
      {
        id: 'upstairs-down',
        kind: 'stairsDown',
        label: 'the stairs down to the living room',
        position: [0, 6.1],
        rotation: Math.PI,
        to: 'house',
      },
      {
        id: 'upstairs-lab',
        kind: 'door',
        label: 'the door to the lab',
        position: [10.8, 1],
        rotation: -Math.PI / 2,
        to: 'house-lab',
      },
      {
        id: 'upstairs-hall',
        kind: 'locked',
        label: 'the door at the end of the landing',
        position: [-1.4, -7.9],
        lines: [
          'Locked. Behind it, according to the plans, is the rest of the first floor.',
          'The bedrooms are down there. So is a room that has been "the office" for two years, and a cupboard nobody has opened since the survey.',
          'The handle turns about a centimetre and stops. Whatever is on the other side of it, it is not finished yet.',
          'Come back in a later commit.',
        ],
      },
    ],
    exhibits: [],
  },

  {
    id: 'house-playroom',
    name: 'Kitsos House',
    kicker: 'The room that is not on the plans',
    building: 'house',
    half: [8, 7],
    floor: '#6d5f7a',
    rug: '#3f4a86',
    wall: '#2f2a3d',
    accent: '#ffd166',
    spawn: [0, 4.8],
    underground: true,
    links: [
      /* The back of the shelf that let you in, in the wall you came through. */
      {
        id: 'playroom-library',
        kind: 'hatch',
        label: 'the shelf back to the library',
        position: [0, 6.8],
        rotation: Math.PI,
        to: 'house-library',
      },
    ],
    props: [
      { kind: 'rug', position: [0, -0.6], scale: 0.9, solid: false },
      { kind: 'tv', position: [0, -6.4] },
      { kind: 'beanbag', position: [-2.6, 0.6] },
      { kind: 'beanbag', position: [2.6, 0.6] },
      { kind: 'table', position: [0, -1.4], scale: 0.7 },
      {
        kind: 'poster',
        position: [-7.8, -2.6],
        rotation: Math.PI / 2,
        color: '#1b2340',
        solid: false,
      },
      {
        kind: 'poster',
        position: [-7.8, 1.4],
        rotation: Math.PI / 2,
        color: '#7a1f2b',
        solid: false,
      },
      {
        kind: 'poster',
        position: [7.8, -2.6],
        rotation: -Math.PI / 2,
        color: '#20402c',
        solid: false,
      },
      { kind: 'shelfUnit', position: [6.4, -6.4], scale: 0.8 },
      { kind: 'lamp', position: [-6.6, 5.2] },
    ],
    exhibits: [
      {
        id: 'playroom-shelf',
        kind: 'case',
        label: 'the console under the television',
        position: [3.4, -6.1],
        panel: {
          kicker: 'The playroom',
          title: 'The room that is not on the plans',
          sections: PLAYROOM_SECTIONS,
        },
        journal: {
          title: 'Mario, still',
          body: 'A Switch docked under the television, two beanbags, and the posters he never grew out of: Star Wars in order, the Marvel run in sequence.',
        },
      },
    ],
  },

  /* ----------------------------- the Academy -------------------------- */

  /**
   * The Polytechnic is the lecture hall, with the programming lab off it to
   * the west and the council room to the east.
   *
   *     [ programming lab ]──east──[ lecture hall ]──east──[ council room ]
   */
  {
    id: 'university',
    name: 'NTUA',
    kicker: 'Lecture hall',
    half: [17, 13],
    floor: '#d3c7ab',
    rug: '#3f7bd6',
    wall: '#f2e9d6',
    accent: '#3f7bd6',
    spawn: [0, 7.5],
    props: [
      { kind: 'pillar', position: [-12, 7] },
      { kind: 'pillar', position: [12, 7] },
      { kind: 'pillar', position: [-12, -3] },
      { kind: 'pillar', position: [12, -3] },
      { kind: 'lectern', position: [0, -7.5] },
      { kind: 'blackboard', position: [0, -12.4] },
      { kind: 'schoolDesk', position: [-6, 1] },
      { kind: 'schoolDesk', position: [-2, 1] },
      { kind: 'schoolDesk', position: [2, 1] },
      { kind: 'schoolDesk', position: [6, 1] },
      { kind: 'schoolDesk', position: [-6, 5] },
      { kind: 'schoolDesk', position: [-2, 5] },
      { kind: 'schoolDesk', position: [2, 5] },
      { kind: 'schoolDesk', position: [6, 5] },
      { kind: 'bookshelf', position: [-15.7, -8], rotation: Math.PI / 2 },
      { kind: 'bookshelf', position: [-15.7, -3.5], rotation: Math.PI / 2 },
      { kind: 'globe', position: [14.8, -10] },
      /* The demonstrator's machine, on a desk against the east wall. The
         monitor stands on the desk, so the desk has to be there. */
      { kind: 'desk', position: [15.2, -5], rotation: -Math.PI / 2 },
      { kind: 'monitor', position: [15.2, -5], rotation: -Math.PI / 2 },
      { kind: 'plant', position: [-15.8, 11] },
      { kind: 'plant', position: [15.8, 11] },
    ],
    links: [
      {
        id: 'university-lab',
        kind: 'door',
        label: 'the door to the programming lab',
        position: [-16.8, 2],
        rotation: Math.PI / 2,
        to: 'university-lab',
      },
      {
        id: 'university-council',
        kind: 'door',
        label: 'the door to the council room',
        position: [16.8, 2],
        rotation: -Math.PI / 2,
        to: 'university-council',
      },
    ],
    exhibits: [
      {
        id: 'uni-degree',
        kind: 'board',
        label: 'the degree notice',
        position: [-7, -12.3],
        panel: {
          kicker: 'NTUA',
          title: 'Education',
          sections: UNIVERSITY_SECTIONS,
        },
        journal: {
          title: 'The Polytechnic',
          body: 'MEng in Electrical & Computer Engineering, NTUA, 2017–2022, GPA 8.4.',
        },
      },
      {
        id: 'uni-thesis',
        kind: 'case',
        label: 'the thesis display',
        position: [7, -12.3],
        panel: {
          kicker: 'NTUA',
          title: 'Thesis & contests',
          sections: THESIS_SECTIONS,
        },
      },
      {
        id: 'uni-publication',
        kind: 'case',
        label: 'the publication case',
        position: [15.7, -2],
        rotation: -Math.PI / 2,
        panel: {
          kicker: 'NTUA',
          title: 'Published research',
          sections: PUBLICATION_SECTIONS,
        },
        journal: {
          title: 'Published on arXiv',
          body: '"An M-Health Algorithmic Approach to Identify and Assess Physiotherapy Exercises in Real Time" (arXiv, Cornell University, December 2025). Pose estimation plus a modified Levenshtein distance, running entirely on the client.',
        },
      },
      {
        id: 'uni-certs',
        kind: 'board',
        label: 'the certificate wall',
        position: [15.8, 6.5],
        rotation: -Math.PI / 2,
        panel: {
          kicker: 'NTUA',
          title: 'Certifications',
          sections: CERTIFICATIONS_SECTIONS,
        },
        journal: {
          title: 'Certifications',
          body: 'MIT Open Learning: Universal AI Foundational Modules (2026). CITI Program: Biomedical Research Investigators (2026–2029). IBM Docker Essentials (2024). ECPE and ECCE in English, DELF B2 in French.',
        },
      },
      {
        id: 'uni-reference',
        kind: 'board',
        label: 'the letters of reference',
        position: [-15.8, 8],
        rotation: Math.PI / 2,
        panel: {
          kicker: 'NTUA',
          title: 'References',
          sections: REFERENCE_ACADEMY_SECTIONS,
        },
        journal: {
          title: 'Academic references',
          body: 'Prof. Panagiotis Tsanakas, Dean of the School of ECE and his thesis supervisor: the thesis was "marked by scientific soundness and technological originality", graded with distinction. Stelios Kandylakis, a classmate: "very strong coding skills, a solution-oriented mindset, and a person of integrity."',
        },
      },
      {
        id: 'uni-key',
        kind: 'key',
        label: 'the thesis display shelf',
        position: [9.5, -10.5],
        keyId: 'key-academy',
      },
    ],
  },

  /**
   * The programming lab: two rows of machines, the whiteboard the first-year
   * labs were taught off, and on the wall the two things the year below
   * remembers him for — the transcript, and the hundred and ten pages.
   */
  {
    id: 'university-lab',
    name: 'NTUA',
    kicker: 'The programming lab',
    building: 'university',
    half: [13, 9],
    floor: '#5f6470',
    rug: '#2f4a6b',
    wall: '#dfe3ea',
    accent: '#3f7bd6',
    spawn: [9.8, 2],
    windows: [{ side: 'north', at: -0.7 }],
    props: [
      { kind: 'whiteboard', position: [0, -8.8], solid: false },
      { kind: 'serverRack', position: [-11.6, -7.8] },

      /* Two rows of four, all facing the board. */
      { kind: 'desk', position: [-8, -3] },
      { kind: 'desk', position: [-4, -3] },
      { kind: 'desk', position: [0, -3] },
      { kind: 'desk', position: [4, -3] },
      { kind: 'monitor', position: [-8, -3.4], solid: false },
      { kind: 'monitor', position: [-4, -3.4], solid: false },
      { kind: 'monitor', position: [0, -3.4], solid: false },
      { kind: 'monitor', position: [4, -3.4], solid: false },
      { kind: 'chair', position: [-8, -1.4], rotation: Math.PI },
      { kind: 'chair', position: [-4, -1.4], rotation: Math.PI },
      { kind: 'chair', position: [0, -1.4], rotation: Math.PI },
      { kind: 'chair', position: [4, -1.4], rotation: Math.PI },
      { kind: 'desk', position: [-8, 2.6] },
      { kind: 'desk', position: [-4, 2.6] },
      { kind: 'desk', position: [0, 2.6] },
      { kind: 'desk', position: [4, 2.6] },
      { kind: 'monitor', position: [-8, 2.2], solid: false },
      { kind: 'monitor', position: [-4, 2.2], solid: false },
      { kind: 'monitor', position: [0, 2.2], solid: false },
      { kind: 'monitor', position: [4, 2.2], solid: false },
      { kind: 'chair', position: [-8, 4.2], rotation: Math.PI },
      { kind: 'chair', position: [-4, 4.2], rotation: Math.PI },
      { kind: 'chair', position: [0, 4.2], rotation: Math.PI },
      { kind: 'chair', position: [4, 4.2], rotation: Math.PI },

      { kind: 'bookshelf', position: [12.4, -5.6], rotation: -Math.PI / 2 },
      { kind: 'shelfUnit', position: [-12.2, 4], rotation: Math.PI / 2 },
      { kind: 'plant', position: [11.6, 7.6] },
      { kind: 'lamp', position: [-11.8, 7.8] },
    ],
    links: [
      {
        id: 'lab-hall',
        kind: 'door',
        label: 'the door to the lecture hall',
        position: [12.8, 2],
        rotation: -Math.PI / 2,
        to: 'university',
      },
    ],
    exhibits: [
      {
        id: 'uni-transcript',
        kind: 'board',
        label: 'the transcript',
        position: [-6, -8.5],
        panel: {
          kicker: 'NTUA',
          title: 'The transcript',
          sections: TRANSCRIPT_SECTIONS,
        },
        journal: {
          title: 'Fifty-five courses',
          body: 'The transcript, course by course: fifty-five of them at an average of 7.94, tens in every programming course from the first semester to the last, a 10 for the thesis, and 8.35 overall, in the five years the programme is designed for.',
        },
      },
      {
        id: 'uni-guide',
        kind: 'case',
        label: 'the Survival Guide',
        position: [6, -8.4],
        panel: {
          kicker: 'NTUA',
          title: 'The Survival Guide',
          sections: GUIDE_SECTIONS,
        },
        journal: {
          title: 'The Survival Guide',
          body: 'A hundred and ten pages for new students on how to get through every compulsory course in the School, written while he was getting through them himself. Years later the year below still passes it round.',
        },
      },
    ],
  },

  /**
   * The council room: the long table the faculty assemblies sat round, the
   * petition on the wall, and two people who were in the room for it.
   */
  {
    id: 'university-council',
    name: 'NTUA',
    kicker: 'The council room',
    building: 'university',
    half: [12, 9],
    floor: '#a98a66',
    rug: '#3f7bd6',
    wall: '#efe7d8',
    accent: '#3f7bd6',
    spawn: [-8.8, 2],
    windows: [{ side: 'east', at: -0.3 }],
    props: [
      { kind: 'rug', position: [1, -2], scale: 1.4, solid: false },
      { kind: 'longTable', position: [1, -2] },
      { kind: 'chair', position: [-1.6, -4.2] },
      { kind: 'chair', position: [1, -4.2] },
      { kind: 'chair', position: [3.6, -4.2] },
      { kind: 'chair', position: [-1.6, 0.2], rotation: Math.PI },
      { kind: 'chair', position: [1, 0.2], rotation: Math.PI },
      { kind: 'chair', position: [3.6, 0.2], rotation: Math.PI },
      { kind: 'chair', position: [-4.2, -2], rotation: Math.PI / 2 },
      { kind: 'chair', position: [6.2, -2], rotation: -Math.PI / 2 },

      { kind: 'bookshelf', position: [-9, -8.6] },
      {
        kind: 'painting',
        position: [11.8, 4],
        rotation: -Math.PI / 2,
        solid: false,
      },
      { kind: 'plant', position: [-11.2, 7.6] },
      { kind: 'lamp', position: [11.4, 7.6] },
    ],
    links: [
      {
        id: 'council-hall',
        kind: 'door',
        label: 'the door to the lecture hall',
        position: [-11.8, 2],
        rotation: Math.PI / 2,
        to: 'university',
      },
    ],
    exhibits: [
      {
        id: 'uni-student',
        kind: 'board',
        label: 'the petition',
        position: [1, -8.5],
        panel: {
          kicker: 'NTUA',
          title: 'The Independent movement',
          sections: STUDENT_LIFE_SECTIONS,
        },
        journal: {
          title: 'Seven hundred signatures',
          body: 'The Independent movement of ECE students he helped found in his third year: a petition of more than 700 signatures in two days, a speech to 800, and two years as the independent representative the Dean appointed, in the open, always saying what he was doing.',
        },
      },
    ],
  },

  /* ========================= the Work District ========================= *
   *
   * The one building on the island with floors. The ground floor is the
   * lobby: what he can do, what he is certified in, and the jobs he held
   * while he was still a student, none of which were software. The first
   * floor is IBM, the second is Veltiston AI, and the third is whatever
   * comes next — the lift has a button for it and the button is not lit.
   *
   * Both ways up work. The stairs are in the north-west corner of every
   * floor and the lift is in the north-east, so you can climb it or ride it,
   * and the ride is the one that takes time.
   */
  {
    id: 'work',
    name: 'Work District',
    kicker: 'Ground floor',
    half: [17, 13],
    floor: '#48545f',
    rug: '#2fb59a',
    wall: '#e8eef2',
    accent: '#2fb59a',
    spawn: [0, 7.5],
    links: [
      {
        id: 'work-stairs-up',
        kind: 'stairsUp',
        label: 'the stairs to the first floor',
        position: [13.4, -9],
        to: 'work-ibm',
        journal: {
          title: 'Three floors',
          body: 'The Work District has a floor per employer: IBM on the first, Veltiston AI on the second, and a third nobody has built yet. Stairs in the north-west corner, lift in the north-east.',
        },
      },
      {
        id: 'work-lift',
        kind: 'lift',
        label: 'the lift',
        position: [9, -12.6],
        floor: 0,
        serves: LIFT_PANEL,
      },
    ],
    props: [
      {
        kind: 'rug',
        position: [0, 2],
        scale: 1.6,
        solid: false,
        color: '#2a6f63',
      },
      /* The reception desk, facing the door. */
      { kind: 'counter', position: [0, 3.4] },
      { kind: 'chair', position: [0, 1.6] },
      { kind: 'plant', position: [-15.8, 11] },
      { kind: 'plant', position: [15.8, 11] },
      { kind: 'sofa', position: [15, 6], rotation: -Math.PI / 2 },
      { kind: 'table', position: [12.5, 6] },
      { kind: 'sofa', position: [-15, 6], rotation: Math.PI / 2 },
      /* The certification wall runs the length of the west side. */
      { kind: 'bookshelf', position: [-15.6, -1.4], rotation: Math.PI / 2 },
      { kind: 'bookshelf', position: [-15.6, -4.6], rotation: Math.PI / 2 },
      { kind: 'painting', position: [15.8, -2], rotation: -Math.PI / 2 },
      { kind: 'desk', position: [7, -7] },
      { kind: 'monitor', position: [7, -6.6], rotation: Math.PI },
      { kind: 'chair', position: [7, -5], rotation: Math.PI },
    ],
    exhibits: [
      {
        id: 'work-directory',
        kind: 'board',
        label: 'the building directory',
        position: [0, -12.3],
        panel: {
          kicker: 'Work District',
          title: 'What is on which floor',
          sections: WORK_DIRECTORY_SECTIONS,
        },
        journal: {
          title: 'Work District',
          body: 'A floor per employer: IBM 2023–2024 on the first, Veltiston AI 2024–present on the second. The third floor is built and empty, and what goes on it has not been decided.',
        },
      },
      {
        id: 'work-capabilities',
        kind: 'board',
        label: 'the capabilities board',
        position: [-6, -12.3],
        panel: {
          kicker: 'Work District',
          title: 'What he does',
          sections: CAPABILITIES_SECTIONS,
        },
        journal: {
          title: 'What he does',
          body: 'Senior full-stack engineer and technical lead: architecture and the hard parts himself, teams of 5–10 across three time zones, security and compliance first, and a production release most weeks.',
        },
      },
      {
        id: 'work-skills',
        kind: 'terminal',
        label: 'the skills terminal',
        position: [15.8, 2],
        rotation: -Math.PI / 2,
        panel: {
          kicker: 'Work District',
          title: 'Skills',
          sections: SKILLS_SECTIONS,
        },
      },
      {
        id: 'work-certs',
        kind: 'case',
        label: 'the certification wall',
        position: [-15.8, 2],
        rotation: Math.PI / 2,
        panel: {
          kicker: 'Work District',
          title: 'Certifications',
          sections: CERTIFICATIONS_SECTIONS,
        },
        journal: {
          title: 'Certifications',
          body: 'MIT Open Learning on foundational AI, CITI Program on biomedical research conduct and HIPAA, IBM Docker Essentials, and the language certificates: ECPE C2, ECCE B2 and DELF B2.',
        },
      },
      /* The small board by the stairs: the student jobs. Kyriakos Oikonomou,
         who gave him the first of them, stands beside it. */
      {
        id: 'work-student-jobs',
        kind: 'board',
        label: 'the board of student jobs',
        position: [-13.5, -12.3],
        panel: {
          kicker: 'While at NTUA',
          title: 'The jobs he held as a student',
          sections: STUDENT_JOBS_SECTIONS,
        },
        journal: {
          title: 'Working through the degree',
          body: 'Director of the "Pantokrator" Foundation 2021–2022, robotics tutor to children at Citylab in Alimos 2020–2021, and a private mathematics tutor throughout — all of it alongside NTUA.',
        },
      },
      {
        id: 'work-foundation-letter',
        kind: 'case',
        label: 'the letter beside the board',
        position: [-9.5, -12.3],
        panel: {
          kicker: 'Reference',
          title: 'From the Vice-President',
          sections: REFERENCE_FOUNDATION_SECTIONS,
        },
        journal: {
          title: 'Foundation reference',
          body: 'Kyriakos Oikonomou, retired Justice of the Hellenic Supreme Court and Vice-President of the "Pantokrator" Foundation, who appointed him Director in 2021: his contribution "had far exceeded our expectations" — renovation, events, volunteers and digital media.',
        },
      },
    ],
  },

  /* ---------------------------- first floor ---------------------------- */

  /**
   * IBM, November 2023 to May 2024. The bank floor: the Cosmos Project at the
   * National Bank of Greece, moving core banking off PL/I and COBOL onto
   * Finacle, and the fortnight in Hamburg. Blue, because of course it is.
   *
   * The server room key is up here rather than in the lobby: it is the floor
   * with the racks on it.
   */
  {
    id: 'work-ibm',
    name: 'Work District',
    kicker: 'First floor · IBM',
    building: 'work',
    half: [17, 13],
    floor: '#3b4653',
    rug: '#1f4fa0',
    wall: '#dfe7f2',
    accent: '#4d8ee0',
    spawn: [0, 7.5],
    links: [
      /* The well you come up out of, and the flight on up, both along the
         west wall: the shaft is in the other corner of the building. */
      {
        id: 'work-ibm-down',
        kind: 'stairsDown',
        label: 'the stairs down to the lobby',
        position: [4.6, -9],
        to: 'work',
      },
      {
        id: 'work-ibm-up',
        kind: 'stairsUp',
        label: 'the stairs to the second floor',
        position: [13.4, -9],
        to: 'work-veltiston',
      },
      {
        id: 'work-ibm-lift',
        kind: 'lift',
        label: 'the lift',
        position: [9, -12.6],
        floor: 1,
        serves: LIFT_PANEL,
      },
    ],
    props: [
      {
        kind: 'rug',
        position: [0, 0],
        scale: 1.6,
        solid: false,
        color: '#1f4fa0',
      },
      /* The integration desks, facing each other across the floor: the calls
         he ran between the bank's subsystems happened over these. */
      { kind: 'desk', position: [-6, 4] },
      { kind: 'monitor', position: [-6, 4.4] },
      { kind: 'chair', position: [-6, 6], rotation: Math.PI },
      { kind: 'desk', position: [8, 4] },
      { kind: 'monitor', position: [8, 4.4] },
      { kind: 'chair', position: [8, 6], rotation: Math.PI },
      { kind: 'desk', position: [-8, -4] },
      { kind: 'monitor', position: [-8, -3.6], rotation: Math.PI },
      /* Well west of the stairwell, mirroring its partner across the floor:
         at [8, -4] this desk stood squarely in front of you as you came up
         from the lobby, and you met a monitor before you met the room. */
      { kind: 'desk', position: [-2.5, -4] },
      { kind: 'monitor', position: [-2.5, -3.6], rotation: Math.PI },
      /* The racks along the back wall, and the key on one of them. */
      { kind: 'serverRack', position: [-8, -12] },
      { kind: 'serverRack', position: [-5, -12] },
      { kind: 'serverRack', position: [-2, -12] },
      { kind: 'whiteboard', position: [15.6, 6], rotation: -Math.PI / 2 },
      { kind: 'plant', position: [-15.8, 9] },
      { kind: 'crate', position: [14.6, 10.4] },
      { kind: 'crate', position: [11.8, 10.8], rotation: 0.4 },
    ],
    exhibits: [
      {
        id: 'work-ibm-board',
        kind: 'board',
        label: 'the IBM pinboard',
        position: [-15.8, 0],
        rotation: Math.PI / 2,
        panel: {
          kicker: 'IBM',
          title: 'DevOps & integration, 2023–2024',
          sections: IBM_SECTIONS,
        },
        journal: {
          title: 'IBM, DevOps Engineer',
          body: 'November 2023 – May 2024 through the IBM Associate Program. The Cosmos Project at the National Bank of Greece: PL/I and COBOL core banking onto Infosys Finacle, integration architecture for the coexistence and target states, and CI/CD with Jenkins, Podman, ELK and Grafana.',
        },
      },
      {
        id: 'work-key',
        kind: 'key',
        label: 'the server rack',
        position: [-5, -10.2],
        keyId: 'key-work',
      },
    ],
  },

  /* --------------------------- second floor --------------------------- */

  /**
   * Veltiston AI, May 2024 to today, and the floor the island is really
   * about: founding engineer, then technical lead of a nurse-scheduling
   * platform that four American hospitals now run their wards on.
   *
   * Four people up here, and between them they cover the whole of it — the
   * founder on the vision, the stack, the team across three time zones, and
   * the data-science side he leads the software for.
   */
  {
    id: 'work-veltiston',
    name: 'Work District',
    kicker: 'Second floor · Veltiston AI',
    building: 'work',
    half: [17, 13],
    floor: '#414d58',
    rug: '#2fb59a',
    wall: '#eef4f3',
    accent: '#2fb59a',
    spawn: [0, 7.5],
    links: [
      {
        id: 'work-velt-down',
        kind: 'stairsDown',
        label: 'the stairs down to the first floor',
        position: [4.6, -9],
        to: 'work-ibm',
      },
      {
        id: 'work-velt-lift',
        kind: 'lift',
        label: 'the lift',
        position: [9, -12.6],
        floor: 2,
        serves: LIFT_PANEL,
      },
    ],
    props: [
      {
        kind: 'rug',
        position: [0, 1],
        scale: 1.7,
        solid: false,
        color: '#27695e',
      },
      /* An open floor: four desks in a block in the middle, the way a startup
         that outgrew its first room actually sits. */
      { kind: 'desk', position: [-3.2, 2] },
      { kind: 'monitor', position: [-3.2, 2.4] },
      { kind: 'chair', position: [-3.2, 4], rotation: Math.PI },
      { kind: 'desk', position: [3.2, 2] },
      { kind: 'monitor', position: [3.2, 2.4] },
      { kind: 'chair', position: [3.2, 4], rotation: Math.PI },
      { kind: 'desk', position: [-3.2, -3] },
      { kind: 'monitor', position: [-3.2, -2.6], rotation: Math.PI },
      { kind: 'desk', position: [3.2, -3] },
      { kind: 'monitor', position: [3.2, -2.6], rotation: Math.PI },
      /* The wall the architecture gets drawn on, and redrawn. */
      { kind: 'whiteboard', position: [-15.6, -1], rotation: Math.PI / 2 },
      { kind: 'whiteboard', position: [-15.6, -6], rotation: Math.PI / 2 },
      /* The lounge corner, moved off the east wall to leave it clear: the
         whole of that wall is the technology wall now. */
      { kind: 'sofa', position: [-14.6, 8], rotation: Math.PI / 2 },
      { kind: 'table', position: [-12.1, 8] },
      { kind: 'plant', position: [-15.8, 11] },
      { kind: 'plant', position: [15.8, 11.6] },
      { kind: 'serverRack', position: [-14, -11.5], rotation: 0.2 },
    ],
    exhibits: [
      {
        id: 'work-role',
        kind: 'board',
        label: 'the team board',
        position: [-6, -12.3],
        panel: {
          kicker: 'Veltiston AI',
          title: 'Current role',
          sections: VELTISTON_SECTIONS,
        },
        journal: {
          title: 'Veltiston AI',
          body: 'One of the first engineers from May 2024, then Senior Software Engineer from May 2026 and project lead on three projects. Technical lead of the Nurse Scheduling platform, concept to production.',
        },
      },
      {
        id: 'work-platform',
        kind: 'terminal',
        label: 'the platform terminal',
        position: [6, -12.3],
        panel: {
          kicker: 'Veltiston AI',
          title: 'The platform',
          sections: PLATFORM_SECTIONS,
        },
      },
      {
        /*
         * Not a case with one thing in it: the east wall of the floor, hung
         * with a mark for every technology on the CV, grouped the way the CV
         * groups them. Walking anywhere along it offers the panel that says
         * what the stack is and how often it ships.
         */
        id: 'work-stack',
        kind: 'techWall',
        label: 'the technology wall',
        position: [16.4, -1],
        rotation: -Math.PI / 2,
        panel: {
          kicker: 'Veltiston AI',
          title: 'The stack, and the pace',
          sections: VELTISTON_STACK_SECTIONS,
        },
        journal: {
          title: 'The stack, and the pace',
          body: 'Java 17–25, Spring Boot and Spring AI, React, MySQL, AWS, Docker, Jenkins and GitLab CI, watched with Grafana, Graylog and Sentry — shipped to production most weeks, into major U.S. hospitals.',
        },
      },
    ],
  },

  /* ------------------------------ the camp --------------------------- */

  /**
   * The Army Camp is two rooms. The barracks behind the gate, where anybody
   * off the road may walk in and talk to the private on duty, and the
   * operations room through the east wall, where the commander is — and
   * which only opens to somebody in uniform. His kit hangs on the locker by
   * the service record; see game/army.ts, which owns the door, the kit and
   * the duty bell by the lockers.
   *
   *     [ barracks ]──east──[ operations room ]
   */
  {
    id: 'army',
    name: 'Army Camp',
    kicker: 'Barracks',
    half: [14.5, 10.5],
    floor: '#8a7f63',
    rug: '#6f7f4a',
    wall: '#a5aa86',
    accent: '#6f7f4a',
    spawn: [0, 5],
    props: [
      { kind: 'bunk', position: [-11, 4], rotation: Math.PI / 2 },
      { kind: 'bunk', position: [-11, -1], rotation: Math.PI / 2 },
      { kind: 'bunk', position: [-11, -6], rotation: Math.PI / 2 },
      { kind: 'bunk', position: [11, 4], rotation: -Math.PI / 2 },
      { kind: 'bunk', position: [11, -1], rotation: -Math.PI / 2 },
      { kind: 'locker', position: [-5.5, -9.8] },
      { kind: 'locker', position: [-3, -9.8] },
      /* His, with the kit hanging on it. */
      { kind: 'locker', position: [3, -9.8] },
      { kind: 'crate', position: [7.5, -8.5] },
      { kind: 'crate', position: [9.5, -8.5] },
      { kind: 'weightBench', position: [6, 6] },
      { kind: 'sandbag', position: [-6, 8.5] },
      { kind: 'sandbag', position: [-4, 8.5] },
      { kind: 'table', position: [0, 4] },
      { kind: 'chair', position: [0, 6.4], rotation: Math.PI },
      { kind: 'greekFlag', position: [12.5, -9] },
      { kind: 'painting', position: [-11, -10.2] },
    ],
    links: [
      /*
       * The officers' door, in the east wall past the last of the bunks. Not
       * locked: shut to civilian clothes, and open to the uniform on the
       * locker a few strides away.
       */
      {
        id: 'army-officers-door',
        kind: 'door',
        label: 'the door to the operations room',
        position: [14.3, -6],
        rotation: -Math.PI / 2,
        to: 'army-ops',
        dress: 'officer',
        lines: [
          'OFFICERS ONLY, stencilled across it at eye height. The handle turns, and the duty clerk on the far side turns you straight back round.',
          'Not in those clothes. There is a uniform hanging on the locker by the service record.',
        ],
        journal: {
          title: 'The operations room',
          body: 'Through the officers’ door at the Army Camp, which opens for the uniform and not for the man: Lt Col Mitsidis at his desk, and the landing plan on the table.',
        },
      },
    ],
    exhibits: [
      {
        id: 'army-service',
        kind: 'board',
        label: 'the service record',
        position: [0, -10.3],
        panel: {
          kicker: 'Army Camp',
          title: 'Military service',
          sections: ARMY_SECTIONS,
        },
        journal: {
          title: 'Army Camp',
          body: 'Reservist Second Lieutenant, Marine Special Forces, 2022–2023, a unit to plan for, train and look after.',
        },
      },
      {
        id: 'army-key',
        kind: 'key',
        label: 'the footlocker at the end of the bunks',
        position: [-11, -9],
        keyId: 'key-camp',
      },
    ],
  },

  /**
   * The operations room, through the officers' door. The commander's desk
   * against the north wall with him behind it, his letter on the east wall,
   * and in the middle the table with the landing laid out on it — which is
   * what the officer standing over it has come to talk about.
   */
  {
    id: 'army-ops',
    building: 'army',
    name: 'Army Camp',
    kicker: 'Operations room',
    half: [10, 7.5],
    floor: '#7d735a',
    rug: '#55603c',
    wall: '#b3b692',
    accent: '#6f7f4a',
    spawn: [-7, 0],
    windows: [{ side: 'north', at: -0.55 }],
    props: [
      { kind: 'rug', position: [0, -3.4], scale: 1.1, solid: false },
      { kind: 'desk', position: [0, -4.4] },
      { kind: 'greekFlag', position: [-3.2, -6.7] },
      { kind: 'bookshelf', position: [5.6, -7] },
      /* The landing, laid out for the briefing. */
      { kind: 'table', position: [3.4, 2.4], scale: 1.3 },
      { kind: 'crate', position: [8.6, 5.8] },
      { kind: 'locker', position: [-6.4, -6.8] },
      { kind: 'plant', position: [-9, 6.4] },
    ],
    links: [
      {
        id: 'ops-barracks',
        kind: 'door',
        label: 'the door to the barracks',
        position: [-9.8, 0],
        rotation: Math.PI / 2,
        to: 'army',
      },
    ],
    exhibits: [
      {
        id: 'army-reference',
        kind: 'board',
        label: 'the commander’s letter',
        position: [9.4, -2.6],
        rotation: -Math.PI / 2,
        panel: {
          kicker: 'Army Camp',
          title: 'The commander’s letter',
          sections: REFERENCE_ARMY_SECTIONS,
        },
        journal: {
          title: 'Commander’s reference',
          body: 'Lt Col Georgios Mitsidis, Commander of the 575 Marine Battalion: Platoon Leader and Weapons Officer for a Marine Company, "accomplished his tasks successfully without the need of supervision"; recommended with the utmost confidence as "a valuable and trusted partner".',
        },
      },
    ],
  },

  /* ------------------------------ the school ------------------------- */

  /**
   * The Town School is three schools in one building. The hall behind the
   * front door is the elementary years — his first teacher, and the two cups
   * — with the volunteering he came back to as an adult on the same walls.
   * Evangeliki, the junior high, is the classroom through the west door, and
   * Ionidios, the high school, the one through the east.
   *
   *     [ Evangeliki ]──east──[ the hall ]──east──[ Ionidios ]
   */
  {
    id: 'school',
    name: 'Town School',
    kicker: 'The hall',
    half: [12, 8],
    floor: '#c08a52',
    rug: '#e6a63c',
    wall: '#f2e2c4',
    accent: '#e6a63c',
    spawn: [0, 4],
    windows: [{ side: 'north', at: 0 }],
    props: [
      { kind: 'rug', position: [0, 0], scale: 1.2, solid: false },
      { kind: 'bookshelf', position: [-8.5, -7.6] },
      { kind: 'bookshelf', position: [8, -7.6] },
      { kind: 'table', position: [7, 3.2] },
      { kind: 'lamp', position: [7, 5.4] },
      { kind: 'plant', position: [-11.2, 6.4] },
      { kind: 'plant', position: [11.2, 6.4] },
    ],
    links: [
      {
        id: 'school-evangeliki',
        kind: 'door',
        label: 'the door to the Evangeliki classroom',
        position: [-11.8, -1],
        rotation: Math.PI / 2,
        to: 'school-evangeliki',
        journal: {
          title: 'Evangeliki',
          body: 'The Model Junior High School of Evangeliki in Nea Smyrni, through the west door of the Town School: one of four public Model schools in Greece, and he ranked 1st in the exam to get in.',
        },
      },
      {
        id: 'school-ionidios',
        kind: 'door',
        label: 'the door to the Ionidios classroom',
        position: [11.8, -3.5],
        rotation: -Math.PI / 2,
        to: 'school-ionidios',
        journal: {
          title: 'Ionidios',
          body: 'The Model High School of Ionidios in Piraeus, through the east door of the Town School: the oldest school in Piraeus, founded in 1847, a second entrance exam ranked 1st, and the Piraeus prize for the top graduating grade of 2017.',
        },
      },
    ],
    exhibits: [
      {
        id: 'school-trophies',
        kind: 'case',
        label: 'the trophy case',
        position: [-4, -7.4],
        panel: {
          kicker: 'Town School',
          title: 'Elementary school',
          sections: ELEMENTARY_SECTIONS,
        },
        journal: {
          title: 'Two cups in the hall',
          body: 'Captain of the elementary school chess team, 1st in the city tournament; captain of the basketball team for two years, 3rd in the local tournament.',
        },
      },
      {
        id: 'school-volunteer',
        kind: 'case',
        label: 'the volunteering case',
        position: [4, -7.4],
        panel: {
          kicker: 'Town School',
          title: 'Teaching & volunteering',
          sections: VOLUNTEER_SECTIONS,
        },
      },
      {
        id: 'school-key',
        kind: 'key',
        label: 'the trophy case shelf',
        position: [-1.4, -7.6],
        keyId: 'key-school',
      },
    ],
  },

  /**
   * Evangeliki: the classroom, with the after-school clubs round its walls.
   * Pascal on the machine by the west window, the robotics bench behind it
   * with the bicycle that ran on twelve volts, the planetarium in the far
   * corner, and the chessboard where the chess team met.
   */
  {
    id: 'school-evangeliki',
    name: 'Town School',
    kicker: 'Evangeliki',
    building: 'school',
    half: [14.5, 10.5],
    floor: '#b98a5a',
    rug: '#2f6fa8',
    wall: '#efe4cc',
    accent: '#2f6fa8',
    spawn: [11.3, -1],
    windows: [
      { side: 'north', at: 0.6 },
      { side: 'west', at: -0.5 },
    ],
    props: [
      /* The lesson. */
      { kind: 'blackboard', position: [0, -9.9] },
      { kind: 'lectern', position: [0, -6.5] },
      { kind: 'schoolDesk', position: [-5, -1] },
      { kind: 'schoolDesk', position: [-1, -1] },
      { kind: 'schoolDesk', position: [3, -1] },
      { kind: 'schoolDesk', position: [-5, 3] },
      { kind: 'schoolDesk', position: [-1, 3] },
      { kind: 'schoolDesk', position: [3, 3] },

      /* Pascal, on the machine under the west window. */
      { kind: 'desk', position: [-12.4, -5], rotation: Math.PI / 2 },
      {
        kind: 'monitor',
        position: [-13, -5],
        rotation: Math.PI / 2,
        solid: false,
      },
      { kind: 'chair', position: [-10.8, -5], rotation: Math.PI / 2 },

      /* Robotics, along the rest of the west wall: the bench, the board over
         it, and the bicycle that ran on twelve volts. */
      { kind: 'workbench', position: [-13.2, 5], rotation: Math.PI / 2 },
      {
        kind: 'pegboard',
        position: [-14.2, 5],
        rotation: Math.PI / 2,
        solid: false,
      },
      { kind: 'toolChest', position: [-13.2, 8.4] },
      /* Leant against the west wall past the bench, on its wheels. */
      { kind: 'bicycle', position: [-13.4, 1.6], rotation: Math.PI / 2 },
      { kind: 'crate', position: [-13.2, -1.4] },

      /* Astronomy in the far corner: the planetarium, and the sun it went
         round. */
      { kind: 'globe', position: [12.6, -8.6] },
      { kind: 'lamp', position: [10.6, -8.6] },
      { kind: 'table', position: [11.5, -6], rotation: -Math.PI / 2 },

      /* And the board the chess team met over. */
      { kind: 'chessTable', position: [12, 6.4] },
      { kind: 'chair', position: [12, 4.6], rotation: Math.PI },
      { kind: 'chair', position: [12, 8.2] },
      { kind: 'plant', position: [-6.8, 8.8] },
    ],
    links: [
      {
        id: 'evangeliki-hall',
        kind: 'door',
        label: 'the door to the hall',
        position: [14.3, -1],
        rotation: -Math.PI / 2,
        to: 'school',
      },
    ],
    exhibits: [
      {
        id: 'evangeliki-board',
        kind: 'board',
        label: 'the honours board',
        position: [5.8, -10.1],
        panel: {
          kicker: 'Evangeliki',
          title: 'Model Junior High School of Evangeliki',
          sections: EVANGELIKI_SECTIONS,
        },
        journal: {
          title: 'First of the class',
          body: 'Evangeliki, 2011–2015: first of the class every year with the prize of excellence, class president and school representative, and a fifteen-page report handed to the principal at the end of it.',
        },
      },
      {
        id: 'evangeliki-terminal',
        kind: 'terminal',
        label: 'the Pascal machine',
        position: [-13.9, -1.4],
        rotation: Math.PI / 2,
        panel: {
          kicker: 'Evangeliki',
          title: 'The extra classes',
          sections: EVANGELIKI_CLUBS_SECTIONS,
        },
        journal: {
          title: 'The extra classes',
          body: 'Pascal from the age of thirteen, a sundial and a planetarium to scale, a submarine drone with the robotics class and an electric bicycle on his own, and the chess team to captain.',
        },
      },
      /*
       * The globe in the astronomy corner. A 'toy' like the helicopter in
       * the library — the prop is already in the room and draws itself, so
       * this only hangs a prompt and a hitbox on it. Nothing here opens a
       * door: spinning it just says where it has been stopped.
       */
      {
        id: 'evangeliki-globe',
        kind: 'prop',
        label: 'the globe',
        /* Where you stand for the prompt: out in front of it, clear of the
           lamp and the table sharing that corner. */
        position: [12.6, -6.9],
        rotation: Math.PI,
        /* And the ball itself, 1.1 up its stand with a 0.55 radius — a
           hitbox a touch wider so it can be clicked without being hunted. */
        hitbox: { at: [12.6, -8.6], y: 1.1, size: 0.62 },
        panel: {
          kicker: 'Evangeliki',
          title: 'The globe in the corner',
          sections: GLOBE_SECTIONS,
        },
        journal: {
          title: 'Six countries',
          body: 'The globe in the astronomy corner at Evangeliki: Greece, Cyprus, Germany, France, Italy and Switzerland, stood in rather than pointed at.',
        },
      },
    ],
  },

  /**
   * Ionidios: the classroom for the last two years, with the labs he lived
   * in round its walls. The biology bench by the east window, the physics
   * bench the EUSO team worked at on the west, the machine he learned C++ on
   * in the south-east corner, and the three scholarship letters his teachers
   * wrote framed beside the blackboard.
   */
  {
    id: 'school-ionidios',
    name: 'Town School',
    kicker: 'Ionidios',
    building: 'school',
    half: [14.5, 10.5],
    floor: '#b3835a',
    rug: '#8a2f3a',
    wall: '#f1e6d2',
    accent: '#8a2f3a',
    spawn: [-11.3, -3.5],
    windows: [
      { side: 'north', at: -0.65 },
      { side: 'east', at: -0.1 },
    ],
    props: [
      /* The lesson, at the front of the room. */
      { kind: 'blackboard', position: [0, -9.9] },
      { kind: 'lectern', position: [0, -6.5] },
      { kind: 'schoolDesk', position: [-5, -1] },
      { kind: 'schoolDesk', position: [-1, -1] },
      { kind: 'schoolDesk', position: [3, -1] },
      { kind: 'schoolDesk', position: [-5, 3] },
      { kind: 'schoolDesk', position: [-1, 3] },
      { kind: 'schoolDesk', position: [3, 3] },

      /* Biology, under the east window: the bench, and the shelf of
         specimens nobody is allowed to open. */
      { kind: 'desk', position: [12.4, -6], rotation: -Math.PI / 2 },
      { kind: 'shelfUnit', position: [11.2, -9.6] },
      { kind: 'plant', position: [13.4, -2.4] },

      /* Physics, along the west wall: the bench the EUSO team worked at,
         the board over it, and the crate the experiments came in. */
      { kind: 'workbench', position: [-13.2, 5], rotation: Math.PI / 2 },
      {
        kind: 'pegboard',
        position: [-14.2, 5],
        rotation: Math.PI / 2,
        solid: false,
      },
      {
        kind: 'whiteboard',
        position: [-14.2, 1.2],
        rotation: Math.PI / 2,
        solid: false,
      },
      { kind: 'crate', position: [-13.2, 8.4] },

      /* Informatics, in the south-east corner: one machine, and a rack that
         was doing more than a school needed. */
      { kind: 'desk', position: [12.4, 5], rotation: -Math.PI / 2 },
      {
        kind: 'monitor',
        position: [13, 5],
        rotation: -Math.PI / 2,
        solid: false,
      },
      { kind: 'chair', position: [10.8, 5], rotation: -Math.PI / 2 },
      { kind: 'serverRack', position: [12.8, 8.8] },

      /* And the tool chest that was never officially his. */
      { kind: 'toolChest', position: [-11, -8.6] },
      { kind: 'lamp', position: [-13.2, -8.6] },
      { kind: 'plant', position: [-6.8, 8.8] },
    ],
    links: [
      {
        id: 'ionidios-hall',
        kind: 'door',
        label: 'the door to the hall',
        position: [-14.3, -3.5],
        rotation: Math.PI / 2,
        to: 'school',
      },
    ],
    exhibits: [
      {
        id: 'ionidios-board',
        kind: 'board',
        label: 'the honours board',
        position: [5.8, -10.1],
        panel: {
          kicker: 'Ionidios',
          title: 'Model High School of Ionidios',
          sections: IONIDIOS_SECTIONS,
        },
        journal: {
          title: 'The Piraeus prize',
          body: 'Ionidios, 2015–2017: 1st in the entrance exam, the excellence award every year, the Piraeus prize for the top graduating grade of 2017 at 19.9 out of 20, 2nd of about 1,650 in the national Biology competition, awards in Mathematics and Programming, and captain of the EUSO team.',
        },
      },
      {
        id: 'ionidios-letters',
        kind: 'board',
        label: 'the scholarship letters',
        position: [-6, -10.1],
        panel: {
          kicker: 'Ionidios',
          title: 'Three letters from his teachers',
          sections: REFERENCE_IONIDIOS_SECTIONS,
        },
        journal: {
          title: 'Three letters from Ionidios',
          body: 'His biology, physics and chemistry teachers, each on a scholarship recommendation form in September 2017: first in his class year after year, excellent throughout, in every event the school ran, and "without doubt among the best students I have had".',
        },
      },
    ],
  },

  {
    id: 'radio',
    name: 'Radio Center',
    kicker: 'Control room',
    half: [11, 9.5],
    floor: '#443b52',
    rug: '#b95fd0',
    wall: '#efe6f2',
    accent: '#b95fd0',
    spawn: [0, 4],
    props: [
      { kind: 'console', position: [-4, -7], rotation: 0 },
      { kind: 'console', position: [4, -7], rotation: 0 },
      /* The monitoring station down the west side, monitor on its desk. */
      { kind: 'desk', position: [-9, -4], rotation: Math.PI / 2 },
      { kind: 'monitor', position: [-9, -4], rotation: Math.PI / 2 },
      { kind: 'chair', position: [0, -4], rotation: Math.PI },
      { kind: 'bookshelf', position: [-9.8, 1], rotation: Math.PI / 2 },
      { kind: 'table', position: [8, 2] },
      { kind: 'plant', position: [9.6, 7.6] },
      { kind: 'lamp', position: [-9.4, 7.4] },
    ],
    exhibits: [
      {
        id: 'radio-desk',
        kind: 'radio',
        label: 'the transmitter',
        position: [0, -9.3],
        panel: {
          kicker: 'Radio Center',
          title: 'Get in touch',
          sections: RADIO_SECTIONS,
        },
        journal: {
          title: 'Radio Center',
          body: 'The message desk composes an email straight to Kitsos, with no operator in between.',
        },
      },
      /* What is on the air: the island's own release notes, on the wall
         the station would pin its broadcast log to. */
      {
        id: 'radio-release',
        kind: 'board',
        label: 'the release notes',
        position: [10.4, -3],
        rotation: -Math.PI / 2,
        panel: {
          kicker: 'Radio Center',
          title: 'Release notes',
          sections: [
            {
              heading: 'Version 1.0 · 2026-09-25',
              blocks: [{ type: 'text', text: 'First working version.' }],
            },
          ],
        },
        journal: {
          title: 'Release notes',
          body: 'Version 1.0, 2026-09-25: the first working version of the island.',
        },
      },
    ],
  },

  {
    id: 'lighthouse',
    name: 'The Old Lighthouse',
    /*
     * Not a summit room any more. The kicker is the first thing the HUD says
     * when he walks in, so it is the first place the reveal lands.
     */
    kicker: 'Flight deck',
    half: [10, 10],
    /*
     * Painted like a hull rather than a keeper's parlour: plate grey
     * underfoot, cold panelling on the walls, and the amber kept for the
     * things that are still the lighthouse - the logbook, the collar of the
     * suit, the lamp at the top of the hologram.
     */
    floor: '#39414b',
    rug: '#1f5f9e',
    wall: '#5a6672',
    accent: '#6fc3ff',
    spawn: [0, 8.2],
    /*
     * A keeper's room that stopped being one. The north half is the flight
     * deck — console, window and the button, all drawn by
     * `features/launch/FlightDeck.tsx` rather than declared here, because
     * they read the launch clock — and what is left of the lighthouse is
     * pushed to the edges: the logbook on the east wall, the globe and the
     * shelf behind him, the stairs he came up by.
     *
     * The west wall is the airlock. That is the one part of the room the
     * visitor has to walk to before anything happens, so it is kept well
     * clear of the console and given the whole side to itself.
     */
    props: [
      /*
       * No stairs, and no globe.
       *
       * Both were the keeper's room still showing through. The flight to
       * the deck is a hatch and a ladder now, not a wooden staircase with a
       * handrail, and a flight of steps standing in the corner of a launch
       * cabin reads as a cottage somebody parked a rocket in - which is the
       * one thing the rest of this room works to undo. The globe went with
       * them: a blue ball on a turned wooden stand is a parlour ornament,
       * and it sat in the eyeline between the door and the console.
       */
      /* The flight chair, facing the console and the window beyond it. */
      { kind: 'chair', position: [0, -3.6], rotation: Math.PI },
      /* No shelf of books. The keeper's library was the last thing in here
         still furnishing a parlour, and a wall of paperbacks behind a flight
         console reads as a study somebody parked a rocket in. The logbook on
         the east wall is what is left of him, and it is enough. */

      /*
       * The west wall is the airlock and nothing else. The rack stands at
       * z = -2 in its own lit alcove and the whole side is left to it -
       * there were lockers along here and they are gone, because a row of
       * green cupboards beside a spacesuit reads as a changing room and
       * pulls the eye off the one thing on this wall worth looking at.
       */
      /* Avionics down the other side: the racks that fly the thing. */
      { kind: 'serverRack', position: [9, -4], rotation: -Math.PI / 2 },
      { kind: 'serverRack', position: [9, -6], rotation: -Math.PI / 2 },
      { kind: 'serverRack', position: [-9, -6], rotation: Math.PI / 2 },
      { kind: 'monitor', position: [6.6, -7.6], rotation: Math.PI },
      { kind: 'monitor', position: [-6.6, -7.6], rotation: Math.PI },
      /* One green thing, in a tank by the door. Every crew keeps one. */
      { kind: 'plant', position: [-8.6, 8.4] },
    ],
    exhibits: [
      {
        id: 'lh-summary',
        kind: 'cv',
        label: 'the keeper’s logbook',
        /* Off the east wall now: the south wall in front of the window is
           the flight deck's, and a logbook there would be read through the
           console. */
        position: [9.3, 0],
        rotation: -Math.PI / 2,
        panel: {
          kicker: 'The Old Lighthouse',
          title: 'The short version',
          sections: LIGHTHOUSE_SECTIONS,
        },
        journal: {
          title: 'The Old Lighthouse',
          body: 'Opened with all five district keys. The keeper’s logbook holds the career summary, what he is good at, and what he is looking for.',
        },
      },
      {
        id: 'lh-crew',
        kind: 'crew',
        label: 'the crew screen',
        /* On the east wall by the door, across the room from the notice:
           the last thing on the way out, and everybody he is leaving. */
        position: [9.3, 5.4],
        rotation: -Math.PI / 2,
        panel: {
          kicker: 'Flight deck',
          title: 'Meet the characters',
          sections: [],
        },
        journal: {
          title: 'The crew screen',
          body: 'A screen on the flight deck with everybody on the island on it, and a tick against each one he stopped to hear.',
        },
      },
      {
        id: 'lh-notice',
        kind: 'board',
        label: 'the departure notice',
        position: [-9.3, 5],
        rotation: Math.PI / 2,
        lines: [
          'PRE-FLIGHT — read it in order, there is no second try.',
          'One. The suit is on the rack behind you. Put it on; the console will not answer a man in shirtsleeves.',
          'Two. The button is under the glass on the console. Press it and the count starts.',
          'Three. There is no abort. Once the gantry lets go you are going up.',
          'Signed, the keeper. He has done it once and says the view is worth it.',
        ],
        journal: {
          title: 'The departure notice',
          body: 'The lighthouse is a gantry and the summit room is a flight deck. The suit goes on first, then the button under the glass. There is no abort.',
        },
      },
    ],
  },
]

export const INTERIOR_BY_ID = new Map(INTERIORS.map((i) => [i.id, i]))
