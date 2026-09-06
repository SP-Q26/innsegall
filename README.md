# Innsegall

**Macintosh triage · Battle Scout · not antivirus.**

Standalone product repo. Not coupled to SPQ.

## Structure

```
innsegall/
  bin/          CLI entry
  src/          Engine · checks · Parley · Field Report
  scripts/      test, smoke, field-report
  web/          innsegall.com static site (Vercel root)
  docs/         Brand · audits · ship checklists
```

## Engine (local)

```bash
npm run runes
npm run run
npm run plan
npm run test
npm run smoke
npm run field-report
```

## Deploy site (Vercel)

1. New Vercel project → this repo
2. **Root directory:** `web`
3. Framework: Other · no build command
4. Add domains: `innsegall.com`, `www.innsegall.com`
5. Namecheap DNS:
   - `@` → A `76.76.21.21`
   - `www` → CNAME `cname.vercel-dns.com`

### Stripe (test mode · card 4242)

In Vercel → Environment variables (project root `web`):

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_...` from Stripe Dashboard |
| `INNSEGALL_LICENSE_SECRET` | random string (match local if testing import) |

Optional: `STRIPE_PRICE_EXTRA`, `STRIPE_PRICE_CLAN`, `STRIPE_WEBHOOK_SECRET`

Redeploy → test `/#pricing` → success page downloads `license.json` → `innsegall plan --import-license`.

See `docs/STRIPE_ASAP.md` and `web/.env.example`.

## Install (users)

```bash
curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash
```

Set `INNSEGALL_REPO_URL` if using a fork before `github.com/innsegall/innsegall` exists.

## Brand

See `docs/BRAND_BIBLE.md` · manifesto: *With Innsegall, no one is your enemy · you have no foe.*
