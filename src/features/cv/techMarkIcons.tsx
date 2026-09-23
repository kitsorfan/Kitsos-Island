import type { ReactNode } from 'react'

/**
 * The marks themselves, and the question of which tags have one.
 *
 * Kept apart from the component that draws them so that TechIcon.tsx exports
 * a component and nothing else: a file mixing the two loses fast refresh for
 * all of it, and these are seven hundred lines of drawing that one would
 * rather not reload by hand while working on a panel.
 *
 * Same rule as `Flag.tsx` and the wall in `TechMarks.tsx`: drawn in code out
 * of the shape each technology is *known* by — the steaming cup, the leaf, the
 * whale, the dolphin, the llama — never a copy of anybody's registered
 * artwork, and never a file to fetch. A chip is about fourteen pixels of
 * icon, so each mark is two or three shapes and no more; anything finer is
 * mud at that size.
 *
 * Keyed by the tag's own English text, because that is what the CV data
 * carries. A tag with no mark simply renders without one, so the list can grow
 * without this file having to keep up.
 */

/** Whether a chip has a mark, so the chip can reserve the space only if so. */
export function hasTechIcon(name: string) {
  return name in MARKS
}

/* ------------------------------ the marks ----------------------------- */

/** The Java cup: three curls of steam over a blue cup. */
const java = (
  <>
    <g stroke="#e8763a" strokeWidth="1.5" strokeLinecap="round" fill="none">
      <path d="M9 10c1.2-1 -1.2-2 0-3.5" />
      <path d="M12 10c1.2-1 -1.2-2 0-4" />
      <path d="M15 10c1.2-1 -1.2-2 0-3.5" />
    </g>
    <path d="M6.5 12h11v3a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4z" fill="#3d6a8f" />
    <path
      d="M17.5 12.5h1a2 2 0 0 1 0 4h-1"
      fill="none"
      stroke="#3d6a8f"
      strokeWidth="1.4"
    />
  </>
)

/** Spring: the leaf, curled the way the seedling is. */
const springLeaf = (
  <>
    <path
      d="M19 5c0 8-4 13-9.5 14C6 19.6 4 17 4 14 4 9 9 6 19 5z"
      fill="#6db33f"
    />
    <path
      d="M16 8c-4 2-7 5-8.5 9"
      fill="none"
      stroke="#f7f4ea"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </>
)

/** Spring AI: the leaf with a spark thrown off it. */
const springAi = (
  <>
    <path
      d="M17 6c0 7.5-3.8 12.2-9 13.2C4.9 18.8 3.2 16.4 3.2 13.6 3.2 9 7.8 6.4 17 5.6z"
      fill="#6db33f"
    />
    <path
      d="M19 3.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"
      fill="#f0a33a"
    />
  </>
)

/** Spring Security: the leaf tucked behind a shield. */
const springSecurity = (
  <>
    <path
      d="M15.5 5.5c0 6-3 9.8-7.2 10.6C5.6 15.7 4 13.8 4 11.6 4 8 7.7 5.9 15.5 5.2z"
      fill="#6db33f"
    />
    <path
      d="M15 8l5 1.7v4.1c0 3-2.2 5.4-5 6.2-2.8-.8-5-3.2-5-6.2V9.7z"
      fill="#4a7a2c"
    />
    <path
      d="M12.6 14.2l1.7 1.7 3.2-3.4"
      fill="none"
      stroke="#f7f4ea"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)

/** Spring Data JPA: the leaf over a stack of database rings. */
const springData = (
  <>
    <path
      d="M15.5 4c0 5.4-2.7 8.8-6.6 9.6C6.3 13.2 5 11.5 5 9.6 5 6.4 8.4 4.6 15.5 4z"
      fill="#6db33f"
    />
    <g fill="#3d6a8f">
      <ellipse cx="14.5" cy="13.5" rx="6" ry="2.2" />
      <path d="M8.5 14.4v4.4c0 1.2 2.7 2.2 6 2.2s6-1 6-2.2v-4.4c0 1.2-2.7 2.2-6 2.2s-6-1-6-2.2z" />
    </g>
  </>
)

/** Hibernate: the wing, the way the bird's is. */
const hibernate = (
  <>
    <path
      d="M4 15c3-7 8.5-11 16-11.5-1 6-4 10-8 12-2.6 1.3-5.4 1.2-8-.5z"
      fill="#bcae79"
    />
    <path
      d="M7 14.5c3.5-3.5 7-5.8 11-7"
      fill="none"
      stroke="#59534a"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </>
)

