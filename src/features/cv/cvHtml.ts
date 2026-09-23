import type { PanelBlock, PanelSection } from '../../types.ts'
import { CV_PARTS } from './cv.ts'
import { PROFILE } from './profile.ts'

/**
 * The CV as a single self-contained HTML page.
 *
 * This is the way in for anyone the island will not run for — a locked-down
 * work laptop with WebGL switched off, a screen reader, a search crawler, or
 * somebody who would simply rather read than walk. It is built from the same
 * sections the island shows, so there is only ever one CV to keep up to date.
 */

/** Escapes text coming from the CV data so it cannot break the markup. */
function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderBlock(block: PanelBlock): string {
  switch (block.type) {
    case 'text':
      return `<p>${esc(block.text)}</p>`

    case 'quote':
      return `<blockquote><p>${esc(block.text)}</p></blockquote>`

    case 'list':
      return `<ul>${block.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`

    // On paper a flag is just the country: the swatch is a thing the panel
    // draws, and nothing here has a canvas to draw it on.
    case 'flags':
      return `<ul>${block.countries
        .map((c) => `<li>${esc(c.name)}</li>`)
        .join('')}</ul>`

    case 'stats':
      // A description list: the label is the term, the value defines it.
      return `<dl class="stats">${block.stats
        .map((s) => `<dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd>`)
        .join('')}</dl>`

    case 'tags':
      return block.groups
        .map(
          (g) =>
            `<div class="tags"><h4>${esc(g.label)}</h4><ul class="chips">${g.tags
              .map((t) => `<li>${esc(t)}</li>`)
              .join('')}</ul></div>`,
        )
        .join('')

    case 'timeline':
      return block.entries
        .map((e) => {
          const org = e.org ? ` <span class="org"> · ${esc(e.org)}</span>` : ''
          const bullets = e.bullets
            ? `<ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
            : ''
          const tags = e.tags
            ? `<ul class="chips">${e.tags
                .map((t) => `<li>${esc(t)}</li>`)
                .join('')}</ul>`
            : ''
          return `<article class="entry"><h3>${esc(e.title)}${org}</h3><p class="meta">${esc(
            e.meta,
          )}</p>${bullets}${tags}</article>`
        })
        .join('')

    case 'letters':
      // Every letter is open on the page — there is no room here for the
      // click that unfolds it on the island.
      return block.letters
        .map(
          (l) =>
            `<article class="letter"><h3>${esc(l.from)} <span class="org"> · ${esc(
              l.role,
            )}</span></h3><p class="meta">${esc(l.note)}</p><blockquote>${l.paragraphs
              .map((p) => `<p>${esc(p)}</p>`)
              .join('')}</blockquote></article>`,
        )
        .join('')
  }
}

function renderSections(sections: PanelSection[]): string {
  return sections
    .map(
      (s) =>
        `<section><h2>${esc(s.heading)}</h2>${s.blocks
          .map(renderBlock)
          .join('')}</section>`,
    )
    .join('')
}

/** Print-friendly, dark-mode aware, and no bigger than it needs to be. */
const STYLE = `
:root {
  --ink: #1c2430;
  --soft: #5b6878;
  --line: #dfe5ec;
  --bg: #ffffff;
  --panel: #f6f8fb;
  --accent: #1f6f8b;
}
@media (prefers-color-scheme: dark) {
  :root {
    --ink: #e6ecf3;
    --soft: #9fb0c2;
    --line: #2b3644;
    --bg: #131a22;
    --panel: #1b242e;
    --accent: #7ec8e3;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 2.5rem 1.25rem 4rem;
  background: var(--bg);
  color: var(--ink);
  font: 16px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
main { max-width: 46rem; margin: 0 auto; }
h1 { font-size: 2rem; margin: 0 0 .25rem; line-height: 1.2; }
h1 + .title { margin: 0 0 1.25rem; color: var(--soft); font-size: 1.1rem; }
h2 {
  font-size: 1.15rem;
  margin: 2rem 0 .75rem;
  padding-bottom: .35rem;
  border-bottom: 2px solid var(--line);
}
h3 { font-size: 1rem; margin: 1.25rem 0 .2rem; }
h4 { font-size: .85rem; margin: .9rem 0 .35rem; color: var(--soft); text-transform: uppercase; letter-spacing: .04em; }
.part { font-size: 1.5rem; margin: 3rem 0 0; border: 0; color: var(--accent); }
.part:first-of-type { margin-top: 1.5rem; }
p { margin: .5rem 0; }
.meta { color: var(--soft); font-size: .9rem; margin: 0 0 .4rem; }
.org { color: var(--soft); font-weight: 400; }
ul { margin: .5rem 0; padding-left: 1.2rem; }
li { margin: .2rem 0; }
blockquote {
  margin: .6rem 0;
  padding: .6rem 1rem;
  border-left: 3px solid var(--accent);
  background: var(--panel);
  border-radius: 0 6px 6px 0;
}
blockquote p { margin: .4rem 0; }
.chips { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: .35rem; }
.chips li {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: .1rem .6rem;
  font-size: .85rem;
  margin: 0;
}
.stats { display: grid; grid-template-columns: auto 1fr; gap: .2rem .9rem; margin: .5rem 0; }
.stats dt { color: var(--soft); }
.stats dd { margin: 0; }
.entry, .letter { margin: 0 0 1rem; }
header.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}
.contact { list-style: none; padding: 0; margin: .5rem 0 0; display: flex; flex-wrap: wrap; gap: .3rem 1.25rem; }
.contact li { margin: 0; color: var(--soft); }
a { color: var(--accent); }
.back {
  display: inline-block;
  margin-top: 2.5rem;
  padding: .55rem 1.1rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  text-decoration: none;
}
@media print {
  body { padding: 0; color: #000; background: #fff; }
  .back { display: none; }
  blockquote, .chips li, header.card { background: transparent; }
  h2 { break-after: avoid; }
  .entry, .letter, blockquote { break-inside: avoid; }
}
`

/** The whole CV as one standalone HTML document. */
export function buildCvHtml(): string {
  const name = `${PROFILE.firstName} "${PROFILE.nickname}" ${PROFILE.lastName}`
  const body = CV_PARTS.map(
    ([title, sections]) =>
      `<h2 class="part">${esc(title)}</h2>${renderSections(sections)}`,
  ).join('')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(name)} · CV</title>
<meta name="description" content="${esc(`${name} · ${PROFILE.title}, ${PROFILE.location}.`)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>${STYLE}</style>
</head>
<body>
<main>
<header class="card">
<h1>${esc(name)}</h1>
<p class="title">${esc(PROFILE.title)}</p>
<ul class="contact">
<li>${esc(PROFILE.location)}</li>
<li>${esc(PROFILE.nationality)}</li>
<li><a href="mailto:${esc(PROFILE.email)}">${esc(PROFILE.email)}</a></li>
<li><a href="${esc(PROFILE.linkedin)}" rel="noopener">${esc(PROFILE.linkedinLabel)}</a></li>
</ul>
</header>
${body}
<a class="back" href="/">← Back to the island</a>
</main>
</body>
</html>
`
}
