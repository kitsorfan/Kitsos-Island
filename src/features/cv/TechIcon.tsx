import { MARKS } from './techMarkIcons'

/**
 * The little mark that sits at the head of a technology chip.
 *
 * The marks it draws from live in techMarks.tsx; this file is the component
 * alone, which is what keeps fast refresh working on both.
 */
const S = 24

export function TechIcon({ name }: { name: string }) {
  const mark = MARKS[name]
  if (!mark) return null
  return (
    <svg
      className="tech-icon"
      viewBox={`0 0 ${S} ${S}`}
      width={S}
      height={S}
      role="presentation"
      aria-hidden
    >
      {mark}
    </svg>
  )
}
