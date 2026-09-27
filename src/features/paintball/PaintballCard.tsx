import { NPCS } from '../island/world'
import {
  COUNTDOWN,
  MAG_SIZE,
  MAX_ENEMIES,
  MAX_FRIENDS,
  MIN_ENEMIES,
  RELOAD_MS,
  ROSTER,
  START_LIVES,
  combatantName,
} from './paintballLogic'
import { useGame } from '../../shared/state/store'
import * as sfx from '../../shared/engine/audio'
import { useT } from '../../shared/i18n/useT'
import { fill, rich } from '../../shared/i18n'

const NPC_BY_ID = new Map(NPCS.map((n) => [n.id, n]))

/** The briefing before a match, and the scoreline after one. */
export function PaintballCard() {
  const t = useT()
  const game = useGame((s) => s.paintball)
  const begin = useGame((s) => s.beginPaintball)
  const exit = useGame((s) => s.exitPaintball)
  const rematch = useGame((s) => s.openPaintball)
  const toggleAlly = useGame((s) => s.toggleAlly)
  const setEnemyCount = useGame((s) => s.setEnemyCount)
  const redraw = useGame((s) => s.redrawTeams)

  if (!game) return null

  const briefing = game.status === 'briefing'
  const won = game.status === 'won'
  const painted = game.enemies.filter((id) => game.out[id]).length

  return (
    <div className="overlay">
      <div className={`pb-card${won ? ' pb-card--won' : ''}`}>
        <span className="pb-card__kicker">
          {briefing
            ? t('Paintball mode')
            : fill(t('Round {round}'), { round: game.round })}
        </span>
        <h2 className="pb-card__title">
          {t(
            briefing
              ? 'Pick up the marker'
              : won
                ? 'Field cleared'
                : 'Painted out',
          )}
        </h2>

        {briefing ? (
          <>
            <p className="pb-card__lead">
              {t(
                'The island splits in two for an afternoon, and the sides are never the same twice. Whoever picked up a marker for you is standing in the plaza; everyone else is out in the fields.',
              )}
            </p>

            <div className="pb-card__teams">
              <div className="pb-team pb-team--friend">
                <span className="pb-team__label">
                  {fill(t('On your side: {count} of {max}'), {
                    count: game.friends.length,
                    max: MAX_FRIENDS,
                  })}
                </span>
                <p className="pb-team__hint">
                  {t(
                    game.friends.length === 0
                      ? 'Nobody yet. Tap a name and they will pick up a marker for you; leave it empty and the afternoon is yours alone.'
                      : 'Tap a name to take them off it. Whoever you leave out lines up against you.',
                  )}
                </p>
                <div className="pb-roster">
                  {ROSTER.map((id) => {
                    const npc = NPC_BY_ID.get(id)
                    const picked = game.friends.includes(id)
                    const full = !picked && game.friends.length >= MAX_FRIENDS
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`pb-pick${picked ? ' pb-pick--on' : ''}`}
                        disabled={full}
                        aria-pressed={picked}
                        title={npc ? t(npc.role) : undefined}
                        onClick={() => toggleAlly(id)}
                      >
                        {t(combatantName(id))}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pb-team pb-team--enemy">
                <span className="pb-team__label">
                  {fill(t('Against you: {count}'), {
                    count: game.enemies.length,
                  })}
                </span>
                <p className="pb-team__hint">
                  {t(
                    game.enemies.length > ROSTER.length
                      ? 'The island, plus enough of the next village along to make up the numbers.'
                      : 'Islanders, spread across the fields around the plaza.',
                  )}
                </p>
                <label className="pb-dial">
                  <input
                    type="range"
                    min={MIN_ENEMIES}
                    max={MAX_ENEMIES}
                    step={1}
                    value={game.enemies.length}
                    onChange={(event) =>
                      setEnemyCount(Number(event.target.value))
                    }
                  />
                  <span>
                    {MIN_ENEMIES}–{MAX_ENEMIES}
                  </span>
                </label>
                <button
                  type="button"
                  className="pb-redraw"
                  onClick={() => redraw()}
                >
                  {t('Draw both sides again')}
                </button>
              </div>
            </div>

            <ul className="pb-card__rules">
              <li>
                {rich(
                  t(
                    '<b>{rounds} rounds</b> per hopper, then a {seconds}-second refill.',
                  ),
                  { rounds: MAG_SIZE, seconds: RELOAD_MS / 1000 },
                )}
              </li>
              <li>
                {rich(
                  t('<b>{lives} lives</b>. A ball to the chest costs one.'),
                  {
                    lives: START_LIVES,
                  },
                )}
              </li>
              <li>
                {rich(
                  t(
                    '<b>Get down</b> (Ctrl, or the DUCK button) and their paint sails over you, but you cannot shoot back from down there. Cover costs you the shot.',
                  ),
                )}
              </li>
              <li>
                {rich(
                  t(
                    '<b>{seconds} seconds</b> on the clock before anybody may fire. Use them to get behind something.',
                  ),
                  { seconds: COUNTDOWN },
                )}
              </li>
              <li>
                {t(
                  'Your marker leads whichever enemy you are facing. A ring marks them. Paint a friend and you lose them.',
                )}
              </li>
            </ul>
          </>
        ) : (
          <>
            <p className="pb-card__lead">
              {fill(
                t(
                  won
                    ? 'Every last one of them is sitting in the grass. You painted {hits} of {total} yourself.'
                    : 'Three hits and the afternoon is over. {painted} of {total} went down first.',
                ),
                { hits: game.hits, painted, total: game.enemies.length },
              )}
            </p>
            <div className="pb-card__score">
              <div>
                <span>{t('Painted by you')}</span>
                <strong>{game.hits}</strong>
              </div>
              <div>
                <span>{t('Team total')}</span>
                <strong>
                  {painted}/{game.enemies.length}
                </strong>
              </div>
              <div>
                <span>{t('Lives left')}</span>
                <strong>{game.lives}</strong>
              </div>
              <div>
                <span>{t('Friendly fire')}</span>
                <strong>{game.friendlyFire}</strong>
              </div>
            </div>
          </>
        )}

        <div className="pb-card__actions">
          <button
            className="button button--primary"
            onClick={() => (briefing ? begin() : rematch())}
          >
            {t(briefing ? 'Start the match' : 'Rematch')}
          </button>
          <button
            className="button"
            onClick={() => {
              sfx.cancel()
              exit()
            }}
          >
            {t('Back to the island')}
          </button>
        </div>
      </div>
    </div>
  )
}
