import { NPCS } from '../data/world'
import { MAG_SIZE, RELOAD_MS, START_LIVES } from '../game/paintball'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'

const NPC_BY_ID = new Map(NPCS.map((n) => [n.id, n]))

/** The briefing before a match, and the scoreline after one. */
export function PaintballCard() {
  const game = useGame((s) => s.paintball)
  const begin = useGame((s) => s.beginPaintball)
  const exit = useGame((s) => s.exitPaintball)
  const rematch = useGame((s) => s.openPaintball)

  if (!game) return null

  const briefing = game.status === 'briefing'
  const won = game.status === 'won'
  const friends = game.friends.map((id) => NPC_BY_ID.get(id))
  const painted = game.enemies.filter((id) => game.out[id]).length

  return (
    <div className="overlay">
      <div className={`pb-card${won ? ' pb-card--won' : ''}`}>
        <span className="pb-card__kicker">
          {briefing ? 'Paintball mode' : `Round ${game.round}`}
        </span>
        <h2 className="pb-card__title">
          {briefing ? 'Pick up the marker' : won ? 'Field cleared' : 'Painted out'}
        </h2>

        {briefing ? (
          <>
            <p className="pb-card__lead">
              The island splits in two for an afternoon. Two of the locals grab a
              marker and stand with you — everyone else is out to paint you.
            </p>

            <div className="pb-card__teams">
              <div className="pb-team pb-team--friend">
                <span className="pb-team__label">On your side</span>
                <ul>
                  {friends.map((npc, i) => (
                    <li key={npc?.id ?? i}>
                      <strong>{npc?.name ?? 'A friend'}</strong>
                      <em>{npc?.role}</em>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pb-team pb-team--enemy">
                <span className="pb-team__label">Against you</span>
                <p>
                  <strong>{game.enemies.length}</strong> islanders, spread across
                  the fields around the plaza.
                </p>
              </div>
            </div>

            <ul className="pb-card__rules">
              <li>
                <strong>{MAG_SIZE} rounds</strong> per hopper, then a{' '}
                {RELOAD_MS / 1000}-second refill.
              </li>
              <li>
                <strong>{START_LIVES} lives</strong>. A ball to the chest costs
                one.
              </li>
              <li>
                <strong>Get down</strong> (Ctrl, or the DUCK button) and their
                paint sails over you.
              </li>
              <li>
                Your marker leads whichever enemy you are facing — a ring marks
                them. Paint a friend and you lose them.
              </li>
            </ul>
          </>
        ) : (
          <>
            <p className="pb-card__lead">
              {won
                ? `Every last one of them is sitting in the grass. You painted ${game.hits} of ${game.enemies.length} yourself.`
                : `Three hits and the afternoon is over. ${painted} of ${game.enemies.length} went down first.`}
            </p>
            <div className="pb-card__score">
              <div>
                <span>Painted by you</span>
                <strong>{game.hits}</strong>
              </div>
              <div>
                <span>Team total</span>
                <strong>
                  {painted}/{game.enemies.length}
                </strong>
              </div>
              <div>
                <span>Lives left</span>
                <strong>{game.lives}</strong>
              </div>
              <div>
                <span>Friendly fire</span>
                <strong>{game.friendlyFire}</strong>
              </div>
            </div>
          </>
        )}

        <div className="pb-card__actions">
          <button
            className="button button--primary"
            onClick={() => (briefing ? begin() : rematch())}
          >
            {briefing ? 'Start the match' : 'Rematch'}
          </button>
          <button
            className="button"
            onClick={() => {
              sfx.cancel()
              exit()
            }}
          >
            Back to the island
          </button>
        </div>
      </div>
    </div>
  )
}
