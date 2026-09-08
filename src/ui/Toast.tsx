import { useEffect } from 'react'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'

const LABEL = {
  journal: 'Journal updated',
  key: 'Key obtained',
  mission: 'New mission',
} as const

export function Toast() {
  const toast = useGame((s) => s.toast)
  const dismiss = useGame((s) => s.dismissToast)

  useEffect(() => {
    if (!toast) return
    if (toast.kind !== 'key') sfx.jingle()
    const id = window.setTimeout(dismiss, 4200)
    return () => window.clearTimeout(id)
  }, [toast, dismiss])

  if (!toast) return null

  return (
    <div className={`toast toast--${toast.kind}`} role="status">
      <span className="toast__label">{LABEL[toast.kind]}</span>
      <strong>{toast.title}</strong>
      <p>{toast.body}</p>
    </div>
  )
}