/** REST: the two arrows of a round trip. */
const rest = (
  <g
    fill="none"
    stroke="#3d7a8f"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 8.5h13" />
    <path d="M14 5.5l3 3-3 3" />
    <path d="M20 15.5H7" />
    <path d="M10 12.5l-3 3 3 3" />
  </g>
)

/** Microservices: the hub and the three boxes round it. */
const microservices = (
  <>
    <g stroke="#8a7fb0" strokeWidth="1.5">
      <path d="M12 12L6 6M12 12l6-6M12 12v7" />
    </g>
    <circle cx="12" cy="12" r="2.6" fill="#5b4b8a" />
    <g fill="#8a7fb0">
      <rect x="3" y="3" width="5" height="5" rx="1.4" />
      <rect x="16" y="3" width="5" height="5" rx="1.4" />
      <rect x="9.5" y="17.5" width="5" height="5" rx="1.4" />
    </g>
  </>
)

/** RAG: a page fed into the reading eye. */
const rag = (
  <>
    <path
      d="M4 3.5h8.5L16 7v6.5H4z"
      fill="#f3ecd8"
      stroke="#8a7a52"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <g stroke="#8a7a52" strokeWidth="1.2" strokeLinecap="round">
      <path d="M6.5 7h4M6.5 9.5h6M6.5 12h5" />
    </g>
    <path
      d="M9 17.5c2.2-3 7.8-3 10 0-2.2 3-7.8 3-10 0z"
      fill="#f7f4ea"
      stroke="#3d6a8f"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="14" cy="17.5" r="1.7" fill="#3d6a8f" />
  </>
)

/** Agentic AI: the little robot that goes off and does it. */
const agentic = (
  <>
    <path
      d="M12 2.5v2"
      stroke="#5b4b8a"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <circle cx="12" cy="2.2" r="1.4" fill="#f0a33a" />
    <rect x="4" y="5" width="16" height="11" rx="3.5" fill="#5b4b8a" />
    <g fill="#f7f4ea">
      <circle cx="8.8" cy="10" r="1.7" />
      <circle cx="15.2" cy="10" r="1.7" />
    </g>
    <path
      d="M9.5 13.5h5"
      stroke="#f7f4ea"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <g fill="#5b4b8a">
      <rect x="6.5" y="17" width="4" height="4.5" rx="1.2" />
      <rect x="13.5" y="17" width="4" height="4.5" rx="1.2" />
    </g>
  </>
)

/** Ollama: the llama, seen side on — the shape the name is drawn by. */
const ollama = (
  <>
    {/* The body, deep enough to read as an animal and not a post. */}
    <ellipse cx="13.5" cy="13.8" rx="7" ry="4.4" fill="#4a4a4a" />
    {/* Neck and head, up and to the left. */}
    <path
      d="M7.8 13.2c-1.2-2.4-1.9-4.6-2-6.6l3.6-.4c.1 1.6.6 3.3 1.5 4.9z"
      fill="#4a4a4a"
    />
    <path
      d="M5.8 4.2c1.8-.5 3.5.3 3.8 2l.2 1.4-4.2.5-.5-1.7c-.2-1 .1-1.8.7-2.2z"
      fill="#4a4a4a"
    />
    {/* Ears. */}
    <path d="M5.6 4.4l-.8-3 1.9 2.2z" fill="#4a4a4a" />
    <path d="M8.2 3.9l.6-3 .9 2.8z" fill="#4a4a4a" />
    {/* Eye, big enough to survive the shrink. */}
    <circle cx="7" cy="6" r="0.95" fill="#f7f4ea" />
    {/* Legs. */}
    <g fill="#4a4a4a">
      <rect x="8.6" y="16.4" width="2.2" height="5.4" rx="1.1" />
      <rect x="16.4" y="16.4" width="2.2" height="5.4" rx="1.1" />
    </g>
    {/* Tail. */}
    <path d="M20.4 11.4c1.4-.5 2.3.2 2.2 1.5l-2.2.5z" fill="#4a4a4a" />
  </>
)

