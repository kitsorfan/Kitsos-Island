import type { Building, KeyItem, Mission, Npc, SignPost, Vec2 } from '../types'
import { PROFILE } from './profile'

/** Everything inside this radius is flat, walkable ground. */
export const ISLAND_FLAT_RADIUS = 108
export const ISLAND_WALK_RADIUS = 111
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

/** The Academy's front steps, and the portico landing they lead to. */
export const RAMPS: Ramp[] = [
  {
    from: [0, -63.95],
    to: [0, -67],
    halfWidth: 9,
    fromHeight: 0,
    toHeight: 1.26,
  },
]

/** The top tread and the portico floor behind it, both at full height. */
export const LEDGES: Ledge[] = [
  { x: 0, z: -68.45, hx: 8.1, hz: 1.45, height: 1.26 },
]

export const BUILDINGS: Building[] = [
  {
    id: 'house',
    kind: 'house',
    name: 'Kitsos House',
    short: 'House',
    subtitle: 'Home of Christos "Kitsos" Orfanopoulos',
    position: [-62, 56],
    door: [-62, 47],
    half: [7.2, 6.5],
    rotation: Math.PI,
    scale: 1.5,
    height: 8,
    accent: '#e0574a',
  },
  {
    id: 'university',
    kind: 'university',
    name: 'NTUA Academy',
    short: 'Academy',
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
    door: [66, -34],
    half: [9.5, 10.2],
    rotation: -Math.PI / 2,
    scale: 1.5,
    height: 22,
    accent: '#2fb59a',
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
    subtitle: 'Marine Special Forces — reserve',
    position: [60, 54],
    door: [60, 43],
    half: [10.2, 8.7],
    rotation: Math.PI,
    scale: 1.5,
    height: 9,
    accent: '#6f7f4a',
    closesAtNight: [
      'The gate is chained and the guardhouse lamp is lit. Two sentries on it, and neither of them has moved.',
      'One of them will talk to you. Getting past them is not on the table.',
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
    subtitle: 'Sealed — five district keys open it',
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
  { id: 'key-camp', name: 'Footlocker Key', buildingId: 'army', color: '#8a9a5a' },
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
    hint: 'Kyria Voula says the spare is on the shelf beside the chessboard, inside the house.',
    done: 'Brass Key taken from the shelf by the chessboard.',
  },
  {
    id: 'm-academy',
    title: 'Thesis defence',
    buildingId: 'university',
    keyId: 'key-academy',
    brief: 'The Academy keeps its keys somewhere behind the lectern.',
    hint: 'Prof. Nikolaos left the lecture hall key on the thesis display, past the lectern.',
    done: 'Lecture Hall Key collected from the thesis display.',
  },
  {
    id: 'm-work',
    title: 'Production access',
    buildingId: 'work',
    keyId: 'key-work',
    brief: 'Nobody gets into the server room without asking first.',
    hint: 'Anna says the server room key hangs on the rack at the back of the office floor.',
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
    hint: 'Ms. Maria keeps the cabinet key in the trophy case beside the blackboard.',
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
    name: 'Mayor Kostas',
    role: 'Kitsos Town',
    area: 'island',
    position: [8, 10],
    facing: Math.PI,
    colors: { skin: SKIN.tan, hair: '#4a3526', shirt: '#3d5a98', pants: '#2c3242' },
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
      `Everything here belongs to ${PROFILE.firstName} "${PROFILE.nickname}" ${PROFILE.lastName} — a senior full stack engineer and technical lead out of ${PROFILE.location}.`,
      'Seven roads leave this square. Academy north, Work east, School west, House and Camp south, Radio Center due south.',
      'And north-west, on the cape, the Old Lighthouse. Sealed for years. Five district keys open it — one hidden in each building.',
      'Press M for the map if the walk gets long. Once you have found a place, you can travel straight back to it.',
    ],
    journal: {
      title: 'Welcome to Kitsos Town',
      body: 'Christos "Kitsos" Orfanopoulos — Senior Full Stack Software Engineer & Technical Lead, based in Athens, Greece. Five keys, one per district, open the Old Lighthouse on the north-west cape.',
    },
  },
  {
    id: 'volunteer',
    name: 'Eleni',
    role: 'Volunteer coordinator',
    area: 'island',
    position: [-24, 20],
    facing: Math.PI * 0.35,
    colors: { skin: SKIN.light, hair: '#8a4a2c', shirt: '#d94f6b', pants: '#3a3f4d' },
    route: [
      [-24, 20],
      [-19, 25],
      [-28, 27],
    ],
    pace: 1.2,
    lines: [
      'Kitsos? He has been around this tent since 2017.',
      'Leading volunteer at the Christian Youth Foundation "Pantokrator" in Paleo Faliro — 2017 to 2021, then again from 2023 to today.',
      'He even ran the place. Director from February 2021 to September 2022, appointed by the council while he was still finishing his degree.',
      'Staff, volunteers, the buildings, the books, the grant applications. Events, field trips, tree planting, donation drives, prison visits.',
      'When the lockdowns hit he put the whole programme on a live stream so the children would not lose it.',
      'The Vice-President — a retired Supreme Court judge, mind you — wrote it all down in a letter. It is up at the school.',
      'And he still gives blood. Blood donor since 2017, no fuss about it.',
    ],
    journal: {
      title: 'Volunteering',
      body: 'Leading volunteer (2017–2021, 2023–today) and Director (2021–2022) at the Christian Youth Foundation "Pantokrator", Paleo Faliro. Blood donor since 2017.',
    },
  },
  {
    id: 'chess',
    name: 'Grigoris',
    role: 'Park regular',
    area: 'island',
    position: [27, 16],
    facing: -Math.PI * 0.75,
    colors: { skin: SKIN.deep, hair: '#2b2b2b', shirt: '#5c8a3a', pants: '#4a4436' },
    prop: 'cap',
    lines: [
      'Sit down, I have white. …No? Fine.',
      'Kitsos plays here between runs. Chess, running, cycling — the man cannot sit still.',
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
    colors: { skin: SKIN.tan, hair: '#6b5b4a', shirt: '#7a6fb0', pants: '#3a3f4d' },
    route: [
      [-14, -14],
      [14, -18],
      [22, 4],
      [-6, 14],
    ],
    pace: 1.5,
    lines: [
      'Lovely square, is it not? He rebuilt those benches himself.',
      'Careful on the north road — the students cycle like maniacs.',
    ],
  },
  {
    id: 'stroller-b',
    name: 'Despina',
    role: 'Townsfolk',
    area: 'island',
    position: [24, -16],
    facing: Math.PI,
    colors: { skin: SKIN.light, hair: '#c08a4a', shirt: '#4fb0c0', pants: '#4c4358' },
    route: [
      [24, -16],
      [32, 10],
      [8, 24],
      [-18, 8],
    ],
    pace: 1.3,
    lines: [
      'Looking for the Lighthouse? North-west cape, follow the old road.',
      'Locked since before I moved here. Five keys, they say. One per district.',
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
    colors: { skin: SKIN.tan, hair: '#453224', shirt: '#f0653f', pants: '#2c3242' },
    route: [
      [86, 20],
      [72, 52],
      [40, 78],
      [0, 88],
      [-44, 74],
    ],
    pace: 3.6,
    lines: [
      'Cannot stop — halfway through the loop!',
      'He runs this coast most mornings. Cycles the long way round on Sundays.',
      'Says the best debugging happens at kilometre six.',
    ],
    journal: {
      title: 'Coastal loop',
      body: 'Runs and cycles the island loop — the thinking happens somewhere around kilometre six.',
    },
  },
  {
    id: 'fisherman',
    name: 'Captain Yannis',
    role: 'The dock',
    area: 'island',
    position: [-104, 20],
    facing: Math.PI * 0.55,
    colors: { skin: SKIN.deep, hair: '#7d7d7d', shirt: '#3f6f8c', pants: '#43484f' },
    prop: 'cap',
    lines: [
      'Sea is calm. Good day for a long conversation.',
      'Athens is over that horizon. That is where he lives and works.',
      'Hiking, camping, a boat when he can get one. Then back to the screens.',
      'If you have a job for him, do not shout it at the sea — use the Radio Center.',
    ],
    journal: {
      title: 'Based in Athens',
      body: 'Lives and works in Athens, Greece — Greek nationality, open to conversations that start with a message.',
    },
  },
  /* ---------------------------- districts -------------------------- */
  {
    id: 'neighbour',
    name: 'Kyria Voula',
    role: 'Neighbour',
    area: 'island',
    position: [-53, 44],
    facing: Math.PI * 0.7,
    colors: { skin: SKIN.light, hair: '#8f8f8f', shirt: '#c96fa0', pants: '#4c4358' },
    gives: 'm-house',
    missionLines: ['Shelf by the chessboard. You cannot miss it, he never tidies.'],
    lines: [
      'That is his house, right there. Lights on late, always.',
      'Greek is his mother tongue, English at proficiency — the Michigan ECPE — and French to B2, he has the DELF for it.',
      'Athens born and based. Greek national. Go in, he does not mind visitors.',
      'Looking for the brass key? It is on the shelf beside the chessboard, inside.',
    ],
    journal: {
      title: 'Profile & languages',
      body: 'Athens, Greece · Greek nationality. Greek (native), English (proficiency — ECPE, University of Michigan 2016), French (B2 — DELF 2019).',
    },
  },
  {
    id: 'studentrep',
    name: 'Marina',
    role: 'Student council',
    area: 'island',
    position: [-22, -60],
    facing: Math.PI * 0.15,
    colors: { skin: SKIN.tan, hair: '#3b2a1e', shirt: '#e2a33f', pants: '#39435c' },
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
      body: 'Students’ representative and leader of the Independent ECE Students — e-voting, depoliticization of the university, realistic and democratic problem-solving.',
    },
  },
  {
    id: 'robotkid',
    name: 'Alex',
    role: 'Robotics club',
    area: 'island',
    position: [-66, -36],
    facing: Math.PI * 0.1,
    colors: { skin: SKIN.deep, hair: '#191919', shirt: '#d94f6b', pants: '#2f5aa8' },
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
      body: 'Children’s tutor in Robotics at Citylab, Alimos — 2020–2021.',
    },
  },
  {
    id: 'sergeant',
    name: 'Sergeant Petros',
    role: 'Army Camp',
    area: 'island',
    position: [66, 40],
    facing: -Math.PI * 0.8,
    colors: { skin: SKIN.tan, hair: '#3a3129', shirt: '#6f7f4a', pants: '#4c5238' },
    prop: 'beret',
    shift: 'day',
    gives: 'm-camp',
    missionLines: ['Footlocker. End of the bunks. Do not rearrange my barracks.'],
    lines: [
      'Halt. …Relax, civilian, the camp is open today.',
      'Second Lieutenant Orfanopoulos, reservist. September 2022 to November 2023, straight out of NTUA.',
      'Basic training at the Center of Special Forces in Nea Peramos. Third in his class out of the Infantry Reserve Officers School in Heraklion.',
      'Then the Rangers’ school at Rentina — guerilla warfare. After that, Deputy Company Commander and Weapons Officer at a Marine Battalion.',
      'Platoon Leader and Weapons Officer for a Marine Company. Personnel, logistics, weaponry, readiness.',
      'The Battalion Commander wrote him a letter. It is framed inside, on the east wall. Read it.',
      'That is where the calm comes from. Bad news does not make him louder.',
      'The key you are after is in the footlocker at the end of the bunks. Go on in.',
    ],
    journal: {
      title: 'Military service',
      body: 'Reservist Second Lieutenant, Marine Battalion, September 2022 – November 2023. Special Forces basic training at Nea Peramos; graduated 3rd in class from the Infantry Reserve Officers School, Heraklion; completed the Rangers’ Guerilla Warfare School at Rentina; served as Deputy Company Commander and Weapons Officer.',
    },
  },
  /* --------------------------- interiors --------------------------- */
  {
    id: 'professor',
    name: 'Prof. Nikolaos',
    role: 'NTUA Academy',
    area: 'university',
    position: [-6, 2],
    facing: Math.PI * 0.85,
    colors: { skin: SKIN.light, hair: '#d8d8d8', shirt: '#4b5b8c', pants: '#33384a' },
    prop: 'glasses',
    gives: 'm-academy',
    missionLines: ['The thesis display, past the lectern. Mind the cables.'],
    lines: [
      'Ah, another visitor for the Academy.',
      'Christos took the MEng at the National Technical University of Athens, School of Electrical and Computer Engineering. 2017 to 2022, GPA 8.4.',
      'His thesis in 2022: a movement compliance application using machine learning.',
      'And it did not stop there — it became a paper on arXiv in December 2025. The case by the east wall has it.',
      'The Dean himself supervised it, and graded it with distinction. His letter is on the board by the west wall.',
      'Five hard years. He came out of it able to build a system, not just a feature.',
      'If you want the lecture hall key, it is sitting on the thesis display over there.',
    ],
    journal: {
      title: 'NTUA — MEng ECE',
      body: 'National Technical University of Athens, School of Electrical and Computer Engineering, MEng 2017–2022, GPA 8.4. Thesis: movement compliance application using machine learning.',
    },
  },
  {
    id: 'researcher',
    name: 'Dr. Fotini',
    role: 'Academy labs',
    area: 'university',
    position: [10, -4],
    facing: -Math.PI * 0.6,
    colors: { skin: SKIN.deep, hair: '#1f1a17', shirt: '#7b5fd0', pants: '#2f3446' },
    lines: [
      'The lab bench is open, mind the cables.',
      'See the certificate wall over there? MIT Open Learning for the AI foundations, CITI Program for biomedical research and HIPAA, Docker from IBM.',
      'Languages too — ECPE and ECCE from Michigan, and DELF B2 in French.',
      'He was at the Arduino IEEE Workshop here in 2018, volunteered at the European Researchers’ Night in 2019 and the 100-years celebration of ECE in 2017.',
      'Contests as well — 2nd in the National Biology Competition of 2016, plus awards in Physics, Mathematics, Informatics and Literature.',
    ],
    journal: {
      title: 'Seminars & contests',
      body: 'IBM graduate program (2024), Agile bootcamp in Hamburg (2024), Arduino IEEE Workshop at NTUA (2018). 2nd in the National Biology Competition (2016) and awards in Physics, Mathematics, Informatics and Literature. Volunteer at European Researchers’ Night (2019) and 100 years of ECE (2017).',
    },
  },
  {
    id: 'recruiter',
    name: 'Anna',
    role: 'Veltiston.AI',
    area: 'work',
    position: [-7, 5],
    facing: Math.PI * 0.6,
    colors: { skin: SKIN.light, hair: '#5a3a24', shirt: '#2fb59a', pants: '#2b3140' },
    gives: 'm-work',
    missionLines: ['Server rack, back wall. Do not touch anything blinking.'],
    lines: [
      'Work District. Mind the deploys.',
      'He came in May 2024 as one of the first engineers at Veltiston AI — an AI healthcare startup founded by MIT Professor Dimitris Bertsimas.',
      'Full-stack engineer for two years, Senior Software Engineer since May 2026, and project lead on three projects.',
      'Java, Spring Boot, React, MySQL and AWS — a cloud-native platform now live in four major U.S. hospitals.',
      'He also leads the software on a contract for Holistic Hospital Optimization, on the same problem from the other side.',
      'Weekly production releases, HIPAA compliance, and nobody paged at 3am. Mostly.',
      'The server room key is on the rack at the back. Take it, you have my blessing.',
    ],
    journal: {
      title: 'Veltiston AI — Senior Engineer',
      body: 'At Veltiston AI since May 2024: full-stack engineer, then Senior Software Engineer from May 2026 and project lead on three projects. Technical Lead of the Nurse Scheduling platform — Java, Spring Boot, React, MySQL, AWS — live in four major U.S. hospitals. Also Lead Software Engineer on contract for Holistic Hospital Optimization.',
    },
  },
  {
    id: 'teammate',
    name: 'Youssef',
    role: 'Engineer, Veltiston.AI',
    area: 'work',
    position: [9, 6],
    facing: -Math.PI * 0.2,
    colors: { skin: SKIN.deep, hair: '#241c16', shirt: '#3f7bd6', pants: '#3a3f4d' },
    prop: 'headset',
    lines: [
      'Greece, Boston, Morocco — I am the Morocco part of the stand-up.',
      'He leads cross-functional teams of five to ten developers across three time zones: architecture, delivery, code reviews, sprint planning, the calls nobody wants to make.',
      'He runs the technical interviews, mentors us, and onboards every new engineer himself.',
      'He also took a legacy Java/Angular app and dragged it into this decade — Agile process, engineering standards, CI/CD, documentation, refactoring in slices.',
    ],
    journal: {
      title: 'Leadership',
      body: 'Leads cross-functional teams of 5–10 developers across Greece, Boston and Morocco. Drives architecture, delivery, code reviews and sprint planning; leads technical interviews, mentoring and onboarding. Modernized a legacy Java/Angular application with Agile process, standards, CI/CD and incremental refactoring.',
    },
  },
  {
    id: 'architect',
    name: 'Thodoris',
    role: 'Platform architect',
    area: 'work',
    position: [12, -6],
    facing: Math.PI * 0.9,
    colors: { skin: SKIN.tan, hair: '#4d3a2a', shirt: '#586b7d', pants: '#31363f' },
    prop: 'hardhat',
    lines: [
      'You want the interesting part? The integrations.',
      'A documentation assistant on Spring AI with RAG and agentic AI. A SMART on FHIR app running inside Epic. A Length of Stay plugin delivered the same way.',
      'UKG workforce management wired in, SAML 2.0 single sign-on against Microsoft ADFS, a notification framework and full activity audit logging.',
      'Even the ticketing is ours — Jira-integrated, with reCAPTCHA on the front so the queue stays real.',
      'Observability is not an afterthought: Grafana, Graylog, Sentry. Secure and scalable, or it does not ship.',
    ],
    journal: {
      title: 'Platform capabilities',
      body: 'Spring AI documentation assistant (RAG + agentic AI), a SMART on FHIR app embedded in Epic EHR, a Length of Stay analytics plugin, UKG integration, SAML 2.0 SSO via Microsoft ADFS, a secure notification framework, audit logging, and Jira-integrated ticketing with reCAPTCHA.',
    },
  },
  {
    id: 'devops',
    name: 'Dimitris',
    role: 'Dev(Sec)Ops, IBM',
    area: 'work',
    position: [-11, -7],
    facing: Math.PI * 0.25,
    colors: { skin: SKIN.light, hair: '#2e2a26', shirt: '#1f4fa0', pants: '#2b3140' },
    lines: [
      'Before the startup, there was the bank.',
      'November 2023 to May 2024, DevOps Engineer at IBM — picked for the IBM Associate Program.',
      'The Cosmos Project at the National Bank of Greece: moving core banking off legacy PL/I and COBOL onto Infosys Finacle.',
      'He ran the integration calls across the bank’s subsystems and designed the architecture for both the coexistence state and the target state.',
      'Deployments and pipeline automation with Jenkins, Podman, ELK and Grafana. And he represented IBM Greece at the Agile and Enterprise Design Thinking bootcamp in Hamburg.',
    ],
    journal: {
      title: 'IBM — DevOps Engineer',
      body: 'November 2023 – May 2024, via the IBM Associate Program. Cosmos Project at the National Bank of Greece: legacy PL/I and COBOL to Infosys Finacle, integration architecture for coexistence and target states, CI/CD automation with Jenkins, Podman, ELK and Grafana. Represented IBM Greece at an Agile bootcamp in Hamburg.',
    },
  },
  {
    id: 'teacher',
    name: 'Ms. Maria',
    role: 'Town School',
    area: 'school',
    position: [-6, -3],
    facing: -Math.PI * 0.35,
    colors: { skin: SKIN.light, hair: '#6b4a30', shirt: '#e6a63c', pants: '#3d4353' },
    gives: 'm-school',
    missionLines: ['Trophy case, beside the blackboard. Quietly, please.'],
    lines: [
      'Shh — exams. Come in, quietly.',
      'Model High School of Ionidios in Piraeus, 2015 to 2017, graduating GPA 19.9 out of 20.',
      'Before that, the Model Experimental High School of Evaggeliki in Nea Smyrni, 2011 to 2015 — he ranked 1st in the admission exam of 2014.',
      'Bright kid. Insufferably curious. Still is, I hear.',
      'The cabinet key is in the trophy case by the blackboard, if that is what you came for.',
    ],
    journal: {
      title: 'Schooling',
      body: 'Model High School of Ionidios, Piraeus (2015–2017, GPA 19.9). Model Experimental High School of Evaggeliki, Nea Smyrni (2011–2015) — ranked 1st in the 2014 admission exam.',
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
    colors: { skin: SKIN.tan, hair: '#2b2b2b', shirt: '#2f4858', pants: '#2b2f38' },
    prop: 'cap',
    hand: 'flashlight',
    shift: 'night',
    lines: [
      'Easy. The district is shut — nobody goes in after hours.',
      'Unless… did production fall over at midnight? Is that what has you out here?',
      'Because it has not. Not once. Not one page in the small hours the whole time I have had this gate. It would be a first.',
      'Mind you, Kitsos kept those hours anyway. University years worst of all: in before the sun, still at it long after. Nothing was paging him — he just did not stop.',
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
    colors: { skin: SKIN.tan, hair: '#3a3129', shirt: '#6f7f4a', pants: '#4c5238' },
    prop: 'beret',
    hand: 'flashlight',
    shift: 'night',
    lines: [
      'Halt. The camp is sealed for the night — nothing goes in and nothing comes out before reveille.',
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
    colors: { skin: SKIN.deep, hair: '#241d18', shirt: '#6f7f4a', pants: '#4c5238' },
    prop: 'cap',
    shift: 'night',
    lines: [
      'Nothing goes in. The sergeant is over there if you want the reason.',
      'This post is mine until four. Nobody has walked past it yet, and nobody is going to tonight.',
    ],
  },

  {
    id: 'operator',
    name: 'Sofia',
    role: 'Radio Center',
    area: 'radio',
    position: [-5, 3],
    facing: Math.PI * 0.4,
    colors: { skin: SKIN.light, hair: '#2a2320', shirt: '#b95fd0', pants: '#343a4c' },
    prop: 'headset',
    lines: [
      'Radio Center, Sofia speaking. Signal is strong today.',
      'Two open channels — email and LinkedIn — plus the message desk right here.',
      'Step up to the console and pick one. Everything goes straight to Kitsos; there is no operator in between.',
    ],
    journal: {
      title: 'Radio Center',
      body: `Reach Kitsos at ${PROFILE.email} or ${PROFILE.linkedinLabel}.`,
    },
  },
]

export const SIGNS: SignPost[] = [
  {
    id: 'sign-plaza',
    position: [-7, 14],
    facing: 0,
    label: 'Town Plaza',
    lines: [
      'KITSOS TOWN — Town Plaza. Seven roads leave this square.',
      'North: NTUA Academy. East: Work District. West: Town School.',
      'South-west: Kitsos House. South-east: Army Camp. Due south: Radio Center.',
      'North-west, on the cape: the Old Lighthouse. Locked.',
      'Press M for the map, J for the journal.',
    ],
  },
  {
    id: 'sign-north',
    position: [-4, -20],
    facing: 0,
    label: 'North road',
    lines: [
      'NTUA ACADEMY — straight on. Mind the bicycles.',
      'Electrical & Computer Engineering, and the lecture hall behind it.',
    ],
  },
  {
    id: 'sign-east',
    position: [20, -11],
    facing: -Math.PI * 0.45,
    label: 'East road',
    lines: [
      'WORK DISTRICT — Veltiston.AI and IBM Consulting.',
      'Deploys on Thursdays. Coffee is free, the incidents are not.',
    ],
  },
  {
    id: 'sign-west',
    position: [-21, -9],
    facing: Math.PI * 0.6,
    label: 'West road',
    lines: [
      'TOWN SCHOOL — where the whole thing started.',
      'Carry on past the school for the west beach and the dock.',
    ],
  },
  {
    id: 'sign-cape',
    position: [-17, -18],
    facing: Math.PI * 0.25,
    label: 'Cape road',
    lines: [
      'THE OLD LIGHTHOUSE — north-west cape.',
      'The door has five locks. One key waits in each district building.',
      'Nobody has opened it in years. Be the one who does.',
    ],
  },
  {
    id: 'sign-south',
    position: [-4, 22],
    facing: Math.PI,
    label: 'South road',
    lines: [
      'RADIO CENTER — straight ahead, follow the antenna.',
      'Open to recruiters, collaborators and old friends alike.',
    ],
  },
]

/**
 * Straight path segments (from → to). They stop at the rim of the paved plaza
 * rather than crossing it, so the square itself stays open to walk across.
 */
export const PATHS: [Vec2, Vec2][] = [
  [[0, -17], [0, -63.9]],
  [[16, -8.2], [66, -34]],
  [[-17.2, -5.5], [-69, -22]],
  [[-13.1, -12.4], [-62.5, -59]],
  [[-14.3, 10.9], [-62, 47]],
  [[14.6, 10.5], [60, 43]],
  [[0, 17], [0, 87]],
  // Coastal spur out to the dock, past the school.
  [[-69, -22], [-92, 4]],
  [[-92, 4], [-103, 19]],
]

export const BUILDING_BY_ID = new Map(BUILDINGS.map((b) => [b.id, b]))
export const MISSION_BY_ID = new Map(MISSIONS.map((m) => [m.id, m]))
export const KEY_BY_ID = new Map(KEYS.map((k) => [k.id, k]))
