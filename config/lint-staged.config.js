/**
 * What the pre-commit hook runs, and only against the files being committed,
 * so a commit costs a second or two rather than a whole-repo lint.
 *
 * Prettier rewrites in place and lint-staged restages the result, so a
 * commit can never land unformatted. oxlint denies warnings here: the tree is
 * clean, and the cheapest moment to keep it that way is before the commit.
 */
const prettier =
  'prettier --write --config config/.prettierrc.json --ignore-path config/.prettierignore'

export default {
  '*.{ts,tsx,js,mjs,cjs}': [
    'oxlint --config config/.oxlintrc.json --deny-warnings',
    prettier,
  ],
  '*.{json,css,md,html,yml,yaml}': prettier,
}
