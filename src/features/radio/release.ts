/**
 * The island's latest release, as pinned to the Radio Center wall.
 *
 * Kept on its own so the printed CV can say when it was last updated without
 * pulling in every room on the island to find out.
 */
export const LATEST_RELEASE = {
  version: '1.2',
  /** ISO date, as the release notes print it. */
  date: '2026-09-26',
} as const
