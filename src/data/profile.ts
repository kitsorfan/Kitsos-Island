import type { Letter, PanelSection } from '../types'

export const PROFILE = {
  firstName: 'Christos',
  nickname: 'Kitsos',
  lastName: 'Orfanopoulos',
  title: 'Senior Software Engineer & Technical Lead',
  location: 'Athens, Greece',
  nationality: 'Greek',
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
        text: 'Senior Software Engineer and Technical Lead based in Athens, Greece. I build cloud-native healthcare products end to end — Java and Spring Boot on the backend, React on the front, AWS underneath — and I lead the teams that ship them into hospitals.',
      },
      {
        type: 'stats',
        stats: [
          { label: 'Home', value: 'Athens, Greece' },
          { label: 'Nationality', value: 'Greek' },
          { label: 'Field', value: 'Full stack / cloud / health tech' },
          { label: 'Currently', value: 'Senior Software Engineer' },
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
          'English — proficiency, ECPE (University of Michigan, 2016)',
          'French — B2, DELF (2019)',
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
              'Thesis: compliance analysis of movement exercises using machine learning, supervised by Prof. Panagiotis Tsanakas, Dean of the School — graded with distinction, and later published on arXiv.',
              'Coursework with the Dean included Operating Systems and Software Service Technologies.',
            ],
          },
        ],
      },
    ],
  },
  {
    heading: 'Seminars & workshops',
    blocks: [
      {
        type: 'list',
        items: [
          'IBM graduate program (2024)',
          'Agile & Enterprise Design Thinking bootcamp, Hamburg (2024)',
          'Arduino IEEE Workshop at NTUA (2018)',
        ],
      },
    ],
  },
]

export const PUBLICATION_SECTIONS: PanelSection[] = [
  {
    heading: 'Published research',
    blocks: [
      {
        type: 'timeline',
        entries: [
          {
            title:
              'An M-Health Algorithmic Approach to Identify and Assess Physiotherapy Exercises in Real Time',
            org: 'arXiv, Cornell University',
            meta: '11 December 2025',
            bullets: [
              'Grew out of the NTUA thesis: judging how a physiotherapy movement is actually performed against how it should be.',
              'Reads a movement as a sequence of static poses, estimated from a phone camera by a pose-estimation neural network.',
              'Turns body keypoints into trigonometric angle features and classifies them with lightweight supervised models, giving per-frame pose predictions and accuracy scores.',
              'Recognises whole exercises and locates the inaccuracies using dynamic programming over a modified Levenshtein distance.',
              'Runs entirely client-side, which is what keeps it scalable and real time.',
            ],
            tags: [
              'Pose estimation',
              'Machine learning',
              'Dynamic programming',
              'Levenshtein distance',
              'm-Health',
            ],
          },
        ],
      },
      {
        type: 'quote',
        text: 'Applicable to remote physiotherapy supervision — the patient’s own phone does the assessment, so nothing leaves the device.',
      },
    ],
  },
]

