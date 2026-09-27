import { useEffect, useRef, useState } from 'react'
import { COUNT, HEAD_START, HIDE, HOLD_OUT } from './hideLogic'
import { isCrouching } from '../player/input'
import { useGame } from '../../shared/state/store'
import { useCoarsePointer } from '../../shared/ui/useCoarsePointer'
import { useScreen } from '../../shared/ui/useScreen'
import { useT } from '../../shared/i18n/useT'
import { fill } from '../../shared/i18n'

interface Readout {
  found: number
  /** How far off you are giving yourself away, while hiding. */
  drawing: number
  /** 0 to 1: how near the closest one you have not found is. */
  warmth: number
  /** Bumped once per thump, which is what re-runs the flash. */
  pulse: number
  /** Seconds of the head start left, then seconds still to survive. */
  counting: number
  left: number
  /** How many of them are running at you, and how close the nearest is. */
  chasers: number
  closest: number
  seen: boolean
  crouched: boolean
  feed: {
    text: string
    slots?: Record<string, string | number>
    kind: 'good' | 'bad'
    at: number
  } | null
}

const EMPTY: Readout = {
  found: 0,
  drawing: 0,
  warmth: 0,
  pulse: 0,
  counting: 0,
  left: HOLD_OUT,
  chasers: 0,
  closest: 0,
  seen: false,
  crouched: false,
  feed: null,
}

/** The game runs outside React, so the panel reads it on its own frame. */
function useReadout(active: boolean): Readout {
  const [state, setState] = useState<Readout>(EMPTY)
  const last = useRef(0)

  useEffect(() => {
    if (!active) return
    let raf = 0
    const tick = (now: number) => {
      if (now - last.current > 70) {
        last.current = now
        setState({
          found: HIDE.found,
          drawing: HIDE.drawing,
          warmth: HIDE.warmth,
          pulse: HIDE.pulse,
          counting: HIDE.headStart,
          left: Math.max(0, HOLD_OUT - (HIDE.elapsed - HEAD_START)),
          chasers: HIDE.chasers,
          closest: HIDE.closest,
          seen: HIDE.seen,
          crouched: isCrouching(),
          feed: HIDE.feed,
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return state
}

export function HideHud() {
  const t = useT()
  const playing = useGame((s) => s.hide?.status === 'playing')
  const role = useGame((s) => s.hide?.role)
  const handLight = useGame((s) => s.handLight)
  const readout = useReadout(Boolean(playing))
  const coarse = useCoarsePointer()
  /* Shorter counts on a phone, where the panel shares the top line. */
  const { mobile } = useScreen()

  if (!playing) return null
  const seeking = role === 'seeker'
  const lit = handLight !== 'none'

  return (
    <div className="hd">
      {/* The proximity thump: the edges of the screen breathe, evenly all the
          way round, so it says how near without ever saying which way. */}
      {seeking && readout.warmth > 0 && (
        <div
          key={readout.pulse}
          className="hd__pulse"
          style={{ '--warmth': readout.warmth } as React.CSSProperties}
          aria-hidden
        />
      )}

      {!seeking && readout.counting > 0 && (
        <div className="hd-count" aria-live="polite">
          <strong key={Math.ceil(readout.counting)}>
            {Math.ceil(readout.counting)}
          </strong>
          <em>{t('They are still counting. Get out of sight.')}</em>
        </div>
      )}

      {!seeking && readout.chasers > 0 && (
        <div key={readout.chasers} className="hd__flash" aria-hidden />
      )}

      <div className="hd__panel">
        <span className="hd__label">
          {t(seeking ? 'Hide and seek: seeking' : 'Hide and seek: hiding')}
        </span>

        {seeking ? (
          <>
            <div className="hd__found">
              <span className="hd__torch" aria-hidden>
                🔦
              </span>
              <strong key={readout.found}>{readout.found}</strong>
              <em>
                {fill(t(mobile ? 'of {total}' : 'of {total} found'), {
                  total: COUNT,
                })}
              </em>
            </div>
            <div className="hd__bar">
              <div
                className="hd__bar-fill"
                style={{ width: `${(readout.found / COUNT) * 100}%` }}
              />
            </div>
            <p className="hd__task">
              {t(
                readout.warmth > 0.55
                  ? 'Somebody is very close.'
                  : readout.warmth > 0
                    ? 'Something is near here.'
                    : 'Walk up and touch them. A light is not enough.',
              )}
            </p>
            {!lit && (
              <p className="hd__warn">
                {t(
                  'Your torch is out. Press T or you will never see them at all',
                )}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="hd__found">
              <span className="hd__torch" aria-hidden>
                🌒
              </span>
              <strong>
                {mobile
                  ? fill(t('{s}s'), { s: Math.ceil(readout.left) })
                  : Math.ceil(readout.left)}
              </strong>
              {!mobile && <em>{t('seconds to hold out')}</em>}
            </div>
            <div className="hd__bar">
              <div
                className="hd__bar-fill"
                style={{
                  width: `${((HOLD_OUT - readout.left) / HOLD_OUT) * 100}%`,
                }}
              />
            </div>
            <div
              className={`hd__meter${readout.chasers > 0 ? ' hd__meter--seen' : ''}`}
            >
              {/* Fills as the nearest one closes, so it reads as distance
                  rather than as a countdown you cannot do anything about. */}
              <div
                className="hd__meter-fill"
                style={{
                  width: `${
                    readout.chasers > 0
                      ? Math.max(6, Math.min(100, 100 - readout.closest * 2.6))
                      : 0
                  }%`,
                }}
              />
              <span>
                {readout.chasers > 0
                  ? fill(t('{count} AFTER YOU: {metres}m'), {
                      count: readout.chasers,
                      metres: Math.round(readout.closest),
                    })
                  : t(readout.seen ? 'SEEN' : 'Nobody has seen you')}
              </span>
            </div>
            <div className="hd__states">
              <span
                className={`hd__state${readout.crouched ? ' hd__state--on' : ''}`}
              >
                {t('Low')}
              </span>
              <span
                className={`hd__state${lit ? ' hd__state--bad' : ' hd__state--on'}`}
              >
                {t(lit ? 'Torch lit' : 'Torch out')}
              </span>
            </div>
            {readout.drawing > 0 && (
              <p className="hd__warn">
                {fill(
                  t(
                    lit
                      ? 'That torch is visible right across the town · anyone inside {metres}m is on their way'
                      : 'They can hear you moving · anyone inside {metres}m is on their way',
                  ),
                  { metres: Math.round(readout.drawing) },
                )}
              </p>
            )}
          </>
        )}
      </div>

      {readout.feed && (
        <p
          key={readout.feed.at}
          className={`hd__feed hd__feed--${readout.feed.kind}`}
        >
          {fill(t(readout.feed.text), t(readout.feed.slots ?? {}))}
        </p>
      )}

      <p className="hd__keys">
        {coarse ? (
          <>
            <kbd>{t('Stick')}</kbd> {t('walk')} · <kbd>{t('DUCK')}</kbd>{' '}
            {t('keep low')}
          </>
        ) : (
          <>
            <kbd>WASD</kbd> {t('walk')} · <kbd>Ctrl</kbd> {t('keep low')} ·{' '}
            <kbd>T</kbd> {t('torch')} · <kbd>Esc</kbd> {t('give up')}
          </>
        )}
      </p>
    </div>
  )
}
