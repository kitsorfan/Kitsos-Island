import { useState } from 'react'
import { TOTAL_ENTRIES, useGame } from '../state/store'
import { useCoarsePointer } from './useCoarsePointer'
import * as sfx from '../game/audio'

export function Hud() {
  const nearby = useGame((s) => s.nearby)
  const mode = useGame((s) => s.mode)
  const found = useGame((s) => s.entries.length)
  const muted = useGame((s) => s.muted)
  const hasMoved = useGame((s) => s.hasMoved)
  const openJournal = useGame((s) => s.openJournal)
  const toggleMute = useGame((s) => s.toggleMute)
  const [help, setHelp] = useState(false)
  const coarse = useCoarsePointer()

  const percent = Math.round((found / TOTAL_ENTRIES) * 100)

  return (
    <div className="hud">
      <div className="hud__top">
        <div className="badge">
          <span className="badge__title">Kitsos Island</span>
          <div className="badge__meter">
            <div className="badge__fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="badge__count">
            {found}/{TOTAL_ENTRIES} discovered
          </span>
        </div>

        <div className="hud__buttons">
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
            title="Sound (M)"
          >
            {muted ? '🔇' : '🔊'}
            <span>{muted ? 'Muted' : 'Sound'}</span>
          </button>
          <button
            className="icon-button"
            onClick={() => setHelp((v) => !v)}
            title="Controls"
          >
            ❔<span>Controls</span>
          </button>
        </div>
      </div>

      {help && (
        <div className="help-card">
          <h3>Controls</h3>
          <dl>
            <div><dt>Move</dt><dd>WASD / Arrow keys</dd></div>
            <div><dt>Run</dt><dd>Shift</dd></div>
            <div><dt>Interact</dt><dd>E / Space / Enter</dd></div>
            <div><dt>Rotate camera</dt><dd>Q and R</dd></div>
            <div><dt>Journal</dt><dd>J</dd></div>
            <div><dt>Sound</dt><dd>M</dd></div>
            <div><dt>Back</dt><dd>Esc</dd></div>
          </dl>
          <button className="button" onClick={() => setHelp(false)}>
            Got it
          </button>
        </div>
      )}

      {mode === 'explore' && !hasMoved && (
        <p className="nudge">
          {coarse
            ? 'Drag the stick to walk, tap A to interact'
            : 'Use WASD or the arrow keys to walk around'}
        </p>
      )}

      {mode === 'explore' && nearby && (
        <div className="prompt">
          <kbd>{coarse ? 'A' : 'E'}</kbd>
          <span>
            {nearby.verb} <strong>{nearby.label}</strong>
          </span>
        </div>
      )}
    </div>
  )
}
