import './verify.css'
import { judge, readRequest } from './verify'
import type { Say, VerifyRequest } from './verify'

/**
 * The page at /verify/<reference>?name=<name>: whether a certificate is one
 * of ours.
 *
 * Plain DOM rather than the island. Somebody arriving from a link on a
 * LinkedIn profile wants an answer, not a 3D scene, and should get one
 * without WebGL, React or three.js — so this is the whole of what they
 * download, and it works on a machine the island itself would turn away.
 *
 * Everything the visitor brought in the link is written with textContent,
 * never as markup: the name in the query is whatever somebody typed into it.
 */
export function showVerify(root: HTMLElement): void {
  document.documentElement.classList.add('verify-doc')
  const request = readRequest(location.pathname, location.search)
  void speaker().then((say) => {
    document.title = say('Verify a certificate · Kitsos Island')
    render(root, request, say)
  })
}

/**
 * The page's language: Greek for somebody who chose Greek on the island, and
 * English for everybody else, which is most people who land here off a link
 * on somebody's profile. Read straight from storage, as main.tsx reads it,
 * because the store belongs to the island and this page never loads it. The
 * words are this page's own short list, not the island's dictionary: they
 * are all it needs, and a few of them mean something else here.
 */
async function speaker(): Promise<Say> {
  try {
    if (localStorage.getItem('island.settings')?.includes('"locale":"el"')) {
      const { VERIFY } = await import('../../shared/i18n/el/verify')
      document.documentElement.lang = 'el'
      return (text) => VERIFY[text] ?? text
    }
  } catch {
    /* No storage to read, or no dictionary to be had: English it is. */
  }
  return (text) => text
}

function render(root: HTMLElement, request: VerifyRequest, say: Say): void {
  const verdict = judge(request, say)

  const card = el('main', 'verify')
  card.append(
    el('p', 'verify__kicker', say('Kitsos Island · Certificate check')),
    el('h1', `verify__headline verify__headline--${verdict.tone}`, [
      el('span', 'verify__mark', MARKS[verdict.tone]),
      verdict.headline,
    ]),
    el('p', 'verify__detail', verdict.detail),
  )

  if (verdict.check === 'valid' || verdict.check === 'unbound') {
    const facts = el('dl', 'verify__facts')
    if (request.name)
      facts.append(el('dt', '', say('Name')), el('dd', '', request.name))
    facts.append(
      el('dt', '', say('Reference')),
      el('dd', 'verify__mono', request.reference),
      el('dt', '', say('Issued for')),
      el('dd', '', say('Completing Kitsos Island')),
    )
    card.append(facts)
  }

  card.append(form(root, request, say))

  card.append(
    el(
      'p',
      'verify__note',
      say(
        'The reference is signed with RSA, and the signature covers the name. The key is deliberately tiny and ships with the site, so this shows how verification works rather than proving much: it is a souvenir, checked honestly.',
      ),
    ),
    link('/', say('Visit the island →'), 'verify__home'),
  )

  root.replaceChildren(card)
}

/** The boxes to check another reference, prefilled with this one. */
function form(
  root: HTMLElement,
  request: VerifyRequest,
  say: Say,
): HTMLFormElement {
  const f = el('form', 'verify__form')
  const reference = input('reference', 'KI-0ABCD-1EFGH', request.reference)
  const name = input('name', say('Name on the certificate'), request.name)
  f.append(
    field(say('Reference'), reference),
    field(say('Name'), name),
    el('button', 'verify__submit', say('Check')),
  )
  f.addEventListener('submit', (e) => {
    e.preventDefault()
    const next: VerifyRequest = {
      reference: reference.value.trim().toUpperCase(),
      name: name.value.replace(/\s+/g, ' ').trim(),
    }
    const url =
      `/verify/${encodeURIComponent(next.reference)}` +
      (next.name ? `?name=${encodeURIComponent(next.name)}` : '')
    history.replaceState(null, '', url)
    render(root, next, say)
  })
  return f
}

const MARKS = { good: '✓', fair: '✓', bad: '✕', none: '?' } as const

function field(label: string, control: HTMLInputElement): HTMLLabelElement {
  const l = el('label', 'verify__field')
  l.append(el('span', 'verify__label', label), control)
  return l
}

function input(name: string, placeholder: string, value: string) {
  const i = el('input', 'verify__input')
  i.name = name
  i.placeholder = placeholder
  i.value = value
  i.autocomplete = 'off'
  i.spellcheck = false
  return i
}

function link(href: string, text: string, className: string) {
  const a = el('a', className, text)
  a.href = href
  return a
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  children: string | (string | Node)[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  node.append(...(typeof children === 'string' ? [children] : children))
  return node
}
