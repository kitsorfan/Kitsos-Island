import { useGame } from '../state/store'
import * as sfx from './audio'
import type { Exhibit } from '../types'

/**
 * Looking at an exhibit: the panel or the lines it has to say, the journal
 * entry it files, and the secret it lets out.
 *
 * It lives here rather than in the frame loop because two things do it — the
 * prompt you press walking round a room, and, for a toy, a click on the thing
 * itself — so the two can never drift apart.
 *
 * A toy is the one kind that does not give up its secret here. Pressing it
 * only opens the shelf for a proper look; what it is hiding is let out by
 * `pickUpToy` once you have found the right toy among the rest.
 */
export function examine(
  exhibit: Exhibit,
  accent: string,
  source: string,
): void {
  const state = useGame.getState()

  sfx.confirm()

  if (exhibit.panel) {
    state.openPanel({
      kicker: exhibit.panel.kicker,
      title: exhibit.panel.title,
      sections: exhibit.panel.sections,
      accent,
      kind: exhibit.kind,
    })
  } else if (exhibit.lines) {
    state.talk({ speaker: exhibit.label, lines: exhibit.lines })
  }

  /*
   * A toy keeps both of these back. Its journal entry is the story of finding
   * the switch, and filing it the moment the shelf is opened would tell you
   * there is one before you have looked.
   */
  if (exhibit.kind === 'toy') return

  if (exhibit.journal) {
    state.record({
      id: exhibit.id,
      title: exhibit.journal.title,
      body: exhibit.journal.body,
      source,
    })
  }

  if (exhibit.reveals) {
    const { id, title, body } = exhibit.reveals
    state.revealSecret(id, { title, body })
  }
}

/**
 * Picking the right toy off the shelf, from the close-up the prompt opened.
 *
 * This is where the secret actually comes out, and where the journal entry is
 * filed: both of them are the reward for having spotted the one toy on the
 * shelf that does something, rather than for having walked past it.
 */
export function pickUpToy(exhibit: Exhibit, source: string): void {
  const state = useGame.getState()
  if (exhibit.reveals && state.secrets[exhibit.reveals.id]) return

  if (exhibit.journal) {
    state.record({
      id: exhibit.id,
      title: exhibit.journal.title,
      body: exhibit.journal.body,
      source,
    })
  }

  if (exhibit.reveals) {
    const { id, title, body } = exhibit.reveals
    state.revealSecret(id, { title, body })
  }

  state.closePanel()
}
