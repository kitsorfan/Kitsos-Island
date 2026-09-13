import { useEffect, useRef } from 'react'
import { nextObjective, useGame } from '../state/store'
import { drawMap } from './mapDraw'
import { useT } from '../i18n/useT'

const SIZE = 168

export function Minimap() {
  const t = useT()
  const canvas = useRef<HTMLCanvasElement>(null)
  const discovered = useGame((s) => s.discovered)
  const missions = useGame((s) => s.missions)
  const keys = useGame((s) => s.keys)
  const lighthouseOpen = useGame((s) => s.lighthouseOpen)
  const openMap = useGame((s) => s.openMap)

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    el.width = SIZE * dpr
    el.height = SIZE * dpr
    const ctx = el.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const objective = nextObjective({ missions, keys, lighthouseOpen })
    let raf = 0
    let last = 0

    const tick = (now: number) => {
      // The world moves smoothly; the map only needs a steady ~20fps.
      if (now - last > 50) {
        last = now
        drawMap(ctx, {
          size: SIZE,
          discovered,
          objective: objective?.buildingId ?? null,
          people: true,
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [discovered, missions, keys, lighthouseOpen])

  return (
    <button
      className="minimap"
      onClick={openMap}
      title={t('Open the map (M)')}
      aria-label={t('Open the map')}
    >
      <canvas ref={canvas} style={{ width: SIZE, height: SIZE }} />
      <span className="minimap__north">N</span>
      <span className="minimap__hint">
        <kbd>M</kbd>
      </span>
    </button>
  )
}
