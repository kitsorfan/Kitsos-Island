import { COUNT, HEAD_START, HOLD_OUT } from './hideLogic'
import type { Role } from './hideLogic'
import { useGame } from '../../shared/state/store'
import * as sfx from '../../shared/engine/audio'
import { useCoarsePointer } from '../../shared/ui/useCoarsePointer'
import { useT } from '../../shared/i18n/useT'
import { fill, rich } from '../../shared/i18n'
import type { Translate } from '../../shared/i18n'

const clock = (seconds: number, t: Translate) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m > 0 ? fill(t('{m}m {s}s'), { m, s }) : fill(t('{s}s'), { s })
}

/** The briefing before a game of hide and seek, and the card after one. */
export function HideCard() {
  const t = useT()
  const game = useGame((s) => s.hide)
  const setRole = useGame((s) => s.setRole)
  const begin = useGame((s) => s.beginHide)
  const exit = useGame((s) => s.exitHide)
  const again = useGame((s) => s.openHide)
  const coarse = useCoarsePointer()

  if (!game) return null
  const briefing = game.status === 'briefing'
  const seeking = game.role === 'seeker'

  const side = (role: Role, title: string, line: string) => (
    <button
      type="button"
      className={`hd-side${game.role === role ? ' hd-side--on' : ''}`}
      aria-pressed={game.role === role}
      onClick={() => setRole(role)}
    >
      <strong>{title}</strong>
      <span>{line}</span>
    </button>
  )

  return (
    <div className="overlay">
      <div className={`hd-card${game.won && !briefing ? ' hd-card--won' : ''}`}>
        <span className="hd-card__kicker">
          {briefing
            ? t('Hide and seek · after dark')
            : fill(t('Game {round}'), { round: game.round })}
        </span>
        <h2 className="hd-card__title">
          {t(
            briefing
              ? 'Lights out on the island'
              : game.won
                ? seeking
                  ? 'Every one of them found'
                  : 'Never found you'
                : 'Found you',
          )}
        </h2>

        {briefing ? (
          <>
            <p className="hd-card__lead">
              {t(
                'Every lamp on the island goes out: the windows, the lighthouse, the searchlight over the camp. The only light left anywhere is whatever somebody is carrying.',
              )}
            </p>

            <div className="hd-sides">
              {side(
                'seeker',
                t('You seek'),
                fill(
                  t(
                    'All {count} of them hide. Go and find them with your torch.',
                  ),
                  { count: COUNT },
                ),
              )}
              {side(
                'hider',
                t('You hide'),
                fill(
                  t(
                    '{seconds} seconds to disappear, then all {count} come looking.',
                  ),
                  { seconds: HEAD_START, count: COUNT },
                ),
              )}
            </div>

            <ul className="hd-card__rules">
              {seeking ? (
                <>
                  <li>
                    {rich(
                      t(
                        'Shining a light on somebody is not finding them. You have to <b>walk up and touch them</b>.',
                      ),
                    )}
                  </li>
                  <li>
                    {rich(
                      t(
                        'Keep the torch <b>lit</b>, or you will walk past every one of them in the dark. Nothing tells you where they are. They are behind things.',
                      ),
                    )}
                  </li>
                  <li>
                    {fill(
                      t(
                        'Nothing is timed against you. The clock only says how long it took to find all {count}.',
                      ),
                      { count: COUNT },
                    )}
                  </li>
                </>
              ) : (
                <>
                  <li>
                    {rich(
                      t(
                        '<b>{seconds} seconds</b> while they count. After that every one of them is out with a torch.',
                      ),
                      { seconds: HEAD_START },
                    )}
                  </li>
                  <li>
                    {rich(
                      t(
                        'Stay out of their hands for <b>{seconds} seconds</b> and you have won the night. Being seen is not being caught. Somebody has to reach you, the same rule you play by the other way round.',
                      ),
                      { seconds: HOLD_OUT },
                    )}
                  </li>
                  <li>
                    {rich(
                      t(
                        '<b>They run when they see you</b>, and a shade faster than you can. Speed is no way out of it. Get something solid between you and them and they will lose you.',
                      ),
                    )}
                  </li>
                  <li>
                    {rich(
                      t(
                        '<b>Anything you do draws them.</b> Walking is heard from a good way off, crouch-walking from barely any, and a lit torch is seen right across the town, so everyone inside that range stops looking where they were and comes to look at you.',
                      ),
                    )}
                  </li>
                  <li>
                    {rich(
                      t(
                        '<b>Still and dark is safe</b>, up to a point. Every so often one of them takes it into their head to come and look exactly where you are anyway.',
                      ),
                    )}
                  </li>
                </>
              )}
            </ul>

            <dl className="hd-keys">
              {coarse ? (
                <>
                  <div>
                    <dt>{t('Move')}</dt>
                    <dd>{t('Stick')}</dd>
                  </div>
                  <div>
                    <dt>{t('Keep low')}</dt>
                    <dd>{t('DUCK')}</dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt>{t('Walk')}</dt>
                    <dd>{t('WASD')}</dd>
                  </div>
                  <div>
                    <dt>{t('Keep low')}</dt>
                    <dd>{t('Ctrl')}</dd>
                  </div>
                  <div>
                    <dt>{t('Torch out')}</dt>
                    <dd>T</dd>
                  </div>
                  <div>
                    <dt>{t('Give up')}</dt>
                    <dd>{t('Esc')}</dd>
                  </div>
                </>
              )}
            </dl>
          </>
        ) : (
          <>
            <p className="hd-card__lead">
              {seeking
                ? fill(
                    t(
                      'All {count} of them out of the dark, one torch beam at a time.',
                    ),
                    { count: COUNT },
                  )
                : game.won
                  ? fill(
                      t(
                        '{seconds} seconds with the whole island looking, and not one of them got a beam on you.',
                      ),
                      { seconds: HOLD_OUT },
                    )
                  : t(
                      'Somebody held a light on you just long enough to be sure.',
                    )}
            </p>
            <div className="hd-card__score">
              {seeking ? (
                <div>
                  <span>{t('Found')}</span>
                  <strong>
                    {game.found}/{COUNT}
                  </strong>
                </div>
              ) : (
                <div>
                  <span>{t('Held out')}</span>
                  <strong>{clock(game.seconds, t)}</strong>
                </div>
              )}
              <div>
                <span>{t(seeking ? 'Took' : 'Needed')}</span>
                <strong>
                  {seeking
                    ? clock(game.seconds, t)
                    : fill(t('{s}s'), { s: HOLD_OUT })}
                </strong>
              </div>
            </div>
          </>
        )}

        <div className="hd-card__actions">
          <button
            className="button button--primary"
            onClick={() => (briefing ? begin() : again())}
          >
            {t(
              briefing ? (seeking ? 'Start counting' : 'Go and hide') : 'Again',
            )}
          </button>
          <button
            className="button"
            onClick={() => {
              sfx.cancel()
              exit()
            }}
          >
            {t('Lights back on')}
          </button>
        </div>
      </div>
    </div>
  )
}
