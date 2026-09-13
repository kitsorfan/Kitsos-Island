import { useCallback, useEffect, useState } from 'react'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'
import { dialogueBridge } from './useKeyboard'
import { useT } from '../i18n/useT'

const CHARS_PER_SECOND = 120

export function DialogueBox() {
  const t = useT()
  const dialogue = t(useGame((s) => s.dialogue))
  const advance = useGame((s) => s.advance)
  const [typed, setTyped] = useState({ line: '', shown: 0 })

  const line = dialogue?.lines[dialogue.page] ?? ''
  // A new line always starts empty, without a reset render.
  const shown = typed.line === line ? typed.shown : 0
  const done = shown >= line.length

  useEffect(() => {
    if (!line) return
    let raf = 0
    let last = performance.now()
    let count = 0
    let sinceBlip = 0

    const tick = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      count = Math.min(line.length, count + delta * CHARS_PER_SECOND)
      sinceBlip += delta
      if (sinceBlip > 0.042) {
        sinceBlip = 0
        if (count < line.length) sfx.blip()
      }
      setTyped({ line, shown: Math.floor(count) })
      if (count < line.length) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [line])

  /** First press finishes the line, the next one turns the page. */
  const step = useCallback(() => {
    if (done) advance()
    else setTyped({ line, shown: line.length })
  }, [advance, done, line])

  useEffect(() => {
    dialogueBridge.advance = step
    return () => {
      dialogueBridge.advance = () => useGame.getState().advance()
    }
  }, [step])

  if (!dialogue) return null

  const isLast = dialogue.page === dialogue.lines.length - 1

  return (
    <div className="dialogue-layer" onPointerDown={step}>
      <div className="dialogue" role="dialog" aria-live="polite">
        <div className="dialogue__name">
          <span>{dialogue.speaker}</span>
          {dialogue.role && <em>{dialogue.role}</em>}
        </div>
        <p className="dialogue__text">
          {line.slice(0, shown)}
          <span className="dialogue__caret" aria-hidden>
            {done ? '' : '▌'}
          </span>
        </p>
        <div className="dialogue__footer">
          <span className="dialogue__pages">
            {dialogue.page + 1} / {dialogue.lines.length}
          </span>
          <span className="dialogue__hint">
            {t(done ? (isLast ? 'Close' : 'Next') : 'Skip')}
            <kbd>Enter</kbd>
          </span>
          {done && (
            <span className="dialogue__arrow" aria-hidden>
              ▼
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
