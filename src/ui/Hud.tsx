import { useState } from 'react'
import { BUILDING_BY_ID, KEYS } from '../data/world'
import {
  TOTAL_ENTRIES,
  TOTAL_KEYS,
  keyCount,
  nextObjective,
  useGame,
} from '../state/store'
import * as sfx from '../game/audio'
import { BalloonHud } from './BalloonHud'
import { Minimap } from './Minimap'
import { MotoHud } from './MotoHud'
import { PaintballHud } from './PaintballHud'
import { useCoarsePointer } from './useCoarsePointer'

export function Hud() {
  const nearby = useGame((s) => s.nearby)
  const mode = useGame((s) => s.mode)
  const area = useGame((s) => s.area)
  const found = useGame((s) => s.entries.length)
  const keys = useGame((s) => s.keys)
  const missions = useGame((s) => s.missions)
  const lighthouseOpen = useGame((s) => s.lighthouseOpen)
  const muted = useGame((s) => s.muted)
  const hasMoved = useGame((s) => s.hasMoved)
  const openJournal = useGame((s) => s.openJournal)
  const openMap = useGame((s) => s.openMap)
  const openGreeting = useGame((s) => s.openGreeting)
  const toggleMute = useGame((s) => s.toggleMute)
  const musicOn = useGame((s) => s.musicOn)
  const toggleMusic = useGame((s) => s.toggleMusic)
  const night = useGame((s) => s.night)
  const toggleNight = useGame((s) => s.toggleNight)
  const handLight = useGame((s) => s.handLight)
  const toggleHandLight = useGame((s) => s.toggleHandLight)
  const party = useGame((s) => s.party)
  const amaliaHere = useGame((s) => s.amaliaHere)
  const fighting = useGame((s) => s.paintball?.status === 'playing')
  const riding = useGame((s) => s.moto?.status === 'riding')
  const flying = useGame((s) => s.balloon?.status === 'flying')
  const openArcade = useGame((s) => s.openArcade)
  const exitPaintball = useGame((s) => s.exitPaintball)
  const exitMoto = useGame((s) => s.exitMoto)
  const exitBalloon = useGame((s) => s.exitBalloon)
  const playing = fighting || riding || flying
  const [help, setHelp] = useState(false)
  const coarse = useCoarsePointer()

  const percent = Math.round((found / TOTAL_ENTRIES) * 100)
  const have = keyCount(keys)
  const objective = nextObjective({ missions, keys, lighthouseOpen })
  const indoors = area !== 'island'
  const room = indoors ? BUILDING_BY_ID.get(area) : undefined

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
          <div className="badge" hidden={playing}>
            <span className="badge__title">
              {room ? room.name : 'Kitsos Island'}
            </span>
            <div className="badge__meter">
              <div className="badge__fill" style={{ width: `${percent}%` }} />
            </div>
            <span className="badge__count">
              {found}/{TOTAL_ENTRIES} discovered
            </span>
            <div className="keyring" title={`${have} of ${TOTAL_KEYS} keys`}>
              {KEYS.map((key) => (
                <span
                  key={key.id}
                  className={`keyring__key${keys[key.id] ? ' keyring__key--held' : ''}`}
                  style={{ '--key': key.color } as React.CSSProperties}
                  title={keys[key.id] ? key.name : 'Not found yet'}
                >
                  🔑
                </span>
              ))}
            </div>
          </div>

          {objective && mode === 'explore' && !playing && (
            <div className="objective">
              <span className="objective__label">Next</span>
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
              title="Map (M)"
            >
              🗺️<span>Map</span>
            </button>
            <button
              className="icon-button"
              onClick={() => {
                sfx.confirm()
                openJournal()
              }}
              title="Journal (J)"
            >
              📓<span>Journal</span>
            </button>
            <button
              className="icon-button"
              onClick={() => {
                toggleMute()
                if (muted) sfx.confirm()
              }}
              title="Sound (N)"
            >
              {muted ? '🔇' : '🔊'}
              <span>{muted ? 'Muted' : 'Sound'}</span>
            </button>
            <button
              className="icon-button"
              onClick={() => {
                toggleMusic()
                if (!musicOn) sfx.confirm()
              }}
              title="Music (B)"
            >
              {musicOn ? '🎵' : '🎼'}
              <span>{musicOn ? 'Music' : 'No music'}</span>
            </button>
            <button
              className="icon-button"
              onClick={() => {
                sfx.confirm()
                toggleNight()
              }}
              title="Day or night (L)"
            >
              {night ? '🌙' : '☀️'}
              <span>{night ? 'Night' : 'Day'}</span>
            </button>
            {night && (
              <button
                className="icon-button"
                onClick={() => {
                  sfx.confirm()
                  toggleHandLight()
                }}
                title="Torch or flashlight (T)"
              >
                {handLight === 'torch' ? '🔥' : '🔦'}
                <span>{handLight === 'torch' ? 'Torch' : 'Light'}</span>
              </button>
            )}
            <button
              className={`icon-button${playing ? ' icon-button--live' : ''}`}
              onClick={() => {
                if (fighting) exitPaintball()
                else if (riding) exitMoto()
                else if (flying) exitBalloon()
                else openArcade()
              }}
              disabled={Boolean(night) && !playing}
              title={
                night && !playing
                  ? 'The games are played in daylight'
                  : 'Island games (P)'
              }
            >
              {playing ? '🚪' : '🕹️'}
              <span>{playing ? 'Quit game' : 'Games'}</span>
            </button>
            <button
              className="icon-button icon-button--cta"
              onClick={() => {
                sfx.confirm()
                openGreeting()
              }}
              title="Contact & full CV (C)"
            >
              👋<span>Say hi</span>
            </button>
            <button
              className="icon-button"
              onClick={() => setHelp((v) => !v)}
              title="Controls"
            >
              ❔<span>Controls</span>
            </button>
          </div>

          {help && (
            <div className="help-card">
              <h3>Controls</h3>
              <dl>
                <div><dt>Move</dt><dd>WASD / Arrows</dd></div>
                <div><dt>Sprint</dt><dd>Shift</dd></div>
                <div><dt>Interact</dt><dd>E / Enter</dd></div>
                <div><dt>Jump</dt><dd>Space</dd></div>
                <div><dt>Turn camera</dt><dd>Q and R</dd></div>
                <div><dt>Map & travel</dt><dd>M</dd></div>
                <div><dt>Journal</dt><dd>J</dd></div>
                <div><dt>Sound</dt><dd>N</dd></div>
                <div><dt>Music</dt><dd>B</dd></div>
                <div><dt>Day / night</dt><dd>L</dd></div>
                <div><dt>Torch / flashlight</dt><dd>T</dd></div>
                <div><dt>Contact &amp; CV</dt><dd>C</dd></div>
                <div><dt>Games board</dt><dd>P</dd></div>
                <div><dt>Shoot paint</dt><dd>Space / click</dd></div>
                <div><dt>Get down</dt><dd>Ctrl</dd></div>
                <div><dt>Wheelie</dt><dd>Space</dd></div>
                <div><dt>Burner / vent</dt><dd>Shift / Ctrl</dd></div>
                <div><dt>Water bomb</dt><dd>Space</dd></div>
                <div><dt>Confetti</dt><dd>F</dd></div>
                <div><dt>Back / leave</dt><dd>Esc</dd></div>
              </dl>
              <button className="button" onClick={() => setHelp(false)}>
                Got it
              </button>
            </div>
          )}

          {!indoors && !coarse && <Minimap />}
        </div>
      </div>

      {mode === 'explore' && !hasMoved && !playing && (
        <p className="nudge">
          {coarse
            ? 'Drag the stick to walk, tap A to interact'
            : 'WASD to walk · Shift to sprint · M for the map'}
        </p>
      )}

      {party && (
        <p className="party-banner">
          <span>Party in the plaza</span>
          <em>
            {amaliaHere
              ? 'Press the button again to call it a night'
              : 'Walk into the middle of the floor'}
          </em>
        </p>
      )}

      {mode === 'explore' && nearby && !playing && (
        <div className={`prompt${nearby.blocked ? ' prompt--locked' : ''}`}>
          <kbd>{coarse ? 'A' : 'E'}</kbd>
          <span>
            {nearby.verb ? `${nearby.verb} ` : ''}
            <strong>{nearby.label}</strong>
            {nearby.blocked ? ' — locked' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
