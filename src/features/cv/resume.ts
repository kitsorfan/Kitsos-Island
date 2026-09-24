import type { PanelSection } from '../../types.ts'
import {
  ARMY_SECTIONS,
  CERTIFICATIONS_SECTIONS,
  IBM_SECTIONS,
  PROFILE,
  PUBLICATION_SECTIONS,
  SCHOOL_SECTIONS,
  SKILLS_SECTIONS,
  STUDENT_JOBS_SECTIONS,
  UNIVERSITY_SECTIONS,
  VELTISTON_SECTIONS,
} from './profile.ts'
import { LATEST_RELEASE } from '../radio/release.ts'

/**
 * The CV as a recruiter expects to receive it: two A4 pages, nothing about
 * the island in it.
 *
 * The island tells the story at length and in its own voice, and that is the
 * wrong register for a PDF that gets forwarded around an HR department. So
 * the wording here is edited down on purpose. What is not edited is the
 * facts: every role, employer and date is read out of profile.ts by title,
 * and a title that stops existing there fails the build rather than leaving
 * a stale date on paper.
 */

type Entry = {
  title: string
  org?: string
  meta: string
  bullets?: string[]
  tags?: string[]
  /** Titles held in turn at one employer, newest first, with their dates. */
  steps?: { title: string; meta: string }[]
}

/** A timeline entry from the island's data, looked up by its title. */
function entry(sections: PanelSection[], title: string): Entry {
  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.type !== 'timeline') continue
      const found = block.entries.find((e) => e.title === title)
      if (found) return found
    }
  }
  throw new Error(`resume: no timeline entry titled "${title}" in profile.ts`)
}

/** The tag groups from a section, by label. */
function tagGroup(sections: PanelSection[], label: string): string[] {
  for (const section of sections) {
    for (const block of section.blocks) {
      if (block.type !== 'tags') continue
      const found = block.groups.find((g) => g.label === label)
      if (found) return found.tags
    }
  }
  throw new Error(`resume: no tag group labelled "${label}" in profile.ts`)
}

/**
 * An island entry with its dates kept and its wording replaced.
 *
 * `as` renames the role or the organisation for paper, where the island's
 * version is more detailed than a CV should be — a unit number, a street.
 * The dates are never overridden.
 */
function role(
  sections: PanelSection[],
  title: string,
  bullets: string[],
  tags?: string[],
  as: { title?: string; org?: string } = {},
): Entry {
  const { org, meta } = entry(sections, title)
  return {
    title: as.title ?? title,
    org: as.org ?? org,
    meta,
    bullets,
    tags,
  }
}

/**
 * Several titles at one employer, told as one job: the titles and their
 * dates stacked at the top, then a single account of the work across all of
 * them. A promotion reads better that way than as two jobs that repeat each
 * other.
 */
function promoted(
  sections: PanelSection[],
  titles: string[],
  bullets: string[],
  tags?: string[],
): Entry {
  const steps = titles.map((title) => ({
    title,
    meta: entry(sections, title).meta,
  }))
  const { org } = entry(sections, titles[0])
  return { ...steps[0], org, bullets, tags, steps }
}

