import { useState } from 'react'
import { INTERIOR_BY_ID } from '../data/interiors'
import { KEYS } from '../data/world'
import {
  TOTAL_ENTRIES,
  TOTAL_KEYS,
  keyCount,
  nextObjective,
  useGame,
} from '../state/store'
import * as sfx from '../game/audio'
import { ZOOM_STEP, sprintLock, zoomBy, zoomHold } from '../game/input'
import { BalloonHud } from './BalloonHud'
import { SettingsCard } from './SettingsCard'
import { useT } from '../i18n/useT'
import { HideHud } from './HideHud'
import { HoldMeter } from './HoldMeter'
import { Minimap } from './Minimap'
import { MotoHud } from './MotoHud'
import { RescueHud } from './RescueHud'
import { PaintballHud } from './PaintballHud'
import { useCoarsePointer } from './useCoarsePointer'

/**
 * One notch on the way down, and then it keeps going while you hold it.
 *
 * The step is on pointerdown rather than on click so that a press and a hold
 * are the same gesture starting: click fires on release, which would have put
 * an extra notch on the end of every hold.
 */
function ZoomButton({
  way,
  title,
  label,
}: {
  way: 'in' | 'out'
  title: string
  label: string
}) {
  const stop = () => {
    zoomHold.in = false
    zoomHold.out = false
  }
  return (
    <button
      className="icon-button"
      title={title}
      onPointerDown={() => {
        zoomBy(way === 'in' ? 1 / ZOOM_STEP : ZOOM_STEP)
        zoomHold[way] = true
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
    >
      {way === 'in' ? '🔍' : '🔭'}
      <span>{label}</span>
    </button>
  )
}

export function Hud() {
  const t = useT()
  const nearby = t(useGame((s) => s.nearby))
  const mode = useGame((s) => s.mode)
  const area = useGame((s) => s.area)
  const found = useGame((s) => s.entries.length)
  const keys = useGame((s) => s.keys)
  const missions = useGame((s) => s.missions)
  const lighthouseOpen = useGame((s) => s.lighthouseOpen)
  const hasMoved = useGame((s) => s.hasMoved)
  const openJournal = useGame((s) => s.openJournal)
  const openMap = useGame((s) => s.openMap)
  const openGreeting = useGame((s) => s.openGreeting)
  const night = useGame((s) => s.night)
  const firstPerson = useGame((s) => s.firstPerson)
  const toggleNight = useGame((s) => s.toggleNight)
  const handLight = useGame((s) => s.handLight)
  const toggleHandLight = useGame((s) => s.toggleHandLight)
  const party = useGame((s) => s.party)
  const amaliaHere = useGame((s) => s.amaliaHere)
  const fighting = useGame((s) => s.paintball?.status === 'playing')
  const riding = useGame((s) => s.moto?.status === 'riding')
  const flying = useGame((s) => s.balloon?.status === 'flying')
  const hiding = useGame((s) => s.hide?.status === 'playing')
  const sailing = useGame((s) => s.rescue?.status === 'sailing')
  const swimming = useGame((s) => s.swimming)
  /**
   * Any game at all, briefing card and result card included — which is what
   * the day-night switch is locked against, rather than only the minutes
   * you are actually playing.
   */
  const inGame = useGame((s) =>
    Boolean(s.hide || s.paintball || s.moto || s.balloon || s.rescue),
  )
  const openArcade = useGame((s) => s.openArcade)
  const exitPaintball = useGame((s) => s.exitPaintball)
  const exitMoto = useGame((s) => s.exitMoto)
  const exitBalloon = useGame((s) => s.exitBalloon)
  const exitHide = useGame((s) => s.exitHide)
  const exitRescue = useGame((s) => s.exitRescue)
  const playing = fighting || riding || flying || hiding || sailing
  const [settings, setSettings] = useState(false)
  const [sprint, setSprint] = useState(sprintLock.on)
  const coarse = useCoarsePointer()

  const percent = Math.round((found / TOTAL_ENTRIES) * 100)
  const have = keyCount(keys)
  const objective = t(nextObjective({ missions, keys, lighthouseOpen }))
  const indoors = area !== 'island'
  // Off the interior rather than the building: a cellar has no front door of
  // its own, so a building lookup comes back empty two floors down and the
  // banner reads "Kitsos Island" while you are standing under the house.
  const room = t(indoors ? INTERIOR_BY_ID.get(area) : undefined)

  return (
    <div
      className="hud"
      // A clicked button keeps the focus, and the browser then presses it
      // again on the next Enter or Space — which is how the day/night button
      // was being flipped by talking to someone. Nothing in the HUD should
      // answer the keyboard, so the focus is dropped as soon as it is used.
      onClick={(event) => {
        ;(event.target as HTMLElement).closest('button')?.blur()
      }}
    >
      <div className="hud__top">
        <div className="hud__left">
          {fighting && <PaintballHud />}
          {riding && <MotoHud />}
          {flying && <BalloonHud />}
          {hiding && <HideHud />}
          {sailing && <RescueHud />}
          <div className="badge" hidden={playing}>
            <span className="badge__title">
              {room ? `${room.name} · ${room.kicker}` : t('Kitsos Island')}
            </span>
            <div className="badge__meter">
              <div className="badge__fill" style={{ width: `${percent}%` }} />
            </div>
            <span className="badge__count">
              {found}/{TOTAL_ENTRIES} {t('discovered')}
            </span>
            <div className="keyring" title={`${have} of ${TOTAL_KEYS} keys`}>
              {KEYS.map((key) => (
                <span
                  key={key.id}
                  className={`keyring__key${keys[key.id] ? ' keyring__key--held' : ''}`}
                  style={{ '--key': key.color } as React.CSSProperties}
                  title={keys[key.id] ? t(key.name) : t('Not found yet')}
                >
                  🔑
                </span>
              ))}
            </div>
          </div>

          {objective && mode === 'explore' && !playing && (
            <div className="objective">
              <span className="objective__label">{t('Next')}</span>
              <strong>{objective.title}</strong>
              <p>{objective.detail}</p>
            </div>
          )}
        </div>

        <div className="hud__right">
          <div className="hud__buttons">
            <button
              className="icon-button"
              onClick={() => {
                sfx.confirm()
                openMap()
              }}
              title={t('Map (M)')}
            >
              🗺️<span>{t('Map')}</span>
            </button>
            <button
              className="icon-button"
              onClick={() => {
                sfx.confirm()
                openJournal()
              }}
              title={t('Journal (J)')}
            >
              📓<span>{t('Journal')}</span>
            </button>

            <button
              className={`icon-button${settings ? ' icon-button--live' : ''}`}
              onClick={() => {
                sfx.confirm()
                setSettings((v) => !v)
              }}
              title={t('Sound, music, quality, and the controls')}
            >
              ⚙️<span>{t('Settings')}</span>
            </button>
            <button
              className={`icon-button${playing ? ' icon-button--live' : ''}`}
              onClick={() => {
                if (fighting) exitPaintball()
                else if (riding) exitMoto()
                else if (flying) exitBalloon()
                else if (hiding) exitHide()
                else if (sailing) exitRescue()
                else openArcade()
              }}
              title={t('Island games (P)')}
            >
              {playing ? '🚪' : '🕹️'}
              <span>{t(playing ? 'Quit game' : 'Games')}</span>
            </button>
            <button
              className="icon-button icon-button--cta"
              onClick={() => {
                sfx.confirm()
                openGreeting()
              }}
              title={t('Contact & full CV (G)')}
            >
              👋<span>{t('Say hi')}</span>
            </button>
          </div>

          {settings && <SettingsCard />}

          {!indoors && !coarse && <Minimap />}
        </div>
      </div>

      {/* Day or night sits bottom left, out from under the badge and
          opposite the rest of the walking controls. */}
      <div className="hud__bottom">
        <div className="hud__buttons">
          <button
            className="icon-button"
            onClick={toggleNight}
            disabled={inGame}
            title={
              hiding
                ? t('The lights stay out until the game is over')
                : inGame
                  ? t('The light stays as it is until the game is over')
                  : t('Day or night (L)')
            }
          >
            {night ? '🌙' : '☀️'}
            <span>{t(night ? 'Night' : 'Day')}</span>
          </button>
        </div>

        {mode === 'explore' && !playing && (
          <div className="hud__buttons">
            {night && area === 'island' && (
              <button
                className="icon-button"
                onClick={toggleHandLight}
                disabled={swimming}
                title={t(
                  swimming
                    ? 'Nothing stays alight in the water'
                    : 'Flashlight, torch, or out (T)',
                )}
              >
                {handLight === 'torch'
                  ? '🔥'
                  : handLight === 'none'
                    ? '🌑'
                    : '🔦'}
                <span>
                  {t(
                    handLight === 'torch'
                      ? 'Torch'
                      : handLight === 'none'
                        ? 'Dark'
                        : 'Light',
                  )}
                </span>
              </button>
            )}
            <button
              className={`icon-button${sprint ? ' icon-button--live' : ''}`}
              aria-pressed={sprint}
              onClick={() => {
                sfx.confirm()
                const next = !sprint
                sprintLock.on = next
                setSprint(next)
              }}
              title={t('Keep running, the same as holding Shift')}
            >
              👟<span>{t(sprint ? 'Running' : 'Walk')}</span>
            </button>
            {/* Nothing to pull the camera back from when you are inside
                his head, so the pair of them stand down. */}
            {!firstPerson && (
              <>
                <ZoomButton
                  way="in"
                  title={t('Zoom in (Z, = or the wheel)')}
                  label={t('In')}
                />
                <ZoomButton
                  way="out"
                  title={t('Zoom out (C, - or the wheel)')}
                  label={t('Out')}
                />
              </>
            )}
          </div>
        )}
      </div>

      {mode === 'explore' && !hasMoved && !playing && (
        <p className="nudge">
          {coarse
            ? t('Drag the stick to walk, tap A to interact')
            : t('WASD to walk · Shift to sprint · M for the map')}
        </p>
      )}

      {party && (
        <p className="party-banner">
          <span>{t('Party in the plaza')}</span>
          <em>
            {amaliaHere
              ? t('Press the button again to call it a night')
              : t('Walk into the middle of the floor')}
          </em>
        </p>
      )}

      <HoldMeter />

      {mode === 'explore' && nearby && !playing && (
        <div className={`prompt${nearby.blocked ? ' prompt--locked' : ''}`}>
          {/* A door on a sensor has no key to offer: it names itself and
              opens as he reaches it. */}
          {nearby.silent ? (
            <span className="prompt__auto" aria-hidden="true">
              ▸
            </span>
          ) : (
            <kbd>{coarse ? 'A' : 'Enter'}</kbd>
          )}
          <span>
            {nearby.silent ? '' : nearby.verb ? `${nearby.verb} ` : ''}
            <strong>{nearby.label}</strong>
            {nearby.blocked ? ` · ${t('locked')}` : ''}
          </span>
        </div>
      )}
    </div>
  )
}
