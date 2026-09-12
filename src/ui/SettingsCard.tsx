import { useState } from 'react'
import { LEVELS } from '../game/audio'
import { TOTAL_ENTRIES, hasProgress, keyCount, useGame } from '../state/store'
import * as sfx from '../game/audio'
import type { Quality } from '../types'
import { LOCALES, useTranslate } from '../i18n'

/**
 * Everything the visitor is allowed to turn down, in one place.
 *
 * The two volumes are sliders rather than pips because a slider can be
 * dragged, arrowed, and read by a screen reader without any of that having to
 * be written here, and because hearing the steps go by while dragging is the
 * whole point of having more than an on and an off.
 *
 * The progress row is here rather than in the journal because this is where a
 * visitor comes looking for what the page has kept about them, and the only
 * honest answer to that is next to the button that takes it back.
 */

const QUALITIES: { id: Quality; label: string; hint: string }[] = [
  { id: 'auto', label: 'Auto', hint: 'Steps down if the island runs slow' },
  { id: 'high', label: 'High', hint: 'Shadows always on' },
  { id: 'low', label: 'Low', hint: 'Shadows off — fastest' },
]

/** 'Off', then one bar per step, so the number means something at a glance. */
function readout(level: number) {
  return level === 0 ? null : '▮'.repeat(level) + '▯'.repeat(LEVELS - level)
}

