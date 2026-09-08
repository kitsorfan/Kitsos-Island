import { useEffect } from 'react'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'

export function Toast() {
  const toast = useGame((s) => s.toast)
  const dismiss = useGame((s) => s.dismissToast)

  useEffect(() => {
    if (!toast) return
    sfx.jingle()
    const id = window.setTimeout(dismiss, 3600)
    return () => window.clearTimeout(id)
  }, [toast, dismiss])

  if (!toast) return null

  return (
    <div className="toast" role="status">
      <span className="toast__label">Journal updated</span>
      <strong>{toast.title}</strong>
    </div>
  )
}
