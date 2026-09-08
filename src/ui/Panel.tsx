import { useEffect, useRef, useState } from 'react'
import { downloadCv } from '../data/cv'
import { useGame } from '../state/store'
import * as sfx from '../game/audio'
import { RadioConsole } from './RadioConsole'
import type { Letter, PanelBlock } from '../types'

export function Panel() {
  const panel = useGame((s) => s.panel)
  const closePanel = useGame((s) => s.closePanel)
  const body = useRef<HTMLDivElement>(null)
  // Tracked by panel title so a new panel starts unsaved without a reset render.
  const [savedFor, setSavedFor] = useState<string | null>(null)

  useEffect(() => {
    body.current?.scrollTo({ top: 0 })
  }, [panel])

  if (!panel) return null

  const saved = savedFor === panel.title

  const close = () => {
    sfx.cancel()
    closePanel()
  }

  const save = () => {
    sfx.jingle()
    downloadCv()
    setSavedFor(panel.title)
  }

  return (
    <div className="overlay" onPointerDown={close}>
      <section
        className="panel"
        style={{ '--accent': panel.accent } as React.CSSProperties}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={panel.title}
      >
        <header className="panel__head">
          <div>
            <p className="panel__kicker">{panel.kicker}</p>
            <h2 className="panel__title">{panel.title}</h2>
          </div>
          <button className="panel__close" onClick={close} aria-label="Close">
            ✕<kbd>Esc</kbd>
          </button>
        </header>

        <div className="panel__body" ref={body}>
          {panel.sections.map((section) => (
            <section key={section.heading} className="panel__section">
              <h3 className="panel__heading">{section.heading}</h3>
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}

          {panel.kind === 'radio' && <RadioConsole />}

          {panel.kind === 'cv' && (
            <div className="panel__cta">
              <button className="button button--primary" onClick={save}>
                ⬇ Take a copy of the CV
              </button>
              <p className="panel__note">
                {saved
                  ? 'Saved as Markdown — the same content you have been walking through.'
                  : 'Written out as Markdown, generated from everything on this island.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/** One reference, collapsed until you click the name. */
function LetterEntry({ letter }: { letter: Letter }) {
  const [failed, setFailed] = useState<Record<string, true>>({})
  const scans = (letter.scans ?? []).filter((name) => !failed[name])

  return (
    <details className="letter">
      <summary className="letter__summary">
        <span className="letter__from">{letter.from}</span>
        <span className="letter__role">{letter.role}</span>
        <span className="letter__more" aria-hidden>
          Read
        </span>
      </summary>
      <div className="letter__body">
        <p className="letter__note">{letter.note}</p>
        {letter.paragraphs.map((paragraph, i) => (
          <p key={i} className="letter__text">
            {paragraph}
          </p>
        ))}
        {scans.length > 0 && (
          <>
            <p className="letter__scans-label">
              {scans.length > 1 ? 'The original, page by page' : 'The original'}
            </p>
            <div className="letter__scans">
              {scans.map((name) => (
                <Scan
                  key={name}
                  name={name}
                  from={letter.from}
                  onMissing={() => setFailed((f) => ({ ...f, [name]: true }))}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </details>
  )
}

/** A scan from public/letters/. Anything missing quietly removes itself. */
function Scan({
  name,
  from,
  onMissing,
}: {
  name: string
  from: string
  onMissing: () => void
}) {
  const href = `${import.meta.env.BASE_URL}letters/${name}`

  if (name.toLowerCase().endsWith('.pdf')) {
    return (
      <a className="letter__pdf" href={href} target="_blank" rel="noreferrer">
        📄 Open the signed letter
      </a>
    )
  }

  return (
    <a className="letter__scan" href={href} target="_blank" rel="noreferrer">
      <img
        src={href}
        alt={`Letter of reference from ${from}`}
        loading="lazy"
        onError={onMissing}
      />
    </a>
  )
}

function Block({ block }: { block: PanelBlock }) {
  switch (block.type) {
    case 'text':
      return <p className="panel__text">{block.text}</p>

    case 'letters':
      return (
        <div className="letters">
          <p className="letters__hint">
            {block.letters.length === 1
              ? 'Click to read the letter.'
              : `Click a name to read the letter. ${block.letters.length} in total.`}
          </p>
          {block.letters.map((letter) => (
            <LetterEntry key={letter.id} letter={letter} />
          ))}
        </div>
      )

    case 'quote':
      return <blockquote className="panel__quote">{block.text}</blockquote>

    case 'list':
      return (
        <ul className="panel__list">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )

    case 'stats':
      return (
        <div className="stat-grid">
          {block.stats.map((s) => (
            <div key={s.label} className="stat">
              <span className="stat__label">{s.label}</span>
              <span className="stat__value">{s.value}</span>
            </div>
          ))}
        </div>
      )

    case 'tags':
      return (
        <div className="tag-groups">
          {block.groups.map((group) => (
            <div key={group.label} className="tag-group">
              <span className="tag-group__label">{group.label}</span>
              <div className="tag-group__tags">
                {group.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )

    case 'timeline':
      return (
        <ol className="timeline">
          {block.entries.map((entry, i) => (
            <li key={i} className="timeline__item">
              <span className="timeline__dot" aria-hidden />
              <div className="timeline__head">
                <h4>{entry.title}</h4>
                {entry.org && <p className="timeline__org">{entry.org}</p>}
                <p className="timeline__meta">{entry.meta}</p>
              </div>
              {entry.bullets && (
                <ul className="panel__list">
                  {entry.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
              {entry.tags && (
                <div className="tag-group__tags">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="chip chip--sm">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )
  }
}
