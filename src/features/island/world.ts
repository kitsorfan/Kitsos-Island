import type {
  Building,
  KeyItem,
  Mission,
  Npc,
  SignPost,
  Vec2,
} from '../../types'
import { CLASS } from '../npc/audience'
import { HOME_FAMILY, IN_LAWS, OLD_FAMILY } from '../npc/family'
import { PROFILE } from '../cv/profile'

/** Everything inside this radius is flat, walkable ground. */
export const ISLAND_FLAT_RADIUS = 108
/**
 * And how far out on to the sand he may walk.
 *
 * Six metres short of the water, which leaves the whole width of the beach
 * to walk down — and, more to the point, leaves room to get round the hill
 * on the west shore, whose foot comes to within a metre of where this used
 * to stop. A beach you cannot walk the length of is a wall with a view.
 */
export const ISLAND_WALK_RADIUS = 117
export const ISLAND_SHORE_RADIUS = 138
export const ISLAND_EDGE = 176

export const PLAZA_RADIUS = 18
export const PLAYER_START: Vec2 = [0, 26]

/** The fountain sits off the crossroads so no route walks into it. */
export const FOUNTAIN: Vec2 = [12, -9]
export const FOUNTAIN_RADIUS = 3.4

/** The player's own colours, shared with the portrait in the greeting card. */
export const PLAYER_COLORS = {
  skin: '#f0c39a',
  hair: '#3a2a1d',
  shirt: '#e8442f',
  pants: '#2a3f78',
} as const

/**
 * Sloped ground you can walk up. Height is interpolated along the axis and
 * only applies within `halfWidth` of it.
 */
export interface Ramp {
  from: Vec2
  to: Vec2
  halfWidth: number
  fromHeight: number
  toHeight: number
}

/** Flat raised platforms — the landing at the top of a flight of steps. */
export interface Ledge {
  x: number
  z: number
  hx: number
  hz: number
  height: number
}

/**
 * The jetty on the west shore, out past the school.
 *
 * One definition of it, because the planks you can see, the surface you walk
 * on and the strip that lets you off the island's leash are all the same
 * jetty — and a dock kept in three places is a dock in the wrong place twice.
 */
export const DOCK = {
  /** Centres of the first plank, at the top of the beach, and of the last. */
  head: -112,
  end: -134,
  /** Plank spacing, which is also how long each plank is along the run. */
  step: 2,
  z: 20,
  /** Half the width of the planking. */
  halfWidth: 2.2,
  /**
   * Top of the decking, and it is level all the way out.
   *
   * High enough that the landward end stands clear of the sand on its piles:
   * a deck laid at the height of the water would have its first few planks
   * buried, which is a walkway you can feel underfoot and cannot see.
   */
  deck: 0.1,
  /** How far the planks are laid off the ground. */
  thickness: 0.2,
  /** Length of the gangway board that bridges the sand and the deck. */
  ramp: 4,
  /**
   * How far short of the planking's own edge he is stopped, on every side of
   * it that ends in water. Half a metre: he leans over the edge rather than
   * standing on the last inch of it, and — since the decking stops being
   * ground he can stand on at exactly that edge — never at the one spot
   * where the planks are behind him and the sea bed is underfoot.
   */
  inset: 0.5,
  /**
   * How far back up the sand the walkable strip reaches past the gangway.
   * The island's own edge cuts across the beach here, and without the
   * overlap the jetty would be a walkway you could see and never set foot on.
   */
  approach: 3,
} as const

/** The planks themselves, beach end first. */
export const DOCK_PLANKS: number[] = Array.from(
  { length: Math.round(Math.abs(DOCK.end - DOCK.head) / DOCK.step) + 1 },
  (_, i) => DOCK.head - i * DOCK.step,
)

/** Landward edge of the decking, where the gangway meets it. */
export const DOCK_EDGE = DOCK.head + DOCK.step / 2

/** And the seaward one, off the end of the last plank. */
export const DOCK_TIP = DOCK.end - DOCK.step / 2

/**
 * The gangway: a board from the sand up on to the deck, so the step on is
 * walked up rather than stepped over. The sand it starts from is the flat
 * top of the beach, which is why the near end can simply be nought.
 */
export const DOCK_RAMP: Ramp = {
  from: [DOCK_EDGE + DOCK.ramp, DOCK.z],
  to: [DOCK_EDGE, DOCK.z],
  halfWidth: DOCK.halfWidth,
  fromHeight: 0,
  toHeight: DOCK.deck,
}

/**
 * The strip he may walk down: the decking and its gangway, plus the sand
 * that joins them to the island. Half a metre narrower than the planks, so
 * he stops at the edge rather than with half of him over the water.
 */
export const DOCK_WALK = {
  x: (DOCK_EDGE + DOCK.ramp + DOCK.approach + DOCK_TIP + DOCK.inset) / 2,
  z: DOCK.z,
  hx:
    Math.abs(DOCK_TIP + DOCK.inset - DOCK_EDGE - DOCK.ramp - DOCK.approach) / 2,
  hz: DOCK.halfWidth - DOCK.inset,
}

/** The Academy's steps and the portico landing, and the jetty's gangway. */
export const RAMPS: Ramp[] = [
  {
    from: [0, -63.95],
    to: [0, -67],
    halfWidth: 9,
    fromHeight: 0,
    toHeight: 1.26,
  },
  DOCK_RAMP,
]

/**
 * The house's front steps: three treads from the path up to the plinth.
 *
 * In world measurements rather than the building's own, because this is
 * ground rather than scenery — the model is drawn at a fifty per cent scale
 * and turned to face the path, and these are where its treads land once it
 * has been. Their tops climb by a quarter of a metre a time, which is the
 * same flight <HouseModel/> draws; moving one without the other puts him
 * either inside the stone or walking a hand's breadth above it.
 */
const HOUSE_STEPS: Ledge[] = [0.72, 0.48, 0.24].map((height, i) => ({
  x: -62,
  z: 49.1 - i * 1.35,
  hx: 2.55,
  hz: 0.675,
  height,
}))

/**
 * The top tread and the portico floor behind it, both at full height — the
 * jetty's decking, which is walkable ground laid out over the water — and
 * the flight up to the front door of the house.
 */
export const LEDGES: Ledge[] = [
  { x: 0, z: -68.45, hx: 8.1, hz: 1.45, height: 1.26 },
  ...HOUSE_STEPS,
  {
    x: (DOCK_EDGE + DOCK_TIP) / 2,
    z: DOCK.z,
    hx: Math.abs(DOCK_TIP - DOCK_EDGE) / 2,
    hz: DOCK.halfWidth,
    height: DOCK.deck,
  },
]

export const BUILDINGS: Building[] = [
  {
    id: 'house',
    kind: 'house',
    name: 'Kitsos House',
    short: 'House',
    subtitle: 'Home of Kitsos Orfanopoulos',
    position: [-62, 56],
    door: [-62, 47],
    half: [7.2, 6.5],
    rotation: Math.PI,
    scale: 1.5,
    /* Two storeys and a pitched roof now, which the camera has to know about
       or it will happily sit inside the first floor. */
    height: 15,
    accent: '#e0574a',
  },
  {
    id: 'university',
    kind: 'university',
    name: 'National Technical University of Athens',
    short: 'NTUA',
    subtitle: 'School of Electrical & Computer Engineering',
    position: [0, -80],
    door: [0, -68.6],
    half: [16.2, 10.2],
    rotation: 0,
    scale: 1.5,
    height: 13,
    accent: '#3f7bd6',
  },
  {
    id: 'work',
    kind: 'work',
    name: 'Work District',
    short: 'Work',
    subtitle: 'Veltiston.AI · IBM Consulting',
    position: [78, -34],
    /*
     * In front of the glass, which is not in front of the building.
     *
     * The tower's entrance sits off the centre of its own facade — the model
     * puts the doors at local x = -2.6, and a quarter turn swings that round
     * to nearly four metres down the frontage. A mark on the building's
     * centre line therefore left him standing on the grass beside the
     * canopy, walking into a blank wall while the doors opened out of shot.
     *
     * Set back far enough from the glass that walking in is a stride rather
     * than a shuffle: a metre and a half, which is the walk the entrance
     * animation is timed for.
     */
    door: [65.4, -37.9],
    half: [9.5, 10.2],
    rotation: -Math.PI / 2,
    scale: 1.5,
    height: 22,
    accent: '#2fb59a',
    /* An office lobby: the glass slides for you, the way it does on a Monday
       morning. Only in daylight — after dark the badge reader is what you
       meet, and that is a press, not a walk. */
    autoDoor: true,
    closesAtNight: [
      'The glass is dark and the badge reader is dead. Nothing is shipping tonight.',
      'There is somebody on the gate, though, if you want the long version.',
    ],
  },
  {
    id: 'army',
    kind: 'army',
    name: 'Army Camp',
    short: 'Camp',
    subtitle: 'Marine Special Forces, reserve',
    position: [60, 54],
    door: [60, 43],
    half: [10.2, 8.7],
    rotation: Math.PI,
    scale: 1.5,
    height: 9,
    accent: '#6f7f4a',
    closesAtNight: [
      'The chain is on the gate and the searchlight is coming round again. Two sentries between you and it, and neither has taken their eyes off you.',
      'One more step and a hand goes flat on your chest and walks you back. Getting through tonight is not on the table.',
    ],
    sentries: true,
  },
  {
    id: 'school',
    kind: 'school',
    name: 'Town School',
    short: 'School',
    subtitle: 'Where it all started',
    position: [-80, -22],
    door: [-69, -22],
    half: [8, 10.2],
    rotation: Math.PI / 2,
    scale: 1.5,
    height: 12,
    accent: '#e6a63c',
  },
  {
    id: 'radio',
    kind: 'radio',
    name: 'Radio Center',
    short: 'Radio',
    subtitle: 'Broadcast a message to Kitsos',
    position: [0, 96],
    door: [0, 87],
    half: [6.5, 6.5],
    rotation: Math.PI,
    scale: 1.5,
    height: 8,
    accent: '#b95fd0',
  },
  {
    id: 'lighthouse',
    kind: 'lighthouse',
    name: 'The Old Lighthouse',
    short: 'Lighthouse',
    subtitle: 'Sealed. Five district keys open it',
    position: [-70, -66],
    door: [-62.5, -59],
    half: [7, 7],
    rotation: 0.82,
    scale: 1.4,
    height: 26,
    accent: '#f0a33c',
    locksWith: 5,
  },
]

