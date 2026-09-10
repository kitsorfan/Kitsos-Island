import { buildCvText } from '../data/cv'
import { PROFILE } from '../data/profile'

/**
 * Hands the visitor a Markdown copy of the CV.
 *
 * This lives up here rather than beside the CV data because it is the only
 * part that touches the document; the build generates the plain HTML page
 * from that data and cannot afford to pull the DOM in with it.
 */
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