/** Vector search: the arrow struck through the scatter. */
const vectorSearch = (
  <>
    <g fill="#b9b0cd">
      <circle cx="5" cy="17" r="1.6" />
      <circle cx="6" cy="8" r="1.6" />
      <circle cx="12" cy="18.5" r="1.6" />
      <circle cx="17" cy="6" r="1.6" />
    </g>
    <path
      d="M4.5 19.5L19 5"
      stroke="#5b4b8a"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M14.5 5h5v5"
      fill="none"
      stroke="#5b4b8a"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)

/** LLM tooling: the spanner across the token blocks. */
const llmTooling = (
  <>
    <g fill="#8a7fb0">
      <rect x="2.5" y="4" width="6" height="6" rx="1.6" />
      <rect x="10" y="4" width="6" height="6" rx="1.6" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.6" />
    </g>
    <path
      d="M20.8 11.6a3.6 3.6 0 0 1-4.9 4.3l-3 3a1.7 1.7 0 0 1-2.4-2.4l3-3a3.6 3.6 0 0 1 4.3-4.9l-2 2 1.5 2.5 2.5 1.5z"
      fill="#5b4b8a"
    />
  </>
)

/** Neural networks: the three-layer net. */
const neural = (
  <>
    <g stroke="#8a7fb0" strokeWidth="1.1">
      <path d="M5 6.5L12 6.5M5 6.5L12 17.5M5 17.5L12 6.5M5 17.5L12 17.5M12 6.5L19 12M12 17.5L19 12" />
    </g>
    <g fill="#5b4b8a">
      <circle cx="5" cy="6.5" r="2.2" />
      <circle cx="5" cy="17.5" r="2.2" />
      <circle cx="12" cy="6.5" r="2.2" />
      <circle cx="12" cy="17.5" r="2.2" />
      <circle cx="19" cy="12" r="2.2" />
    </g>
  </>
)

/** Pose estimation: the stick figure with its joints marked. */
const pose = (
  <>
    <circle cx="12" cy="4.2" r="2.4" fill="#5b4b8a" />
    <g stroke="#5b4b8a" strokeWidth="1.6" strokeLinecap="round" fill="none">
      <path d="M12 7v6" />
      <path d="M12 8.5L6.5 11M12 8.5L17.5 11" />
      <path d="M12 13l-3.5 7M12 13l3.5 7" />
    </g>
    <g fill="#f0a33a">
      <circle cx="6.5" cy="11" r="1.5" />
      <circle cx="17.5" cy="11" r="1.5" />
      <circle cx="8.5" cy="20" r="1.5" />
      <circle cx="15.5" cy="20" r="1.5" />
    </g>
  </>
)

/** React: the nucleus in its three orbits. */
const react = (
  <>
    <g
      fill="none"
      stroke="#4fb3c8"
      strokeWidth="1.3"
      transform="translate(12 12)"
    >
      <ellipse rx="10" ry="3.8" />
      <ellipse rx="10" ry="3.8" transform="rotate(60)" />
      <ellipse rx="10" ry="3.8" transform="rotate(120)" />
    </g>
    <circle cx="12" cy="12" r="2.1" fill="#4fb3c8" />
  </>
)

/** TypeScript: the lettered tile. */
const typescript = (
  <>
    <rect x="2.5" y="2.5" width="19" height="19" rx="3" fill="#3d7ab8" />
    <text
      x="12"
      y="13.2"
      textAnchor="middle"
      dominantBaseline="middle"
      fill="#f7f4ea"
      fontSize="11"
      fontWeight="800"
      fontFamily='"Baloo 2", "Trebuchet MS", system-ui, sans-serif'
    >
      TS
    </text>
  </>
)

/** Angular: the shield with the A cut into it. */
const angular = (
  <>
    <path d="M12 2.2l9 3.2-1.4 12L12 21.8 4.4 17.4 3 5.4z" fill="#c0364a" />
    <path
      d="M12 6l4.4 11h-1.9l-.9-2.4H10.4L9.5 17H7.6zM12 9.3l-1.1 3.1h2.2z"
      fill="#f7f4ea"
    />
  </>
)

/** Tailwind: the two stacked waves. */
const tailwind = (
  <g fill="#38bdc8">
    <path d="M7.5 6.5c1.4-3.2 3.6-4.2 6.5-3 1.7.7 2.5 1.9 3.2 2.9.7 1 1.2 1.8 2.3 1.8.9 0 1.4-.4 2-1.3-1.4 3.2-3.6 4.2-6.5 3-1.7-.7-2.5-1.9-3.2-2.9-.7-1-1.2-1.8-2.3-1.8-.9 0-1.4.4-2 1.3z" />
    <path d="M2.5 13.5c1.4-3.2 3.6-4.2 6.5-3 1.7.7 2.5 1.9 3.2 2.9.7 1 1.2 1.8 2.3 1.8.9 0 1.4-.4 2-1.3-1.4 3.2-3.6 4.2-6.5 3-1.7-.7-2.5-1.9-3.2-2.9-.7-1-1.2-1.8-2.3-1.8-.9 0-1.4.4-2 1.3z" />
  </g>
)

