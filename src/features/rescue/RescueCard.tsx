import { SOULS } from './rescue'
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

/** The briefing before a run, and the card at the end of one. */
export function RescueCard() {
  const t = useT()
  const run = useGame((s) => s.rescue)
  const begin = useGame((s) => s.beginRescue)
  const exit = useGame((s) => s.exitRescue)
  const again = useGame((s) => s.openRescue)
  const coarse = useCoarsePointer()

  if (!run) return null
  const briefing = run.status === 'briefing'

  return (
    <div className="overlay">
      <div className="rescue-card">
        <span className="rescue-card__kicker">
          {briefing
            ? t('Mayday')
            : fill(t('Run {round}'), { round: run.round })}
        </span>
        <h2 className="rescue-card__title">
          {t(
            briefing
              ? 'Take the lifeboat out'
              : run.won
                ? 'Everyone aboard'
                : 'A flare went out',
          )}
        </h2>

        {briefing ? (
          <>
            <p className="rescue-card__lead">
              {rich(
                t(
                  'A boat went down off the coast in the night and her people are in the water in rafts. <b>{count} of them</b> will put up hand flares over the next few minutes, and a hand flare burns for a little over a minute. After that there is nothing left out there to steer by.',
                ),
                { count: SOULS },
              )}
            </p>

            <dl className="rescue-keys">
              {coarse ? (
                <>
                  <div>
                    <dt>{t('Throttle')}</dt>
                    <dd>{t('Stick')}</dd>
                  </div>
                  <div>
                    <dt>{t('Astern')}</dt>
                    <dd>{t('Pull the stick back')}</dd>
                  </div>
                  <div>
                    <dt>{t('Helm')}</dt>
                    <dd>{t('Stick left and right')}</dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt>{t('Throttle')}</dt>
                    <dd>W</dd>
                  </div>
                  <div>
                    <dt>{t('Astern')}</dt>
                    <dd>S</dd>
                  </div>
                  <div>
                    <dt>{t('Helm')}</dt>
                    <dd>{t('A and D')}</dd>
                  </div>
                  <div>
                    <dt>{t('Chart')}</dt>
                    <dd>M</dd>
                  </div>
                  <div>
                    <dt>{t('Put in')}</dt>
                    <dd>{t('Esc')}</dd>
                  </div>
                </>
              )}
            </dl>

            <ul className="rescue-card__rules">
              <li>
                {rich(
                  t(
                    'Get alongside a raft and <b>take the way off her</b>. Nobody can climb a net at speed, so the last twenty metres are done on nothing but what she is already carrying.',
                  ),
                )}
              </li>
              <li>
                {t(
                  'The ring on the water round the boat goes green the moment she is slow enough, and the ring round the raft fills as they come over. Open the throttle and it empties again.',
                )}
              </li>
              <li>
                {t(
                  'The panel lists every flare in the water, shortest first, and that order is the only real decision in the game. Let one burn out and the run is over.',
                )}
              </li>
            </ul>
          </>
        ) : (
          <>
            <p className="rescue-card__lead">
              {t(
                run.won
                  ? 'Every one of them off the water and under the shelter aft. They will all have a story about the boat that came.'
                  : 'One of the flares went out before you got there, and a raft in the dark is a raft nobody finds. The others are still out there.',
              )}
            </p>
            <div className="rescue-card__score">
              <div>
                <span>{t('Taken aboard')}</span>
                <strong>
                  {run.saved}/{SOULS}
                </strong>
              </div>
              <div>
                <span>{t('Time at sea')}</span>
                <strong>{clock(run.seconds, t)}</strong>
              </div>
            </div>
          </>
        )}

        <div className="rescue-card__actions">
          <button
            className="button button--primary"
            onClick={() => (briefing ? begin() : again())}
          >
            {t(briefing ? 'Cast off' : 'Out again')}
          </button>
          <button
            className="button"
            onClick={() => {
              sfx.cancel()
              exit()
            }}
          >
            {t('Back on the dock')}
          </button>
        </div>
      </div>
    </div>
  )
}
