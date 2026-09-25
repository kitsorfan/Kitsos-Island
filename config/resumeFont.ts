/**
 * Inter for the printed CV, read out of @fontsource-variable/inter.
 *
 * Resolved through the package rather than a node_modules path, so it follows
 * wherever npm put it. The build serves these bytes at RESUME_FONT and the PDF
 * render inlines them; either way the font comes from the repo, not Google.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SPEC = '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'
const FILE = fileURLToPath(import.meta.resolve(SPEC))

export const readResumeFont = () => readFileSync(FILE)
