import type { FlagCode } from '../types'

/**
 * A flag, drawn as a handful of rectangles.
 *
 * Not an emoji. A flag emoji is a pair of regional-indicator letters, and
 * Windows ships no font that joins them into a picture — every browser on it
 * falls back to the bare letters, so 🇬🇷 reads 'GR'. These are the six
 * countries on the globe at Evangeliki and no more, so drawing them costs a
 * few rectangles each and looks the same on every machine.
 *
 * Simplified to their bands: this is a 21×14 swatch in a line of text, and at
 * that size a crescent or a coat of arms is three grey pixels. The proportions
 * and the colours are the real ones.
 */
const W = 21
const H = 14

export function Flag({ code }: { code: FlagCode }) {
  return (
    <svg
      className="flag"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      role="presentation"
      aria-hidden
    >
      {FLAGS[code]}
      {/* A hairline so a white or pale flag still reads as a flag against
          the panel's cream paper. */}
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        fill="none"
        stroke="rgba(0,0,0,0.22)"
        strokeWidth={1}
      />
    </svg>
  )
}

/** Three vertical bands of equal width. */
function Tricolour({ colors }: { colors: [string, string, string] }) {
  return (
    <>
      {colors.map((c, i) => (
        <rect key={i} x={(W / 3) * i} y={0} width={W / 3} height={H} fill={c} />
      ))}
    </>
  )
}

const FLAGS: Record<FlagCode, React.ReactNode> = {
  /* Nine stripes, and the canton with its cross. */
  gr: (
    <>
      <rect width={W} height={H} fill="#0d5eaf" />
      {[1, 3, 5, 7].map((i) => (
        <rect
          key={i}
          x={0}
          y={(H / 9) * i}
          width={W}
          height={H / 9}
          fill="#fff"
        />
      ))}
      <rect
        x={0}
        y={0}
        width={(H / 9) * 5}
        height={(H / 9) * 5}
        fill="#0d5eaf"
      />
      <rect
        x={(H / 9) * 2}
        y={0}
        width={H / 9}
        height={(H / 9) * 5}
        fill="#fff"
      />
      <rect
        x={0}
        y={(H / 9) * 2}
        width={(H / 9) * 5}
        height={H / 9}
        fill="#fff"
      />
    </>
  ),
  /* White, with the island in copper — the metal the place is named for. */
  cy: (
    <>
      <rect width={W} height={H} fill="#fff" />
      <ellipse cx={W / 2} cy={H * 0.45} rx={3.4} ry={2.1} fill="#d57800" />
      <path
        d="M8.4 9.2l1.4 2.2M10.4 9.4l0.6 2.3M12.4 9.2l-0.4 2.3"
        stroke="#4e7d3a"
        strokeWidth={0.8}
        fill="none"
      />
    </>
  ),
  /* Three horizontal bands. */
  de: (
    <>
      {['#000', '#dd0000', '#ffce00'].map((c, i) => (
        <rect key={c} x={0} y={(H / 3) * i} width={W} height={H / 3} fill={c} />
      ))}
    </>
  ),
  fr: <Tricolour colors={['#002395', '#fff', '#ed2939']} />,
  it: <Tricolour colors={['#009246', '#fff', '#ce2b37']} />,
  /* Square in life, and square here: the one flag that is not 3:2. */
  ch: (
    <>
      <rect width={W} height={H} fill="#f4f4f4" />
      <rect x={(W - H) / 2} y={0} width={H} height={H} fill="#d52b1e" />
      <rect x={W / 2 - 1} y={H / 2 - 3.6} width={2} height={7.2} fill="#fff" />
      <rect x={W / 2 - 3.6} y={H / 2 - 1} width={7.2} height={2} fill="#fff" />
    </>
  ),
}
