import type { PanelSection } from '../../types.ts'
import {
  ARMY_SECTIONS,
  CERTIFICATIONS_SECTIONS,
  HOUSE_SECTIONS,
  IBM_SECTIONS,
  LIGHTHOUSE_SECTIONS,
  PLATFORM_SECTIONS,
  CV_NAME,
  PROFILE,
  PUBLICATION_SECTIONS,
  REFERENCES_SECTIONS,
  SCHOOL_SECTIONS,
  SKILLS_SECTIONS,
  STUDENT_LIFE_SECTIONS,
  THESIS_SECTIONS,
  UNIVERSITY_SECTIONS,
  VELTISTON_SECTIONS,
  VOLUNTEER_SECTIONS,
} from './profile.ts'

function renderSections(sections: PanelSection[]): string[] {
  const out: string[] = []

  for (const section of sections) {
    out.push(`## ${section.heading}`, '')

    for (const block of section.blocks) {
      switch (block.type) {
        case 'text':
          out.push(block.text, '')
          break
        case 'letters':
          for (const letter of block.letters) {
            out.push(
              `### ${letter.from} · ${letter.role}`,
              `*${letter.note}*`,
              '',
              ...letter.paragraphs.flatMap((p) => [`> ${p}`, '']),
            )
          }
          break
        case 'quote':
          out.push(`> ${block.text}`, '')
          break
        case 'list':
          out.push(...block.items.map((i) => `- ${i}`), '')
          break
        // Markdown has no flags in it: the country is the content.
        case 'flags':
          out.push(...block.countries.map((c) => `- ${c.name}`), '')
          break
        case 'stats':
          out.push(...block.stats.map((s) => `- ${s.label}: ${s.value}`), '')
          break
        case 'tags':
          out.push(
            ...block.groups.map((g) => `- ${g.label}: ${g.tags.join(', ')}`),
            '',
          )
          break
        case 'timeline':
          for (const entry of block.entries) {
            const org = entry.org ? `${entry.org}` : ''
            out.push(`### ${entry.title}${org}`, `*${entry.meta}*`, '')
            if (entry.bullets)
              out.push(...entry.bullets.map((b) => `- ${b}`), '')
            if (entry.tags)
              out.push(`Technologies: ${entry.tags.join(', ')}`, '')
          }
          break
      }
    }
  }

  return out
}

/**
 * The CV in reading order. Both the Markdown copy and the plain HTML page
 * are built from this, so neither can drift from the other.
 */
export const CV_PARTS: [string, PanelSection[]][] = [
  ['Summary', LIGHTHOUSE_SECTIONS],
  ['Experience', VELTISTON_SECTIONS],
  ['Platform work', PLATFORM_SECTIONS],
  ['Earlier roles', IBM_SECTIONS],
  ['Skills', SKILLS_SECTIONS],
  ['Education', UNIVERSITY_SECTIONS],
  ['Publications', PUBLICATION_SECTIONS],
  ['Certifications', CERTIFICATIONS_SECTIONS],
  ['Thesis, contests and awards', THESIS_SECTIONS],
  ['University life', STUDENT_LIFE_SECTIONS],
  ['Military service', ARMY_SECTIONS],
  ['Early education', SCHOOL_SECTIONS],
  ['Volunteering and teaching', VOLUNTEER_SECTIONS],
  ['References', REFERENCES_SECTIONS],
  ['Personal', HOUSE_SECTIONS],
]

/** The whole CV as Markdown, built from the same data the island shows. */
export function buildCvText(): string {
  const lines: string[] = [
    `# ${CV_NAME}`,
    '',
    PROFILE.title,
    '',
    `- Location: ${PROFILE.location}`,
    `- Nationality: ${PROFILE.nationality}`,
    `- Email: ${PROFILE.email}`,
    `- LinkedIn: ${PROFILE.linkedinLabel}`,
    '',
    '---',
    '',
  ]

  for (const [title, sections] of CV_PARTS) {
    lines.push(`# ${title}`, '', ...renderSections(sections), '')
  }

  lines.push('---', '', 'Generated from kitsos-island, the playable CV.')
  return lines.join('\n')
}
