import type { PanelSection } from '../../types.ts'
import {
  ARMY_SECTIONS,
  CERTIFICATIONS_SECTIONS,
  HOUSE_SECTIONS,
  IBM_SECTIONS,
  LIGHTHOUSE_SECTIONS,
  PLATFORM_SECTIONS,
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

/**
 * The CV in reading order, as the plain HTML page at /cv.html lays it out.
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
