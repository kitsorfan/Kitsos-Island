# Security

The island is static files and one small Cloudflare Worker, so there is not
much to break. What there is, I would rather hear about from you than find
out the hard way.

## Reporting a vulnerability

Please report it privately, not in a public issue: **Security → Report a
vulnerability** on this repository opens an advisory that only you and I can
see. If that does not suit you, write to kitsorfan@protonmail.com with
"Security" in the subject.

Say what you found, where, and how to reproduce it. I read these myself and
answer as soon as I can, and once it is fixed I am glad to credit you in the
advisory, if you would like that.

Try things against your own copy rather than the live site:
`npm run worker:dev` runs the Worker with Turnstile's test keys and writes the
mail it would have sent under `.wrangler/tmp/email/`. The live one delivers to
a real inbox.

## What counts

- **The transmitter**, `worker/index.ts` behind `/api/transmit`: getting a
  message past its checks (the honeypot, the timing, Turnstile, the rate
  limit), making it mail anywhere but my inbox, or making it send as anyone
  but `radio@kitsorfan.com`.
- **The site** at www.kitsorfan.com: script injection anywhere, the verifier
  at `/verify/<reference>` included, since it prints the name from the link;
  or a gap in the Content-Security-Policy and the other headers in
  `public/_headers`.
- **The build**, `.github/`: a way for a pull request to reach a secret, write
  to the repository, or change what gets deployed.

## What does not

- **The keys in the repository.** `.env.development`, `.env.worker` and
  `.dev.vars.example` hold Cloudflare's published always-pass test keys. The
  site key in `.env.production` is public by design; the secret that goes
  with it is set on the Worker alone and never committed.
- **Forging a certificate.** Both RSA keys ship in the bundle, on purpose, and
  `src/features/launch/certId.ts` explains why: the verifier is a
  demonstration, not a guarantee.
- **The email addresses** in `wrangler.jsonc` and on the CV. They are
  published on purpose.
- **Volume.** Please do not flood the transmitter or the site to see what
  happens. The rate limit and Cloudflare are there for that.
- **Scanner output with no impact shown**, such as a header that changes
  nothing for a static site.

## Supported versions

Only what is live at www.kitsorfan.com, which is always the latest `main`.
Older tags are not patched.
