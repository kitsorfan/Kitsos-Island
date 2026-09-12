import { useEffect, useRef, useState } from 'react'
import { BUILDINGS, MISSIONS } from '../data/world'
import { TOTAL_KEYS, keyCount, nextObjective, useGame } from '../state/store'
import * as sfx from '../game/audio'
import { drawMap, worldToMap } from './mapDraw'
import { useT } from '../i18n/useT'

export function MapOverlay() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState(520)

  const t = useT()
  const area = useGame((s) => s.area)
  const discovered = useGame((s) => s.discovered)
  const missions = useGame((s) => s.missions)
  const keys = useGame((s) => s.keys)
  const lighthouseOpen = useGame((s) => s.lighthouseOpen)
  const closeMap = useGame((s) => s.closeMap)
  const travelTo = useGame((s) => s.travelTo)

  const objective = nextObjective({ missions, keys, lighthouseOpen })
  const indoors = area !== 'island'

  useEffect(() => {
    const fit = () =>
      setSize(
        Math.max(
          260,
          Math.min(
            560,
            Math.min(window.innerWidth - 80, window.innerHeight - 260),
          ),
        ),
      )
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    el.width = size * dpr
    el.height = size * dpr
    const ctx = el.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    let raf = 0
    let last = 0
    const tick = (now: number) => {
      if (now - last > 60) {
        last = now
        drawMap(ctx, {
          size,
          discovered,
          objective: objective?.buildingId ?? null,
          people: true,
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [size, discovered, objective])

  const dismiss = () => {
    sfx.cancel()
    closeMap()
  }

  const travel = (id: string) => {
    travelTo(id)
  }

  return (
    <div className="overlay" onPointerDown={dismiss}>
      <section
        className="panel panel--map"
        onPointerDown={(e) => e.stopPropagation()}
        style={{ '--accent': '#3f7bd6' } as React.CSSProperties}
        aria-label={t('Island map')}
      >
        <header className="panel__head">
          <div>
            <p className="panel__kicker">{t('Kitsos Island')}</p>
            <h2 className="panel__title">
              {keyCount(keys)} / {TOTAL_KEYS} {t('keys')} ·{' '}
              {Object.keys(discovered).length} / {BUILDINGS.length}{' '}
              {t('places found')}
            </h2>
          </div>
          <button
            className="panel__close"
            onClick={dismiss}
            aria-label={t('Close')}
          >
            ✕<kbd>Esc</kbd>
          </button>
        </header>

        <div className="map">
          <div className="map__canvas" style={{ width: size, height: size }}>
            <canvas ref={canvas} style={{ width: size, height: size }} />
            {BUILDINGS.map((b) => {
              const [x, y] = worldToMap(b.position[0], b.position[1], size)
              const found = Boolean(discovered[b.id])
              return (
                <button
                  key={b.id}
                  className={`map__pin${found ? '' : ' map__pin--unknown'}${
                    objective?.buildingId === b.id ? ' map__pin--target' : ''
                  }`}
                  style={
                    {
                      left: x,
                      top: y,
                      '--accent': b.accent,
                    } as React.CSSProperties
                  }
                  disabled={!found || indoors}
                  onClick={() => travel(b.id)}
                  title={
                    !found
                      ? t('Not found yet')
                      : indoors
                        ? t('Step outside first')
                        : `${t('Travel to')} ${t(b.name)}`
                  }
                >
                  {found ? b.short : '?'}
                </button>
              )
            })}
          </div>

          <aside className="map__side">
            <h3 className="panel__heading">{t('Missions')}</h3>
            <ul className="quest-list">
              {MISSIONS.map((m) => {
                const state = missions[m.id]
                return (
                  <li key={m.id} className={`quest quest--${state}`}>
                    <span className="quest__mark" aria-hidden>
                      {state === 'done' ? '✓' : state === 'active' ? '◆' : '○'}
                    </span>
                    <div>
                      <strong>{t(m.title)}</strong>
                      <p>
                        {t(
                          state === 'done'
                            ? m.done
                            : state === 'active'
                              ? m.hint
                              : m.brief,
                        )}
                      </p>
                    </div>
                  </li>
                )
              })}
              <li
                className={`quest quest--${lighthouseOpen ? 'done' : 'idle'}`}
              >
                <span className="quest__mark" aria-hidden>
                  {lighthouseOpen ? '✓' : '★'}
                </span>
                <div>
                  <strong>{t('The Old Lighthouse')}</strong>
                  <p>
                    {lighthouseOpen
                      ? t('Open. The keeper’s logbook is at the top.')
                      : `${t('Sealed with five locks —')} ${keyCount(keys)} ${t('of')} ${TOTAL_KEYS} ${t('turned.')}`}
                  </p>
                </div>
              </li>
            </ul>

            <p className="map__note">
              {t(
                indoors
                  ? 'Step outside to travel.'
                  : 'Click a place you have found to travel there.',
              )}
            </p>
          </aside>
        </div>
      </section>
    </div>
  )
}
