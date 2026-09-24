import { RESUME, RESUME_PDF } from './resume.ts'

/**
 * The CV as a printed document: two A4 sheets in a clean two-column layout,
 * the work on the left and the quick-scan facts on the right.
 *
 * It is one page of HTML doing two jobs. On screen it shows the sheets on a
 * desk with a button to take the PDF; printed — which is how
 * `npm run cv:pdf` makes that PDF — the chrome drops away and each sheet is
 * exactly one page. The split between the two pages is fixed by hand rather
 * than left to the browser, because a CV that breaks mid-role reads as
 * careless, and the browser does not know that.
 */

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type Entry = (typeof RESUME.experience)[number]

/* Line icons, drawn at 24 units and sized by CSS. */
const ICON = {
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 7 8.5-7"/>',
  link: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2.5 2.5 0 0 1 5 0v4M12 10v7"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9s1.3-6.4 3.8-9z"/>',
}

const icon = (name: keyof typeof ICON) =>
  `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICON[name]}</svg>`

/** The organisation, split from the place and mode that follow its " · ". */
function splitOrg(org = ''): [string, string] {
  const [name, ...rest] = org.split(' · ')
  return [name, rest.join(' · ')]
}

function bullets(items?: string[]): string {
  return items?.length
    ? `<ul class="points">${items.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
    : ''
}

function tech(tags?: string[]): string {
  return tags?.length
    ? `<ul class="stack">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`
    : ''
}

/**
 * Roles on a timeline. Consecutive roles at the same organisation share one
 * heading, so a promotion reads as one company and two steps rather than two
 * separate jobs.
 */
function timeline(entries: Entry[]): string {
  const groups: Entry[][] = []
  for (const e of entries) {
    const last = groups.at(-1)
    if (last && e.org && last[0].org === e.org) last.push(e)
    else groups.push([e])
  }

  return `<ol class="timeline">${groups
    .map((group) => {
      const [name, where] = splitOrg(group[0].org)
      const roles = group
        .map((e) => {
          const head = (e.steps ?? [e])
            .map(
              (step) =>
                `<header><h3>${esc(step.title)}</h3><span class="when">${esc(
                  step.meta,
                )}</span></header>`,
            )
            .join('')
          const cls = e.steps ? 'entry entry--steps' : 'entry'
          return `<article class="${cls}">${head}${bullets(e.bullets)}${tech(e.tags)}</article>`
        })
        .join('')
      return `<li class="company${group.length > 1 ? ' company--steps' : ''}"><p class="org"><b>${esc(
        name,
      )}</b>${where ? `<span>${esc(where)}</span>` : ''}</p>${roles}</li>`
    })
    .join('')}</ol>`
}

function section(title: string, body: string, cls = ''): string {
  return `<section class="block ${cls}"><h2>${esc(title)}</h2>${body}</section>`
}

const plain = (items: string[]) =>
  `<ul class="plain">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`

const STYLE = `
@page { size: A4; margin: 0; }
:root {
  --ink: #0f172a;
  --body: #334155;
  --soft: #64748b;
  --line: #e2e8f0;
  --tint: #f1f5f9;
  --accent: #0e7490;
  --accent-tint: #ecfeff;
  --desk: #cbd5e1;
  --font: "Inter", "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: var(--desk);
  color: var(--body);
  font: 8.6pt/1.42 var(--font);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ------------------------------ on screen ------------------------------ */
.toolbar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  justify-content: center;
  padding: .75rem 1rem;
  background: rgba(255,255,255,.88);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
  font: 500 14px/1.2 var(--font);
}
.toolbar a {
  padding: .55rem 1.1rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
}
.toolbar a.primary { background: var(--ink); border-color: var(--ink); color: #fff; }
.desk { padding: 1.5rem .75rem 3rem; overflow-x: auto; }

/* ------------------------------- a sheet ------------------------------- */
.sheet {
  position: relative;
  width: 210mm;
  height: 297mm;
  margin: 0 auto 1.5rem;
  padding: 13mm 14mm 12mm;
  background: #fff;
  box-shadow: 0 10px 30px rgba(15,23,42,.18);
  overflow: hidden;
}
/* A thin accent rule along the top edge. */
.sheet::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 2.2mm;
  background: linear-gradient(90deg, var(--ink) 0 38%, var(--accent) 38% 100%);
}
.cols {
  display: grid;
  grid-template-columns: 1fr 55mm;
  gap: 0 8mm;
}
.side {
  padding-left: 6mm;
  border-left: .3mm solid var(--line);
}

/* ------------------------------- header -------------------------------- */
.masthead {
  display: flex;
  align-items: center;
  gap: 7mm;
  margin: 2mm 0 6mm;
  padding-bottom: 5mm;
  border-bottom: .3mm solid var(--line);
}
.masthead .who { flex: 1; min-width: 0; }
.masthead h1 {
  margin: 0;
  color: var(--ink);
  font-size: 25pt;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -.02em;
}
.masthead h1 .nick { color: #737f91; font-weight: 400; }
.masthead .role {
  margin: 1.8mm 0 3.2mm;
  color: var(--accent);
  font-size: 11.5pt;
  font-weight: 600;
  letter-spacing: -.005em;
}
.masthead .role span { color: var(--soft); font-weight: 400; }
.contact { display: grid; grid-template-columns: repeat(2, max-content); gap: 1.4mm 8mm; margin: 0; padding: 0; list-style: none; }
.contact li { display: flex; align-items: center; gap: 1.4mm; color: var(--body); }
.contact a { color: inherit; text-decoration: none; }
.ico { width: 3.4mm; height: 3.4mm; flex: none; fill: none; stroke: var(--accent); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.portrait {
  width: 30mm;
  height: 30mm;
  flex: none;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 0 1mm #fff, 0 0 0 1.5mm #155e75;
}
.portrait img { width: 100%; height: 100%; object-fit: cover; }

.runner {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 1mm 0 6mm;
  padding-bottom: 3mm;
  border-bottom: .3mm solid var(--line);
  color: var(--soft);
}
.runner b { color: var(--ink); font-size: 11pt; letter-spacing: -.01em; }

/* ------------------------------- sections ------------------------------ */
.block { margin: 0 0 5mm; }
.block h2 {
  display: flex;
  align-items: center;
  gap: 2.5mm;
  margin: 0 0 2.6mm;
  color: var(--ink);
  font-size: 8pt;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
}
.block h2::after { content: ""; flex: 1; height: .3mm; background: var(--line); }
.side .block h2::after { display: none; }
.summary p { margin: 0; color: var(--body); font-size: 9pt; line-height: 1.5; }

/* ------------------------------- timeline ------------------------------ */
.timeline { list-style: none; margin: 0; padding: 0; }
.company {
  position: relative;
  margin: 0 0 3.6mm;
  padding-left: 5mm;
  break-inside: avoid;
}
.company::before {
  content: "";
  position: absolute;
  left: .7mm;
  top: 1.6mm;
  bottom: -3.2mm;
  width: .3mm;
  background: var(--line);
}
.company:last-child::before { bottom: 0; }
.company::after {
  content: "";
  position: absolute;
  left: 0;
  top: 1mm;
  width: 1.7mm;
  height: 1.7mm;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 .7mm var(--accent-tint);
}
.org { margin: 0 0 .8mm; color: var(--ink); font-size: 9.4pt; }
.org b { font-weight: 700; letter-spacing: -.01em; }
.org span { color: var(--soft); font-size: 8pt; margin-left: 2mm; }
.entry { margin: 0 0 2mm; }
.entry:last-child { margin-bottom: 0; }
.company--steps .entry + .entry { padding-top: 1.6mm; border-top: .3mm dashed var(--line); }
.entry--steps header + header { margin-top: .6mm; }
.entry--steps header + header h3 { color: var(--soft); font-weight: 500; }
.entry header { display: flex; justify-content: space-between; gap: 3mm; align-items: baseline; }
.entry h3 { margin: 0; color: var(--accent); font-size: 8.9pt; font-weight: 600; }
.entry .when { flex: none; color: var(--soft); font-size: 7.6pt; font-variant-numeric: tabular-nums; white-space: nowrap; }
.points { margin: .8mm 0 0; padding-left: 3.6mm; }
.points li { margin: 0 0 .5mm; }
.points li::marker { color: var(--accent); }
.stack { display: flex; flex-wrap: wrap; gap: 1mm; margin: 1.4mm 0 0; padding: 0; list-style: none; }
.stack li {
  padding: .25mm 1.8mm;
  border-radius: 1mm;
  background: var(--tint);
  color: var(--body);
  font-size: 7pt;
  font-weight: 500;
}

/* --------------------------------- side -------------------------------- */
.side .block { margin-bottom: 5.5mm; }
.skill { margin: 0 0 2.4mm; }
.skill h3 { margin: 0 0 1mm; color: var(--ink); font-size: 7.6pt; font-weight: 600; }
.chips { display: flex; flex-wrap: wrap; gap: .9mm; margin: 0; padding: 0; list-style: none; }
.chips li {
  padding: .2mm 1.6mm;
  border: .25mm solid var(--line);
  border-radius: 999px;
  font-size: 7pt;
  color: var(--body);
}
.langs { margin: 0; padding: 0; list-style: none; }
.langs li { display: grid; grid-template-columns: 1fr auto; align-items: center; margin: 0 0 1.6mm; }
.langs b { color: var(--ink); font-weight: 600; }
.langs small { grid-column: 1 / -1; color: var(--soft); font-size: 7.2pt; }
.dots { display: flex; gap: .9mm; }
.dots i { width: 1.8mm; height: 1.8mm; border-radius: 50%; background: var(--line); }
.dots i.on { background: var(--accent); }
.certs { margin: 0; padding: 0; list-style: none; }
.certs li { margin: 0 0 2mm; }
.certs b { display: block; color: var(--ink); font-weight: 600; line-height: 1.3; }
.certs span { color: var(--soft); font-size: 7.4pt; }
.plain { margin: 0; padding: 0; list-style: none; }
.plain li { position: relative; margin: 0 0 1.3mm; padding-left: 3mm; }
.plain li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 1.6mm;
  width: 1.1mm;
  height: 1.1mm;
  border-radius: 50%;
  background: var(--accent);
}
.tags { margin: 0; color: var(--body); }
.other p { margin: 0; }

.foot {
  position: absolute;
  left: 14mm;
  right: 14mm;
  bottom: 7mm;
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 7pt;
}

@media print {
  body { background: #fff; }
  .toolbar { display: none; }
  .desk { padding: 0; overflow: visible; }
  .sheet { margin: 0; box-shadow: none; break-after: page; }
  .sheet:last-child { break-after: auto; }
}
`

export interface ResumeOptions {
  /** A portrait for the header; the header simply goes without one. */
  photo?: string
  /** Leave out the on-screen toolbar, as the PDF render does. */
  bare?: boolean
}

/** The two-sheet CV as one standalone HTML document. */
export function buildResumeHtml({ photo, bare }: ResumeOptions = {}): string {
  const r = RESUME

  const portrait = photo
    ? `<div class="portrait"><img src="${esc(photo)}" alt="${esc(r.name)}"></div>`
    : ''

  const [email, linkedin, website] = r.contact
  const contact = `<ul class="contact">
<li>${icon('pin')}${esc(r.profile[0].value)}</li>
<li>${icon('mail')}<a href="${esc(email.href)}">${esc(email.value)}</a></li>
<li>${icon('link')}<a href="${esc(linkedin.href)}">${esc(linkedin.value)}</a></li>
<li>${icon('globe')}<a href="${esc(website.href)}">${esc(website.value)}</a></li>
</ul>`

  const masthead = `<header class="masthead"><div class="who"><h1>${esc(
    r.firstName,
  )} <span class="nick">(${esc(r.nickname)})</span> ${esc(
    r.lastName,
  )}</h1><p class="role">${esc(r.title)} <span>· ${esc(
    r.subtitle,
  )}</span></p>${contact}</div>${portrait}</header>`

  const runner = `<header class="runner"><b>${esc(
    `${r.firstName} ${r.lastName}`,
  )}</b><span>${esc(r.title)}</span></header>`

  const skills = section(
    'Skills',
    r.skills
      .map(
        (s) =>
          `<div class="skill"><h3>${esc(s.label)}</h3><ul class="chips">${s.tags
            .map((t) => `<li>${esc(t)}</li>`)
            .join('')}</ul></div>`,
      )
      .join(''),
  )

  const languages = section(
    'Languages',
    `<ul class="langs">${r.languages
      .map(
        (l) =>
          `<li><b>${esc(l.name)}</b><span class="dots" aria-label="${l.score} of 5">${[
            1, 2, 3, 4, 5,
          ]
            .map((n) => `<i${n <= l.score ? ' class="on"' : ''}></i>`)
            .join('')}</span><small>${esc(l.level)}</small></li>`,
      )
      .join('')}</ul>`,
  )

  const certifications = section(
    'Certifications',
    `<ul class="certs">${r.certifications
      .map(
        (c) =>
          `<li><b>${esc(c.title)}</b><span>${esc(
            [c.org, c.meta].filter(Boolean).join(' · '),
          )}</span></li>`,
      )
      .join('')}</ul>`,
  )

  const foot = (n: number) =>
    `<footer class="foot"><span>${esc(r.name)}</span><span>${n} / 2</span></footer>`

  const page1 = `<div class="sheet">
${masthead}
<div class="cols">
<main class="main">
${section('Profile', `<p>${esc(r.summary)}</p>`, 'summary')}
${section('Experience', timeline(r.experience))}
</main>
<aside class="side">${skills}</aside>
</div>${foot(1)}</div>`

  const page2 = `<div class="sheet">
${runner}
<div class="cols">
<main class="main">
${section('Leadership & service', timeline(r.earlier))}
${section('Education', timeline(r.education))}
${section('Publications', timeline(r.publications))}
${section('Beyond work', `<p>${esc(r.other)}</p>`, 'other')}
</main>
<aside class="side">
${languages}
${certifications}
${section('Seminars & courses', plain(r.courses))}
${section('Awards', plain(r.awards))}
${section('Volunteering', plain(r.volunteering))}
${section('Interests', `<p class="tags">${r.hobbies.map(esc).join(' · ')}</p>`)}
</aside>
</div>${foot(2)}</div>`

  const toolbar = bare
    ? ''
    : `<nav class="toolbar"><a class="primary" href="/${esc(RESUME_PDF)}" download>Download PDF</a><a href="/cv.html">Full CV</a><a href="/">Back to the island</a></nav>`

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(r.name)} · CV</title>
<meta name="description" content="${esc(`${r.name} · ${r.title}, ${r.profile[0].value}.`)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=block">
<style>${STYLE}</style>
</head>
<body>
${toolbar}
<div class="desk">
${page1}
${page2}
</div>
</body>
</html>
`
}