export const KEYS: KeyItem[] = [
  { id: 'key-house', name: 'Brass Key', buildingId: 'house', color: '#e0574a' },
  {
    id: 'key-academy',
    name: 'Lecture Hall Key',
    buildingId: 'university',
    color: '#3f7bd6',
  },
  {
    id: 'key-work',
    name: 'Server Room Key',
    buildingId: 'work',
    color: '#2fb59a',
  },
  {
    id: 'key-camp',
    name: 'Footlocker Key',
    buildingId: 'army',
    color: '#8a9a5a',
  },
  {
    id: 'key-school',
    name: 'Cabinet Key',
    buildingId: 'school',
    color: '#e6a63c',
  },
]

export const MISSIONS: Mission[] = [
  {
    id: 'm-house',
    title: 'The spare key',
    buildingId: 'house',
    keyId: 'key-house',
    brief: 'Someone on his street will know how to get into Kitsos House.',
    hint: 'Ms. Stella says the spare is on the shelf beside the chessboard, inside the house.',
    done: 'Brass Key taken from the shelf by the chessboard.',
  },
  {
    id: 'm-academy',
    title: 'Thesis defence',
    buildingId: 'university',
    keyId: 'key-academy',
    brief: 'The Academy keeps its keys somewhere behind the lectern.',
    hint: 'The Dean left the lecture hall key on the thesis display, past the lectern.',
    done: 'Lecture Hall Key collected from the thesis display.',
  },
  {
    id: 'm-work',
    title: 'Production access',
    buildingId: 'work',
    keyId: 'key-work',
    brief: 'Nobody gets into the server room without asking first.',
    hint: 'Giorgos says the server room key hangs on the rack at the back of the IBM floor, one up from the lobby.',
    done: 'Server Room Key pulled off the rack.',
  },
  {
    id: 'm-camp',
    title: 'Kit inspection',
    buildingId: 'army',
    keyId: 'key-camp',
    brief: 'The camp runs on inventory, and inventory runs on footlockers.',
    hint: 'Sergeant Petros points at the footlocker at the end of the bunks.',
    done: 'Footlocker Key recovered from the barracks.',
  },
  {
    id: 'm-school',
    title: 'Old records',
    buildingId: 'school',
    keyId: 'key-school',
    brief: 'The school still has his file somewhere.',
    hint: 'Ms. Maria keeps the cabinet key in the trophy case in the school hall.',
    done: 'Cabinet Key found in the trophy case.',
  },
]

const SKIN = {
  light: '#f0c39a',
  tan: '#d99e6f',
  deep: '#a2683f',
}

