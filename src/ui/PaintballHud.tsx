import { useEffect, useState } from 'react'
import { ARENA, MAG_SIZE, RELOAD_MS, START_LIVES } from '../game/paintball'
import { isCrouching } from '../game/input'
import { useGame } from '../state/store'
import { useCoarsePointer } from './useCoarsePointer'
import { useT } from '../i18n/useT'

/**
 * The clock before the whistle, and whether he is flat on the ground. Both
 * live outside React, so the panel reads them on a frame of its own.
 */
function useField(active: boolean) {
  const [state, setState] = useState({ countdown: 0, down: false })

  useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = () => {
      setState((was) => {
        const countdown = Math.ceil(ARENA.countdown)
        const down = isCrouching()
        return was.countdown === countdown && was.down === down
          ? was
          : { countdown, down }
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return state
}

/** Fraction of the six-second refill still to run, 1 down to 0. */
function useReload(reloadAt: number | null) {
  const [left, setLeft] = useState(0)

  useEffect(() => {
    if (reloadAt === null) return
    let raf = 0
    const tick = () => {
      setLeft(Math.max(0, (reloadAt - Date.now()) / RELOAD_MS))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reloadAt])

  return reloadAt === null ? 0 : left
}

export function PaintballHud() {
  const t = useT()
  const game = useGame((s) => s.paintball)
  const coarse = useCoarsePointer()
  const left = useReload(game?.reloadAt ?? null)
  const field = useField(game?.status === 'playing')

  if (!game || game.status !== 'playing') return null

  const standing = game.enemies.filter((id) => !game.out[id]).length
  const reloading = game.reloadAt !== null

  return (
    <div className="pb">
      {field.countdown > 0 && (
        <div className="pb-count" aria-live="polite">
          <strong key={field.countdown}>{field.countdown}</strong>
          <em>{t('Markers down until the whistle')}</em>
        </div>
      )}

      {game.feed?.kind === 'bad' && (
        <div key={game.feed.at} className="pb__flash" aria-hidden />
      )}

      <div className="pb__panel">
        <span className="pb__label">{t('Paintball')}</span>

        <div className="pb__row">
          <span className="pb__row-label">{t('Lives')}</span>
          <span className="pb__hearts">
            {Array.from({ length: START_LIVES }, (_, i) => (
              <span
                key={i}
                className={`pb__heart${i < game.lives ? '' : ' pb__heart--gone'}`}
              >
                {i < game.lives ? '❤' : '🤍'}
              </span>
            ))}
          </span>
        </div>

        <div className="pb__row">
          <span className="pb__row-label">{t('Hopper')}</span>
          <span className="pb__ammo">
            {Array.from({ length: MAG_SIZE }, (_, i) => (
              <span
                key={i}
                className={`pb__ball${i < game.ammo ? '' : ' pb__ball--spent'}`}
              />
            ))}
          </span>
        </div>

        {field.down && (
          <p className="pb__down">{t('Down — you cannot shoot from here')}</p>
        )}

        <div className={`pb__reload${reloading ? ' pb__reload--on' : ''}`}>
          <div
            className="pb__reload-fill"
            style={{ width: `${(1 - left) * 100}%` }}
          />
          <span>
            {reloading
              ? `Refilling — ${Math.ceil(left * (RELOAD_MS / 1000))}s`
              : `${game.ammo} of ${MAG_SIZE} rounds`}
          </span>
        </div>

        <div className="pb__row pb__row--tally">
          <span>
            <strong>{standing}</strong> against you
          </span>
          <span>
            <strong>{game.hits}</strong> painted
          </span>
        </div>
      </div>

      {game.feed && (
        <p
          key={game.feed.at}
          className={`pb__feed pb__feed--${game.feed.kind}`}
        >
          {game.feed.text}
        </p>
      )}

      <p className="pb__keys">
        {coarse ? (
          <>
            <kbd>FIRE</kbd> shoot · <kbd>DUCK</kbd> get down
          </>
        ) : (
          <>
            <kbd>Space</kbd> shoot · <kbd>Ctrl</kbd> get down · <kbd>Q</kbd>
            <kbd>R</kbd> turn
          </>
        )}
      </p>
    </div>
  )
}
