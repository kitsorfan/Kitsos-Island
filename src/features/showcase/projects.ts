import type { Exhibit, PanelSection, Vec2 } from '../../types'

/**
 * The side projects, on the ground floor of the Work District.
 *
 * The floors above are the day job, an employer apiece. The ground floor is
 * what he can do, and these are the proof of it that nobody paid for: a row
 * of screens in the lobby, one per project, each showing the thing running.
 * Walking up to one opens its card, and the card hands over the real thing —
 * the live demo and the source — rather than a description of it.
 *
 * Adding a project is one entry in PROJECTS and one screenshot in
 * public/projects/. The row grows sideways from its middle, and the tests
 * say so if it has grown into the furniture or across somebody's spot.
 */

/** One way out to the project itself, on a button. */
export interface ProjectLink {
  label: string
  href: string
  /** The one to press first: drawn as the main button, and the screenshot opens it too. */
  primary?: boolean
}

export interface Project {
  id: string
  /** As the project calls itself, on its screen, the prompt and the card. */
  name: string
  /** The line over the name on the card. */
  kicker: string
  /**
   * A 16:9 screenshot in public/projects/, shown on the screen and at the top
   * of the card. Without it the screen draws the name instead, so the stand
   * still renders.
   */
  image: string
  /** Whose pictures are on the screenshot, when they are not his. */
  credit?: string
  links: ProjectLink[]
  sections: PanelSection[]
  journal: { title: string; body: string }
}

export const PROJECTS: Project[] = [
  {
    id: 'dental-cbct-viewer',
    name: 'Dental CBCT Viewer',
    kicker: 'Side project · 2026',
    image: 'dental-cbct-viewer.jpg',
    credit:
      'On screen: an anonymised public CBCT, case K01 by Feng L, Li Z, Gu Q, Wang Y and Yu X, Science Data Bank, CC BY 4.0.',
    links: [
      {
        label: 'Open the viewer',
        href: 'https://kitsorfan.github.io/dental-cbct-viewer/',
        primary: true,
      },
      {
        label: 'Try the demo jaw',
        href: 'https://kitsorfan.github.io/dental-cbct-viewer/?demo',
      },
      {
        label: 'Source on GitHub',
        href: 'https://github.com/kitsorfan/dental-cbct-viewer',
      },
    ],
    sections: [
      {
        heading: 'What it is',
        blocks: [
          {
            type: 'text',
            text: 'A dental CBCT viewer that runs entirely in the browser. Open a scan folder or its ZIP and you get the panoramic, cross-sections along the arch, the three slice planes, a 3D rendering, measurements, and a PDF report in one click.',
          },
          {
            type: 'text',
            text: 'It works on a computer, a tablet or a phone. Nothing to install, nothing stored, and the scan never leaves the device it was opened on.',
          },
        ],
      },
      {
        heading: 'What it does',
        blocks: [
          {
            type: 'list',
            items: [
              'A panoramic rebuilt along the dental arch, which it finds by itself from the teeth when a scan arrives without one.',
              'Cross-sections at right angles to the arch, linked axial, coronal and sagittal slices, and a 3D view ray-marched on the graphics card.',
              'Distances and angles on any view, and the nerve canals traced in CS 3D Imaging drawn on every one of them.',
              'A PDF report in one click: the overview, then a cross-section every millimetre along the whole arch, numbered and matched to marks on the panoramic.',
              'Reads DICOM straight out of a ZIP, ZIP64 included, without unpacking it. On a phone you pick the ZIP and that is all.',
              'In English, Greek and French, and it gets Greek patient names right.',
            ],
          },
        ],
      },
      {
        heading: 'Private by construction',
        blocks: [
          {
            type: 'list',
            items: [
              'There is no server side. The browser reads the scan, keeps it in memory, and the reports go straight to the Downloads folder.',
              'A Content Security Policy lets only the viewer’s own script run, pinned by its hash, and blocks every network connection, so even a bug could not send a scan anywhere.',
              'No cookies, no local storage, no analytics.',
              'A privacy tab checks all of that live while you watch, and wipes the scan from memory on request.',
              'Or skip the host entirely: the whole viewer downloads as one HTML file that works offline, off a USB stick.',
            ],
          },
        ],
      },
      {
        heading: 'How it is built',
        blocks: [
          {
            type: 'stats',
            stats: [
              { label: 'Size', value: 'About 220 KB, one file' },
              { label: 'Dependencies', value: 'None' },
              { label: 'Languages', value: 'English · Ελληνικά · Français' },
              { label: 'Licence', value: 'MIT' },
            ],
          },
          {
            type: 'text',
            text: 'Plain JavaScript, HTML and CSS, with no frameworks and no third-party code. It has its own DICOM reader, its own ZIP reader and its own PDF writer, and the build inlines the lot into a single page.',
          },
          {
            type: 'text',
            text: 'The tests make their DICOM files in memory and the demo jaw is synthetic, so no patient data has ever been part of the project.',
          },
          {
            type: 'tags',
            groups: [
              {
                label: 'Built with',
                tags: ['JavaScript', 'HTML', 'CSS', 'WebGL2', 'DICOM'],
              },
              {
                label: 'Shipped with',
                tags: ['GitHub Actions', 'GitHub Pages'],
              },
            ],
          },
        ],
      },
      {
        heading: 'Small print',
        blocks: [
          {
            type: 'text',
            text: 'For reviewing scans only. It is not a certified medical device, and it is no substitute for certified software when a diagnosis or a treatment plan depends on it.',
          },
        ],
      },
    ],
    journal: {
      title: 'Dental CBCT Viewer',
      body: 'A side project, free and open source: a dental CBCT viewer that runs entirely in the browser. Panoramic, cross-sections, 3D, measurements and a PDF report in one click, and the scan never leaves the device. Live at kitsorfan.github.io/dental-cbct-viewer.',
    },
  },
]

