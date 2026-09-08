import type { PanelSection } from '../types'

export const PROFILE = {
  firstName: 'Christos',
  nickname: 'Kitsos',
  lastName: 'Orfanopoulos',
  title: 'Senior Software Engineer & Technical Lead',
  location: 'Athens, Greece',
  nationality: 'Greek',
  phone: '+30 6933225477',
  email: 'kitsorfan@protonmail.com',
  linkedin: 'https://linkedin.com/in/kitsorfan/',
  linkedinLabel: 'linkedin.com/in/kitsorfan',
} as const

export const HOUSE_SECTIONS: PanelSection[] = [
  {
    heading: 'Trainer card',
    blocks: [
      {
        type: 'text',
        text: 'Senior Full Stack Engineer and Technical Lead based in Athens, Greece. I build cloud-native products end to end — Java and Spring Boot on the backend, React on the front, AWS underneath — and I lead the teams that ship them.',
      },
      {
        type: 'stats',
        stats: [
          { label: 'Home', value: 'Athens, Greece' },
          { label: 'Nationality', value: 'Greek' },
          { label: 'Field', value: 'Full stack / cloud' },
          { label: 'Currently', value: 'Technical Lead' },
        ],
      },
    ],
  },
  {
    heading: 'Languages',
    blocks: [
      {
        type: 'list',
        items: [
          'Greek — native speaker',
          'English — proficiency level',
          'French — lower level',
        ],
      },
    ],
  },
  {
    heading: 'Off the clock',
    blocks: [
      {
        type: 'tags',
        groups: [
          {
            label: 'Hobbies',
            tags: [
              'Running',
              'Cycling',
              'Theater',
              'DIY & handiwork',
              'Chess',
              'Hiking',
              'Camping',
            ],
          },
        ],
      },
      {
        type: 'text',
        text: 'Leading volunteer at the Christian Youth Foundation "Pantokrator" in Paleo Faliro, and a blood donor since 2017.',
      },
    ],
  },
]

export const UNIVERSITY_SECTIONS: PanelSection[] = [
  {
    heading: 'Higher education',
    blocks: [
      {
        type: 'timeline',
        entries: [
          {
            title: 'MEng, Electrical & Computer Engineering',
            org: 'National Technical University of Athens (NTUA)',
            meta: '2017 – 2022 · GPA 8.4',
            bullets: [
              'Five-year integrated Master of Engineering in the School of Electrical and Computer Engineering.',
              'Thesis: "Movement compliance application using machine learning" (2022).',
            ],
          },
        ],
      },
    ],
  },
  {
    heading: 'Campus life',
    blocks: [
      {
        type: 'text',
        text: 'Students’ representative and leader of the Independent ECE Students.',
      },
      {
        type: 'list',
        items: [
          'Campaigned for the establishment of e-voting',
          'Pushed for the depoliticization of the university',
          'Representation and problem-solving through realistic, lawful and democratic means',
        ],
      },
    ],
  },
  {
    heading: 'Seminars, courses & contests',
    blocks: [
      {
        type: 'list',
        items: [
          'IBM graduate program (2024)',
          'Arduino IEEE Workshop at NTUA (2018)',
          'National Biology Competition 2016 — ranked 2nd',
          'Awards in Physics, Mathematics, Informatics and Literature contests',
        ],
      },
    ],
  },
  {
    heading: 'Volunteering on campus',
    blocks: [
      {
        type: 'list',
        items: [
          'European Researchers’ Night, NTUA (2019)',
          '100 years of ECE celebration, NTUA (2017)',
        ],
      },
    ],
  },
]