export const RESUME = {
  name: `${PROFILE.firstName} (${PROFILE.nickname}) ${PROFILE.lastName}`,
  firstName: PROFILE.firstName,
  nickname: PROFILE.nickname,
  lastName: PROFILE.lastName,
  title: 'Senior Software Engineer',
  subtitle: 'Technical Lead · Health Tech',

  /*
   * No phone number, although the original carries one. This file is built
   * into a public site from a public repo, and a number that goes out that
   * way gets scraped; the email and LinkedIn are the channels meant for it.
   */
  profile: [{ label: 'Location', value: PROFILE.location }],
  contact: [
    {
      label: 'Email',
      value: PROFILE.email,
      href: `mailto:${PROFILE.email}`,
    },
    {
      label: 'LinkedIn',
      value: PROFILE.linkedinLabel,
      href: PROFILE.linkedin,
    },
    {
      label: 'Website',
      value: PROFILE.websiteLabel,
      href: PROFILE.website,
    },
  ],

  summary:
    'Senior full-stack engineer and technical lead with a track record of taking healthcare products from concept to production. Java and Spring Boot on the backend, React on the front, AWS underneath, and teams of 5–10 engineers across three countries shipping weekly into U.S. hospitals under HIPAA.',

  experience: [
    promoted(
      VELTISTON_SECTIONS,
      ['Senior Software Engineer', 'Full-stack Software Engineer'],
      [
        'One of the first engineers at an AI healthcare startup founded by MIT Professor Dimitris Bertsimas; grew into Technical Lead of the flagship Nurse Scheduling platform and project lead on three projects.',
        'Architected and built the cloud-native Nurse Scheduling platform (Java, Spring Boot, React, MySQL, AWS), now live in four major U.S. hospitals.',
        'Leads cross-functional teams of 5–10 developers across Greece, Boston (USA) and Morocco: architecture, technical decisions, code reviews and sprint planning.',
        'Delivered an AI documentation assistant (Spring AI, RAG), SMART on FHIR apps inside Epic EHR, SAML 2.0 SSO, UKG integration, notifications and audit logging.',
        'Modernised a legacy Java/Angular application through Agile practices, engineering standards, CI/CD, documentation and incremental refactoring.',
        'Ships weekly, secure, HIPAA-compliant releases with customers, Product, QA and DevOps; runs technical interviews, mentors and onboards engineers.',
      ],
      [
        'Java',
        'Spring Boot',
        'Spring AI',
        'React',
        'MySQL',
        'AWS',
        'Docker',
        'Jenkins',
        'GitLab CI',
        'Flyway',
        'SMART on FHIR',
        'SAML',
        'Grafana',
        'Sentry',
      ],
    ),
    role(VELTISTON_SECTIONS, 'Lead Software Engineer', [
      'Software lead on AI-powered healthcare applications for U.S. hospitals: nurse scheduling, length-of-stay optimisation and SMART on FHIR integrations.',
    ]),
    role(
      IBM_SECTIONS,
      'DevOps Engineer',
      [
        'Core banking transformation at the National Bank of Greece: migrating legacy PL/I and COBOL systems to Infosys Finacle.',
        'Designed the integration architecture for legacy subsystems in both the coexistence and target states.',
        'Deployments and CI/CD automation with Jenkins, Podman, ELK and Grafana.',
        'Represented IBM Greece at an international Agile & Enterprise Design Thinking bootcamp in Hamburg.',
      ],
      ['Jenkins', 'Podman', 'Docker Compose', 'ELK Stack', 'Grafana', 'Jira'],
    ),
  ],

  /* Before software: the roles that taught the leading part of the job. */
  earlier: [
    role(
      ARMY_SECTIONS,
      'Reservist Second Lieutenant, Special Forces',
      [
        'Platoon Leader, Weapons Officer and Deputy Company Commander in a Marine Company; graduated 3rd in class from the Infantry Reserve Officers School.',
      ],
      undefined,
      {
        title: 'Reservist Second Lieutenant in Marine Special Forces',
        org: 'Hellenic Army / Special Forces',
      },
    ),
    role(
      STUDENT_JOBS_SECTIONS,
      'Director',
      [
        'Held alongside university studies: ran the foundation’s premises, staff, volunteers, budget and events, and led its renovation and modernisation.',
      ],
      undefined,
      { org: 'Christian Youth Foundation “Pantokrator”' },
    ),
    role(
      STUDENT_JOBS_SECTIONS,
      'Robotics tutor',
      ['Taught robotics classes to children alongside university studies.'],
      undefined,
      { org: 'Citylab' },
    ),
  ],

  education: [
    role(UNIVERSITY_SECTIONS, 'MEng, Electrical & Computer Engineering', [
      'Integrated five-year Master of Engineering, completed in the nominal five years.',
      'Thesis on movement compliance analysis with machine learning, graded with distinction and later published.',
    ]),
    role(SCHOOL_SECTIONS, 'Model High School of Ionidios, Piraeus', [
      'Ranked 1st in the entrance exam; Piraeus prize for the top graduating grade of 2017.',
    ]),
    role(
      SCHOOL_SECTIONS,
      'Model Junior High School of Evangeliki, Nea Smyrni',
      ['Ranked 1st in the admission exam; first of the class every year.'],
    ),
  ],

  publications: [
    role(
      PUBLICATION_SECTIONS,
      'An M-Health Algorithmic Approach to Identify and Assess Physiotherapy Exercises in Real Time',
      [
        'Real-time, on-device assessment of physiotherapy exercises from a phone camera: pose estimation, angle features, lightweight classifiers and a modified Levenshtein distance.',
      ],
    ),
  ],

  /* The groups a CV reader scans for, in the order they scan them. */
  skills: [
    'Languages',
    'Backend',
    'AI',
    'Frontend',
    'Databases',
    'Cloud & DevOps',
    'Observability & monitoring',
    'Testing',
    'Healthcare & security',
    'Architecture & design',
  ].map((label) => ({ label, tags: tagGroup(SKILLS_SECTIONS, label) })),

  languages: [
    /* `score` out of five, for the dots; the level says what it means. */
    { name: 'Greek', level: 'Native', score: 5 },
    { name: 'English', level: 'C2 · Proficiency', score: 5 },
    { name: 'French', level: 'B2', score: 3 },
  ],

  certifications: [
    'Universal AI Foundational Modules',
    'Group 1: Biomedical Research Investigators',
    'Docker Essentials: A Developer Introduction',
  ].map((title) => {
    const { org, meta } = entry(CERTIFICATIONS_SECTIONS, title)
    // The credential IDs are for the island's verifiers, not for paper.
    return { title, org, meta: meta.split(' · ')[0] }
  }),

  courses: [
    'IBM graduate program (2024)',
    'Agile & Enterprise Design Thinking bootcamp, Hamburg (2024)',
    'Arduino IEEE Workshop at NTUA (2018)',
  ],

  awards: [
    'National Biology Competition 2016: ranked 2nd of ~1,650',
    'Awards in Physics, Mathematics, Informatics and Literature contests',
  ],

  volunteering: [
    'Leading volunteer, Christian Youth Foundation “Pantokrator” (2017–2021, 2023–today)',
    'European Researchers’ Night, NTUA (2019)',
    '100 years of ECE celebration, NTUA (2017)',
    'Blood donor since 2017',
  ],

  other:
    'Students’ representative and co-founder of the Independent ECE Students at NTUA: e-voting, a depoliticised assembly, and representation by lawful, democratic means.',

  hobbies: [
    'Running',
    'Cycling',
    'Theater',
    'DIY & handiwork',
    'Chess',
    'Hiking & camping',
  ],
}

/**
 * When the CV was last brought up to date: the island's latest release,
 * since the CV is printed from the island's data and ships with it.
 */
export const RESUME_UPDATED = new Date(
  `${LATEST_RELEASE.date}T12:00:00Z`,
).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** What the PDF is saved as, so it is findable in a downloads folder. */
export const RESUME_PDF = `${PROFILE.lastName}-${PROFILE.firstName}-CV.pdf`
