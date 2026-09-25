/**
 * Warns, at commit time, when the CV has changed and the PDF has not.
 *
 * The PDF in public/ is printed from the CV data by `npm run cv:pdf` and
 * committed, because printing it needs a real browser and the build should
 * not. That leaves one way for it to go stale: change the data, forget to
 * reprint. This catches exactly that commit.
 *
 * It warns rather than blocks. Reprinting needs Edge or Chrome, and a hook
 * that fails on a machine without one would only teach people --no-verify.
 */
import { execFileSync } from 'node:child_process'
import { RESUME_PDF } from '../src/features/cv/resume.ts'

/** Everything the printed CV is made from. */
const SOURCES = [
  /^src\/features\/cv\/(profile|resume|resumeHtml)\.ts$/,
  /^src\/features\/radio\/release\.ts$/,
  /^public\/cv\/photo\.jpg$/,
]

const staged = execFileSync(
  'git',
  ['diff', '--cached', '--name-only', '--diff-filter=ACMR'],
  { encoding: 'utf8' },
)
  .split('\n')
  .filter(Boolean)

const changed = staged.filter((f) => SOURCES.some((re) => re.test(f)))
const reprinted = staged.includes(`public/${RESUME_PDF}`)

if (changed.length && !reprinted) {
  console.warn(
    [
      '',
      `  ⚠  The CV changed but public/${RESUME_PDF} did not:`,
      ...changed.map((f) => `       ${f}`),
      '     Reprint it with `npm run cv:pdf` and stage the result,',
      '     or ignore this if the change does not show on paper.',
      '',
    ].join('\n'),
  )
}