export const WORK_SECTIONS: PanelSection[] = [
  {
    heading: 'Experience',
    blocks: [
      {
        type: 'timeline',
        entries: [
          {
            title: 'Senior Full Stack Software Engineer & Technical Lead',
            org: 'Veltiston.AI',
            meta: 'May 2024 – today',
            bullets: [
              'Early engineering hire at an AI healthcare startup founded by MIT Professor Dimitris Bertsimas, progressing to Technical Lead of the flagship Nurse Scheduling platform.',
              'Lead cross-functional engineering teams of 5–10 developers across Greece, Boston (USA) and Morocco — architecture, feature delivery, code reviews, sprint planning and technical decision-making.',
              'Architected and built a cloud-native healthcare platform with Java, Spring Boot, React, MySQL and AWS, now deployed across four major U.S. hospitals.',
              'Modernized a legacy Java/Angular application by introducing Agile processes, engineering standards, CI/CD improvements, documentation and incremental refactoring.',
              'Designed and delivered secure, scalable capabilities: AI-powered documentation assistance (RAG), SMART on FHIR integration, SAML SSO, notification services, audit logging and third-party healthcare integrations.',
              'Partner with customers, product managers and DevOps teams to deliver weekly production releases while ensuring reliability, security and HIPAA compliance.',
              'Lead technical interviews, mentor engineers and onboard new team members.',
            ],
            tags: [
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
              'REST APIs',
              'Microservices',
              'SMART on FHIR',
              'SAML',
              'Grafana',
              'Graylog',
              'Sentry',
            ],
          },
          {
            title: 'Dev(Sec)Ops Engineer — Hybrid Cloud',
            org: 'IBM Consulting',
            meta: '2023 – 2024',
            bullets: [
              'Contributed to the cloud transformation of NBG’s core banking system through integration with Infosys Finacle.',
              'Designed integration architecture for legacy subsystems and modern platforms.',
              'Participated in deployment processes and automation using Jenkins, Podman, ELK and Grafana.',
              'Represented IBM Greece in an international Agile bootcamp in Hamburg, working in a diverse, multicultural team.',
            ],
            tags: [
              'Jenkins',
              'Docker Compose',
              'Podman',
              'ELK Stack',
              'Grafana',
              'Jira',
              'Confluence',
            ],
          },
          {
            title: 'Director of the Christian Youth Foundation "Pantokrator"',
            meta: '2021 – 2022',
            bullets: ['Led the foundation’s youth programme in Paleo Faliro.'],
          },
          {
            title: 'Children’s tutor in Robotics',
            org: 'Citylab, Alimos',
            meta: '2020 – 2021',
            bullets: [
              'Taught robotics fundamentals to children through hands-on projects.',
            ],
          },
        ],
      },
    ],
  },
  {
    heading: 'Skills',
    blocks: [
      {
        type: 'tags',
        groups: [
          {
            label: 'Languages',
            tags: ['Java (17–25)', 'JavaScript', 'TypeScript', 'Python', 'C++'],
          },
          {
            label: 'Backend',
            tags: [
              'Spring Boot',
              'Spring Framework',
              'Spring Security',
              'Spring Data JPA',
              'Hibernate',
              'REST APIs',
              'Microservices',
              'Spring AI',
            ],
          },
          {
            label: 'Frontend',
            tags: ['React', 'Angular', 'HTML', 'CSS', 'Tailwind CSS'],
          },
          { label: 'Databases', tags: ['MySQL', 'Flyway'] },
          {
            label: 'Cloud & DevOps',
            tags: [
              'AWS (EC2, S3, SES, SNS)',
              'Docker',
              'Docker Compose',
              'Jenkins',
              'GitLab CI',
              'Bitbucket Pipelines',
              'Git',
            ],
          },
          {
            label: 'Observability & monitoring',
            tags: ['Grafana', 'Graylog', 'ELK Stack', 'Sentry'],
          },
          { label: 'Testing', tags: ['JUnit', 'Mockito', 'JaCoCo'] },
          {
            label: 'Architecture & design',
            tags: ['Jira', 'Confluence', 'Figma', 'UML', 'SRS', 'Agile/Scrum'],
          },
          {
            label: 'Healthcare & security',
            tags: ['SMART on FHIR', 'SAML SSO', 'JWT', 'HIPAA'],
          },
        ],
      },
    ],
  },
]

export const ARMY_SECTIONS: PanelSection[] = [
  {
    heading: 'Military service',
    blocks: [
      {
        type: 'timeline',
        entries: [
          {
            title: 'Reservist Second Lieutenant',
            org: 'Marine Special Forces',
            meta: '2022 – 2023',
            bullets: [
              'Served as a reservist officer in the Marine Special Forces after graduating from NTUA.',
              'Responsible for a unit of soldiers: planning, training, discipline and welfare.',
            ],
          },
        ],
      },
    ],
  },
  {
    heading: 'What the camp taught me',
    blocks: [
      {
        type: 'list',
        items: [
          'Leading people you did not pick, toward objectives you did not choose — and still building trust.',
          'Calm decision-making under pressure and with incomplete information.',
          'Planning, briefing and debriefing as a habit rather than a ceremony.',
          'Endurance — the same stubbornness I bring to long refactors and release nights.',
        ],
      },
      {
        type: 'quote',
        text: 'Same discipline, different terrain: stand-ups instead of formations, on-call instead of watch.',
      },
    ],
  },
]

export const SCHOOL_SECTIONS: PanelSection[] = [
  {
    heading: 'Early education',
    blocks: [
      {
        type: 'timeline',
        entries: [
          {
            title: 'Model High School of Ionidios, Piraeus',
            meta: '2015 – 2017 · GPA 19.9 / 20',
          },
          {
            title: 'Model Experimental High School of Evaggeliki, Nea Smyrni',
            meta: '2011 – 2015',
            bullets: ['Ranked 1st in the admission exam (2014).'],
          },
        ],
      },
    ],
  },
  {
    heading: 'Contests & awards',
    blocks: [
      {
        type: 'list',
        items: [
          'National Biology Competition 2016 — ranked 2nd',
          'Awards in Physics, Mathematics, Informatics and Literature contests',
        ],
      },
    ],
  },
  {
    heading: 'Teaching & volunteering',
    blocks: [
      {
        type: 'list',
        items: [
          'Leading volunteer at the Christian Youth Foundation "Pantokrator", Paleo Faliro — 2017–2021 and 2023 to today',
          'Director of the same foundation, 2021–2022',
          'Children’s tutor in Robotics at Citylab, Alimos — 2020–2021',
          'Blood donor since 2017',
        ],
      },
    ],
  },
]

export const RADIO_SECTIONS: PanelSection[] = [
  {
    heading: 'Open channels',
    blocks: [
      {
        type: 'text',
        text: 'The Radio Center broadcasts on four frequencies. Pick one and the message goes straight to me — no operator in between.',
      },
    ],
  },
]
