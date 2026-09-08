import type { PanelSection } from '../types'
import {
  ARMY_SECTIONS,
  CERTIFICATIONS_SECTIONS,
  HOUSE_SECTIONS,
  IBM_SECTIONS,
  LIGHTHOUSE_SECTIONS,
  PLATFORM_SECTIONS,
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
} from './profile'

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
              `### ${letter.from} — ${letter.role}`,
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
            const org = entry.org ? ` — ${entry.org}` : ''
            out.push(`### ${entry.title}${org}`, `*${entry.meta}*`, '')
            if (entry.bullets) out.push(...entry.bullets.map((b) => `- ${b}`), '')
            if (entry.tags) out.push(`Technologies: ${entry.tags.join(', ')}`, '')
          }
          break
      }
    }
  }

  return out
}

/** The whole CV as Markdown, built from the same data the island shows. */
export function buildCvText(): string {
  const lines: string[] = [
    `# ${PROFILE.firstName} "${PROFILE.nickname}" ${PROFILE.lastName}`,
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

  const parts: [string, PanelSection[]][] = [
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

  for (const [title, sections] of parts) {
    lines.push(`# ${title}`, '', ...renderSections(sections), '')
  }

  lines.push('---', '', 'Generated from kitsos-island, the playable CV.')
  return lines.join('\n')
}

/** Hands the visitor a Markdown copy of the CV. */
export function downloadCv() {
  const blob = new Blob([buildCvText()], {
    type: 'text/markdown;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${PROFILE.lastName}-${PROFILE.firstName}-CV.md`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
