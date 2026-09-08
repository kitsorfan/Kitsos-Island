import type { Building, Npc, SignPost, Vec2 } from '../types'
import {
  ARMY_SECTIONS,
  HOUSE_SECTIONS,
  PROFILE,
  RADIO_SECTIONS,
  SCHOOL_SECTIONS,
  UNIVERSITY_SECTIONS,
  WORK_SECTIONS,
} from './profile'

/** Everything inside this radius is flat, walkable ground. */
export const ISLAND_FLAT_RADIUS = 36
export const ISLAND_WALK_RADIUS = 37
export const ISLAND_SHORE_RADIUS = 46

export const PLAYER_START: Vec2 = [0, 9]

/** The fountain sits off the crossroads so no route walks into it. */
export const FOUNTAIN: Vec2 = [5.2, -3.8]
export const FOUNTAIN_RADIUS = 2.5

export const BUILDINGS: Building[] = [
  {
    id: 'house',
    kind: 'house',
    name: 'Kitsos House',
    subtitle: 'Home of Christos "Kitsos" Orfanopoulos',
    position: [-20, 18],
    door: [-20, 12],
    half: [5, 4.5],
    rotation: Math.PI,
    height: 7,
    accent: '#e0574a',
    panel: {
      kicker: 'Kitsos House',
      title: 'Who lives here',
      sections: HOUSE_SECTIONS,
    },
  },
  {
    id: 'university',
    kind: 'university',
    name: 'NTUA Academy',
    subtitle: 'School of Electrical & Computer Engineering',
    position: [0, -26],
    door: [0, -15.5],
    half: [11, 7],
    rotation: 0,
    height: 10.5,
    accent: '#3f7bd6',
    panel: {
      kicker: 'NTUA Academy',
      title: 'Education',
      sections: UNIVERSITY_SECTIONS,
    },
  },
  {
    id: 'work',
    kind: 'work',
    name: 'Work District',
    subtitle: 'Veltiston.AI · IBM Consulting',
    position: [24, -10],
    door: [16, -10],
    half: [6.5, 7],
    rotation: -Math.PI / 2,
    height: 15,
    accent: '#2fb59a',
    panel: {
      kicker: 'Work District',
      title: 'Experience & skills',
      sections: WORK_SECTIONS,
    },
  },
  {
    id: 'army',
    kind: 'army',
    name: 'Army Camp',
    subtitle: 'Marine Special Forces — reserve',
    position: [19, 17],
    door: [19, 10],
    half: [7, 6],
    rotation: Math.PI,
    height: 7,
    accent: '#6f7f4a',
    panel: {
      kicker: 'Army Camp',
      title: 'Military service',
      sections: ARMY_SECTIONS,
    },
  },
  {
    id: 'school',
    kind: 'school',
    name: 'Town School',
    subtitle: 'Where it all started',
    position: [-26, -6],
    door: [-19.5, -6],
    half: [5.5, 7],
    rotation: Math.PI / 2,
    height: 10,
    accent: '#e6a63c',
    panel: {
      kicker: 'Town School',
      title: 'Early years & giving back',
      sections: SCHOOL_SECTIONS,
    },
  },
  {
    id: 'radio',
    kind: 'radio',
    name: 'Radio Center',
    subtitle: 'Broadcast a message to Kitsos',
    position: [0, 30],
    door: [0, 24],
    half: [4.5, 4.5],
    rotation: Math.PI,
    height: 6.5,
    accent: '#b95fd0',
    panel: {
      kicker: 'Radio Center',
      title: 'Get in touch',
      sections: RADIO_SECTIONS,
    },
  },
]

const SKIN = {
  light: '#f0c39a',
  tan: '#d99e6f',
  deep: '#a2683f',
}

