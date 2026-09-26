import type { Letter, PanelSection } from '../../types.ts'

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
  website: 'https://www.kitsorfan.com',
  websiteLabel: 'www.kitsorfan.com',
} as const

/** The full name, given name and nickname both. Only the CV carries it. */
export const CV_NAME = `${PROFILE.firstName} (${PROFILE.nickname}) ${PROFILE.lastName}`

/** The name everywhere else on the island. */
export const NAME = `${PROFILE.nickname} ${PROFILE.lastName}`

export const HOUSE_SECTIONS: PanelSection[] = [
  {
    heading: 'Trainer card',
    blocks: [
      {
        type: 'text',
        text: 'Senior Software Engineer and Technical Lead based in Athens, Greece. I build cloud-native healthcare products end to end, Java and Spring Boot on the backend, React on the front, AWS underneath, and I lead the teams that ship them into hospitals.',
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
          'Greek, native speaker',
          'English, proficiency (ECPE, University of Michigan, 2016)',
          'French, B2 (DELF, 2019)',
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
              'Five-year integrated Master of Engineering in the School of Electrical and Computer Engineering, the most competitive school in Greece to get into, where only the top entrance-exam grades make it.',
              'Finished in the five years the programme is designed for; the average student takes about seven and a half.',
              'Thesis: compliance analysis of movement exercises using machine learning, supervised by Prof. Panagiotis Tsanakas, Dean of the School, graded with distinction, and later published on arXiv.',
              'Coursework with the Dean included Operating Systems and Software Service Technologies.',
              'Worked alongside the degree from the third year: part-time at first, then full-time as Director of the "Pantokrator" Foundation through the fourth and fifth.',
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
        text: 'Applicable to remote physiotherapy supervision: the patient’s own phone does the assessment, so nothing leaves the device.',
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
        text: 'Compliance analysis of movement exercises using machine learning: a system that watches how a movement is performed and judges it against how it should be performed. Supervised by Prof. Panagiotis Tsanakas, Dean of the School of ECE, who called it "marked by scientific soundness and technological originality" and graded it with distinction. Three years later it became a published paper.',
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
          'National Biology Competition 2016, ranked 2nd',
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
              'Human-subjects research conduct and ethics, and HIPAA, the compliance side of building for hospitals.',
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
            title: 'ECPE, Certificate of Proficiency in English (C2)',
            org: 'University of Michigan',
            meta: 'May 2016',
          },
          {
            title: 'ECCE, Certificate of Competency in English (B2)',
            org: 'University of Michigan',
            meta: 'May 2015',
          },
          {
            title: 'DELF B2, Diplôme d’études en langue française',
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
    'Specifically, when a vacancy arose in the Foundation\u2019s Directorship in 2021, I turned to young Christos, then a student at the National Technical University of Athens, and proposed that he take on the Director\u2019s post, because we considered that his bearing, the traits of his character, the particular quality of his personality, his abilities and above all his warm love for the Foundation made him right for the role. Indeed, when after a year and a half he had to end his work with us, because he had completed his studies and had to fulfil his military obligations, his overall contribution had far exceeded our expectations. The field of his activities was broad, running from the maintenance and management of the premises through to the organisation of events, making the most of the volunteers, and the management of digital media.',
    'He was highly organised, focused on his duties, hard-working and conscientious, and kept us regularly informed of everything he did. He continually took on new initiatives and always tried to address the cause of whatever problems he found in the Foundation\u2019s running. He kept good relations with the children of the Foundation, whom he had been called to educate and look after during their time on the premises. He talked with them and took an interest in their problems, and moreover guided them with useful advice, and had succeeded in being trusted and heeded by them. By character he was approachable, welcoming, friendly and particularly likeable.',
    'Christos is distinguished by his sincerity, his discipline and his dedication to every task he undertakes to see through. He is modest, serious, dignified, and a person who inspires trust. I consider Christos Orfanopoulos to be a worthy scientist and a capable professional, and I judge that he will prove useful, effective and indispensable, bringing significant benefit to any business working environment.',
  ],
}

/*
 * Three teachers at Ionidios, on a scholarship recommendation form in
 * September 2017. Each form asks the same five questions — how they know
 * him, his ability, his character, what he will get from his studies, and
 * anything else — so each letter is the five answers in order.
 */

const LETTER_PANTOU: Letter = {
  id: 'pantou',
  from: 'Dr Dimitra Pantou',
  role: 'Biologist, PhD, MSc · Model General Lyceum of the Ionidios School of Piraeus',
  note: 'Biology teacher for both lyceum years · Scholarship recommendation · 29 September 2017 · translated from Greek',
  scans: ['pantou-1.jpg', 'pantou-2.jpg'],
  paragraphs: [
    'Christos Orfanopoulos was my student at the Model General Lyceum of the Ionidios School of Piraeus for two school years (2015–2016 and 2016–2017). He attended the courses "General Biology, 2nd year of Lyceum", "General Biology, 3rd year of Lyceum" and "Biology, Science stream, 3rd year of Lyceum" with me as his teacher.',
    'Christos Orfanopoulos was an excellent student. In all three years of Lyceum he was consistently first in performance in his class. He is able to grasp new concepts quickly and to apply that knowledge in practice, which I concluded through the Biology laboratory lessons. He is intelligent, cooperative, and works hard and methodically to achieve his goals.',
    'Christos Orfanopoulos is a particularly interesting personality, with rare qualities and a bright character. He is an honest person, with faith in his abilities, consistency in his relationships with others and a strongly creative disposition. He is characterised by positive thinking, emotional maturity and adaptability, and he is extremely well liked among the people he keeps company with. He is without doubt among the best students I have had in recent years.',
    'Christos Orfanopoulos, as I mentioned, has analytical judgement and constantly sets himself clear goals, which he works hard to achieve. He is also an excellent computer user. I am certain that all these qualities will help him develop into an excellent student and a future scientist, on the one condition that he can devote himself to his school without the anxiety of covering his student expenses. I therefore recommend Christos Orfanopoulos unreservedly for the scholarship.',
    'Christos Orfanopoulos took second (2nd) place among approximately 1,650 participants in the Panhellenic Biology Competition (www.pdbio.gr) in the 2nd year of Lyceum, in 2016.',
  ],
}

const LETTER_MITSOPOULOU: Letter = {
  id: 'mitsopoulou',
  from: 'Athina Mitsopoulou',
  role: 'Chemist, MSc, PhD candidate · Lyceum of the Ionidios School of Piraeus',
  note: 'Chemistry teacher for both lyceum years · Scholarship recommendation · 28 September 2017 · translated from Greek',
  scans: ['mitsopoulou-1.jpg', 'mitsopoulou-2.jpg'],
  paragraphs: [
    'The candidate, Mr Christos Orfanopoulos, was my student in Chemistry for the last two years at the Model Lyceum of the Ionidios School of Piraeus.',
    'Throughout those years he achieved outstanding results in my subject, showed an excellent grasp of new material, and confirmed his title of excellence.',
    'Besides his excellent performance in his lessons, the candidate also showed an outstanding character. He was always cooperative, willing to help, polite, disciplined, and friendly with his classmates.',
    'For this particular person, I am sure, studies will not only be the means of enriching his knowledge; they will be the springboard for his usefulness to society and his contribution to research and to science in general.',
    'The candidate took part in a great many of our school’s programmes, activities and events. He was my student in the "Physics and Chemistry" Club, where he showed particular ability in handling instruments and laboratory equipment, in taking accurate measurements and in processing the results correctly. He showed initiative and consistency, qualities a future scientist cannot do without.',
  ],
}

const LETTER_PAPADAKIS: Letter = {
  id: 'papadakis',
  from: 'Nikolaos Papadakis',
  role: 'Physics teacher · Model General Lyceum of the Ionidios School of Piraeus',
  note: 'Physics teacher for both lyceum years · Scholarship recommendation · 27 September 2017 · translated from Greek',
  scans: ['papadakis-1.jpg', 'papadakis-2.jpg'],
  paragraphs: [
    'I was the candidate’s teacher in general Physics and science-stream Physics in the 2nd and 3rd years of Lyceum.',
    'His performance was excellent throughout the two years I had him as a student.',
    'Very hard-working, with an excellent character. He also took part in every event, competition and presentation our school put on, and did so with particular effectiveness.',
    'His interest in the physical sciences, and in their practical applications too, is such that his studies will give him a deep understanding of every subject that concerns him.',
    'I would describe him as very hard-working, a pleasant personality with a particular sense of humour, and a very good conversationalist with clear arguments.',
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

/** The three from Ionidios, on the wall of the classroom they taught in. */
export const REFERENCE_IONIDIOS_SECTIONS = recommendations([
  LETTER_PANTOU,
  LETTER_PAPADAKIS,
  LETTER_MITSOPOULOU,
])

/** All four referees, for the full CV and the download. */
export const REFERENCES_SECTIONS = recommendations([
  LETTER_TSANAKAS,
  LETTER_MITSIDIS,
  LETTER_OIKONOMOU,
  LETTER_KANDYLAKIS,
])

export const STUDENT_LIFE_SECTIONS: PanelSection[] = [
  {
    heading: 'The Independent movement',
    blocks: [
      {
        type: 'text',
        text: 'In his third year, party-political groups ran the faculty assemblies and students’ own problems went unheard. He co-founded an independent movement of ECE students to win real representation by democratic means.',
      },
      {
        type: 'list',
        items: [
          'Ran a petition that more than 700 students signed in two days.',
          'Spoke at the councils and at a general meeting of 800.',
          'Appointed by the Dean of the School as independent students’ representative, and served two years in the open, always saying what he was doing, and why.',
          'Campaigned for e-voting and for keeping party politics out of the assembly; took real hostility from groups outside the student body, and kept going anyway.',
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

/** The hundred and ten pages the year below still passes round. */
export const GUIDE_SECTIONS: PanelSection[] = [
  {
    heading: 'The Survival Guide',
    blocks: [
      {
        type: 'text',
        text: 'A hundred and ten pages for new students: what each compulsory course is, how it is run, how it is examined, and how to get through it, written while he was getting through it himself. Years later it is still passed from year to year, and some of the students reading it are not sure the author was real.',
      },
      {
        type: 'stats',
        stats: [
          { label: 'Pages', value: '110' },
          { label: 'Courses', value: 'Every compulsory one' },
          { label: 'Still in use', value: 'Years later' },
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
          'Assisted in the first-year programming laboratories as a lab instructor.',
          'Took part in class, uploaded his notes, and posted worked solutions on the student forums.',
          'Many projects along the way, and the diploma thesis: a phone application that watches a movement through a neural network, recognises it and assesses how well it was performed.',
        ],
      },
    ],
  },
]

/**
 * The transcript, course by course. The names are the English glosses of
 * the School's courses; the grades are out of ten, and a course taken for a
 * pass mark says so.
 */
export const TRANSCRIPT_SECTIONS: PanelSection[] = [
  {
    heading: 'The transcript',
    blocks: [
      {
        type: 'stats',
        stats: [
          { label: 'Courses', value: '55' },
          { label: 'Course average', value: '7.94' },
          { label: 'Diploma thesis', value: '10' },
          { label: 'Overall', value: '8.35 / 10' },
          { label: 'Time to finish', value: '5 years' },
        ],
      },
    ],
  },
  {
    heading: 'Semester 1',
    blocks: [
      {
        type: 'list',
        items: [
          'Introduction to Programming · 10',
          'Logic Design · 10',
          'Linear Algebra · 10',
          'Physics · 8',
          'Calculus I · 7',
          'History · 10',
        ],
      },
    ],
  },
  {
    heading: 'Semester 2',
    blocks: [
      {
        type: 'list',
        items: [
          'Programming Techniques · 10',
          'Electric Circuits · 10',
          'Electrical Engineering Materials · 10',
          'Differential Equations · 9',
          'Calculus II · 6',
          'Engineering Mechanics · 10',
        ],
      },
    ],
  },
  {
    heading: 'Semester 3',
    blocks: [
      {
        type: 'list',
        items: [
          'Electrical Measurements · 10',
          'Logic Design Lab · 9',
          'Foundations of Computer Science · 7',
          'Signals & Systems · 7',
          'Probability & Statistics · 6',
          'Computer Organisation · 9',
        ],
      },
    ],
  },
  {
    heading: 'Semester 4',
    blocks: [
      {
        type: 'list',
        items: [
          'Communication Networks · 10',
          'Waves & Quantum Physics · 6',
          'Stochastic Processes · Pass',
          'Electronics I · 7',
          'Electromagnetic Fields A · 5',
          'Discrete Mathematics · 7',
          'English · 10',
        ],
      },
    ],
  },
  {
    heading: 'Semester 5',
    blocks: [
      {
        type: 'list',
        items: [
          'Industrial Electronics · 6',
          'Telecommunications · 5',
          'Computer Architecture · 7',
          'Control Systems · 6',
          'Electric Power Systems · 5',
          'Electromagnetic Fields B · 5',
        ],
      },
    ],
  },
  {
    heading: 'Semester 6',
    blocks: [
      {
        type: 'list',
        items: [
          'Network & Circuit Theory · 6',
          'Operating Systems · 10',
          'Microcomputers · 8',
          'Programming Languages I · 6',
          'Databases · Pass',
          'Queueing Systems · 5',
          'Management Systems · 9',
        ],
      },
    ],
  },
  {
    heading: 'Semester 7',
    blocks: [
      {
        type: 'list',
        items: [
          'Electrical Drawing · Pass',
          'Human–Computer Interaction · 10',
          'Multimedia · 10',
          'Operating Systems Lab · 6',
          'Algorithms · 6',
          'Software Engineering · 8',
          'Computer Networks · 8',
          'Decision Support Systems · 8',
        ],
      },
    ],
  },
  {
    heading: 'Semester 8',
    blocks: [
      {
        type: 'list',
        items: [
          'Advanced Computer Architecture · 8',
          'Software as a Service · 9',
          'Internet Protocols · Pass',
          'Security · 7',
          'Forecasting Techniques · 8',
          'Digital Enterprise Management · 9',
          'Electromagnetic Compatibility · 10',
        ],
      },
    ],
  },
  {
    heading: 'Semester 9',
    blocks: [
      {
        type: 'list',
        items: [
          'Neural Networks · 6',
          'Information Systems · 10',
          'Advanced Databases · 7',
        ],
      },
    ],
  },
]

export const VELTISTON_SECTIONS: PanelSection[] = [
  {
    heading: 'Veltiston AI, two and a half years',
    blocks: [
      {
        type: 'text',
        text: 'Joined an AI healthcare startup founded by MIT Professor Dimitris Bertsimas as one of its first engineers, and grew into Technical Lead of the flagship Nurse Scheduling platform, concept to production, with teams across Greece, Boston and Morocco.',
      },
      {
        type: 'timeline',
        entries: [
          /*
           * One job, told once: the promotion is two steps in the head, and
           * the lead work for Holistic Hospital Optimization is part of the
           * same role, both companies sitting in the Dynamic Ideas group.
           */
          {
            title: 'Senior Software Engineer',
            org: 'Veltiston AI · Athens, hybrid',
            meta: 'May 2026 – present',
            steps: [
              { title: 'Senior Software Engineer', meta: 'May 2026 – present' },
              {
                title: 'Full-stack Software Engineer',
                meta: 'May 2024 – May 2026',
              },
            ],
            bullets: [
              'One of the company’s first engineers; built the flagship Nurse Scheduling platform from concept to production.',
              'Project lead on three projects.',
              'Leads cross-functional teams of 5–10 developers: architecture, technical decisions, code reviews, sprint planning and customer delivery.',
              'Also the software lead at Holistic Hospital Optimization, its sister company in the Dynamic Ideas group: AI-powered applications for U.S. hospitals, from nurse scheduling to length-of-stay optimization and SMART on FHIR integrations.',
              'Led production deployments across major U.S. hospitals, working directly with hospital stakeholders.',
              'Works with Product, Design, QA and DevOps to deliver weekly production releases.',
              'Mentors engineers, runs technical interviews and coordinates distributed international teams.',
              'Modernized legacy applications: Agile practices, engineering standards, CI/CD pipelines, documentation, automated testing and incremental refactoring.',
            ],
            tags: [
              'Java',
              'Spring Boot',
              'Spring AI',
              'React',
              'React Native',
              'MySQL',
              'AWS',
              'Docker',
              'Microservices',
              'SMART on FHIR',
              'HIPAA',
            ],
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
        type: 'text',
        text: 'Technical lead on every one of these: the architecture, the decisions, the reviews and the delivery into the hospital.',
      },
      {
        type: 'list',
        items: [
          'The flagship Nurse Scheduling platform, live in major U.S. hospitals.',
          'An AI-powered documentation assistant built on Spring AI, retrieval-augmented generation and agentic AI.',
          'A SMART on FHIR application embedded inside Epic EHR.',
          'A Length of Stay analytics plugin delivered into Epic EHR through SMART on FHIR.',
          'Integration with UKG workforce management systems.',
          'SAML 2.0 single sign-on against Microsoft ADFS.',
          'A React Native mobile app for the nurses themselves: their schedule, their shift preferences and the rest of the platform on their phone, not only on the web.',
          'A secure notification framework and comprehensive activity audit logging, reaching nurses through Microsoft Teams and Twilio SMS.',
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
              'Worked on the Cosmos Project at the National Bank of Greece, a core banking transformation migrating legacy PL/I and COBOL systems to Infosys Finacle.',
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

/**
 * What the ground floor of the Work District is for: the lobby board that
 * tells you the building has three floors, which one holds what, and that the
 * third is not built yet. The lift panel says the same thing in buttons.
 */
export const WORK_DIRECTORY_SECTIONS: PanelSection[] = [
  {
    heading: 'Directory',
    blocks: [
      {
        type: 'text',
        text: 'Two employers, one floor each, in the order he worked them. Everything on the ground floor is the part that came before either of them, or runs underneath both.',
      },
      {
        type: 'stats',
        stats: [
          {
            label: 'Ground',
            value: 'Capabilities, certifications, student jobs',
          },
          { label: 'First', value: 'IBM · 2023–2024' },
          { label: 'Second', value: 'Veltiston AI · 2024–present' },
          { label: 'Third', value: 'Empty. Waiting on an offer' },
        ],
      },
      {
        type: 'text',
        text: 'The lift has a button for the third floor. Press it and nothing lights, because nobody has decided yet what that floor is — which is the honest position of a senior engineer who is good at this and is listening to offers. If you are reading this because you are hiring, you are the one who gets to name it.',
      },
    ],
  },
]

/**
 * The capabilities board in the lobby: what he is actually good at, stated
 * plainly, before you go up and see where each of them was earned.
 */
export const CAPABILITIES_SECTIONS: PanelSection[] = [
  {
    heading: 'What he does',
    blocks: [
      {
        type: 'text',
        text: 'A senior full-stack engineer who leads: designs the architecture, writes the hard parts himself, and takes the team and the customer along with him. Java and Spring Boot on the back, React on the front, AWS underneath, and a production release most weeks.',
      },
      {
        type: 'list',
        items: [
          'Takes a product from concept to production, then keeps it alive in front of real users.',
          'Leads cross-functional teams of 5–10 across three time zones without slowing any of them down.',
          'Designs for security and compliance first, because hospitals are the customer.',
          'Modernises legacy systems in slices, with the lights on, rather than by rewrite.',
          'Runs the technical interviews, the mentoring and the onboarding.',
          'Talks to the people paying for it in their language, not in ours.',
        ],
      },
      {
        type: 'quote',
        text: 'Secure and scalable, or it does not ship.',
      },
    ],
  },
]

/**
 * The small board by the lobby stairs: the three jobs he held while he was
 * still a student at NTUA, none of them software, all of them the same skill
 * he now gets paid for — standing in front of people and being answerable.
 */
export const STUDENT_JOBS_SECTIONS: PanelSection[] = [
  {
    heading: 'While he was still a student',
    blocks: [
      {
        type: 'text',
        text: 'Three jobs held alongside the degree at NTUA, from the third year on. None of them were engineering. All of them were being handed a room and made answerable for it.',
      },
      {
        type: 'timeline',
        entries: [
          {
            title: 'Director',
            org: 'Christian Youth Foundation "Pantokrator" · Paleo Faliro',
            meta: 'February 2021 – September 2022',
            bullets: [
              'Offered the post directly by the Vice-President while still an undergraduate, after years as a volunteer there.',
              'Ran the building, the staff, the volunteers, the budget and the programme of events.',
              'Renovated and modernised the premises and the foundation’s day-to-day operations.',
              'Left when the degree finished and the army called.',
            ],
            tags: ['People management', 'Facilities', 'Budget', 'Events'],
          },
          {
            title: 'Robotics tutor',
            org: 'Citylab · Alimos',
            meta: '2020 – 2021',
            bullets: [
              'Taught robotics to children, in classes of his own.',
              'Explaining a machine to a ten-year-old is the same skill as explaining an architecture to a stakeholder, and harder.',
            ],
            tags: ['Robotics', 'Teaching'],
          },
          {
            title: 'Private mathematics tutor',
            org: 'Self-employed · Athens',
            meta: 'During the degree',
            bullets: [
              'One-to-one mathematics with schoolchildren, at their kitchen tables.',
            ],
            tags: ['Mathematics', 'Teaching'],
          },
        ],
      },
    ],
  },
]

/**
 * The Veltiston floor’s technology wall. The platform panel says what was
 * shipped; this says what it was built out of, and is deliberately the long
 * list — the floor is meant to feel like a stack you could not hold in your
 * head all at once.
 */
export const VELTISTON_STACK_SECTIONS: PanelSection[] = [
  {
    heading: 'What the platform is made of',
    blocks: [
      {
        type: 'tags',
        groups: [
          {
            label: 'Core',
            tags: [
              'Java 17–25',
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
              'Ollama',
              'RAG',
              'Agentic AI',
              'Vector search',
              'LLM tooling',
            ],
          },
          {
            label: 'Front',
            tags: [
              'React',
              'React Native',
              'TypeScript',
              'Angular',
              'Tailwind CSS',
            ],
          },
          { label: 'Data', tags: ['MySQL', 'Flyway'] },
          {
            label: 'Cloud',
            tags: [
              'AWS EC2',
              'AWS S3',
              'AWS SES',
              'AWS SNS',
              'Docker',
              'Docker Compose',
            ],
          },
          {
            label: 'Delivery',
            tags: ['Jenkins', 'GitLab CI', 'Bitbucket Pipelines', 'Git'],
          },
          { label: 'Watching it', tags: ['Grafana', 'Graylog', 'Sentry'] },
          {
            label: 'Proving it',
            tags: ['JUnit', 'Mockito', 'JaCoCo', 'Vitest'],
          },
          {
            label: 'Hospital side',
            tags: [
              'SMART on FHIR',
              'Epic EHR',
              'UKG',
              'Microsoft Teams',
              'Jira',
              'Twilio',
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
  {
    heading: 'The pace, and who is on the other end of it',
    blocks: [
      {
        type: 'text',
        text: 'A production release most weeks, on a platform major U.S. hospitals run their nursing rosters on. The people using it are charge nurses at shift change, not beta testers. That is the whole argument for why the standards are what they are.',
      },
      {
        type: 'stats',
        stats: [
          { label: 'Live in', value: 'Major U.S. hospitals' },
          { label: 'Releases', value: 'Weekly, to production' },
          { label: 'Teams', value: 'Greece · Boston · Morocco' },
          { label: 'Since', value: 'May 2024, founding engineer' },
        ],
      },
      {
        type: 'quote',
        text: 'If the roster is wrong on Monday morning, a ward is short. You do not get to call that a P2.',
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
              'Ollama',
              'RAG',
              'Agentic AI',
              'Artificial neural networks',
              'Pose estimation',
            ],
          },
          {
            label: 'Frontend',
            tags: [
              'React',
              'React Native',
              'Angular',
              'HTML',
              'CSS',
              'Tailwind CSS',
            ],
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
            org: 'Hellenic Armed Forces, 575 Marine Battalion',
            meta: 'September 2022 – 22 November 2023',
            bullets: [
              'Basic training at the Center of Special Forces, Nea Peramos.',
              'Graduated 3rd in class from the Infantry Reserve Officers School, Heraklion.',
              'Completed the Rangers’ Basic Training School (Guerilla Warfare School), Rentina.',
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
            bullets: [
              'Ranked 1st in the entrance exam to the oldest school in Piraeus, founded in 1847, and one of the four public Model schools in Greece.',
              'Excellence award every year, and the Piraeus prize for the top graduating grade of 2017.',
              '2nd among about 1,650 entrants in the Panhellenic Biology Competition (2016); awards in Mathematics and Programming; captain of the school’s EUSO science team.',
              'Summer School of the University of Piraeus; self-taught C++ from the age of sixteen.',
            ],
          },
          {
            title: 'Model Junior High School of Evangeliki, Nea Smyrni',
            meta: '2011 – 2015',
            bullets: [
              'Ranked 1st in the entrance exam to one of only four public Model schools in Greece.',
              'First of the class every year, with the prize of excellence; class president and representative of the school.',
              'After-school programming in Pascal, astronomy and robotics; captain of the chess team.',
              'Placings in mathematics, programming and literature contests.',
            ],
          },
          {
            title: 'Elementary school',
            meta: 'Chess and basketball captain',
            bullets: [
              '1st place in the city chess tournament; 3rd in the local basketball tournament.',
            ],
          },
        ],
      },
    ],
  },
]

/** The one honour the elementary years get: his first teacher, and two cups. */
export const ELEMENTARY_SECTIONS: PanelSection[] = [
  {
    heading: 'Elementary school',
    blocks: [
      {
        type: 'quote',
        text: 'A charismatic child with a good heart, always doing his homework and always participating. He will have a bright future. (Ms. Maria, his first teacher)',
      },
      {
        type: 'list',
        items: [
          'Captain of the school chess team, 1st place in the city tournament.',
          'Captain of the school basketball team for two years, 3rd in the local tournament.',
        ],
      },
    ],
  },
]

export const IONIDIOS_SECTIONS: PanelSection[] = [
  {
    heading: 'Model High School of Ionidios, Piraeus',
    blocks: [
      {
        type: 'text',
        text: 'The oldest school in Piraeus, founded in 1847, and one of the four public Model schools in Greece. Evangeliki, which he had just left, is another. Another entrance exam, and he ranked 1st in it again.',
      },
      {
        type: 'stats',
        stats: [
          { label: 'Founded', value: '1847' },
          { label: 'Entrance exam', value: '1st' },
          { label: 'Graduating grade', value: '19.9 / 20' },
          { label: 'Excellence award', value: 'Every year' },
        ],
      },
    ],
  },
  {
    heading: 'Honours',
    blocks: [
      {
        type: 'list',
        items: [
          'The excellence award in every year.',
          'The Piraeus prize for the top graduating grade of the year, on leaving in 2017 with 19.9 out of 20.',
          'First in performance in his class, year after year. His biology teacher put it in writing.',
        ],
      },
    ],
  },
  {
    heading: 'Contests and the bench',
    blocks: [
      {
        type: 'list',
        items: [
          '2nd among about 1,650 entrants in the Panhellenic Biology Competition, 2016.',
          'Notable awards in Mathematics and Programming.',
          'Captain of the school’s EUSO team, the European Union Science Olympiad, where three students share one bench of experiments.',
          'Summer School of the University of Piraeus, on his informatics teacher’s recommendation, and C++ on his own from the age of sixteen.',
        ],
      },
    ],
  },
]

export const EVANGELIKI_SECTIONS: PanelSection[] = [
  {
    heading: 'Model Junior High School of Evangeliki, Nea Smyrni',
    blocks: [
      {
        type: 'text',
        text: 'A historic school, founded in 1733, and one of only four public Model schools in the whole of Greece: you sit an entrance exam to get in. He ranked 1st.',
      },
      {
        type: 'stats',
        stats: [
          { label: 'Founded', value: '1733' },
          { label: 'Public Model schools in Greece', value: '4' },
          { label: 'Entrance exam', value: '1st' },
          { label: 'Prize of excellence', value: 'Every year' },
        ],
      },
    ],
  },
  {
    heading: 'First of the class',
    blocks: [
      {
        type: 'list',
        items: [
          'First student of the class in every year, taking the prize of excellence each time.',
          'Class president for a year, and representative of the school.',
          'Closed the presidency with a fifteen-page report to the principal on what the class had achieved, and returned every unspent cent of the class funds, as the law required and nobody expected.',
        ],
      },
    ],
  },
  {
    heading: 'Contests',
    blocks: [
      {
        type: 'list',
        items: [
          'Notable placings in Mathematics and Programming competitions.',
          '2nd prize in two school literature contests.',
          '7th prize in an open literature contest, the only entrant under eighteen to place.',
        ],
      },
    ],
  },
]

export const EVANGELIKI_CLUBS_SECTIONS: PanelSection[] = [
  {
    heading: 'The extra classes',
    blocks: [
      {
        type: 'text',
        text: 'A Model school keeps going after the timetable ends. He took four of the extra classes, and the habit never left him.',
      },
      {
        type: 'timeline',
        entries: [
          {
            title: 'Programming, in Pascal',
            meta: 'From the age of 13',
            bullets: [
              'Every extra exercise set, and then small games of his own, with graphics.',
            ],
          },
          {
            title: 'Astronomy',
            meta: 'After-school class',
            bullets: [
              'Built a sundial and a small planetarium, both to correct scale.',
            ],
          },
          {
            title: 'Robotics',
            meta: 'After-school class',
            bullets: [
              'The class built a submarine drone.',
              'On his own: a proof-of-concept electric bicycle running on 12 V.',
            ],
          },
          {
            title: 'Chess team',
            meta: 'Captain',
            bullets: ['Led the school team, as he had in elementary school.'],
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
              'Appointed by the foundation’s council after years as a volunteer, while finishing the degree. The Vice-President approached him directly to fill the vacancy.',
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
          'Leading volunteer at the same foundation, 2017–2021 and 2023 to today',
          'Children’s tutor in Robotics at Citylab, Alimos, 2020–2021',
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
        text: 'The Radio Center broadcasts on three frequencies. Pick one and the message goes straight to me, with no operator in between.',
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
        text: 'Senior full-stack engineer and technical lead with a track record of taking healthcare products from concept to production. Java and Spring Boot on the backend, React on the front, AWS underneath, and teams of 5–10 engineers across three countries shipping weekly into U.S. hospitals under HIPAA.',
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
          'Owning a system end to end (schema, service, API, UI, pipeline, dashboard) instead of one slice of it.',
          'Taking a legacy codebase nobody wants to touch and making it shippable again, in increments, without a rewrite.',
          'Leading engineers across time zones: reviews that teach, sprints that finish, decisions that are written down.',
          'Working where correctness is not negotiable: healthcare data, HIPAA, audit trails, Epic and FHIR integrations.',
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
        text: 'A big family is a small organisation. Nobody hands you a role. You find the thing that needs doing and you do it, because if you wait for somebody else the thing does not get done. That is the whole of it, and I have not found a team since where it was not also true.',
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
          'Wood, mostly: shelving, tables, whatever the flat needs',
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
        text: 'A mini server in the corner running Linux, and enough electronics on the bench to make something blink by the end of an evening. It is not a showpiece. It is where I try the thing before I trust it at work.',
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
        text: 'Not many books, and none of them here by accident. These are the ones I have gone back to. Verne is on the shelf across the room, where he has always been.',
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
              'The twenty thousand leagues are how far the Nautilus travels, not how deep she goes, which everybody gets wrong, and which is the sort of detail I have never been able to leave alone.',
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

/**
 * The shelf of toys in the library, close up. The text is only the frame —
 * the shelf itself is drawn under it by the panel, and one of the toys on it
 * does something.
 */
export const TOY_SHELF_SECTIONS: PanelSection[] = [
  {
    heading: 'The shelf of toys',
    blocks: [
      {
        type: 'text',
        text: 'Four boards of things nobody ever put away. Most of it has not moved in twenty years.',
      },
      {
        type: 'text',
        text: 'Pick things up. Nothing on this shelf minds being handled.',
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
          'Star Wars, the whole thing, arguments about the ordering included',
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

/**
 * The globe in the corner of the Evangeliki classroom, which is the one thing
 * in that room he ever spun instead of read. Six countries on it have been
 * stood in rather than pointed at, and that is the whole of what the panel
 * says: a list, not an itinerary.
 */
export const GLOBE_SECTIONS: PanelSection[] = [
  {
    heading: 'Where the globe has been stopped',
    blocks: [
      {
        type: 'text',
        text: 'The astronomy corner had a globe, and a boy who spun it more than he studied it. Six of the countries on it he has since stood in.',
      },
      {
        type: 'flags',
        countries: [
          { code: 'gr', name: 'Greece' },
          { code: 'cy', name: 'Cyprus' },
          { code: 'de', name: 'Germany' },
          { code: 'fr', name: 'France' },
          { code: 'it', name: 'Italy' },
          { code: 'ch', name: 'Switzerland' },
        ],
      },
    ],
  },
]