/** HTML and CSS: the bracket tag. */
const markup = (
  <g
    fill="none"
    stroke="#c9713a"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 7.5L3.5 12 8 16.5" />
    <path d="M16 7.5L20.5 12 16 16.5" />
    <path d="M13.5 5l-3 14" />
  </g>
)

/** MySQL: the dolphin over the database rings. */
const mysql = (
  <>
    <path
      d="M3 9.5c3.5-.3 6 .8 8 3 .4-1.6 1.3-2.7 2.8-3.4-.6 1.4-.6 2.6 0 3.7.9-.3 1.8-.2 2.7.3-1.1.2-1.8.7-2.2 1.6 2.3 1 4.1.7 5.7-.6-.6 2.3-2.4 3.6-5.2 3.7-2.9.1-5.1-1.2-6.7-3.6C6.6 12 5 10.4 3 9.5z"
      fill="#3d7a8f"
    />
    <g fill="#f0a33a">
      <ellipse cx="17" cy="5.5" rx="4.5" ry="1.6" />
      <path d="M12.5 6.2v2.4c0 .9 2 1.6 4.5 1.6s4.5-.7 4.5-1.6V6.2c0 .9-2 1.6-4.5 1.6s-4.5-.7-4.5-1.6z" />
    </g>
  </>
)

/** Flyway: the paper plane over the migration steps. */
const flyway = (
  <>
    <g fill="#c0364a">
      <rect x="2.5" y="17" width="5" height="4.5" rx="1" />
      <rect x="8.5" y="14" width="5" height="7.5" rx="1" />
      <rect x="14.5" y="11" width="5" height="10.5" rx="1" />
    </g>
    <path d="M21.5 2.5L3.5 8.2l6.4 2.3 2 3.9z" fill="#3d7a8f" />
    <path d="M9.9 10.5l11.6-8-9.6 11.9z" fill="#2b5468" />
  </>
)

/** AWS: the smile under the cloud. */
const aws = (
  <>
    <path
      d="M6.8 11.5a3.6 3.6 0 0 1 .4-1.7 4.6 4.6 0 0 1 8.8.7 3.3 3.3 0 0 1 .3 6.5H7.2a3.3 3.3 0 0 1-.4-5.5z"
      fill="#3d5a7a"
    />
    <path
      d="M3 19.5c5.6 3 12.4 3 18 0"
      fill="none"
      stroke="#f0a33a"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </>
)

/** Docker: the whale with the containers on its back. */
const docker = (
  <>
    <g fill="#3d7ab8">
      <rect x="4.5" y="10" width="3.3" height="3.2" rx="0.5" />
      <rect x="8.4" y="10" width="3.3" height="3.2" rx="0.5" />
      <rect x="12.3" y="10" width="3.3" height="3.2" rx="0.5" />
      <rect x="8.4" y="6.4" width="3.3" height="3.2" rx="0.5" />
      <rect x="12.3" y="6.4" width="3.3" height="3.2" rx="0.5" />
      <rect x="12.3" y="2.8" width="3.3" height="3.2" rx="0.5" />
    </g>
    <path
      d="M2 14.2h17.4c.6-1 .8-2 .7-3 1.4.5 2.2 1.4 2.4 2.7-1 .6-2 .8-3 .6-.8 3.5-3.3 5.3-7.5 5.3-5 0-8.3-1.9-10-5.6z"
      fill="#2b5e96"
    />
  </>
)

/** Docker Compose: the whale's boxes, roped together. */
const compose = (
  <>
    <g fill="#3d7ab8">
      <rect x="3" y="4" width="7" height="6" rx="1.4" />
      <rect x="14" y="4" width="7" height="6" rx="1.4" />
      <rect x="8.5" y="15" width="7" height="6" rx="1.4" />
    </g>
    <g fill="none" stroke="#2b5e96" strokeWidth="1.5" strokeLinecap="round">
      <path d="M10 7h4" />
      <path d="M6.5 10v2.5h11V10" />
      <path d="M12 12.5V15" />
    </g>
  </>
)

