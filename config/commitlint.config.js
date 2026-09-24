/**
 * Commit messages, checked by the commit-msg hook and again in CI on every
 * pull request.
 *
 * Conventional Commits, which the history has followed since the first
 * commit: `type(scope): subject`, imperative and lowercase. The header limit
 * sits at 100 rather than the conventional 72 because a handful of honest
 * subjects in the history run to the mid-seventies, and a limit the history
 * itself breaks is a limit nobody believes.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 100],
    // Bodies here explain the why, in sentences, and wrap where they wrap.
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
}
