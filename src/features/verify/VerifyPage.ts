import './verify.css'
import { judge, readRequest } from './verify'
import type { VerifyRequest } from './verify'

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
  document.title = 'Verify a certificate · Kitsos Island'
  document.documentElement.classList.add('verify-doc')
  render(root, readRequest(location.pathname, location.search))
}

function render(root: HTMLElement, request: VerifyRequest): void {
  const verdict = judge(request)

  const card = el('main', 'verify')
  card.append(
    el('p', 'verify__kicker', 'Kitsos Island · Certificate check'),
    el('h1', `verify__headline verify__headline--${verdict.tone}`, [
      el('span', 'verify__mark', MARKS[verdict.tone]),
      verdict.headline,
    ]),
    el('p', 'verify__detail', verdict.detail),
  )

  if (verdict.check === 'valid' || verdict.check === 'unbound') {
    const facts = el('dl', 'verify__facts')
    if (request.name)
      facts.append(el('dt', '', 'Name'), el('dd', '', request.name))
    facts.append(
      el('dt', '', 'Reference'),
      el('dd', 'verify__mono', request.reference),
      el('dt', '', 'Issued for'),
      el('dd', '', 'Completing Kitsos Island'),
    )
    card.append(facts)
  }

  card.append(form(root, request))

  card.append(
    el(
      'p',
      'verify__note',
      'The reference is signed with RSA, and the signature covers the name. The key is deliberately tiny and ships with the site, so this shows how verification works rather than proving much: it is a souvenir, checked honestly.',
    ),
    link('/', 'Visit the island →', 'verify__home'),
  )

  root.replaceChildren(card)
}

/** The boxes to check another reference, prefilled with this one. */
function form(root: HTMLElement, request: VerifyRequest): HTMLFormElement {
  const f = el('form', 'verify__form')
  const reference = input('reference', 'KI-0ABCD-1EFGH', request.reference)
  const name = input('name', 'Name on the certificate', request.name)
  f.append(
    field('Reference', reference),
    field('Name', name),
    el('button', 'verify__submit', 'Check'),
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
    render(root, next)
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