export const PROJECT_BY_ID = new Map(PROJECTS.map((p) => [p.id, p]))

/* ------------------------------ the row ------------------------------- */

/**
 * Where the row stands in the lobby: its middle, in the room's own frame.
 *
 * On the open floor between the certification wall and the reception desk,
 * facing the front door, so the screens are the first thing on the left as
 * you walk in. The camera looks down steeply enough that the boards on the
 * north wall behind them stay in view over the top.
 */
export const SHOWCASE = {
  area: 'work',
  position: [-8, -2.5] as Vec2,
  label: 'Side Projects',
}

/** Screen width; it shows a 16:9 picture, so the height follows. */
export const SCREEN_WIDTH = 3.6
export const SCREEN_HEIGHT = (SCREEN_WIDTH * 9) / 16
/** Centre to centre along the row: a screen and a stride between. */
export const SCREEN_PITCH = 4.4
/** Room for the post at each end of the row, beyond the outermost screen. */
const END_POST = 0.45
/** How deep the solid part is: the bezels, the columns, the posts. */
const ROW_DEPTH = 0.8

/** Distance along the row from its middle to a screen's middle. */
export function screenOffset(index: number, count = PROJECTS.length): number {
  return (index - (count - 1) / 2) * SCREEN_PITCH
}

/** Half the length of the row, posts included. */
export function rowHalf(count = PROJECTS.length): number {
  return ((count - 1) / 2) * SCREEN_PITCH + SCREEN_WIDTH / 2 + END_POST
}

/** Where a screen stands in the lobby. The row runs east to west. */
export function screenAt(index: number, count = PROJECTS.length): Vec2 {
  const [x, z] = SHOWCASE.position
  return [x + screenOffset(index, count), z]
}

/**
 * The solid part of the row, screens and posts together, as one box. The
 * room adds it the way it adds the flight deck's console: the screens are
 * exhibits, but the frame they stand in belongs to none of them.
 */
export function showcaseCollider(count = PROJECTS.length) {
  const [x, z] = SHOWCASE.position
  return { x, z, hx: rowHalf(count), hz: ROW_DEPTH / 2 }
}

/**
 * The projects as exhibits of the lobby: a screen apiece, facing the door,
 * opening the project's card and filing it in the journal like any other
 * exhibit in the building.
 */
export const PROJECT_EXHIBITS: Exhibit[] = PROJECTS.map((project, i) => ({
  id: project.id,
  kind: 'project',
  label: project.name,
  position: screenAt(i),
  panel: {
    kicker: project.kicker,
    title: project.name,
    sections: project.sections,
  },
  journal: project.journal,
}))