export function SettingsCard() {
  const quality = useGame((s) => s.quality)
  const autoDropped = useGame((s) => s.autoDropped)
  const setQuality = useGame((s) => s.setQuality)
  const musicLevel = useGame((s) => s.musicLevel)
  const sfxLevel = useGame((s) => s.sfxLevel)
  const setMusicLevel = useGame((s) => s.setMusicLevel)
  const setSfxLevel = useGame((s) => s.setSfxLevel)
  const locale = useGame((s) => s.locale)
  const setLocale = useGame((s) => s.setLocale)
  const found = useGame((s) => s.entries.length)
  const keys = useGame((s) => s.keys)
  const clearProgress = useGame((s) => s.clearProgress)
  const walked = useGame(hasProgress)
  const t = useTranslate(locale)

  // Asking twice, because the button sits one tap away from the volume and
  // there is no way back from it.
  const [confirming, setConfirming] = useState(false)

  const active = QUALITIES.find((q) => q.id === quality)

  return (
    <div className="settings-card">
      <h3>{t('Settings')}</h3>

      <div className="setting setting--stacked">
        <span className="setting__name">{t('Language')}</span>
        <div className="setting__choices" role="group" aria-label="Language">
          {LOCALES.map((l) => (
            <button
              key={l.id}
              className={`chip${locale === l.id ? ' chip--on' : ''}`}
              aria-pressed={locale === l.id}
              onClick={() => {
                sfx.confirm()
                setLocale(l.id)
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="setting">
        <span className="setting__name">{t('Music')}</span>
        <input
          className="setting__slider"
          type="range"
          min={0}
          max={LEVELS}
          step={1}
          value={musicLevel}
          onChange={(event) => setMusicLevel(Number(event.target.value))}
          aria-label={`Music volume, ${musicLevel} of ${LEVELS}`}
        />
        <span className="setting__value">
          {readout(musicLevel) ?? t('Off')}
        </span>
      </div>

      <div className="setting">
        <span className="setting__name">{t('Sound')}</span>
        <input
          className="setting__slider"
          type="range"
          min={0}
          max={LEVELS}
          step={1}
          value={sfxLevel}
          onChange={(event) => setSfxLevel(Number(event.target.value))}
          aria-label={`Sound effect volume, ${sfxLevel} of ${LEVELS}`}
        />
        <span className="setting__value">{readout(sfxLevel) ?? t('Off')}</span>
      </div>

      <div className="setting setting--stacked">
        <span className="setting__name">{t('Quality')}</span>
        <div className="setting__choices" role="group" aria-label="Quality">
          {QUALITIES.map((q) => (
            <button
              key={q.id}
              className={`chip${quality === q.id ? ' chip--on' : ''}`}
              aria-pressed={quality === q.id}
              onClick={() => {
                sfx.confirm()
                setQuality(q.id)
              }}
            >
              {t(q.label)}
            </button>
          ))}
        </div>
      </div>

      <p className="settings-card__hint">
        {quality === 'auto' && autoDropped
          ? t(
              'Auto found this machine short of 30fps and turned shadows off. High overrules it.',
            )
          : t(active?.hint ?? '')}
      </p>

      <div className="settings-card__progress">
        <h4>{t('Progress')}</h4>
        <p>
          {found} {t('of')} {TOTAL_ENTRIES} {t('discovered')} · {keyCount(keys)}{' '}
          {t('keys')}
        </p>
        {confirming ? (
          <>
            <p className="settings-card__warn">
              {t('This cannot be undone. Walk it all again?')}
            </p>
            <div className="setting__choices">
              <button
                className="chip chip--warn"
                onClick={() => {
                  sfx.cancel()
                  clearProgress()
                  setConfirming(false)
                }}
              >
                {t('Clear it')}
              </button>
              <button
                className="chip"
                onClick={() => {
                  sfx.confirm()
                  setConfirming(false)
                }}
              >
                {t('Keep it')}
              </button>
            </div>
          </>
        ) : (
          <button
            className="chip"
            disabled={!walked}
            onClick={() => {
              sfx.confirm()
              setConfirming(true)
            }}
          >
            {t('Clear progress')}
          </button>
        )}
      </div>

      <div className="settings-card__controls">
        <h4>{t('Controls')}</h4>
        <dl>
          <div>
            <dt>{t('Move')}</dt>
            <dd>{t('WASD / Arrows')}</dd>
          </div>
          <div>
            <dt>{t('Sprint')}</dt>
            <dd>{t('Shift')}</dd>
          </div>
          <div>
            <dt>{t('Interact')}</dt>
            <dd>{t('E / Enter')}</dd>
          </div>
          <div>
            <dt>{t('Jump')}</dt>
            <dd>{t('Space')}</dd>
          </div>
          <div>
            <dt>{t('Turn camera')}</dt>
            <dd>{t('Q and R')}</dd>
          </div>
          <div>
            <dt>{t('Zoom')}</dt>
            <dd>{t('Wheel, - and =')}</dd>
          </div>
          <div>
            <dt>{t('Map & travel')}</dt>
            <dd>{t('M')}</dd>
          </div>
          <div>
            <dt>{t('Journal')}</dt>
            <dd>{t('J')}</dd>
          </div>
          <div>
            <dt>{t('Day / night')}</dt>
            <dd>{t('L')}</dd>
          </div>
          <div>
            <dt>{t('Torch / flashlight')}</dt>
            <dd>{t('T')}</dd>
          </div>
          <div>
            <dt>{t('Contact & CV')}</dt>
            <dd>{t('C')}</dd>
          </div>
          <div>
            <dt>{t('Games board')}</dt>
            <dd>{t('P')}</dd>
          </div>
          <div>
            <dt>{t('Shoot paint')}</dt>
            <dd>{t('Space / click')}</dd>
          </div>
          <div>
            <dt>{t('Get down')}</dt>
            <dd>{t('Ctrl')}</dd>
          </div>
          <div>
            <dt>{t('Wheelie')}</dt>
            <dd>{t('Space')}</dd>
          </div>
          <div>
            <dt>{t('Burner / vent')}</dt>
            <dd>{t('Shift / Ctrl')}</dd>
          </div>
          <div>
            <dt>{t('Water bomb')}</dt>
            <dd>{t('Space')}</dd>
          </div>
          <div>
            <dt>{t('Confetti')}</dt>
            <dd>{t('F')}</dd>
          </div>
          <div>
            <dt>{t('Swing the beam')}</dt>
            <dd>{t('A and D')}</dd>
          </div>
          <div>
            <dt>{t('Wide pulse')}</dt>
            <dd>{t('Space')}</dd>
          </div>
          <div>
            <dt>{t('Back / leave')}</dt>
            <dd>{t('Esc')}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