/** Jenkins: the butler, hat and bow tie. */
const jenkins = (
  <>
    <path d="M5.5 7.5c0-3 2.9-5 6.5-5s6.5 2 6.5 5z" fill="#3d3a44" />
    <circle cx="12" cy="11" r="4.6" fill="#f2d3b8" />
    <g fill="#3d3a44">
      <circle cx="10.2" cy="10.5" r="0.9" />
      <circle cx="13.8" cy="10.5" r="0.9" />
    </g>
    <path
      d="M12 16.5l-5.5 2.2v2.8h11v-2.8z"
      fill="#f7f4ea"
      stroke="#b8b2a4"
      strokeWidth="0.8"
    />
    <path d="M12 16.8l2.6 1.8-2.6 1.6-2.6-1.6z" fill="#c0364a" />
  </>
)

/** GitLab CI: the fox-mask chevron. */
const gitlab = (
  <path d="M12 21.5L4.2 9.8l1.6-6 2.7 6h7l2.7-6 1.6 6z" fill="#d6622e" />
)

/** Bitbucket Pipelines: the bucket, tapered. */
const bitbucket = (
  <>
    <path
      d="M2.8 4.2h18.4l-3 15.4c-.1.6-.7 1-1.3 1H7.1c-.6 0-1.2-.4-1.3-1z"
      fill="#3d7ab8"
    />
    <path d="M8.6 9h6.8l-1 5.6H9.6z" fill="#f7f4ea" />
  </>
)

/** Git: the commit and its branch. */
const git = (
  <>
    <g stroke="#d6622e" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 4.5v15" />
      <path d="M6 11h6.5a3 3 0 0 0 3-3V6.5" />
    </g>
    <g fill="#d6622e">
      <circle cx="6" cy="4.5" r="2.4" />
      <circle cx="6" cy="19.5" r="2.4" />
      <circle cx="15.5" cy="5.5" r="2.4" />
    </g>
  </>
)

/** Grafana: the flame over the axis. */
const grafana = (
  <>
    <path
      d="M12 2.5c.6 2.6 2.2 3.5 3.6 5 1.5 1.6 2.4 3.3 2.4 5.4 0 3.6-2.7 6.1-6 6.1s-6-2.5-6-6.1c0-2.7 1.5-4 2.4-5.8.5 1 1.1 1.6 2 2C10 6.9 10.6 4.6 12 2.5z"
      fill="#f0a33a"
    />
    <path
      d="M12 10.5c1.2 1.7 2 2.7 2 4.2a2 2 0 1 1-4 0c0-1.5.8-2.5 2-4.2z"
      fill="#f7f4ea"
    />
  </>
)

/** Graylog: the log lines, one flagged. */
const graylog = (
  <>
    <rect x="3" y="3.5" width="18" height="17" rx="2.6" fill="#3d3a44" />
    <g stroke="#9aa3a8" strokeWidth="1.4" strokeLinecap="round">
      <path d="M6.5 8h11M6.5 11.5h8" />
    </g>
    <path
      d="M6.5 15h7"
      stroke="#f0a33a"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </>
)

/** Sentry: the crest of the wave inside the crest. */
const sentry = (
  <path
    d="M12 3.2c.7 0 1.3.4 1.7 1l7.6 13.2c.7 1.2-.2 2.6-1.6 2.6h-3.2c.1-3.9-1.8-7.4-5-9.4l-2 3.4c1.9 1.2 3.1 3.3 3.2 6H8.3c-.1-1.6-.9-3-2.1-3.8l2-3.5c-2 1.4-3.2 3.9-3.3 7.3H3.4c-1.4 0-2.3-1.4-1.6-2.6L10.3 4.2c.4-.6 1-1 1.7-1z"
    fill="#5b4b8a"
  />
)

/** JUnit: the tick in the round. */
const junit = (
  <>
    <circle cx="12" cy="12" r="9.2" fill="#4a8a4a" />
    <path
      d="M7.5 12.4l3 3 6-6.4"
      fill="none"
      stroke="#f7f4ea"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)

/** Mockito: the stand-in — a masked double. */
const mockito = (
  <>
    <circle cx="12" cy="12" r="9.2" fill="#8a7fb0" />
    <path
      d="M3.6 10.5h16.8c-.4 3-2.4 4.8-4.6 4.8-1.6 0-2.9-.9-3.8-2.2-.9 1.3-2.2 2.2-3.8 2.2-2.2 0-4.2-1.8-4.6-4.8z"
      fill="#f7f4ea"
    />
  </>
)

