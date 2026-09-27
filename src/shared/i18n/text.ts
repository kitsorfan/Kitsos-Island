/**
 * The plain half of the translation kit: putting values into a sentence, and
 * setting it in capitals. Kept apart from index.ts, which is React, so the
 * certificate verifier — a page that loads no React at all — can use it.
 */

/**
 * Capitals, set the way each language sets them.
 *
 * Greek drops its stress marks in capitals — ΠΑΙΧΝΙΔΙΑ, not ΠΑΙΧΝΊΔΙΑ — which
 * toUpperCase does not know to do. Where the mark was what kept two vowels
 * apart, a diaeresis takes its place (πέιντμπολ, ΠΕΪΝΤΜΠΟΛ), or the capitals
 * would read as a different word. Only Greek letters lose their marks: the é
 * in Misérables is a letter of its own and keeps it.
 */
export function upper(text: string): string {
  return text
    .normalize('NFD')
    .replace(/([αεηουΑΕΗΟΥ])\u0301([ιυΙΥ])(?!\u0308)/g, '$1$2\u0308')
    .replace(/([\u0370-\u03ff])\u0301/g, '$1')
    .normalize('NFC')
    .toUpperCase()
}

/** The values that go into a sentence's {slots}. */
export type Slots = Record<string, string | number>

/**
 * Put values into the {slots} of a sentence, after it has been translated.
 *
 * A sentence with a number in it is keyed whole, slot and all — 'All {count}
 * of them served' — and never as the pieces either side of the number. Greek
 * does not keep English word order, so a sentence cut up around its numbers
 * can only ever be translated a fragment at a time, and reads half in one
 * language. With the slot inside the key, the Greek puts the number wherever
 * Greek wants it.
 *
 * A slot with no value is left showing, so a misspelt name reads as {count}
 * on the screen rather than quietly vanishing from the sentence.
 */
export function fill(template: string, slots: Slots = {}): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in slots ? String(slots[name]) : whole,
  )
}
