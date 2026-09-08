import { useEffect, useRef } from 'react'
import { queueInteract, touchStick } from '../game/input'
import { useGame } from '../state/store'
import { dialogueBridge } from './useKeyboard'
import { useCoarsePointer } from './useCoarsePointer'
import * as sfx from '../game/audio'

const RADIUS = 52

export function TouchControls() {
  const coarse = useCoarsePointer()
  const mode = useGame((s) => s.mode)
  const openJournal = useGame((s) => s.openJournal)
  const base = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const pointerId = useRef<number | null>(null)

  useEffect(() => () => {
    touchStick.active = false
    touchStick.x = 0
    touchStick.y = 0
  }, [])

  if (!coarse || (mode !== 'explore' && mode !== 'dialogue')) return null

  const move = (event: React.PointerEvent) => {
    if (pointerId.current !== event.pointerId || !base.current) return
    const rect = base.current.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const dist = Math.min(RADIUS, Math.hypot(dx, dy))
    const angle = Math.atan2(dy, dx)
    const nx = (Math.cos(angle) * dist) / RADIUS
    const ny = (Math.sin(angle) * dist) / RADIUS

    touchStick.x = nx
    touchStick.y = -ny
    touchStick.active = true
    if (knob.current) {
      knob.current.style.transform = `translate(${nx * RADIUS}px, ${ny * RADIUS}px)`
    }
  }

  const release = () => {
    pointerId.current = null
    touchStick.active = false
    touchStick.x = 0
    touchStick.y = 0
    if (knob.current) knob.current.style.transform = 'translate(0px, 0px)'
  }

  return (
    <div className="touch">
      <div
        className="stick"
        ref={base}
        onPointerDown={(e) => {
          pointerId.current = e.pointerId
          e.currentTarget.setPointerCapture(e.pointerId)
          move(e)
        }}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <div className="stick__knob" ref={knob} />
      </div>

      <div className="touch__buttons">
        {mode === 'explore' && (
          <button
            className="round-button round-button--small"
            onPointerDown={(e) => {
              e.preventDefault()
              sfx.confirm()
              openJournal()
            }}
          >
            J
          </button>
        )}
        <button
          className="round-button"
          onPointerDown={(e) => {
            e.preventDefault()
            if (mode === 'dialogue') dialogueBridge.advance()
            else queueInteract()
          }}
        >
          A
        </button>
      </div>
    </div>
  )
}
