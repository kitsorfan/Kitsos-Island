import { NAME, PROFILE } from '../cv/profile'
import { CARDS, type Card } from './shots'
import { STAGE } from './stage'
import './trailer.css'

/** Hands a card's element to the director, which does the fading. */
const hold = (id: string) => (el: HTMLElement | null) => {
  if (el) STAGE.cards.set(id, el)
  else STAGE.cards.delete(id)
}

function Logo() {
  return (
    <h1 className="trailer__logo">
      <span>KITSOS</span>
      <span>ISLAND</span>
    </h1>
  )
}

function Face({ card }: { card: Card }) {
  if (card.kind === 'title') {
    return (
      <>
        {card.kicker && <p className="trailer__kicker">{card.kicker}</p>}
        <Logo />
      </>
    )
  }
  if (card.kind === 'end') {
    return (
      <div className="trailer__end">
        <Logo />
        <p className="trailer__name">{NAME}</p>
        <p className="trailer__role">{PROFILE.title}</p>
        <p className="trailer__url">
          <span className="trailer__pill">
            {card.kicker ?? 'A playable CV'}
          </span>
          <span>{PROFILE.websiteLabel}</span>
        </p>
      </div>
    )
  }
  return (
    <div className="trailer__caption">
      {card.kicker && <span className="trailer__kicker">{card.kicker}</span>}
      <strong>{card.text}</strong>
    </div>
  )
}

/**
 * The words over the pictures: the title, the lines between the shots, and
 * the card at the end. All of them sit here from the start, invisible; the
 * director brings each one up on its bar.
 */
export function Cards() {
  return (
    <div className="trailer-stage" aria-hidden>
      {CARDS.map((card) => (
        <div
          key={card.id}
          ref={hold(card.id)}
          className={`trailer-card trailer-card--${card.kind}${card.place ? ` trailer-card--${card.place}` : ''}`}
          style={{ opacity: 0 }}
        >
          <Face card={card} />
        </div>
      ))}
      <div
        className="trailer-slate"
        ref={(el) => {
          STAGE.slate = el
        }}
      />
    </div>
  )
}