export const NPCS: Npc[] = [
  /* --------------------------- town plaza -------------------------- */
  {
    id: 'mayor',
    name: 'Mayor Vasilis',
    role: 'Kitsos Town',
    area: 'island',
    position: [8, 10],
    facing: Math.PI,
    colors: {
      skin: SKIN.tan,
      hair: '#4a3526',
      shirt: '#3d5a98',
      pants: '#2c3242',
    },
    prop: 'glasses',
    route: [
      [8, 10],
      [-8, 8],
      [-10, -6],
      [6, -8],
    ],
    pace: 1.7,
    lines: [
      'Welcome to KITSOS TOWN! Small island, big CV.',
      `Everything here belongs to ${PROFILE.nickname} ${PROFILE.lastName}, a senior full stack engineer and technical lead out of ${PROFILE.location}.`,
      'Seven roads leave this square, and every one of them is named for what he took out of it. Motivation, Discipline, Curiosity, Caring, Leadership, Collaboration.',
      'And north-west, Freedom Road, out to the Old Lighthouse on the cape. Sealed for years. Five district keys open it, one hidden in each building.',
      'Sealed, I said. Though the night watch tells me there has been hammering out there lately. Probably the wind.',
      'Press M for the map if the walk gets long. Once you have found a place, you can travel straight back to it.',
    ],
    journal: {
      title: 'Welcome to Kitsos Town',
      body: 'Kitsos Orfanopoulos, Senior Full Stack Software Engineer & Technical Lead, based in Athens, Greece. Five keys, one per district, open the Old Lighthouse on the north-west cape.',
    },
  },
  {
    id: 'volunteer',
    name: 'Eleni',
    role: 'Volunteer coordinator',
    area: 'island',
    position: [-24, 20],
    facing: Math.PI * 0.35,
    colors: {
      skin: SKIN.light,
      hair: '#8a4a2c',
      shirt: '#d94f6b',
      pants: '#3a3f4d',
    },
    route: [
      [-24, 20],
      [-19, 25],
      [-28, 27],
    ],
    pace: 1.2,
    lines: [
      'Kitsos? He has been around this tent since 2017.',
      'Leading volunteer at the Christian Youth Foundation "Pantokrator" in Paleo Faliro, 2017 to 2021, then again from 2023 to today.',
      'He even ran the place. Director from February 2021 to September 2022, appointed by the council while he was still finishing his degree.',
      'Staff, volunteers, the buildings, the books, the grant applications. Events, field trips, tree planting, donation drives, prison visits.',
      'When the lockdowns hit he put the whole programme on a live stream so the children would not lose it.',
      'The Vice-President, a retired Supreme Court judge, mind you, wrote it all down in a letter. It is up at the school.',
      'And he still gives blood. Blood donor since 2017, no fuss about it.',
    ],
    journal: {
      title: 'Volunteering',
      body: 'Leading volunteer (2017–2021, 2023–today) and Director (2021–2022) at the Christian Youth Foundation "Pantokrator", Paleo Faliro. Blood donor since 2017.',
    },
  },
  {
    id: 'kiosk-kostas',
    name: 'Kostas',
    role: 'Foundation volunteer',
    area: 'island',
    // Behind the table, under the back of the canopy, looking out over it.
    // Both of these are worked out in the kiosk's own frame and turned by
    // KIOSK.facing, which is why they are not round numbers.
    position: [-28.71, 20.62],
    facing: 0.425,
    colors: {
      skin: SKIN.tan,
      hair: '#6b5646',
      shirt: '#2f7d6b',
      pants: '#3a3f4d',
    },
    prop: 'cap',
    smile: true,
    lines: [
      'Clipboard is on the table, pen is on a string. The string is because of me, not because of you.',
      'Twenty-odd of us run this tent. Kitsos was the one who wrote down who was doing what, and after that the tent stopped losing people.',
      'I came in for one Saturday in 2018 to shift some boxes. He put my name on a rota and I have not got off it since.',
      'Tree planting in the spring, the donation drive at Christmas, the prison visits, the field trips. The blood drive is the one we never have to advertise.',
      'When he took over as Director he was younger than half his volunteers. Nobody minded by the second week.',
    ],
    journal: {
      title: 'The volunteers',
      body: 'The tent on the west green: sign-ups, donation drives, tree planting and the blood drive. Kostas has been on the rota since 2018.',
    },
  },
  {
    id: 'kiosk-marios',
    name: 'Marios',
    role: 'At the tent with his mum',
    area: 'island',
    // In the open front of the stall, on the other side of the table from
    // Kostas and turned back towards it.
    position: [-26.03, 23.3],
    facing: -2.315,
    colors: {
      skin: SKIN.light,
      hair: '#3a2a1c',
      shirt: '#f2b134',
      pants: '#2f5aa8',
    },
    child: true,
    smile: true,
    /* Three points across the open front of the stall. None of them, and no
     * leg between them, crosses the table he is not allowed round. */
    route: [
      [-26.03, 23.3],
      [-23.95, 24.04],
      [-27.97, 25.54],
    ],
    pace: 2.4,
    lines: [
      'I am ALLOWED behind the table. Kostas said. You are not.',
      'I do the stickers. Everyone who signs up gets one, and if you give blood you get two.',
      'Kitsos took us to plant trees up the hill. Mine is the crooked one. He said crooked ones still grow.',
      'My mum says he ran the whole building when he was young. Younger than mum. That is weird.',
    ],
    journal: {
      title: 'The children at the tent',
      body: 'Marios hands out the sign-up stickers. The Foundation’s programme — trips, tree planting, the lot — is run for children like him, and went on a live stream through the lockdowns rather than stopping.',
    },
  },
  {
    id: 'chess',
    name: 'Grigoris',
    role: 'Park regular',
    area: 'island',
    position: [27, 16],
    facing: -Math.PI * 0.75,
    colors: {
      skin: SKIN.deep,
      hair: '#2b2b2b',
      shirt: '#5c8a3a',
      pants: '#4a4436',
    },
    prop: 'cap',
    lines: [
      'Sit down, I have white. …No? Fine.',
      'Kitsos plays here between runs. Chess, running, cycling. The man cannot sit still.',
      'Hiking, camping, theater, and half the furniture in his house is DIY.',
      'He treats a codebase the same way he treats an endgame: slowly, then all at once.',
    ],
    journal: {
      title: 'Hobbies',
      body: 'Running, cycling, theater, DIY and handiwork at home, chess, hiking and camping.',
    },
  },
  {
    id: 'stroller-a',
    name: 'Thanasis',
    role: 'Townsfolk',
    area: 'island',
    position: [-14, -14],
    facing: 0.4,
    colors: {
      skin: SKIN.tan,
      hair: '#6b5b4a',
      shirt: '#7a6fb0',
      pants: '#3a3f4d',
    },
    route: [
      [-14, -14],
      [14, -18],
      [22, 4],
      [-6, 14],
    ],
    pace: 1.5,
    lines: [
      'Lovely square, is it not? He rebuilt those benches himself.',
      'Careful on Motivation Road. The students cycle like maniacs.',
    ],
  },
  {
    id: 'stroller-b',
    name: 'Despina',
    role: 'Townsfolk',
    area: 'island',
    position: [24, -16],
    facing: Math.PI,
    colors: {
      skin: SKIN.light,
      hair: '#c08a4a',
      shirt: '#4fb0c0',
      pants: '#4c4358',
    },
    route: [
      [24, -16],
      [32, 10],
      [8, 24],
      [-18, 8],
    ],
    pace: 1.3,
    lines: [
      'Looking for the Lighthouse? Freedom Road, north-west, out to the cape.',
      'Locked since before I moved here. Five keys, they say. One per district.',
      'Funny, though. I walk past it in the evenings, and these last few days there is banging inside. Metal on metal.',
    ],
  },
  /* --------------------------- the coast --------------------------- */
  {
    id: 'runner',
    name: 'Nikos',
    role: 'Coastal path',
    area: 'island',
    position: [86, 20],
    facing: -Math.PI * 0.55,
    colors: {
      skin: SKIN.tan,
      hair: '#453224',
      shirt: '#f0653f',
      pants: '#2c3242',
    },
    route: [
      [86, 20],
      [72, 52],
      [40, 78],
      [0, 88],
      [-44, 74],
    ],
    pace: 3.6,
    lines: [
      'Cannot stop, halfway through the loop!',
      'He runs this coast most mornings. Cycles the long way round on Sundays.',
      'Says the best debugging happens at kilometre six.',
    ],
    journal: {
      title: 'Coastal loop',
      body: 'Runs and cycles the island loop. The thinking happens somewhere around kilometre six.',
    },
  },
  {
    id: 'fisherman',
    name: 'Captain Yannis',
    role: 'The dock',
    area: 'island',
    position: [-104, 20],
    facing: Math.PI * 0.55,
    colors: {
      skin: SKIN.deep,
      hair: '#7d7d7d',
      shirt: '#3f6f8c',
      pants: '#43484f',
    },
    prop: 'cap',
    lines: [
      'Sea is calm. Good day for a long conversation.',
      'Athens is over that horizon. That is where he lives and works.',
      'Light in the old lighthouse the last few nights. Not the lamp, lower down. Somebody is working in there.',
      'Hiking, camping, a boat when he can get one. Then back to the screens.',
      'If you have a job for him, do not shout it at the sea. Use the Radio Center.',
    ],
    journal: {
      title: 'Based in Athens',
      body: 'Lives and works in Athens, Greece. Greek nationality, open to conversations that start with a message.',
    },
  },
  /* ---------------------------- districts -------------------------- */
  {
    id: 'neighbour',
    name: 'Ms. Stella',
    role: 'Neighbour',
    area: 'island',
    position: [-53, 44],
    facing: Math.PI * 0.7,
    colors: {
      skin: SKIN.light,
      hair: '#b9b4ad',
      shirt: '#c96fa0',
      pants: '#4c4358',
    },
    hair: 'long',
    dress: '#8e5a7c',
    dressTrim: '#e4d7c4',
    smile: true,
    gives: 'm-house',
    missionLines: [
      'Shelf by the chessboard. You cannot miss it, he never tidies.',
    ],
    lines: [
      'That is his house, right there. Lights on late, always.',
      'Not this week, mind. This week he is out before dark with a toolbox, up Freedom Road, and back when the birds start.',
      'I have watched that boy grow up from this spot. Seventy years I have been across the road from them.',
      'I knew his grandfather. Same walk, same way of standing in a doorway to finish a sentence.',
      'Whatever is broken, he is out there with it. The shutter, the gate, the car up on the drive with the bonnet open all Sunday.',
      'And the whole family, God bless them. You will not find better people on this island.',
      'Greek is his mother tongue, English at proficiency with the Michigan ECPE, and French to B2 with the DELF for it.',
      'Athens born and based. Greek national. Go in, go in, he does not mind visitors.',
      'Looking for the brass key? It is on the shelf beside the chessboard, inside.',
    ],
    journal: {
      title: 'Profile & languages',
      body: 'Athens, Greece · Greek nationality. Greek (native), English (proficiency, ECPE, University of Michigan 2016), French (B2, DELF 2019).',
    },
  },
  {
    id: 'studentrep',
    name: 'Marina',
    role: 'Student council',
    area: 'island',
    position: [-22, -60],
    facing: Math.PI * 0.15,
    colors: {
      skin: SKIN.tan,
      hair: '#3b2a1e',
      shirt: '#e2a33f',
      pants: '#39435c',
    },
    route: [
      [-22, -60],
      [-8, -56],
      [-13, -68],
    ],
    pace: 1.4,
    lines: [
      'You missed the elections, but I can tell you about them.',
      'Kitsos was a students’ representative and led the Independent ECE Students.',
      'The platform: establish e-voting, depoliticize the university, and solve problems with realistic, lawful, democratic means.',
      'He argued with everyone and stayed on speaking terms with everyone. Rare skill.',
    ],
    journal: {
      title: 'Student representation',
      body: 'Students’ representative and leader of the Independent ECE Students: e-voting, depoliticization of the university, realistic and democratic problem-solving.',
    },
  },
  {
    id: 'robotkid',
    name: 'Alex',
    role: 'Robotics club',
    area: 'island',
    position: [-66, -36],
    facing: Math.PI * 0.1,
    colors: {
      skin: SKIN.deep,
      hair: '#191919',
      shirt: '#d94f6b',
      pants: '#2f5aa8',
    },
    route: [
      [-66, -36],
      [-57, -32],
      [-62, -42],
    ],
    pace: 2.2,
    lines: [
      'Look! My robot goes forward AND turns!',
      'Kitsos taught robotics to kids like me at Citylab in Alimos, 2020 to 2021.',
      'He says a program is just instructions someone else has to read later. So write them nicely.',
    ],
    journal: {
      title: 'Teaching robotics',
      body: 'Children’s tutor in Robotics at Citylab, Alimos, 2020–2021.',
    },
  },
  {
    id: 'sergeant',
    name: 'Sergeant Petros',
    role: 'Army Camp',
    area: 'island',
    position: [66, 40],
    facing: -Math.PI * 0.8,
    colors: {
      skin: SKIN.tan,
      hair: '#3a3129',
      shirt: '#6f7f4a',
      pants: '#4c5238',
    },
    prop: 'beret',
    shift: 'day',
    gives: 'm-camp',
    missionLines: [
      'Footlocker. End of the bunks. Do not rearrange my barracks.',
    ],
    lines: [
      'Halt. …Relax, civilian, the camp is open today.',
      'Military service is compulsory in Greece. Becoming a reserve officer is not: you sit the exams, and then they decide whether to take you.',
      'Second Lieutenant Orfanopoulos, reservist. September 2022 to November 2023, straight out of NTUA.',
      'Basic training at the Center of Special Forces in Nea Peramos. Then the Infantry Reserve Officers School in Heraklion, where his captain made him cadet company leader, and he finished third in the School.',
      'Then the extra selection for the Special Forces, and the Rangers’ school at Rentina, guerilla warfare. After that, Deputy Company Commander and Weapons Officer at a Marine Battalion.',
      'Platoon Leader and Weapons Officer for a Marine Company. Personnel, logistics, weaponry, readiness.',
      'His Battalion Commander is inside today, in the operations room. Officers only through that door, so you will have to look the part.',
      'That is where the calm comes from. Bad news does not make him louder.',
      'The key you are after is in the footlocker at the end of the bunks. Go on in.',
    ],
    journal: {
      title: 'Military service',
      body: 'Reservist Second Lieutenant, Marine Battalion, September 2022 – November 2023. Service is compulsory; the reserve officer’s path is by exam and selection. Special Forces basic training at Nea Peramos; cadet company leader at the Infantry Reserve Officers School, Heraklion, graduating 3rd; selected for the Special Forces and completed the Rangers’ Guerilla Warfare School at Rentina; served as Deputy Company Commander and Weapons Officer.',
    },
  },

  /* ------------------------------ the camp -------------------------- */

  /** On duty in the barracks, who served in his company. */
  {
    id: 'giotampas',
    name: 'Private Giotampas',
    role: '575 Marine Battalion',
    area: 'army',
    position: [-5, 1.5],
    facing: Math.PI * 0.15,
    colors: {
      skin: SKIN.tan,
      hair: '#241d18',
      shirt: '#6f7f4a',
      pants: '#4c5238',
    },
    prop: 'cap',
    lines: [
      'Private Giotampas, 575 Marine Battalion. I served in the Lieutenant’s company.',
      'Every exercise, he was first. First up the hill, first off the boat, first into the water. And he did not have to be — he was the one holding the clipboard.',
      'Weapons officer, platoon leader, deputy company commander, and still the one checking we had eaten. Three jobs, and none of them ever dropped.',
      'You want to see where the officers work? Not in those clothes. His kit is on the locker by the service record. Put it on, and the door in the east wall will open for you.',
      'And once you are in uniform, leave the bell alone. Unless you want five of us standing by our beds.',
    ],
    journal: {
      title: 'A private in his company',
      body: 'Private Giotampas, 575 Marine Battalion: first in every exercise, while carrying the weapons, a platoon and the company’s readiness at the same time.',
    },
  },

  /** Behind his desk in the operations room: the commander who wrote the letter. */
  {
    id: 'mitsidis',
    name: 'Lt Col Mitsidis',
    role: 'Commander, 575 Marine Battalion',
    area: 'army-ops',
    position: [0, -6.2],
    facing: 0,
    colors: {
      skin: SKIN.light,
      hair: '#8c8a86',
      shirt: '#5d6840',
      pants: '#474d33',
    },
    prop: 'beret',
    lines: [
      'Lieutenant Colonel Georgios Mitsidis, Commander of the 575 Marine Battalion. Stand easy.',
      'He reported to my unit as an Officer Designate in February 2023, and left us a Special Forces Second Lieutenant that November. Platoon Leader and Weapons Officer for a Marine Company.',
      'I will tell you what I told everyone who asked. He did his job without anybody standing over him, and he threw himself into every activity the Unit had.',
      'Team spirit, critical thinking, and an eye for formality and detail. And he came to me with ideas for running things better, and then did the work of putting them in, inside the Command’s guidelines.',
      'I was proud to have him as an officer in my Unit. He honoured the green beret. Whatever field he chooses, I recommend him with the utmost confidence.',
      'The letter is on the east wall, if you would like it in writing.',
    ],
    journal: {
      title: 'His commanding officer',
      body: 'Lt Col Georgios Mitsidis, Commander of the 575 Marine Battalion, in person: worked without supervision, brought ideas for how the Unit ran and put them in place, and "honoured the green beret".',
    },
  },

  /** Over the landing plan: a reserve officer from the same intake. */
  {
    id: 'stavros',
    name: '2nd Lt Stavros',
    role: 'Same intake, reserve officer',
    area: 'army-ops',
    position: [6.3, 2.4],
    facing: -Math.PI / 2,
    colors: {
      skin: SKIN.tan,
      hair: '#3b2a1c',
      shirt: '#6b7446',
      pants: '#555c39',
    },
    prop: 'beret',
    lines: [
      'Same intake as him: Heraklion, then the Special Forces selection, then Rentina. We still talk about Rentina.',
      'Hell Week. No rest and no food, up in the mountains with no camp to go back to. Just out in the wild, walking, and then walking again.',
      'You stop feeling your feet on the second day and stop thinking about them on the third. He kept the rest of us talking the whole way, which was harder than the walking.',
      'And this, on the table, was our D-Day. A full landing exercise: off the ship, onto the beach, and take the island from the sea.',
      'Ramps down, into the water up to the chest, and up the sand under smoke. His platoon came off the ramp in the order it had been briefed in, which on a landing is the whole trick.',
    ],
    journal: {
      title: 'Rentina, and the landing',
      body: 'A reserve officer from the same intake: Hell Week at the Rangers’ school in Rentina, with no rest, no food and days on foot in the mountains with no camp, and a full landing exercise from ship to beach to island.',
    },
  },
  /* --------------------------- interiors --------------------------- */

  /* ------------------------------ the Academy ----------------------- */

  /** The Dean, at the lectern, who supervised the thesis and appointed him. */
  {
    id: 'dean',
    name: 'Dean Tsanakas',
    role: 'Dean, School of ECE',
    area: 'university',
    position: [-6, 2],
    facing: Math.PI * 0.85,
    colors: {
      skin: SKIN.light,
      hair: '#d8d8d8',
      shirt: '#4b5b8c',
      pants: '#33384a',
    },
    prop: 'glasses',
    gives: 'm-academy',
    missionLines: ['The thesis display, past the lectern. Mind the cables.'],
    lines: [
      'Panagiotis Tsanakas, Dean of the School. Sit anywhere; the lecture is over.',
      'The most competitive school in the country to get into, only the top entrance grades make it, and a five-year programme most students take seven and a half to finish. Kitsos finished it in five. 2017 to 2022, 8.4.',
      'He was my student in Operating Systems and Software Service Technologies, and I supervised his thesis: a phone application that watches a movement through a neural network, recognises it and judges how well it was done. Distinction. Three years later, a paper on arXiv. The case by the east wall has it.',
      'When the assemblies were being wrecked by people with no connection to this School, I appointed him independent students’ representative. Two years, and he told everyone everything he did. That is rarer than the grades.',
      'And through the last three of those years he was also working, the last two of them full-time, running a youth foundation. I still do not know where the hours came from.',
      'The lecture hall key is on the thesis display, past the lectern. My letter is on the board by the west wall.',
    ],
    journal: {
      title: 'NTUA, MEng ECE',
      body: 'National Technical University of Athens, School of Electrical and Computer Engineering, the most competitive school in Greece to enter. MEng 2017–2022 in the five years the programme is designed for, GPA 8.4; thesis supervised by the Dean and graded with distinction.',
    },
  },
  /** The programming lecturer, in the lab where the first-year labs ran. */
  {
    id: 'professor',
    name: 'Prof. Nikos',
    role: 'Programming, NTUA',
    area: 'university-lab',
    position: [-3, -6.4],
    facing: Math.PI * 0.95,
    colors: {
      skin: SKIN.tan,
      hair: '#6b6b6b',
      shirt: '#3f7bd6',
      pants: '#33384a',
    },
    prop: 'glasses',
    lines: [
      'Introduction to Programming, then Programming Techniques: ten and ten. He did not just do the exercises. He did them, and then posted the worked solutions on the forum for everybody else.',
      'He assisted in my first-year labs. The students asked him things they would not ask me.',
      'Operating Systems, Human–Computer Interaction, Multimedia, Information Systems: tens, all of them. The transcript is on the wall; read it for yourself.',
      'What I tell them is that a program is instructions somebody else has to read later. He wrote his as if he believed it.',
    ],
    journal: {
      title: 'Tens in programming',
      body: 'Prof. Nikos, who taught him programming at NTUA: a ten in every programming course from the first semester to the last, worked solutions posted for the whole year, and a lab instructor in the first-year labs.',
    },
  },
  /** The first-year with the Guide under his arm. */
  {
    id: 'student-giorgos',
    name: 'Giorgos',
    role: 'First year, ECE',
    area: 'university-lab',
    position: [8, 5.4],
    facing: -Math.PI * 0.6,
    colors: {
      skin: SKIN.light,
      hair: '#2a2420',
      shirt: '#d94f6b',
      pants: '#2f5aa8',
    },
    prop: 'bag',
    smile: true,
    lines: [
      'Are you here about the Guide? A hundred and ten pages. Every compulsory course: what it is, how it is examined, how to survive it.',
      'It is years old and we still pass it round. Half of us thought the author was a legend somebody made up. Turns out he is a person.',
      'He put his notes online too, and answered the forum questions. Some of us would not have made it to second year without him.',
    ],
    journal: {
      title: 'The legend of the Guide',
      body: 'Giorgos, a first-year at ECE: the hundred-and-ten-page Survival Guide is still passed from year to year, and some of the students reading it were not sure the author was real.',
    },
  },
  /** The professor who sat through the assemblies with him. */
  {
    id: 'prof-ilias',
    name: 'Prof. Ilias',
    role: 'Faculty assembly, NTUA',
    area: 'university-council',
    position: [8.2, -3.4],
    facing: -Math.PI * 0.7,
    colors: {
      skin: SKIN.deep,
      hair: '#3a3a3a',
      shirt: '#5d4a72',
      pants: '#2b2f3a',
    },
    lines: [
      'I sat on the faculty assemblies for years. Most student representatives came to shout. He came with a list.',
      'A petition, more than seven hundred signatures in two days, for e-voting, and for keeping party politics out of the students’ business. Then he stood up in front of eight hundred people and said it again.',
      'Two years as the independent representative the Dean appointed, and every time, a note to the students on what had been said and done. Openness is not a slogan when you actually do it.',
    ],
    journal: {
      title: 'A list, not a shout',
      body: 'Prof. Ilias, who sat on the faculty assemblies: the petition of more than 700 signatures in two days, the speech to 800, and two years of independent representation reported back to the students every time.',
    },
  },
  /** The classmate whose recommendation is on the board in the hall. */
  {
    id: 'classmate-stelios',
    name: 'Stelios',
    role: 'Classmate, ECE',
    area: 'university-council',
    position: [-4, 5.2],
    facing: -Math.PI * 0.2,
    colors: {
      skin: SKIN.tan,
      hair: '#3b2a1e',
      shirt: '#e2a33f',
      pants: '#39435c',
    },
    smile: true,
    lines: [
      'Projects and coding competitions, five years of them, and he was on the team for most of mine.',
      'Very strong coding skills, a solution-oriented mindset, and a person of integrity. I wrote that down for him later, it is on the board in the lecture hall, and I would write it again.',
      'He always ended up leading, and nobody minded. That is the trick, and I have not learned it yet.',
    ],
    journal: {
      title: 'A classmate’s word',
      body: 'Stelios Kandylakis, his classmate at ECE: five years of shared projects and coding competitions, and a recommendation: strong coding, a solution-oriented mindset, integrity, and leadership nobody minded.',
    },
  },
  {
    id: 'researcher',
    name: 'Dr. Fotini',
    role: 'Academy labs',
    area: 'university',
    position: [10, -4],
    facing: -Math.PI * 0.6,
    colors: {
      skin: SKIN.deep,
      hair: '#1f1a17',
      shirt: '#7b5fd0',
      pants: '#2f3446',
    },
    lines: [
      'The lab bench is open, mind the cables.',
      'See the certificate wall over there? MIT Open Learning for the AI foundations, CITI Program for biomedical research and HIPAA, Docker from IBM.',
      'Languages too: ECPE and ECCE from Michigan, and DELF B2 in French.',
      'He was at the Arduino IEEE Workshop here in 2018, volunteered at the European Researchers’ Night in 2019 and the 100-years celebration of ECE in 2017.',
      'Contests as well: 2nd in the National Biology Competition of 2016, plus awards in Physics, Mathematics, Informatics and Literature.',
    ],
    journal: {
      title: 'Seminars & contests',
      body: 'IBM graduate program (2024), Agile bootcamp in Hamburg (2024), Arduino IEEE Workshop at NTUA (2018). 2nd in the National Biology Competition (2016) and awards in Physics, Mathematics, Informatics and Literature. Volunteer at European Researchers’ Night (2019) and 100 years of ECE (2017).',
    },
  },
  /* ------------------------- the Work District ---------------------- */

  /*
   * Three floors, and the people are sorted by the floor they belong to: the
   * lobby explains the building, the first floor is IBM, the second is
   * Veltiston AI. Nobody talks about a floor that is not theirs.
   */

  /**
   * The lobby. Robin has the run of it — she is the one who tells you what
   * the building is for and how to read it, and she is named for the author
   * whose book on presenting yourself is the reason the lobby exists at all.
   */
  {
    id: 'robin',
    name: 'Robin',
    role: 'On presenting yourself',
    area: 'work',
    position: [-4, 4],
    facing: Math.PI * 0.75,
    colors: {
      skin: SKIN.light,
      hair: '#7a4a2c',
      shirt: '#2fb59a',
      pants: '#2b3140',
    },
    hair: 'long',
    prop: 'glasses',
    smile: true,
    lines: [
      'Welcome to the Work District. Three floors, one employer each, and a lift that only goes to two of them.',
      'I am Robin. I am here because somebody has to say the unglamorous part out loud: the work does not speak for itself. It never has.',
      'Most engineers are worse at describing what they built than at building it. A CV is not a receipt for your time — it is an argument about what you can do next.',
      'So this building is laid out as an argument. Ground floor: what he is good at, what he is certified in, and the jobs he held before any of it was software.',
      'First floor, IBM. Second floor, Veltiston AI. Take the stairs in the corner or the lift, whichever you prefer. The lift is slower and worth it.',
      'And the third floor? Built, empty, unnamed. He is good at this and he is listening — so what goes up there depends on who walks in.',
      'You have walked in.',
    ],
    journal: {
      title: 'How the building reads',
      body: 'The Work District is laid out as an argument rather than a list: the ground floor is capabilities, certifications and the student jobs; the first floor is IBM 2023–2024; the second is Veltiston AI 2024–present. The third floor is built, empty and unnamed — what goes on it depends on who is hiring.',
    },
  },

  /**
   * Kyriakos Oikonomou, retired justice of the Areios Pagos and the
   * Vice-President who handed a twenty-something undergraduate the running of
   * a foundation. He stands at the board of student jobs, where his own
   * letter hangs beside it.
   */
  {
    id: 'oikonomou',
    name: 'Kyriakos Oikonomou',
    role: 'Vice-President, "Pantokrator" Foundation',
    area: 'work',
    position: [-11.5, -10.4],
    facing: Math.PI * 0.05,
    colors: {
      skin: SKIN.light,
      hair: '#d8d4cc',
      shirt: '#5a5f6b',
      pants: '#31353d',
    },
    prop: 'glasses',
    lines: [
      'You are looking at the small board. Good — most people walk past it to get to the lift.',
      'I am Kyriakos Oikonomou. I sat on the Supreme Court, the Areios Pagos, until I retired, and I have been Vice-President of the "Pantokrator" Foundation in Paleo Faliro since 2020.',
      'In 2021 the Directorship of the Foundation fell vacant. I did not advertise it. I went to Kitsos, who was then a student at the Polytechnic, and asked him to take it.',
      'He was an undergraduate. I handed him a building, the staff, the volunteers, the budget and the children. He was twenty-something.',
      'A year and a half later he left, because the degree was finished and the army was waiting, and what he handed back had gone well past what we asked of him. The premises renovated, the operations modernised, the events running.',
      'He was organised, hard-working and conscientious, and he told us everything he did as he did it. The children trusted him and listened to him, which is not a thing you can be appointed to.',
      'My letter is on the wall beside the board. Read it there — I have said it better on paper than I will standing here.',
    ],
    journal: {
      title: 'Kyriakos Oikonomou',
      body: 'Retired Justice of the Hellenic Supreme Court and Vice-President of the "Pantokrator" Foundation, who personally offered Kitsos the Directorship in 2021 while he was still an NTUA undergraduate — and judged what he left behind to have exceeded expectations.',
    },
  },

  /* ----------------------- first floor, IBM ------------------------- */

  /**
   * Giorgos, who was on the other end of the pipeline at the bank. He gives
   * out the server-room mission, because the racks are on his floor.
   */
  {
    id: 'devops',
    name: 'Giorgos',
    role: 'DevOps colleague, IBM',
    area: 'work-ibm',
    position: [-4.5, 1],
    facing: Math.PI * 0.6,
    colors: {
      skin: SKIN.light,
      hair: '#2e2a26',
      shirt: '#1f4fa0',
      pants: '#2b3140',
    },
    gives: 'm-work',
    missionLines: [
      'Server rack, back wall of this floor. Do not touch anything blinking.',
    ],
    lines: [
      'First floor. IBM. Mind the deploys.',
      'Giorgos — I was on the DevOps side with him on the Cosmos Project at the National Bank of Greece.',
      'Cosmos was the core banking transformation: PL/I and COBOL, decades of it, being moved onto Infosys Finacle. You do not turn that off one evening and turn it on the next morning.',
      'So there is a coexistence state, where the old and the new run side by side and have to agree with each other, and a target state where only the new is left. He designed the integration architecture for both.',
      'He ran the integration calls across the bank subsystems too, which is the job nobody volunteers for: half a dozen teams who each think the problem is somebody else.',
      'On our side it was ticket deployments and pipeline automation — Jenkins, Podman, Docker Compose, ELK and Grafana on top so you could see what you had done.',
      'The server room key is on the rack at the back. Take it, you have my blessing.',
    ],
    journal: {
      title: 'IBM, DevOps Engineer',
      body: 'November 2023 – May 2024, via the IBM Associate Program. Cosmos Project at the National Bank of Greece: legacy PL/I and COBOL to Infosys Finacle, integration architecture for both the coexistence and target states, integration calls across bank subsystems, and CI/CD with Jenkins, Podman, ELK and Grafana.',
    },
  },

  /**
   * Ms. Ioanna Panagopoulou, his supervisor on the bank side. She is the one
   * who can say how he was as an integration analyst, because she is the one
   * he reported to.
   */
  {
    id: 'panagopoulou',
    name: 'Ms. Ioanna Panagopoulou',
    role: 'Supervisor, National Bank of Greece',
    area: 'work-ibm',
    position: [4.5, 1],
    facing: -Math.PI * 0.3,
    colors: {
      skin: SKIN.light,
      hair: '#3b2f28',
      shirt: '#f2efe8',
      pants: '#242a36',
    },
    hair: 'long',
    /* A bank suit: charcoal navy, ivory blouse, the skirt cut from the same
       cloth as the jacket. She is the one person in the building who came
       from the client side, and she is dressed like it. */
    blazer: '#242a36',
    blouse: '#f2efe8',
    dress: '#2c3242',
    dressTrim: '#3d4761',
    smile: true,
    lines: [
      'You must be the one walking round the building. Ioanna Panagopoulou — I supervised him at the bank.',
      'He came to us through IBM as an integration analyst, on the Finacle onboarding. On paper that is a junior posting.',
      'It was not how he worked it. He would come to the calls having already read what the subsystem actually did, not just what the ticket said about it.',
      'Integration analysis is mostly translation: this team says "customer", that team means something narrower by it, and the migration fails in eighteen months if nobody notices today. He noticed.',
      'He was excellent at it. I say that plainly because I was asked plainly, and because I would take him back tomorrow.',
      'He left for a startup, which I told him was the right decision and was sorry to hear.',
    ],
    journal: {
      title: 'Ms. Ioanna Panagopoulou',
      body: 'His supervisor at the National Bank of Greece during the Finacle onboarding, who rated him excellent as an integration analyst: reading what each subsystem actually did rather than what the ticket said, and catching the mismatches that sink a migration late.',
    },
  },

  /**
   * Klaus, from the Agile and Enterprise Design Thinking bootcamp in Hamburg
   * that IBM Greece sent him to. A week, and the only one on this floor who
   * saw him outside the bank.
   */
  {
    id: 'klaus',
    name: 'Klaus',
    role: 'IBM Hamburg, Agile bootcamp',
    area: 'work-ibm',
    position: [12, -1],
    facing: Math.PI * 0.85,
    colors: {
      skin: SKIN.light,
      hair: '#c9b48a',
      shirt: '#3c6fb8',
      pants: '#343a45',
    },
    prop: 'bag',
    lines: [
      'Hamburg, February 2024. Cold week. Good week.',
      'Klaus. IBM sent people from across Europe to the Agile and Enterprise Design Thinking bootcamp, and Greece sent him.',
      'That is the part worth pausing on: one person represented IBM Greece, and he had been with the company a few months.',
      'Design Thinking at IBM is not a poster. It is a working method — you start from the user you are actually building for, you write down who they are, and you are held to it for the rest of the week.',
      'He argued. Politely, but he argued, which is more than most did. And he came back with the method rather than the certificate, which is the rarer outcome.',
      'We still talk. If you are hiring him, do it before somebody in Hamburg does.',
    ],
    journal: {
      title: 'Hamburg, February 2024',
      body: 'Represented IBM Greece at the international Agile & Enterprise Design Thinking bootcamp in Hamburg, a few months into the job — sent as the one person from the Greek practice.',
    },
  },

  /* -------------------- second floor, Veltiston AI ------------------ */

  /**
   * Professor Dimitris Bertsimas, who founded the company. He talks about the
   * vision and about what a founding engineer in 2024 actually signed up for,
   * and leaves the technology to the people who write it.
   */
  {
    id: 'bertsimas',
    name: 'Prof. Dimitris Bertsimas',
    role: 'Founder, Veltiston AI',
    area: 'work-veltiston',
    position: [-6, 5],
    facing: Math.PI * 0.62,
    colors: {
      skin: SKIN.tan,
      hair: '#5c5750',
      shirt: '#1f3b4d',
      pants: '#2b3140',
    },
    prop: 'glasses',
    smile: true,
    lines: [
      'Welcome to the second floor. This is the company.',
      'Dimitris Bertsimas. I teach at MIT, and I founded Veltiston AI because optimisation has been solved in the literature for thirty years and hospitals are still building rosters by hand.',
      'That is the whole vision, and it is not a modest one: take the analytics that work on paper and put them where a charge nurse can press a button at seven in the morning.',
      'Kitsos was one of the founding engineers, in 2024. There were very few of us then and the platform did not exist — there was an idea about scheduling and a great deal of arguing.',
      'He built it from that. Concept to production, and then he became the technical lead of it, which is a different job and he made the change well.',
      'What I look for is people who can hold the mathematics and the delivery in one head. He can. He also tells me when he disagrees with me, in front of other people, which is worth more than it costs.',
      'Major American hospitals run it now. That is not a pilot. That is a ward that is short-staffed if we are wrong.',
    ],
    journal: {
      title: 'Prof. Dimitris Bertsimas',
      body: 'MIT professor and founder of Veltiston AI, who confirms Kitsos as one of the founding engineers in 2024: built the Nurse Scheduling platform from concept to production and became its technical lead. The vision — put optimisation where a charge nurse can press a button.',
    },
  },

  /**
   * Karim, in Morocco, who is on the receiving end of the leadership rather
   * than describing it from outside.
   */
  {
    id: 'karim',
    name: 'Karim',
    role: 'Engineer, Veltiston AI · Morocco',
    area: 'work-veltiston',
    position: [8, 5],
    facing: -Math.PI * 0.2,
    colors: {
      skin: SKIN.deep,
      hair: '#241c16',
      shirt: '#3f7bd6',
      pants: '#3a3f4d',
    },
    prop: 'headset',
    smile: true,
    lines: [
      'Greece, Boston, Morocco. I am the Morocco part of the stand-up.',
      'Karim. I have worked under a few leads. I am going to tell you why this one is different, and it is not the architecture.',
      'Three time zones is an excuse most companies use. He refuses it. The handover is written down, the decisions are written down, and nobody in Casablanca finds out on Thursday what was settled in Athens on Monday.',
      'He leads teams of five to ten across all of it: architecture, code reviews, sprint planning, the customer calls nobody wants.',
      'He reviews my code properly — line by line, with the reason, and he changes his mind when I am right. That sounds small. Ask around how rare it is.',
      'He runs the technical interviews and he onboards every new engineer himself. I was onboarded by him. That is why I am still here.',
      'Good leadership, honestly. I do not say that about many people and I am not paid to say it about him.',
    ],
    journal: {
      title: 'Leading across three time zones',
      body: 'Leads cross-functional teams of 5–10 across Greece, Boston and Morocco: written handover and decisions so no time zone finds out late, line-by-line code review, and he runs the technical interviews and onboards every new engineer himself.',
    },
  },

  /**
   * Michalis, who joined at the same time he did and can therefore say what
   * was actually built, and out of what. The technology wall is his.
   */
  {
    id: 'michalis',
    name: 'Michalis',
    role: 'Engineer, Veltiston AI',
    area: 'work-veltiston',
    position: [12, -6],
    facing: Math.PI * 0.9,
    colors: {
      skin: SKIN.tan,
      hair: '#4d3a2a',
      shirt: '#586b7d',
      pants: '#31363f',
    },
    prop: 'hardhat',
    lines: [
      'Michalis. I joined about the same time he did, so I watched all of this get built.',
      'You want the interesting part? The integrations.',
      'A documentation assistant on Spring AI — retrieval-augmented generation over the hospital’s own material, with agentic AI on top so it can actually do something rather than just answer.',
      'A SMART on FHIR application running inside Epic. If you have not worked with an EHR: you do not get to ask Epic to change. You arrive in the shape it expects.',
      'A Length of Stay analytics plugin delivered the same way, UKG workforce management wired in, SAML 2.0 single sign-on against Microsoft ADFS.',
      'A secure notification framework, full activity audit logging, and a Jira-integrated ticketing system with reCAPTCHA on the front so the queue stays real.',
      'Java 17 through 25, Spring Boot, React, MySQL with Flyway, AWS, Docker, Jenkins and GitLab CI. Grafana, Graylog and Sentry watching it. JUnit, Mockito and JaCoCo proving it.',
      'And it goes to production most weeks. That pace is not normal. It works because HIPAA and the security architecture were designed in at the start, not bolted on when the auditor called.',
    ],
    journal: {
      title: 'What the platform is made of',
      body: 'Spring AI documentation assistant with RAG and agentic AI, a SMART on FHIR app inside Epic EHR, a Length of Stay plugin, UKG integration, SAML 2.0 SSO via Microsoft ADFS, secure notifications, audit logging and Jira-integrated ticketing with reCAPTCHA — on Java, Spring Boot, React, MySQL, AWS and Docker, released to production most weeks.',
    },
  },

  /**
   * Josh, from the data science team in Boston. Kitsos leads the software on
   * the H2O side, which is the one part of the floor that is not his own
   * team — so it is the one that says most about how he works with others.
   */
  {
    id: 'josh',
    name: 'Josh',
    role: 'Data scientist, MIT team · Boston',
    area: 'work-veltiston',
    position: [-11, -7],
    facing: Math.PI * 0.25,
    colors: {
      skin: SKIN.light,
      hair: '#8a6a42',
      shirt: '#4b6b52',
      pants: '#2f3542',
    },
    lines: [
      'Josh, out of Boston. Data science side, the MIT team.',
      'We work in H2O. Kitsos leads the software on that side, which means he is the one turning what we prove into something a hospital can actually run.',
      'That handoff is where most of these companies die. The model is beautiful in a notebook and then nobody can deploy it, or it deploys and nobody can explain it to a clinician.',
      'He asks the right question, which is never "what accuracy did you get". It is "what happens to this the week the data looks different", and then he builds for that answer.',
      'He does not pretend to be a data scientist and he does not let us pretend to be engineers. Everybody is better off.',
      'Length of stay, scheduling, the analytics going into Epic — that is the pipeline from our side to the ward, and he owns the software half of it.',
    ],
    journal: {
      title: 'The H2O side',
      body: 'Leads the software on the H2O/data-science side with the MIT team in Boston: turning proven models into something a hospital can run and a clinician can be told about — length of stay, scheduling, and the analytics delivered into Epic.',
    },
  },

  /* ----------------------------- the school ------------------------- */

  /**
   * His first teacher, in the hall. The elementary years get one honour and
   * she is it; the junior high is through the door behind her.
   */
  {
    id: 'teacher',
    name: 'Ms. Maria',
    role: 'His first teacher',
    area: 'school',
    position: [-6, 2],
    facing: Math.PI * 0.6,
    colors: {
      skin: SKIN.light,
      hair: '#6b4a30',
      shirt: '#e6a63c',
      pants: '#3d4353',
    },
    prop: 'glasses',
    smile: true,
    gives: 'm-school',
    missionLines: ['The trophy case, here in the hall. Quietly, please.'],
    lines: [
      'Come in. The boy from my first class? Of course I remember him.',
      'A charismatic child, and a good heart. That is the rarer half. Homework done every single day, and a hand up before I had finished the question.',
      'I wrote in his report that he would have a bright future. I do not write that often. I was right.',
      'He captained the chess team to first place in the city tournament, and led the basketball team two years running, third in the local tournament.',
      'Evangeliki is through the west door. The cabinet key is in the trophy case here in the hall, if that is what you came for.',
    ],
    journal: {
      title: 'His first teacher',
      body: 'Ms. Maria, who taught his first class: a charismatic child with a good heart, homework done every day, a hand always up. She wrote that he would have a bright future.',
    },
  },

  /* ------------------------------ Evangeliki ------------------------ */

  {
    id: 'principal-nikos',
    name: 'Principal Nikos',
    role: 'Principal, Evangeliki',
    area: 'school-evangeliki',
    position: [2.6, -6],
    facing: Math.PI * 0.8,
    colors: {
      skin: SKIN.tan,
      hair: '#8a8a8a',
      shirt: '#3d4353',
      pants: '#2b2f3a',
    },
    prop: 'glasses',
    lines: [
      'Not only an excellent student, first of his class every year, the prize of excellence every year, but truly responsible as class president.',
      'Never in my career had a student handed me a report. Fifteen pages, on what his class had achieved in the year.',
      'And the accounts. By the letter of the law he returned every cent of the class money he had not needed. Do you know how rare that is? At that age?',
      'He represented the school as well. When they asked me who should speak for us, I did not have to think.',
    ],
    journal: {
      title: 'The principal’s word',
      body: 'Principal Nikos of Evangeliki: an excellent student, and a truly responsible class president, the only one in his career to hand in a report, fifteen pages of it, and to return every unspent cent of the class funds as the law required.',
    },
  },
  {
    id: 'teacher-diamantis',
    name: 'Mr. Diamantis',
    role: 'Robotics instructor',
    area: 'school-evangeliki',
    position: [-11, 5],
    facing: Math.PI / 2,
    colors: {
      skin: SKIN.deep,
      hair: '#2a2420',
      shirt: '#d9853f',
      pants: '#3a3f4a',
    },
    prop: 'cap',
    lines: [
      'Robotics. That year the whole class built a submarine drone. It floated, it dived, it came back, mostly.',
      'He was the one who asked, once it worked, what it would take to build one that went up instead of down.',
      'Kitsos built a proof-of-concept electric bicycle on his own. Twelve volts, a motor, a frame off the rack, and it moved. Truly remarkable, at that age.',
      'That bicycle by the bench? That is the one.',
    ],
    journal: {
      title: 'Twelve volts',
      body: 'Mr. Diamantis, who ran the robotics class at Evangeliki: the class built a submarine drone, and Kitsos on his own built a working proof-of-concept electric bicycle running on 12 V.',
    },
  },
  {
    id: 'teacher-stavroula',
    name: 'Ms. Stavroula',
    role: 'Pascal tutor',
    area: 'school-evangeliki',
    position: [-9.8, -2.6],
    facing: Math.PI * 0.75,
    colors: {
      skin: SKIN.light,
      hair: '#4a2c1e',
      shirt: '#2f6fa8',
      pants: '#3d4353',
    },
    hair: 'long',
    lines: [
      'Pascal, from the age of thirteen. He always loved programming, and he always wanted more of it.',
      'Every extra exercise I set, he did, and then came back with small games of his own. With graphics, mind you, on these machines.',
      'You can tell the ones who will do this for a living. They do not stop when the bell goes.',
    ],
    journal: {
      title: 'Pascal, at thirteen',
      body: 'Ms. Stavroula, his Pascal tutor at Evangeliki: he always loved programming and wanted more, every extra exercise done, and small games of his own with graphics on top.',
    },
  },
  {
    id: 'classmate-sotiris',
    name: 'Sotiris',
    role: 'Classmate',
    area: 'school-evangeliki',
    position: [10.6, 2.6],
    facing: -Math.PI / 2,
    colors: {
      skin: SKIN.tan,
      hair: '#3b2a1e',
      shirt: '#c8402c',
      pants: '#2f4a6b',
    },
    smile: true,
    lines: [
      'Stop studying and come play! Maths and physics, all the time!',
      'Ask him about the chess team and you will be here until the bell.',
      'Fine. One more problem, mine this time. Get it right and I will tell you something about the jetty past the school.',
    ],
    /**
     * The one question on the island with a prize: a right answer buys the
     * only hint anywhere to the swim, which is otherwise a thing you find by
     * fooling about on the end of the jetty.
     */
    quiz: {
      id: 'swim-hint',
      question:
        'Which of these contests did Kitsos never enter, or never win a prize in?',
      choices: [
        { text: 'Literature' },
        { text: 'Biology' },
        { text: 'Philosophy', right: true },
        { text: 'Drawing' },
      ],
      right: [
        'Philosophy! Never went near it. Everything else on that list he had a go at, and mostly came back with something.',
        'So. The jetty on the west shore, out past the school. Walk to the very end of it and tap Space, the jump key, three times, quick, and he goes over the side and swims.',
        'Do not tell Ms. Maria I told you.',
      ],
      wrong: [
        'Nope, he did that one. Go and read the honours board if you do not believe me.',
        'Come back when you have done your homework. Deal?',
      ],
      journal: {
        title: 'Three taps off the jetty',
        body: 'Sotiris’s tip, for a right answer: from the end of the jetty past the school, three quick taps of the jump key take him over the side and into the sea, and he swims.',
      },
    },
    journal: {
      title: 'Stop studying and come play',
      body: 'Sotiris, his classmate at Evangeliki, who spent three years trying to get him out of a maths problem and onto a football pitch. Sometimes it worked.',
    },
  },

  /* ------------------------------- Ionidios ------------------------- */

  {
    id: 'teacher-dimitra',
    name: 'Ms. Dimitra',
    role: 'Biology, Ionidios',
    area: 'school-ionidios',
    position: [10.6, -3.6],
    facing: -Math.PI * 0.6,
    colors: {
      skin: SKIN.light,
      hair: '#3b2a1e',
      shirt: '#5d7a4a',
      pants: '#3d4353',
    },
    hair: 'long',
    prop: 'glasses',
    lines: [
      'Second among about one thousand six hundred and fifty, in the Panhellenic Biology Competition. I never once saw him revise for it.',
      'I told him he should be a doctor. He told me biology was programming in organic matter: DNA is the source, the cell is the runtime, and evolution is a build that never finishes. I have not found the flaw in it yet.',
      'First in his class, year after year. I put that in a letter for a scholarship, and every word of it was true.',
      'Excellent in Biology without trying. That is the part I still find unfair.',
    ],
    journal: {
      title: 'Programming in organic matter',
      body: 'Ms. Dimitra, his biology teacher at Ionidios: 2nd of about 1,650 in the Panhellenic Biology Competition without seeming to try, and told he should be a doctor. He answered that biology was programming in organic matter.',
    },
  },
  {
    id: 'teacher-nikos',
    name: 'Mr. Nikos',
    role: 'Physics, Ionidios',
    area: 'school-ionidios',
    position: [-11, 5],
    facing: Math.PI / 2,
    colors: {
      skin: SKIN.tan,
      hair: '#4a4a4a',
      shirt: '#2f4a6b',
      pants: '#2b2f3a',
    },
    lines: [
      'General physics and science-stream physics, both years. Excellent throughout. I wrote that on a scholarship form, and I do not hand the word out.',
      'He captained our EUSO team: the science olympiad where three of you share one bench of experiments and a problem that changes the moment you touch it. He kept the bench calm.',
      'He asked me once how fast you would have to go to leave the Earth for good. Eleven kilometres a second, I told him. He wrote it on the back of his hand.',
      'Every event, competition and presentation this school put on, he was in it. And he argued well: a very good conversationalist, with clear arguments and a sense of humour. You need one, in physics.',
    ],
    journal: {
      title: 'The EUSO bench',
      body: 'Mr. Nikos, his physics teacher at Ionidios: excellent in both lyceum years, captain of the school’s EUSO science-experiments team, in every event the school ran, and, in his own words on the form, a pleasant personality with a particular sense of humour.',
    },
  },
  {
    id: 'teacher-panagiotis',
    name: 'Mr. Panagiotis',
    role: 'Informatics, Ionidios',
    area: 'school-ionidios',
    position: [10, 2.4],
    facing: -Math.PI * 0.85,
    colors: {
      skin: SKIN.deep,
      hair: '#1f1c1a',
      shirt: '#8a2f3a',
      pants: '#3a3f4a',
    },
    lines: [
      'Top of the class in Informatics, and by sixteen he had left the syllabus behind. He was teaching himself C++ while the rest were still drawing flowcharts.',
      'I put him forward for the Summer School of the University of Piraeus. He went. He came back asking for harder problems.',
      'The awards in Programming and Mathematics are on the board. I would have been surprised by anything less.',
    ],
    journal: {
      title: 'C++ at sixteen',
      body: 'Mr. Panagiotis, his informatics teacher at Ionidios: top student, teaching himself C++ from sixteen, and sent to the Summer School of the University of Piraeus on his recommendation.',
    },
  },
  {
    id: 'classmate-angelica',
    name: 'Angelica',
    role: 'Classmate',
    area: 'school-ionidios',
    position: [-8.6, -6.2],
    facing: Math.PI * 0.7,
    colors: {
      skin: SKIN.light,
      hair: '#6b3a22',
      shirt: '#e6a63c',
      pants: '#2f4a6b',
    },
    hair: 'long',
    smile: true,
    lines: [
      'If something in this school was broken, nobody called the caretaker. You waited for Kitsos to notice it.',
      'The projector, the tap in the lab, the chair with three legs. He would have it open on the floor before the teacher had finished sighing.',
      'First in the class, and still the one you wanted next to you on a bad day. Do not tell him I said either of those.',
    ],
    journal: {
      title: 'The one who fixed things',
      body: 'Angelica, his classmate at Ionidios: whatever broke in the school, he had it open on the floor before anyone had called the caretaker, and he was the one you wanted beside you on a bad day.',
    },
  },
  /* ---------------------------- night shift ------------------------- */

  {
    id: 'nightwatch',
    name: 'Stelios',
    role: 'Night watch, Work District',
    area: 'island',
    // Beside the Work District gate, turned to face the road in from the
    // plaza — which is the only direction anybody arrives from at this hour.
    position: [64, -29.5],
    facing: -1.15,
    colors: {
      skin: SKIN.tan,
      hair: '#2b2b2b',
      shirt: '#2f4858',
      pants: '#2b2f38',
    },
    prop: 'cap',
    hand: 'flashlight',
    shift: 'night',
    lines: [
      'Easy. The district is shut. Nobody goes in after hours.',
      'Unless… did production fall over at midnight? Is that what has you out here?',
      'Because it has not. Not once. Not one page in the small hours the whole time I have had this gate. It would be a first.',
      'Mind you, Kitsos kept those hours anyway. University years worst of all: in before the sun, still at it long after. Nothing was paging him. He just did not stop.',
    ],
  },

  {
    id: 'campwatch',
    name: 'Sergeant Manolis',
    role: 'Guard commander, Army Camp',
    area: 'island',
    // The pair of them square across the road in, a few paces short of the
    // gate, which is as far as anybody gets after dark.
    position: [56, 41.5],
    facing: -2.2,
    colors: {
      skin: SKIN.tan,
      hair: '#3a3129',
      shirt: '#6f7f4a',
      pants: '#4c5238',
    },
    prop: 'beret',
    hand: 'flashlight',
    shift: 'night',
    lines: [
      'Halt. Stop where you are. You are already closer than I let anyone get.',
      'The camp is sealed until reveille. Nothing goes in, nothing comes out, and no, there is no exception being made tonight.',
      'Do not take it personally. That is the whole of the job: somebody stays awake so that everybody else can sleep.',
      'The Lieutenant understood that better than most of them. At the Infantry Reserve Officers School they made him cadet company leader, and he slept last and woke first, every night of it.',
      'So that when his company woke up he was already standing there, ready. Come back at first light and you can walk straight in.',
    ],
  },

  {
    id: 'campsentry',
    name: 'Private Fotis',
    role: 'Sentry, Army Camp',
    area: 'island',
    position: [64, 41.5],
    facing: -2.15,
    colors: {
      skin: SKIN.deep,
      hair: '#241d18',
      shirt: '#6f7f4a',
      pants: '#4c5238',
    },
    prop: 'cap',
    hand: 'flashlight',
    shift: 'night',
    lines: [
      'Back. You do not cross this line.',
      'Nothing goes in and nothing comes out. The sergeant will give you the reason; my job is the line.',
      'Push it again and we do this the other way. This post is mine until four and nobody has walked past it yet.',
    ],
  },

  {
    id: 'operator',
    name: 'Sofia',
    role: 'Radio Center',
    area: 'radio',
    position: [-5, 3],
    facing: Math.PI * 0.4,
    colors: {
      skin: SKIN.light,
      hair: '#2a2320',
      shirt: '#b95fd0',
      pants: '#343a4c',
    },
    prop: 'headset',
    lines: [
      'Radio Center, Sofia speaking. Signal is strong today.',
      'Two open channels, email and LinkedIn, plus the message desk right here.',
      'Step up to the console and pick one. Everything goes straight to Kitsos; there is no operator in between.',
    ],
    journal: {
      title: 'Radio Center',
      body: `Reach Kitsos at ${PROFILE.email} or ${PROFILE.linkedinLabel}.`,
    },
  },

  /* ------------------------ Kitsos House ------------------------- */
  ...HOME_FAMILY,
  ...OLD_FAMILY,
  /* Her side, in the house on the twenty-fifth of December only. */
  ...IN_LAWS,
  /* The class, in the lecture hall for the thesis defence and nowhere else. */
  ...CLASS,
]