export const THESIS_SECTIONS: PanelSection[] = [
  {
    heading: 'Diploma thesis, 2022',
    blocks: [
      {
        type: 'text',
        text: 'Compliance analysis of movement exercises using machine learning — a system that watches how a movement is performed and judges it against how it should be performed. Supervised by Prof. Panagiotis Tsanakas, Dean of the School of ECE, who called it "marked by scientific soundness and technological originality" and graded it with distinction. Three years later it became a published paper.',
      },
      {
        type: 'list',
        items: [
          'Machine learning over motion data rather than hand-written rules',
          'The engineering lesson that stuck: a model is only as good as the pipeline feeding it',
          'First real taste of shipping something a non-engineer has to trust',
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
]

export const CERTIFICATIONS_SECTIONS: PanelSection[] = [
  {
    heading: 'AI, research & engineering',
    blocks: [
      {
        type: 'timeline',
        entries: [
          {
            title: 'Universal AI Foundational Modules',
            org: 'MIT Open Learning',
            meta: 'August 2026 · Credential b8a1b1aa-1d2e-4c81-9c45-822df5f29a29',
            bullets: [
              'Foundations of modern AI, including artificial neural networks.',
            ],
            tags: ['AI', 'Artificial Neural Networks'],
          },
          {
            title: 'Group 1: Biomedical Research Investigators',
            org: 'CITI Program',
            meta: 'May 2026 – May 2029 · Credential 76841212',
            bullets: [
              'Human-subjects research conduct and ethics, and HIPAA — the compliance side of building for hospitals.',
            ],
            tags: ['Clinical Research', 'HIPAA'],
          },
          {
            title: 'Docker Essentials: A Developer Introduction',
            org: 'IBM',
            meta: 'May 2024',
            tags: ['Docker'],
          },
        ],
      },
    ],
  },
  {
    heading: 'Language certificates',
    blocks: [
      {
        type: 'timeline',
        entries: [
          {
            title: 'ECPE — Certificate of Proficiency in English (C2)',
            org: 'University of Michigan',
            meta: 'May 2016',
          },
          {
            title: 'ECCE — Certificate of Competency in English (B2)',
            org: 'University of Michigan',
            meta: 'May 2015',
          },
          {
            title: 'DELF B2 — Diplôme d’études en langue française',
            org: 'Centre international d’études pédagogiques',
            meta: 'February 2019',
          },
        ],
      },
    ],
  },
]

const LETTER_TSANAKAS: Letter = {
  id: 'tsanakas',
  from: 'Prof. Panagiotis Tsanakas',
  role: 'Dean, School of Electrical & Computer Engineering, NTUA',
  note: 'Thesis supervisor and course lecturer · 29 November 2023 · translated from Greek',
  scans: ['tsanakas.jpg'],
  paragraphs: [
    'Christos (Kitsos) Orfanopoulos was my student in the following undergraduate courses: Operating Systems, and Software Service Technologies. He was a diligent student with a strong interest in the subjects, as his performance in the assignments and examinations of those courses shows. I also had the opportunity to supervise his diploma thesis, on "Compliance analysis of movement exercises using machine learning techniques". That thesis was marked by scientific soundness and technological originality, and was deservedly graded with distinction.',
    'At the same time, Kitsos was active within the Polytechnic, helping younger students through their first academic steps. He contributed as an assistant in the first-year programming labs, answered their questions and shared his notes online. He also wrote a many-page "survival guide" setting down useful advice and observations for every compulsory course in the School.',
    'It is also worth noting that he took a particular interest in confronting a chronic affliction which unfortunately prevails in the Greek university, caused by extreme minorities who created dysfunction and obstructed the normal democratic processes. He led a movement of "Independent Students" with the aim of establishing a system of electronic voting, and met considerable hostility from groups with no connection to the student community. In that context he represented his fellow students with great responsibility in the faculty assemblies, listened to the requests of all sides, and kept everyone continuously informed.',
    'As a character he stands out for his organisation, his courage and his persistence. He is sincere, cooperative and good-humoured. Judging by his academic course, I am certain that he will excel in his professional career as an electrical and computer engineer.',
  ],
}

const LETTER_KANDYLAKIS: Letter = {
  id: 'kandylakis',
  from: 'Stelios Kandylakis',
  role: 'Senior Product Manager, Financial Data Intelligence',
  note: 'Classmate and collaborator at ECE NTUA · November 2025',
  scans: ['kandylakis.jpg'],
  paragraphs: [
    'I highly recommend Christos, with whom I collaborated on numerous university projects and coding competitions while we were both studying at ECE NTUA. He has very strong coding skills, a solution-oriented mindset, and is a person of integrity. Christos always showed strong leadership, making him a valuable asset to any team or organization.',
  ],
}

const LETTER_MITSIDIS: Letter = {
  id: 'mitsidis',
  from: 'Lt Col Georgios Mitsidis',
  role: 'Commander, 575 Marine Battalion',
  note: 'Commanding officer during the reserve posting · Athens, 24 June 2024',
  scans: ['mitsidis.jpg'],
  paragraphs: [
    'Christos V. Orfanopoulos reported to the Unit as an Officer Designate on February 11, 2023 and was released as a Special Forces Second Lieutenant on November 22, 2023 after completing his military service in the Hellenic Armed Forces. During that period, he was assigned as a Platoon Leader and Weapons Officer for a Marine Company.',
    'While active, he demonstrated exemplary behavior to everyone, accomplished his tasks successfully without the need of supervision and participated with enthusiasm in every activity of the Unit. He was distinguished for his team spirit, his critical thinking, as well as his attention to formality and detail.',
    'Moreover, he demonstrated interest in proposing ideas and implementing best practices for the improvement of the functions of the Unit, and took initiatives for that purpose, following the Command\u2019s guidelines.',
    'Undoubtedly, Christos V. Orfanopoulos possesses high professional, leadership and ethical qualifications. I am proud that he has been an Officer in my Unit; he honored the green beret and his tenet, and with the utmost confidence I recommend him as a valuable and trusted partner in every occupational field he will choose.',
  ],
}

const LETTER_OIKONOMOU: Letter = {
  id: 'oikonomou',
  from: 'Kyriakos Oikonomou',
  role: 'Justice of the Hellenic Supreme Court (Areios Pagos), retired',
  note: 'Vice-President of the Christian Youth Foundation "Pantokrator" since 2020 · Paleo Faliro, 22 November 2023 · translated from Greek',
  scans: ['oikonomou-1.jpg', 'oikonomou-2.jpg'],
  paragraphs: [
    'Christos (Kitsos) Orfanopoulos has for a number of years been a volunteer at the Christian Youth Foundation "Pantokrator" of Paleo Faliro, of which I happen to be Vice-President since 2020. During 2021 and 2022 he served as Director of the Foundation, a post he filled in exemplary fashion, leaving behind him significant work and a valuable legacy for those who followed, through the steps he took towards the renovation, upgrading and modernisation of the building infrastructure and of the Foundation\u2019s operations in general.',
    'Specifically, when a vacancy arose in the Foundation\u2019s Directorship in 2021, I turned to young Christos, then a student at the National Technical University of Athens, and proposed that he take on the Director\u2019s post \u2014 because we considered that his bearing, the traits of his character, the particular quality of his personality, his abilities and above all his warm love for the Foundation made him right for the role. Indeed, when after a year and a half he had to end his work with us, because he had completed his studies and had to fulfil his military obligations, his overall contribution had far exceeded our expectations. The field of his activities was broad, running from the maintenance and management of the premises through to the organisation of events, making the most of the volunteers, and the management of digital media.',
    'He was highly organised, focused on his duties, hard-working and conscientious, and kept us regularly informed of everything he did. He continually took on new initiatives and always tried to address the cause of whatever problems he found in the Foundation\u2019s running. He kept good relations with the children of the Foundation, whom he had been called to educate and look after during their time on the premises. He talked with them and took an interest in their problems, and moreover guided them with useful advice, and had succeeded in being trusted and heeded by them. By character he was approachable, welcoming, friendly and particularly likeable.',
    'Christos is distinguished by his sincerity, his discipline and his dedication to every task he undertakes to see through. He is modest, serious, dignified, and a person who inspires trust. I consider Christos Orfanopoulos to be a worthy scientist and a capable professional, and I judge that he will prove useful, effective and indispensable, bringing significant benefit to any business working environment.',
  ],
}

const recommendations = (letters: Letter[]): PanelSection[] => [
  {
    heading: 'Recommendations',
    blocks: [{ type: 'letters', letters }],
  },
]

export const REFERENCE_ACADEMY_SECTIONS = recommendations([
  LETTER_TSANAKAS,
  LETTER_KANDYLAKIS,
])

export const REFERENCE_ARMY_SECTIONS = recommendations([LETTER_MITSIDIS])

export const REFERENCE_FOUNDATION_SECTIONS = recommendations([LETTER_OIKONOMOU])

/** All four referees, for the full CV and the download. */
export const REFERENCES_SECTIONS = recommendations([
  LETTER_TSANAKAS,
  LETTER_MITSIDIS,
  LETTER_OIKONOMOU,
  LETTER_KANDYLAKIS,
])

export const STUDENT_LIFE_SECTIONS: PanelSection[] = [
  {
    heading: 'Student representation',
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
          'Represented fellow students in faculty assemblies — listening to all sides and reporting back continuously',
          'Took real hostility from groups outside the student body, and kept going anyway',
        ],
      },
    ],
  },
  {
    heading: 'Teaching the year below',
    blocks: [
      {
        type: 'list',
        items: [
          'Assisted in the first-year programming laboratories',
          'Answered younger students’ questions and published his own notes online',
          'Wrote a many-page "survival guide" covering every compulsory course in the School',
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

export const VELTISTON_SECTIONS: PanelSection[] = [
  {
    heading: 'Veltiston AI — two and a half years',
    blocks: [
      {
        type: 'text',
        text: 'Joined an AI healthcare startup founded by MIT Professor Dimitris Bertsimas as one of its first engineers, and grew into Technical Lead of the flagship Nurse Scheduling platform — concept to production, with teams across Greece, Boston and Morocco.',
      },
      {
        type: 'timeline',
        entries: [
          {
            title: 'Senior Software Engineer',
            org: 'Veltiston AI · Athens, hybrid',
            meta: 'May 2026 – present',
            bullets: [
              'Project lead on three projects.',
              'Leads cross-functional teams of 5–10 developers: architecture, technical decisions, code reviews, sprint planning and customer delivery.',
              'Mentors engineers, runs technical interviews and coordinates distributed international teams.',
              'Works with Product, Design, QA and DevOps to deliver weekly production releases.',
            ],
            tags: [
              'Java',
              'Spring Boot',
              'Spring AI',
              'React',
              'MySQL',
              'AWS',
              'Docker',
              'Microservices',
            ],
          },
          {
            title: 'Full-stack Software Engineer',
            org: 'Veltiston AI · Athens, hybrid',
            meta: 'May 2024 – May 2026',
            bullets: [
              'One of the company’s first engineers; built the flagship Nurse Scheduling platform from concept to production.',
              'Led production deployments across four major U.S. hospitals, working directly with hospital stakeholders.',
              'Modernized legacy applications: Agile practices, engineering standards, CI/CD pipelines, documentation, automated testing and incremental refactoring.',
            ],
          },
        ],
      },
    ],
  },
  {
    heading: 'Alongside it',
    blocks: [
      {
        type: 'timeline',
        entries: [
          {
            title: 'Lead Software Engineer',
            org: 'Holistic Hospital Optimization · contract, remote',
            meta: 'May 2024 – present',
            bullets: [
              'Software lead on AI-powered healthcare applications for U.S. hospitals.',
              'Nurse scheduling, hospital length-of-stay optimization, SMART on FHIR integrations and enterprise healthcare platform work.',
            ],
            tags: ['HIPAA', 'FHIR', 'Healthcare platforms'],
          },
        ],
      },
    ],
  },
]

export const PLATFORM_SECTIONS: PanelSection[] = [
  {
    heading: 'What I shipped',
    blocks: [
      {
        type: 'list',
        items: [
          'Technical lead of the flagship Nurse Scheduling platform, live in four major U.S. hospitals.',
          'An AI-powered documentation assistant built on Spring AI, retrieval-augmented generation and agentic AI.',
          'A SMART on FHIR application embedded inside Epic EHR.',
          'A Length of Stay analytics plugin delivered into Epic EHR through SMART on FHIR.',
          'Integration with UKG workforce management systems.',
          'SAML 2.0 single sign-on against Microsoft ADFS.',
          'A secure notification framework and comprehensive activity audit logging.',
          'A Jira-integrated ticketing system with Google reCAPTCHA for secure issue submission and workflow automation.',
          'HIPAA-compliant security and data handling architecture across all of it.',
        ],
      },
      {
        type: 'quote',
        text: 'Secure and scalable, or it does not ship.',
      },
    ],
  },
  {
    heading: 'How it stays up',
    blocks: [
      {
        type: 'tags',
        groups: [
          { label: 'Observability', tags: ['Grafana', 'Graylog', 'Sentry'] },
          {
            label: 'Delivery',
            tags: ['Docker', 'Jenkins', 'GitLab CI', 'Flyway'],
          },
          { label: 'Testing', tags: ['JUnit', 'Mockito', 'JaCoCo'] },
        ],
      },
    ],
  },
]

export const IBM_SECTIONS: PanelSection[] = [
  {
    heading: 'Before the startup',
    blocks: [
      {
        type: 'timeline',
        entries: [
          {
            title: 'DevOps Engineer',
            org: 'IBM · Athens, on-site',
            meta: 'November 2023 – May 2024',
            bullets: [
              'Selected for the IBM Associate Program, training in DevOps and integration.',
              'Worked on the Cosmos Project at the National Bank of Greece — a core banking transformation migrating legacy PL/I and COBOL systems to Infosys Finacle.',
              'Coordinated integration calls across bank subsystems to support Finacle onboarding.',
              'Designed integration architecture for both the transitional coexistence state and the target state.',
              'Supported DevOps operations: ticket deployments and CI/CD pipeline automation.',
              'Represented IBM Greece at an international Agile & Enterprise Design Thinking bootcamp in Hamburg, February 2024.',
            ],
            tags: [
              'Jenkins',
              'Podman',
              'Docker Compose',
              'ELK Stack',
              'Grafana',
              'Jira',
              'Confluence',
            ],
          },
        ],
      },
    ],
  },
]

export const SKILLS_SECTIONS: PanelSection[] = [
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
            ],
          },
          {
            label: 'AI',
            tags: [
              'Spring AI',
              'RAG',
              'Agentic AI',
              'Artificial neural networks',
              'Pose estimation',
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
              'Podman',
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
            tags: [
              'SMART on FHIR',
              'Epic EHR',
              'UKG',
              'SAML 2.0 SSO',
              'Microsoft ADFS',
              'JWT',
              'HIPAA',
              'reCAPTCHA',
            ],
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
            title: 'Reservist Second Lieutenant, Special Forces',
            org: 'Hellenic Armed Forces — 575 Marine Battalion',
            meta: 'September 2022 – 22 November 2023',
            bullets: [
              'Basic training at the Center of Special Forces, Nea Peramos.',
              'Graduated 3rd in class from the Infantry Reserve Officers School, Heraklion.',
              'Completed the Rangers’ Basic Training School — Guerilla Warfare School, Rentina.',
              'Reported to the 575 Marine Battalion as an Officer Designate on 11 February 2023.',
              'Served as Platoon Leader and Weapons Officer for a Marine Company, and as Deputy Company Commander.',
              'Released as a Special Forces Second Lieutenant, having earned the green beret.',
            ],
          },
        ],
      },
    ],
  },
  {
    heading: 'What the job actually was',
    blocks: [
      {
        type: 'list',
        items: [
          'Led and supervised personnel through training and field operations.',
          'Coordinated logistics, weaponry and readiness for company-level exercises.',
          'Held the line on discipline, operational efficiency and safety compliance.',
          'Acted as liaison between commanding officers and enlisted troops.',
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
]

export const VOLUNTEER_SECTIONS: PanelSection[] = [
  {
    heading: 'Running a youth foundation',
    blocks: [
      {
        type: 'timeline',
        entries: [
          {
            title: 'Director',
            org: 'Christian Youth Foundation "Pantokrator" · Paleo Faliro',
            meta: 'February 2021 – September 2022',
            bullets: [
              'Appointed by the foundation’s council after years as a volunteer, while finishing the degree — the Vice-President approached him directly to fill the vacancy.',
              'Renovated, upgraded and modernised the building infrastructure and the foundation’s day-to-day operations.',
              'Supervised and taught the children in the foundation’s programmes.',
              'Coordinated staff and volunteers, and managed the facilities themselves.',
              'Organised athletic, theatrical, cultural and ecological events, field trips and youth activities.',
              'Led charitable initiatives: tree planting, donation drives and outreach to vulnerable groups.',
              'Built the foundation’s presence on social media and YouTube, and ran live streaming through the COVID-19 lockdowns.',
              'Oversaw financial operations and pursued alternative funding through grants and partnerships.',
              'Kept the board and the municipal authorities in the loop.',
            ],
            tags: [
              'People management',
              'Facility management',
              'Event management',
              'Financial oversight',
            ],
          },
        ],
      },
    ],
  },
  {
    heading: 'Still going',
    blocks: [
      {
        type: 'list',
        items: [
          'Leading volunteer at the same foundation — 2017–2021 and 2023 to today',
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
        text: 'The Radio Center broadcasts on three frequencies. Pick one and the message goes straight to me — no operator in between.',
      },
    ],
  },
]

/* ------------------ the reward at the top of the island ----------------- */

export const LIGHTHOUSE_SECTIONS: PanelSection[] = [
  {
    heading: 'The short version',
    blocks: [
      {
        type: 'text',
        text: 'Nine years of building things other people depend on: five at NTUA, one in uniform, half a year at IBM inside a bank, and two and a half leading platform work at an AI healthcare startup whose software now runs in four U.S. hospitals. One published paper along the way.',
      },
      {
        type: 'stats',
        stats: [
          { label: 'Now', value: 'Senior Software Engineer, Veltiston AI' },
          { label: 'Core stack', value: 'Java · Spring Boot · React · AWS' },
          { label: 'Team', value: '5–10 engineers, 3 countries' },
          { label: 'Cadence', value: 'Weekly production releases' },
        ],
      },
    ],
  },
  {
    heading: 'What I am actually good at',
    blocks: [
      {
        type: 'list',
        items: [
          'Owning a system end to end — schema, service, API, UI, pipeline, dashboard — instead of one slice of it.',
          'Taking a legacy codebase nobody wants to touch and making it shippable again, in increments, without a rewrite.',
          'Leading engineers across time zones: reviews that teach, sprints that finish, decisions that are written down.',
          'Working where correctness is not negotiable — healthcare data, HIPAA, audit trails, Epic and FHIR integrations.',
          'Translating between hospital stakeholders, product and engineering without losing detail in either direction.',
        ],
      },
    ],
  },
  {
    heading: 'What I am looking for',
    blocks: [
      {
        type: 'text',
        text: 'Hard problems with real users attached, a team that reviews each other honestly, and enough ownership to fix the root cause instead of the symptom. Remote, hybrid or Athens-based.',
      },
      {
        type: 'quote',
        text: 'If the island convinced you, the Radio Center is a two-minute walk south.',
      },
    ],
  },
]

/**
 * Everything, in reading order — used by the "skip ahead" card so nobody has
 * to hunt for keys to see the whole CV.
 */
export const FULL_CV_SECTIONS: PanelSection[] = [
  ...LIGHTHOUSE_SECTIONS,
  ...VELTISTON_SECTIONS,
  ...PLATFORM_SECTIONS,
  ...IBM_SECTIONS,
  ...SKILLS_SECTIONS,
  ...UNIVERSITY_SECTIONS,
  ...PUBLICATION_SECTIONS,
  ...CERTIFICATIONS_SECTIONS,
  ...THESIS_SECTIONS,
  ...STUDENT_LIFE_SECTIONS,
  ...ARMY_SECTIONS,
  ...SCHOOL_SECTIONS,
  ...VOLUNTEER_SECTIONS,
  ...REFERENCES_SECTIONS,
  ...HOUSE_SECTIONS,
]

/* --------------------------- downstairs ---------------------------- */

/**
 * Downstairs. None of it is on a CV, which is rather the point of putting it
 * under the floor: the house upstairs is who he is at work, and the basement
 * is where that came from.
 */
export const FAMILY_SECTIONS: PanelSection[] = [
  {
    heading: 'The house I grew up in',
    blocks: [
      {
        type: 'text',
        text: 'Seven of us: my father, my mother, three brothers, my sister and me. One bathroom, one table, and never a quiet evening in the whole of it.',
      },
      {
        type: 'text',
        text: 'A big family is a small organisation. Nobody hands you a role — you find the thing that needs doing and you do it, because if you wait for somebody else the thing does not get done. That is the whole of it, and I have not found a team since where it was not also true.',
      },
      {
        type: 'list',
        items: [
          'Responsibility, because with five children something is always somebody\u2019s job and often it was mine',
          'Initiative, because asking permission for everything in a house that size means never doing anything',
          'Patience, learned the hard way and mostly from my brothers',
          'That being loved and being agreed with are completely different things',
        ],
      },
      {
        type: 'quote',
        text: 'My siblings were my first friends, and they are still the ones who knew me before I had anything to show.',
      },
    ],
  },
]

export const GARAGE_SECTIONS: PanelSection[] = [
  {
    heading: 'The garage',
    blocks: [
      {
        type: 'text',
        text: 'Tools on the board, bench along the back wall, car nosed at the shutter and the bicycle against the other. Half the furniture upstairs was built on this bench.',
      },
      {
        type: 'text',
        text: 'DIY is the same loop as engineering, with a shorter feedback cycle and worse consequences: measure, cut, discover the wall is not square, adapt. Nothing teaches you to respect a tolerance like a shelf that will not sit level.',
      },
      {
        type: 'list',
        items: [
          'Wood, mostly — shelving, tables, whatever the flat needs',
          'The bicycle gets stripped and rebuilt more often than it strictly needs',
          'Every tool goes back on the board, which took years to become true',
        ],
      },
      {
        type: 'text',
        text: 'The rest of the hobbies live somewhere between here and the front door: running and cycling, where the thinking happens somewhere around kilometre six; hiking and camping, usually somewhere with no signal; chess, badly but stubbornly; and theater, from the audience these days.',
      },
    ],
  },
]

export const LAB_SECTIONS: PanelSection[] = [
  {
    heading: 'The home lab',
    blocks: [
      {
        type: 'text',
        text: 'A mini server in the corner running Linux, and enough electronics on the bench to make something blink by the end of an evening. It is not a showpiece — it is where I try the thing before I trust it at work.',
      },
      {
        type: 'text',
        text: 'Everything I know about operations I learned by breaking my own machine at eleven at night with nobody to escalate to. You read the logs because there is no one else to read them.',
      },
      {
        type: 'list',
        items: [
          'One small Linux box, doing more jobs than it was ever sold to do',
          'Microcontrollers, a soldering iron, and a drawer of components sorted with real optimism',
          'The place where a bad idea gets to be a bad idea cheaply',
        ],
      },
    ],
  },
]

/**
 * The bookshelf downstairs. Ordered as they sit on it rather than by any
 * merit, and each with the reason it is still there.
 */
export const LIBRARY_SECTIONS: PanelSection[] = [
  {
    heading: 'The shelf downstairs',
    blocks: [
      {
        type: 'text',
        text: 'Not many books, and none of them here by accident. These are the ones I have gone back to — Verne is on the shelf across the room, where he has always been.',
      },
      {
        type: 'timeline',
        entries: [
          {
            title: 'The Gambler',
            org: 'Fyodor Dostoevsky',
            meta: 'On wanting the wrong thing, clearly',
            bullets: [
              'Written to pay off a gambling debt, about a man ruined by gambling. Nobody has ever been more honest about their own worst habit.',
            ],
          },
          {
            title: 'Les Misérables',
            org: 'Victor Hugo',
            meta: 'On mercy being a decision, not a feeling',
            bullets: [
              'A thousand pages to say that a man can be more than his record, and worth every one of them.',
            ],
          },
          {
            title: 'Surely You\u2019re Joking, Mr. Feynman!',
            org: 'Richard Feynman',
            meta: 'On refusing to be impressed',
            bullets: [
              'The engineer\u2019s book on this shelf. Take the thing apart, ask the stupid question out loud, and never mistake the jargon for the understanding.',
            ],
          },
          {
            title: '1984',
            org: 'George Orwell',
            meta: 'On what language is for',
            bullets: [
              'Read at the right age it is a thriller. Read again later it is a manual, and you start noticing the vocabulary.',
            ],
          },
          {
            title: 'All Quiet on the Western Front',
            org: 'Erich Maria Remarque',
            meta: 'On who is actually sent',
            bullets: [
              'I read this before my own service and again after it. It is a different book on the far side.',
            ],
          },
          {
            title: 'The Grapes of Wrath',
            org: 'John Steinbeck',
            meta: 'On a family holding together',
            bullets: [
              'A big family on a bad road, keeping each other alive. It landed somewhere personal and it has stayed there.',
            ],
          },
        ],
      },
    ],
  },
]

/**
 * The other shelf downstairs, and the older one. Verne came first, and he is
 * the reason a good deal of the rest of this island exists at all: most of
 * these are about people somewhere impossible who have to build their way
 * out of it, which turned out to be a career. The last one is not, and is
 * left in the order he wrote them rather than tidied off the end.
 */
export const VERNE_SECTIONS: PanelSection[] = [
  {
    heading: 'The Verne shelf',
    blocks: [
      {
        type: 'text',
        text: 'These were first. Read as a boy in a house with five children in it, which meant reading in whatever chair was going and with the argument still running in the next room. I got very good at concentrating.',
      },
      {
        type: 'timeline',
        entries: [
          {
            title: 'Five Weeks in a Balloon',
            org: 'Jules Verne, 1863',
            meta: 'The first one he wrote, and the first one I read',
            bullets: [
              'Three men cross a continent in a balloon they cannot steer, on the theory that you can still choose your altitude. Which is most of engineering: you rarely get to pick the wind.',
            ],
          },
          {
            title: 'Journey to the Centre of the Earth',
            org: 'Jules Verne, 1864',
            meta: 'On going down to find out',
            bullets: [
              'A coded note, a volcano in Iceland, and an uncle who will not be argued out of it. The first book that made me want to know how something worked badly enough to climb into it.',
            ],
          },
          {
            title: 'Twenty Thousand Leagues Under the Sea',
            org: 'Jules Verne, 1870',
            meta: 'On building the thing nobody asked for',
            bullets: [
              'The twenty thousand leagues are how far the Nautilus travels, not how deep she goes \u2014 which everybody gets wrong, and which is the sort of detail I have never been able to leave alone.',
              'Nemo is an engineer with a grievance and unlimited budget. I have met the type.',
            ],
          },
          {
            title: 'The Mysterious Island',
            org: 'Jules Verne, 1875',
            meta: 'The one that did the damage',
            bullets: [
              'Five men land on a rock with nothing and end up with brick, iron, glass, a telegraph and a boat. It is four hundred pages of working out what you can make from what is actually to hand.',
              'If there is one book on either shelf that explains the workbench in this cellar, it is this one.',
            ],
          },
          {
            title: 'Dick Sand: A Captain at Fifteen',
            org: 'Jules Verne, 1878',
            meta: 'On being handed it early',
            bullets: [
              'A fifteen-year-old ends up in command because everybody senior is gone. He is not ready and he does it anyway.',
              'Read at about that age, in a big family, where being handed something before you are ready is simply Tuesday.',
            ],
          },
          {
            title: 'A Drama in Livonia',
            org: 'Jules Verne, 1904',
            meta: 'The one with nothing to build',
            bullets: [
              'Late Verne, and the odd one out on this shelf: no balloon, no submarine, no island. A murder in the frozen Baltic, and a man convicted of it on circumstance while the reader knows perfectly well he did not do it.',
              'A Slav schoolmaster against the German merchant families who own the province, and a verdict that arrives long before the evidence does. It is really about how fast everyone agrees on the wrong answer when they already wanted to.',
              'The only one here where nobody can engineer their way out. That is why I remember it.',
            ],
          },
        ],
      },
      {
        type: 'quote',
        text: 'Anything one man can imagine, other men can make real. He wrote that in 1873 and it has been quoted at every engineer since, and it is still true.',
      },
    ],
  },
]

export const PLAYROOM_SECTIONS: PanelSection[] = [
  {
    heading: 'The room that is not on the plans',
    blocks: [
      {
        type: 'text',
        text: 'Behind a shelf in the library. A television, a Switch docked under it, two beanbags and the posters I have never grown out of.',
      },
      {
        type: 'list',
        items: [
          'Mario, still, and no apology for it',
          'Star Wars — the whole thing, arguments about the ordering included',
          'The Marvel run, watched properly and in sequence like a serious person',
          'And anything well made: give me a good film and I will give you the evening',
        ],
      },
      {
        type: 'quote',
        text: 'Every house should have one room that is nobody\u2019s business.',
      },
    ],
  },
]