/** Vitest: the bolt, which is the whole point of it. */
const vitest = (
  <>
    <path
      d="M13.6 2.2L5.4 13.4h5.1l-1.1 8.4 8.2-11.2h-5.1z"
      fill="#f0a33a"
      stroke="#c97f1e"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
  </>
)

/** JaCoCo: the coverage ring, most of the way round. */
const jacoco = (
  <>
    <circle
      cx="12"
      cy="12"
      r="7.6"
      fill="none"
      stroke="#d8d2c4"
      strokeWidth="3.4"
    />
    <path
      d="M12 4.4a7.6 7.6 0 1 1-5.4 12.9"
      fill="none"
      stroke="#4a8a4a"
      strokeWidth="3.4"
      strokeLinecap="round"
    />
  </>
)

/** Twilio: the four dots in the round, which is the mark it goes by. */
const twilio = (
  <>
    <circle cx="12" cy="12" r="9.4" fill="#d6294a" />
    <circle cx="12" cy="12" r="6.1" fill="#f7f4ea" />
    <g fill="#d6294a">
      <circle cx="9.8" cy="9.8" r="1.7" />
      <circle cx="14.2" cy="9.8" r="1.7" />
      <circle cx="9.8" cy="14.2" r="1.7" />
      <circle cx="14.2" cy="14.2" r="1.7" />
    </g>
  </>
)

/** Jira: the two chevrons, one nested inside the other. */
const jira = (
  <>
    <path d="M12 1.6l9.4 9.4-4.7 4.7L12 11z" fill="#3d7ab8" />
    <path d="M12 7.3l4.7 4.7L12 22.4 2.6 13z" fill="#5b96d6" />
  </>
)

/** Microsoft Teams: the T on its rounded tile, with a head beside it. */
const teams = (
  <>
    <circle cx="18.4" cy="6.6" r="3" fill="#7b83d6" />
    <path
      d="M16 11h6.2c.5 0 .8.4.8.9v3.7a3.6 3.6 0 0 1-7 1.2z"
      fill="#7b83d6"
    />
    <rect x="1.5" y="4.6" width="14" height="14.8" rx="2.4" fill="#5058b0" />
    <path
      d="M4.6 8.4h7.8"
      stroke="#f7f4ea"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M8.5 8.8v7"
      stroke="#f7f4ea"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </>
)

/** SMART on FHIR: the flame of the standard. */
const fhir = (
  <>
    <path
      d="M13.5 2.2c.4 3 3.5 4.5 3.5 8.3 0 1.7-.7 3.2-1.8 4.2.5-2.6-.6-4.4-2.3-5.6.3 2.8-.9 4.6-2.4 5.8.2-1.6-.3-2.8-1.3-3.6-.8 1-1.4 2.3-1.4 3.8 0 3.4 2.7 5.6 6.1 5.6s6.1-2.6 6.1-6.2c0-5.2-4.4-7.4-6.5-12.3z"
      fill="#c0364a"
    />
    <path
      d="M4.5 12.5h3l1.2-2.6 1.6 5 1.3-2.4h2"
      fill="none"
      stroke="#3d7a8f"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)

/** Epic EHR: the chart on the clipboard. */
const epic = (
  <>
    <rect x="4" y="3.5" width="16" height="17.5" rx="2.4" fill="#5b4b8a" />
    <rect x="8.5" y="1.8" width="7" height="3.6" rx="1.2" fill="#3d3a44" />
    <path
      d="M7 14h2.4l1.2-3.4 1.8 6 1.4-3.4H17"
      fill="none"
      stroke="#f7f4ea"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)

/** UKG: the rota — people against a calendar. */
const ukg = (
  <>
    <rect x="2.5" y="4.5" width="19" height="16" rx="2.4" fill="#3d7a8f" />
    <path d="M2.5 8.5h19" stroke="#f7f4ea" strokeWidth="1.3" />
    <g fill="#f7f4ea">
      <circle cx="8.5" cy="13" r="2" />
      <path d="M5 19c0-1.9 1.6-3.2 3.5-3.2s3.5 1.3 3.5 3.2z" />
      <circle cx="15.5" cy="13" r="2" />
      <path d="M12 19c0-1.9 1.6-3.2 3.5-3.2s3.5 1.3 3.5 3.2z" />
    </g>
  </>
)