/**
 * The volunteers' kiosk on the west green.
 *
 * Where it stands, which way it faces and how big it is built live here
 * rather than in the component that draws it, because the collision that
 * stops you walking through the table has to agree with them, and terrain
 * cannot import from the world folder. `scale` multiplies every length in
 * the component, so a half-extent taken off it must be scaled too.
 */
export const KIOSK = {
  x: -27,
  z: 23.5,
  facing: 0.4,
  scale: 1.3,
  /**
   * The solid part, in the kiosk's own unscaled frame: the trestle table and
   * the stall behind it, not the open front where the two of them stand. A
   * box this shallow keeps the gap under the canopy walkable.
   */
  table: { z: -1.5, hx: 1.75, hz: 0.57 },
} as const

export const SIGNS: SignPost[] = [
  {
    id: 'sign-plaza',
    position: [-7, 14],
    facing: 0,
    label: 'Town Plaza',
    lines: [
      'KITSOS TOWN: Town Plaza. Seven roads leave this square, and not one of them is named after where it goes.',
      'North, Motivation Road, to the Polytechnic. East, Discipline Road, to the Work District. West, Curiosity Road, to the Town School.',
      'South-west, Caring Road, to Kitsos House. South-east, Leadership Road, to the Army Camp. Due south, Collaboration Road, to the Radio Center.',
      'And north-west out to the cape: Freedom Road, and the Old Lighthouse at the end of it. Locked.',
      'They are named for what he carried out of each of them. Press M for the map, J for the journal.',
    ],
  },
  {
    id: 'sign-north',
    position: [-4, -20],
    facing: 0,
    label: 'Motivation Road',
    lines: [
      'MOTIVATION ROAD: the Polytechnic, straight on. Mind the bicycles.',
      'Electrical & Computer Engineering, and the lecture hall behind it.',
      'Five years of it. Nobody made him finish; that is rather the point of the name.',
    ],
  },
  {
    id: 'sign-east',
    position: [20, -11],
    facing: -Math.PI * 0.45,
    label: 'Discipline Road',
    lines: [
      'DISCIPLINE ROAD: the Work District. Veltiston.AI and IBM Consulting.',
      'Deploys on Thursdays. Coffee is free, the incidents are not.',
      'Shipping the same standard on a bad week as on a good one is the whole trick.',
    ],
  },
  {
    id: 'sign-west',
    position: [-21, -9],
    facing: Math.PI * 0.6,
    label: 'Curiosity Road',
    lines: [
      'CURIOSITY ROAD: the Town School, where the whole thing started.',
      'Carry on past the school for the west beach and the dock.',
      'Everything after this road is just the same question asked louder.',
    ],
  },
  {
    id: 'sign-cape',
    position: [-17, -18],
    facing: Math.PI * 0.25,
    label: 'Freedom Road',
    lines: [
      'FREEDOM ROAD: the north-west cape, and the Old Lighthouse on the end of it.',
      'The door has five locks. One key waits in each district building.',
      'Nobody has opened it in years. Be the one who does.',
    ],
  },
  {
    id: 'sign-south',
    position: [-4, 22],
    facing: Math.PI,
    label: 'Collaboration Road',
    lines: [
      'COLLABORATION ROAD: the Radio Center, straight ahead. Follow the antenna.',
      'Open to recruiters, collaborators and old friends alike.',
      'Nothing worth building on this island was built by one person.',
    ],
  },
  {
    id: 'sign-house',
    // Off Caring Road itself, far enough to the side of it that nobody
    // walks into the post on the way out of the square.
    position: [-22.4, 11.4],
    facing: 2.04,
    label: 'Caring Road',
    lines: [
      'CARING ROAD: Kitsos House, south-west. Ms. Stella is usually on the step.',
      'Home, and the people who made it one. Volunteering, the Foundation, the blood bank.',
      'Everything on this road he does for nothing, which is how you know he means it.',
    ],
  },
  {
    id: 'sign-camp',
    position: [22.1, 10.3],
    facing: -2.005,
    label: 'Leadership Road',
    lines: [
      'LEADERSHIP ROAD: the Army Camp, south-east. Ask for Sergeant Petros.',
      'Marine Battalion, reserve. Platoon Leader and Weapons Officer.',
      'He slept last and woke first. Nobody on this road had to be told twice.',
    ],
  },
  {
    /*
     * The board on the green in front of the volunteers' kiosk. It stands
     * clear of the stall itself, so that reading it and talking to the two of
     * them at the table are two different things you walk up to.
     */
    id: 'sign-kiosk',
    position: [-22.01, 25.62],
    // Turned back towards the square, so the board faces whoever is walking
    // out to the kiosk rather than showing them its blank back. The writing
    // is on the board's -z, which is why this is the approach bearing less a
    // half turn rather than the bearing itself.
    facing: 2.1 - Math.PI,
    label: 'Volunteers’ Kiosk',
    lines: [
      'VOLUNTEERS’ KIOSK: sign-ups, donations, tree planting, and the blood drive.',
      'Run out of the Christian Youth Foundation "Pantokrator" in Paleo Faliro. Kitsos has been on this rota since 2017.',
      'Leading volunteer 2017–2021 and again from 2023, and Director of the place in between, 2021 to 2022.',
      'He gives blood himself, since 2017. The tin of stickers is Marios’ department, and he is strict about it.',
    ],
    journal: {
      title: 'The volunteers’ kiosk',
      body: 'The stall on the west green: sign-ups, donation drives, tree planting and a standing blood drive, run out of the "Pantokrator" Foundation in Paleo Faliro. Kitsos has been on the rota since 2017 — leading volunteer, and Director 2021–2022.',
    },
  },
]

