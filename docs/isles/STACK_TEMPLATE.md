# Isles stack template · new tank app

Clone this checklist per app · **no WeWeb** unless the product truly needs it (Innsegall does not).

## 1 · Repo & identity

- [ ] Git repo under `SP-Q26/` (or `isles-<app>` monorepo folder later)
- [ ] `docs/isles/apps/<APP>.md` stub
- [ ] Entry in `isles-app-registry.json`
- [ ] Product domain or `innsegall.com/<app>` path until domain bought
- [ ] DBA name chosen · ToS/privacy entity line matches Stripe profile

## 2 · Site (Vercel)

- [ ] Static `web/` or subfolder · `vercel.json` rewrites
- [ ] `innsegall.css` tokens **or** fork tokens with same fjord discipline
- [ ] `/stability` or equivalent scope page
- [ ] `llms.txt` + optional `*-ai-bus.json` if agents matter

## 3 · Commerce (Isles Stripe)

- [ ] Products in **The Isles** Stripe · metadata per `STRIPE_METADATA.md`
- [ ] `web/api/stripe/checkout` + `webhook` pattern (copy from Innsegall)
- [ ] License or provision flow documented
- [ ] PNG product images 512² in `web/stripe/`

## 4 · Telemetry (Xano)

- [ ] `install_ping` · `marketing_ping` with `ref_channel` + `isles_brand`
- [ ] No scout body / PII in events

## 5 · Mac (growth)

- [ ] CLI or signed app path documented
- [ ] `curl | bash` or `.command` install · `bootstrap` if scheduled jobs
- [ ] Homebrew tap optional (Innsegall: `SP-Q26/homebrew-innsegall`)

## 6 · Apple (shared enrollment)

- [ ] Bundle IDs registered under Isles team when binary ships
- [ ] Mac notarized installer **before** App Store if both Mac + iOS

## 7 · Gates

- [ ] `audit-isles-launchpad.mjs` green
- [ ] App-specific swarm subset (not full SPQ lattice)

**Time box:** juvenile tank **30 days** from first public install URL.