/** SSO: the key through the ring. */
const sso = (
  <>
    <circle
      cx="7.5"
      cy="12"
      r="4.2"
      fill="none"
      stroke="#f0a33a"
      strokeWidth="2.2"
    />
    <path
      d="M11.7 12H21"
      stroke="#f0a33a"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <g stroke="#f0a33a" strokeWidth="2.2" strokeLinecap="round">
      <path d="M17 12v3.2" />
      <path d="M20 12v2.4" />
    </g>
  </>
)

/** HIPAA: the seal on the shield. */
const hipaa = (
  <>
    <path
      d="M12 2.2l8 2.8v6.4c0 4.7-3.3 8.6-8 10.4-4.7-1.8-8-5.7-8-10.4V5z"
      fill="#3d5a7a"
    />
    <path
      d="M12 7.5a3 3 0 0 1 3 3v1.2h.6v4.6H8.4v-4.6H9V10.5a3 3 0 0 1 3-3zm0 1.7a1.3 1.3 0 0 0-1.3 1.3v1.2h2.6v-1.2A1.3 1.3 0 0 0 12 9.2z"
      fill="#f7f4ea"
    />
  </>
)

/** reCAPTCHA: the tick inside the arrows. */
const recaptcha = (
  <>
    <path
      d="M12 3.2a8.8 8.8 0 0 1 7.3 3.9V3.5l1.6 4.6-4.8.7 2-2A7.1 7.1 0 0 0 12 4.9zM4.7 15a7.1 7.1 0 0 0 10 3.8l1 1.6A8.8 8.8 0 0 1 3.4 15.6l-2.2 1.1 3.5-3.4 2.2 4.3z"
      fill="#3d7a8f"
    />
    <path
      d="M8 12.2l2.8 2.8 5.4-5.6"
      fill="none"
      stroke="#4a8a4a"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
)

/**
 * Every tag that has a mark, by the text the CV carries. Several tags share a
 * mark where they are the same family — the Spring ones, the AWS services,
 * HTML and CSS — because the chip already says which one it is; the mark is
 * there to be recognised at a glance, not to name it a second time.
 */
export const MARKS: Record<string, ReactNode> = {
  /* Core */
  Java: java,
  'Java 17–25': java,
  'Java 17-25': java,
  'Spring Boot': springLeaf,
  'Spring Framework': springLeaf,
  Spring: springLeaf,
  'Spring Security': springSecurity,
  'Spring Data JPA': springData,
  Hibernate: hibernate,
  'REST APIs': rest,
  Microservices: microservices,

  /* AI */
  'Spring AI': springAi,
  Ollama: ollama,
  RAG: rag,
  'Agentic AI': agentic,
  'Vector search': vectorSearch,
  'LLM tooling': llmTooling,
  'Artificial neural networks': neural,
  'Pose estimation': pose,

  /* Front */
  React: react,
  'React Native': react,
  TypeScript: typescript,
  JavaScript: typescript,
  Angular: angular,
  'Tailwind CSS': tailwind,
  Tailwind: tailwind,
  HTML: markup,
  CSS: markup,

  /* Data */
  MySQL: mysql,
  Flyway: flyway,

  /* Cloud */
  'AWS EC2': aws,
  'AWS S3': aws,
  'AWS SES': aws,
  'AWS SNS': aws,
  AWS: aws,
  'AWS (EC2, S3, SES, SNS)': aws,
  Docker: docker,
  'Docker Compose': compose,

  /* Delivery */
  Jenkins: jenkins,
  'GitLab CI': gitlab,
  'Bitbucket Pipelines': bitbucket,
  Git: git,

  /* Watching it */
  Grafana: grafana,
  Graylog: graylog,
  'ELK Stack': graylog,
  Sentry: sentry,

  /* Proving it */
  JUnit: junit,
  Mockito: mockito,
  JaCoCo: jacoco,
  Vitest: vitest,

  /* Hospital side */
  'Microsoft Teams': teams,
  Jira: jira,
  Twilio: twilio,
  'SMART on FHIR': fhir,
  'Epic EHR': epic,
  UKG: ukg,
  'SAML 2.0 SSO': sso,
  'Microsoft ADFS': sso,
  JWT: sso,
  HIPAA: hipaa,
  reCAPTCHA: recaptcha,
}
