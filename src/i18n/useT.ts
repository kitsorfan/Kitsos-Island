import { useGame } from '../state/store'
import { useTranslate } from './index'

/**
 * The translator for whatever language is currently chosen.
 *
 * Kept apart from index.ts so the core stays free of the store and can be used
 * from plain modules; the store only ever imports the Locale type from it, so
 * there is no cycle at runtime either way.
 */
export function useT() {
  return useTranslate(useGame((s) => s.locale))
}
