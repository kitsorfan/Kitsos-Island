import { useMediaQuery } from './useScreen'

/** True on touch-first devices, so the UI can talk about the stick, not WASD. */
export function useCoarsePointer() {
  return useMediaQuery('(pointer: coarse)')
}
