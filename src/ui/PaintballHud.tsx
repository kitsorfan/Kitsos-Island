import { useEffect, useState } from 'react'
import { MAG_SIZE, RELOAD_MS, START_LIVES } from '../game/paintball'
import { useGame } from '../state/store'
import { useCoarsePointer } from './useCoarsePointer'

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
  const game = useGame((s) => s.paintball)
  const coarse = useCoarsePointer()
  const left = useReload(game?.reloadAt ?? null)

  if (!game || game.status !== 'playing') return null

  const standing = game.enemies.filter((id) => !game.out[id]).length
  const reloading = game.reloadAt !== null

  return (
    <div className="pb">
      {game.feed?.kind === 'bad' && (
        <div key={game.feed.at} className="pb__flash" aria-hidden />
      )}

      <div className="pb__panel">
        <span className="pb__label">Paintball</span>

        <div className="pb__row">
          <span className="pb__row-label">Lives</span>
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
          <span className="pb__row-label">Hopper</span>
          <span className="pb__ammo">
            {Array.from({ length: MAG_SIZE }, (_, i) => (
              <span
                key={i}
                className={`pb__ball${i < game.ammo ? '' : ' pb__ball--spent'}`}
              />
            ))}
          </span>
        </div>

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
        <p key={game.feed.at} className={`pb__feed pb__feed--${game.feed.kind}`}>
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