export const NPCS: Npc[] = [
  {
    id: 'mayor',
    name: 'Mayor Kostas',
    role: 'Kitsos Town',
    position: [4, 5],
    facing: Math.PI * 0.9,
    colors: { skin: SKIN.tan, hair: '#4a3526', shirt: '#3d5a98', pants: '#2c3242' },
    prop: 'glasses',
    lines: [
      'Welcome to KITSOS TOWN! Small island, big CV.',
      `Everything here belongs to ${PROFILE.firstName} "${PROFILE.nickname}" ${PROFILE.lastName} — a senior full stack engineer and technical lead out of ${PROFILE.location}.`,
      'Follow the paths: the Academy to the north, the Work District east, the School west, the Army Camp and his House to the south.',
      'When you have seen enough, head to the Radio Center down south and send him a message. He answers.',
    ],
    journal: {
      title: 'Welcome to Kitsos Town',
      body: 'Christos "Kitsos" Orfanopoulos — Senior Full Stack Software Engineer & Technical Lead, based in Athens, Greece.',
    },
  },
  {
    id: 'volunteer',
    name: 'Eleni',
    role: 'Volunteer coordinator',
    position: [-9, 8],
    facing: Math.PI * 0.35,
    colors: { skin: SKIN.light, hair: '#8a4a2c', shirt: '#d94f6b', pants: '#3a3f4d' },
    lines: [
      'Kitsos? He has been around this tent since 2017.',
      'Leading volunteer at the Christian Youth Foundation "Pantokrator" in Paleo Faliro — 2017 to 2021, then again from 2023 to today.',
      'He even ran the place: Director of the foundation in 2021–2022.',
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
    position: [11, 7],
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
    id: 'neighbour',
    name: 'Kyria Voula',
    role: 'Neighbour',
    position: [-16, 13],
    facing: Math.PI * 0.25,
    colors: { skin: SKIN.light, hair: '#8f8f8f', shirt: '#c96fa0', pants: '#4c4358' },
    lines: [
      'That is his house, right there. Lights on late, always.',
      'Greek is his mother tongue, his English is at proficiency level, and his French… lower level, but he tries.',
      'Athens born and based. Greek national. Knock on the door, he does not mind visitors.',
    ],
    journal: {
      title: 'Profile & languages',
      body: 'Athens, Greece · Greek nationality. Greek (native), English (proficiency level), French (lower level).',
    },
  },
  {
    id: 'professor',
    name: 'Prof. Nikolaos',
    role: 'NTUA Academy',
    position: [4, -18],
    facing: Math.PI * 0.85,
    colors: { skin: SKIN.light, hair: '#d8d8d8', shirt: '#4b5b8c', pants: '#33384a' },
    prop: 'glasses',
    lines: [
      'Ah, another visitor for the Academy.',
      'Christos took the MEng at the National Technical University of Athens, School of Electrical and Computer Engineering. 2017 to 2022, GPA 8.4.',
      'His thesis in 2022: a movement compliance application using machine learning.',
      'Five hard years. He came out of it able to build a system, not just a feature.',
    ],
    journal: {
      title: 'NTUA — MEng ECE',
      body: 'National Technical University of Athens, School of Electrical and Computer Engineering, MEng 2017–2022, GPA 8.4. Thesis: movement compliance application using machine learning.',
    },
  },
  {
    id: 'studentrep',
    name: 'Marina',
    role: 'Student council',
    position: [-8, -19],
    facing: Math.PI * 0.15,
    colors: { skin: SKIN.tan, hair: '#3b2a1e', shirt: '#e2a33f', pants: '#39435c' },
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
    id: 'researcher',
    name: 'Dr. Fotini',
    role: 'Academy labs',
    position: [10, -20],
    facing: -Math.PI * 0.9,
    colors: { skin: SKIN.deep, hair: '#1f1a17', shirt: '#7b5fd0', pants: '#2f3446' },
    lines: [
      'The lab door is open, mind the cables.',
      'He was at the Arduino IEEE Workshop here at NTUA back in 2018, and later did the IBM graduate program in 2024.',
      'Volunteer at the European Researchers’ Night in 2019, and at the 100-years celebration of ECE in 2017.',
      'Contests too — 2nd in the National Biology Competition of 2016, plus awards in Physics, Mathematics, Informatics and Literature.',
    ],
    journal: {
      title: 'Seminars & contests',
      body: 'IBM graduate program (2024), Arduino IEEE Workshop at NTUA (2018). 2nd in the National Biology Competition (2016) and awards in Physics, Mathematics, Informatics and Literature. Volunteer at European Researchers’ Night (2019) and 100 years of ECE (2017).',
    },
  },
  {
    id: 'recruiter',
    name: 'Anna',
    role: 'Work District',
    position: [15, -6],
    facing: Math.PI * 0.6,
    colors: { skin: SKIN.light, hair: '#5a3a24', shirt: '#2fb59a', pants: '#2b3140' },
    lines: [
      'Work District. Mind the deploys.',
      'Since May 2024 he is Senior Full Stack Software Engineer and Technical Lead at Veltiston.AI — an AI healthcare startup founded by MIT Professor Dimitris Bertsimas.',
      'He joined as an early engineering hire and grew into Technical Lead of the flagship Nurse Scheduling platform.',
      'Java, Spring Boot, React, MySQL and AWS — a cloud-native healthcare platform now running in four major U.S. hospitals.',
      'Weekly production releases, HIPAA compliance, and nobody paged at 3am. Mostly.',
    ],
    journal: {
      title: 'Veltiston.AI — Technical Lead',
      body: 'Senior Full Stack Engineer & Technical Lead since May 2024. Early hire at an AI healthcare startup founded by MIT Prof. Dimitris Bertsimas; leads the Nurse Scheduling platform, built with Java, Spring Boot, React, MySQL and AWS and deployed in four major U.S. hospitals.',
    },
  },
  {
    id: 'teammate',
    name: 'Youssef',
    role: 'Engineer, Veltiston.AI',
    position: [19, -17],
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
    name: 'Stelios',
    role: 'Platform architect',
    position: [21, -3],
    facing: Math.PI * 0.4,
    colors: { skin: SKIN.tan, hair: '#4d3a2a', shirt: '#586b7d', pants: '#31363f' },
    prop: 'hardhat',
    lines: [
      'You want the interesting part? The integrations.',
      'AI-powered documentation assistance with RAG, SMART on FHIR, SAML SSO, notification services, audit logging, third-party healthcare integrations.',
      'Observability is not an afterthought here: Grafana, Graylog, Sentry. Flyway for the schema, Docker and Jenkins and GitLab CI to move it.',
      'Secure and scalable, or it does not ship.',
    ],
    journal: {
      title: 'Platform capabilities',
      body: 'Delivered RAG-powered documentation assistance, SMART on FHIR integration, SAML SSO, notification services, audit logging and third-party healthcare integrations — with Grafana, Graylog and Sentry for observability.',
    },
  },
  {
    id: 'devops',
    name: 'Dimitris',
    role: 'Dev(Sec)Ops, IBM',
    position: [17, 2],
    facing: -Math.PI * 0.6,
    colors: { skin: SKIN.light, hair: '#2e2a26', shirt: '#1f4fa0', pants: '#2b3140' },
    lines: [
      'Before the startup, there was the bank.',
      'In 2023–2024 he was a Dev(Sec)Ops Engineer at IBM Consulting, Hybrid Cloud.',
      'Cloud transformation of NBG’s core banking system, integrated with Infosys Finacle — and he designed the integration architecture between legacy subsystems and modern platforms.',
      'Deployments and automation with Jenkins, Podman, ELK and Grafana. Jira and Confluence for the paperwork.',
      'He also represented IBM Greece at an international Agile bootcamp in Hamburg.',
    ],
    journal: {
      title: 'IBM Consulting — Dev(Sec)Ops',
      body: 'Hybrid Cloud, 2023–2024. Cloud transformation of NBG’s core banking system with Infosys Finacle; integration architecture for legacy and modern platforms; automation with Jenkins, Podman, ELK and Grafana. Represented IBM Greece at an international Agile bootcamp in Hamburg.',
    },
  },
  {
    id: 'sergeant',
    name: 'Sergeant Petros',
    role: 'Army Camp',
    position: [22, 11],
    facing: -Math.PI * 0.8,
    colors: { skin: SKIN.tan, hair: '#3a3129', shirt: '#6f7f4a', pants: '#4c5238' },
    prop: 'beret',
    lines: [
      'Halt. …Relax, civilian, the camp is open today.',
      'Second Lieutenant Orfanopoulos, reservist, Marine Special Forces. 2022 to 2023, straight out of NTUA.',
      'He had a unit to run: planning, training, discipline, and the welfare of his people.',
      'That is where the calm comes from. Bad news does not make him louder.',
    ],
    journal: {
      title: 'Military service',
      body: 'Reservist Second Lieutenant in the Marine Special Forces, 2022–2023.',
    },
  },
  {
    id: 'teacher',
    name: 'Ms. Maria',
    role: 'Town School',
    position: [-15, -2],
    facing: -Math.PI * 0.35,
    colors: { skin: SKIN.light, hair: '#6b4a30', shirt: '#e6a63c', pants: '#3d4353' },
    lines: [
      'Shh — exams. Come in, quietly.',
      'Model High School of Ionidios in Piraeus, 2015 to 2017, graduating GPA 19.9 out of 20.',
      'Before that, the Model Experimental High School of Evaggeliki in Nea Smyrni, 2011 to 2015 — he ranked 1st in the admission exam of 2014.',
      'Bright kid. Insufferably curious. Still is, I hear.',
    ],
    journal: {
      title: 'Schooling',
      body: 'Model High School of Ionidios, Piraeus (2015–2017, GPA 19.9). Model Experimental High School of Evaggeliki, Nea Smyrni (2011–2015) — ranked 1st in the 2014 admission exam.',
    },
  },
  {
    id: 'robotkid',
    name: 'Alex',
    role: 'Robotics club',
    position: [-16.2, -14.8],
    facing: Math.PI * 0.1,
    colors: { skin: SKIN.deep, hair: '#191919', shirt: '#d94f6b', pants: '#2f5aa8' },
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
    id: 'runner',
    name: 'Nikos',
    role: 'Coastal path',
    position: [29, 5],
    facing: -Math.PI * 0.55,
    colors: { skin: SKIN.tan, hair: '#453224', shirt: '#f0653f', pants: '#2c3242' },
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
    position: [-33, 7],
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
  {
    id: 'operator',
    name: 'Sofia',
    role: 'Radio Center',
    position: [4, 23],
    facing: -Math.PI * 0.85,
    colors: { skin: SKIN.light, hair: '#2a2320', shirt: '#b95fd0', pants: '#343a4c' },
    prop: 'headset',
    lines: [
      'Radio Center, Sofia speaking. Signal is strong today.',
      'Four channels open: email, phone, LinkedIn, and the message desk inside.',
      'Step up to the console and pick one. Everything goes straight to Kitsos — there is no operator in between.',
    ],
    journal: {
      title: 'Radio Center',
      body: `Reach Kitsos on ${PROFILE.email}, ${PROFILE.phone}, or ${PROFILE.linkedinLabel}.`,
    },
  },
]

export const SIGNS: SignPost[] = [
  {
    id: 'sign-plaza',
    position: [-3, 6],
    facing: 0,
    label: 'Town Plaza',
    lines: [
      'KITSOS TOWN — Town Plaza.',
      'North: NTUA Academy. East: Work District. West: Town School.',
      'South-west: Kitsos House. South-east: Army Camp. Due south: Radio Center.',
      'Talk to everyone. They all know something.',
    ],
  },
  {
    id: 'sign-north',
    position: [-3, -11.5],
    facing: 0,
    label: 'To the Academy',
    lines: [
      'NTUA ACADEMY — 1 min walk.',
      'Electrical & Computer Engineering. Mind the bicycles.',
    ],
  },
  {
    id: 'sign-east',
    position: [12, -8],
    facing: -Math.PI / 2,
    label: 'To the Work District',
    lines: [
      'WORK DISTRICT — Veltiston.AI and IBM Consulting.',
      'Deploys on Thursdays. Coffee is free, the incidents are not.',
    ],
  },
  {
    id: 'sign-south',
    position: [2, 18],
    facing: Math.PI,
    label: 'To the Radio Center',
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
  [[0, -6], [0, -19]],
  [[0, -8], [16, -8]],
  [[16, -8], [16, -10]],
  [[-6, -2], [-17, -6]],
  [[-5, 6], [-20, 12]],
  [[5.5, 5.2], [19, 10]],
  [[0, 6], [0, 24]],
]
