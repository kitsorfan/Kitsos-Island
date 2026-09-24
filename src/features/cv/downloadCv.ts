import { RESUME_PDF } from './resume'

/**
 * Hands the visitor the two-page PDF CV.
 *
 * The PDF is a static file in public/, printed from the same data by
 * `npm run cv:pdf`, so this is only a link with a download on it. It lives up
 * here rather than beside the CV data because it is the only part that
 * touches the document.
 */
export function downloadCv() {
  const link = document.createElement('a')
  link.href = `/${RESUME_PDF}`
  link.download = RESUME_PDF
  document.body.appendChild(link)
  link.click()
  link.remove()
}