/**
 * The ring road: a closed loop through the woods that encircles the town and
 * crosses all seven district roads on its way round. It is the island's race
 * circuit, and the start line is the point below, where it meets the road up
 * to the Radio Center.
 *
 * The line was searched for rather than drawn: every point is at least six
 * metres clear of every building, hill and shoreline, which is what keeps a
 * bike at full lean on the tarmac and out of somebody's front wall. It cannot
 * run along the coast, however much a coast road would suit it — the six
 * hills and the Radio Center between them leave no continuous gap out there.
 */
export const CIRCUIT: Vec2[] = [
  [0, 76],
  [13.2, 74.8],
  [23.9, 65.8],
  [32, 55.4],
  [37.3, 44.4],
  [44.4, 37.3],
  [55.4, 32],
  [65.8, 23.9],
  [68.9, 12.2],
  [70, 0],
  [67, -11.8],
  [58.3, -21.2],
  [53.7, -31],
  [47.5, -39.9],
  [39.9, -47.5],
  [30, -52],
  [20.5, -56.4],
  [10.1, -57.1],
  [0, -58],
  [-10.1, -57.1],
  [-21.9, -60.1],
  [-32, -55.4],
  [-45, -53.6],
  [-53.6, -45],
  [-60.6, -35],
  [-60.1, -21.9],
  [-63, -11.1],
  [-70, 0],
  [-74.8, 13.2],
  [-71.4, 26],
  [-62.4, 36],
  [-50.6, 42.4],
  [-42.4, 50.6],
  [-36, 62.4],
  [-24.6, 67.7],
  [-13.2, 74.8],
]

