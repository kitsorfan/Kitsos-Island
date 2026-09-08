import { useEffect } from 'react'
import {
  INTERACT_KEYS,
  MOVE_KEYS,
  clearKeys,
  queueInteract,
  setKey,
} from '../game/input'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'

/** Advance handler owned by the dialogue box, so typing can be skipped. */
export const dialogueBridge = { advance: () => useGame.getState().advance() }

const SCROLL_KEYS = new Set([
  'Space',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
])

export function useKeyboard() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return

      const { mode, start, closePanel, closeJournal, openJournal, toggleMute } =
        useGame.getState()

      if (SCROLL_KEYS.has(event.code) && mode !== 'panel') event.preventDefault()
      if (event.code in MOVE_KEYS || event.code.startsWith('Shift')) {
        setKey(event.code, true)
      }
      if (event.repeat) return

      setKey(event.code, true)

      switch (mode) {
        case 'title':
          if (INTERACT_KEYS.has(event.code)) start()
          return
        case 'dialogue':
          if (INTERACT_KEYS.has(event.code)) dialogueBridge.advance()
          else if (event.code === 'Escape') useGame.getState().closeDialogue()
          return
        case 'panel':
          if (event.code === 'Escape' || event.code === 'KeyX') {
            sfx.cancel()
            closePanel()
          }
          return
        case 'journal':
          if (
            event.code === 'Escape' ||
            event.code === 'KeyJ' ||
            event.code === 'KeyX'
          ) {
            sfx.cancel()
            closeJournal()
          }
          return
        default:
          if (INTERACT_KEYS.has(event.code)) queueInteract()
          else if (event.code === 'KeyJ') {
            sfx.confirm()
            openJournal()
          } else if (event.code === 'KeyM') toggleMute()
      }
    }

    const onKeyUp = (event: KeyboardEvent) => setKey(event.code, false)
    const onBlur = () => clearKeys()

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])
}
