import { COUNT, HEAD_START, HOLD_OUT } from '../game/hide'
import type { Role } from '../game/hide'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'
import { useCoarsePointer } from './useCoarsePointer'
import { useT } from '../i18n/useT'

const clock = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
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
          {briefing ? 'Hide and seek · after dark' : `Game ${game.round}`}
        </span>
        <h2 className="hd-card__title">
          {briefing
            ? 'Lights out on the island'
            : game.won
              ? seeking
                ? 'Every one of them found'
                : 'Never found you'
              : 'Found you'}
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
                'You seek',
                `All ${COUNT} of them hide. Go and find them with your torch.`,
              )}
              {side(
                'hider',
                'You hide',
                `${HEAD_START} seconds to disappear, then all ${COUNT} come looking.`,
              )}
            </div>

            <ul className="hd-card__rules">
              {seeking ? (
                <>
                  <li>
                    Shining a light on somebody is not finding them. You have to{' '}
                    <strong>{t('walk up and touch them')}</strong>.
                  </li>
                  <li>
                    Keep the torch <strong>{t('lit')}</strong>, or you will walk
                    past every one of them in the dark. Nothing tells you where
                    they are. They are behind things.
                  </li>
                  <li>
                    Nothing is timed against you. The clock only says how long
                    it took to find all {COUNT}.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>{HEAD_START} seconds</strong> while they count.
                    After that every one of them is out with a torch.
                  </li>
                  <li>
                    Stay out of their hands for{' '}
                    <strong>{HOLD_OUT} seconds</strong> and you have won the
                    night. Being seen is not being caught. Somebody has to reach
                    you, the same rule you play by the other way round.
                  </li>
                  <li>
                    <strong>{t('They run when they see you')}</strong>, and a
                    shade faster than you can. Speed is no way out of it. Get
                    something solid between you and them and they will lose you.
                  </li>
                  <li>
                    <strong>{t('Anything you do draws them.')}</strong> Walking
                    is heard from a good way off, crouch-walking from barely
                    any, and a lit torch is seen right across the town, so
                    everyone inside that range stops looking where they were and
                    comes to look at you.
                  </li>
                  <li>
                    <strong>{t('Still and dark is safe')}</strong>, up to a
                    point. Every so often one of them takes it into their head
                    to come and look exactly where you are anyway.
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
                ? `All ${COUNT} of them out of the dark, one torch beam at a time.`
                : game.won
                  ? `${HOLD_OUT} seconds with the whole island looking, and not one of them got a beam on you.`
                  : 'Somebody held a light on you just long enough to be sure.'}
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
                  <strong>{clock(game.seconds)}</strong>
                </div>
              )}
              <div>
                <span>{seeking ? 'Took' : 'Needed'}</span>
                <strong>
                  {seeking ? clock(game.seconds) : `${HOLD_OUT}s`}
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
            {briefing ? (seeking ? 'Start counting' : 'Go and hide') : 'Again'}
          </button>
          <button
            className="button"
            onClick={() => {
              sfx.cancel()
              exit()
            }}
          >
            Lights back on
          </button>
        </div>
      </div>
    </div>
  )
}