/** The circuit as segments, which is the shape the rest of the world wants. */
const CIRCUIT_PATHS: [Vec2, Vec2][] = CIRCUIT.map((point, i) => [
  point,
  CIRCUIT[(i + 1) % CIRCUIT.length],
])

/**
 * Straight path segments (from → to). The seven spokes stop at the rim of the
 * paved plaza rather than crossing it, so the square itself stays open to
 * walk across; the ring road crosses every one of them.
 */
export const PATHS: [Vec2, Vec2][] = [
  [
    [0, -17],
    [0, -63.9],
  ],
  [
    [16, -8.2],
    [66, -34],
  ],
  [
    [-17.2, -5.5],
    [-69, -22],
  ],
  [
    [-13.1, -12.4],
    [-62.5, -59],
  ],
  [
    [-14.3, 10.9],
    [-62, 47],
  ],
  [
    [14.6, 10.5],
    [60, 43],
  ],
  [
    [0, 17],
    [0, 87],
  ],
  // Coastal spur out to the dock, past the school.
  [
    [-69, -22],
    [-92, 4],
  ],
  [
    [-92, 4],
    [-103, 19],
  ],
  ...CIRCUIT_PATHS,
]

export const BUILDING_BY_ID = new Map(BUILDINGS.map((b) => [b.id, b]))
export const MISSION_BY_ID = new Map(MISSIONS.map((m) => [m.id, m]))
export const KEY_BY_ID = new Map(KEYS.map((k) => [k.id, k]))
