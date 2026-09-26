import { useCoarsePointer } from './useCoarsePointer'

/**
 * What a close button shows: the cross, and the key that does the same job.
 * A touch screen has no Esc to press, so there it is the cross on its own.
 */
export function CloseMark() {
  const coarse = useCoarsePointer()
  return <>✕{!coarse && <kbd>Esc</kbd>}</>
}
