# Innsegall

**Macintosh triage · Battle Scout · not antivirus.**

Standalone product repo. Not coupled to SPQ.

## Working folder

**One clone:** `~/Desktop/innsegall` or `~/innsegall` · not `~/SPQ/innsegall` (legacy). See **`docs/WORKSPACE_CANON.md`**.

```bash
cd ~/Desktop/innsegall   # or ~/innsegall
npm run audit:workspace && npm run preflight
```

**Production:** `https://innsegall.com` · float ops: **`docs/FLOAT_MODE_RUNBOOK.md`** · doc map: **`docs/DOCS_INDEX.md`**.  
Strategy lane (no pivot): **`docs/NORTH_STAR_AUDIT.md`**. Pre-launch wake archive: **`docs/WAKE_BELOW_DECK.md`**.

## Structure

```
innsegall/
  bin/          CLI entry
  src/          Engine · checks · Parley · Field Report · AI paste
  scripts/      preflight · smoke · smoke:live · audit
  web/          innsegall.com static site (Vercel root)
  docs/         Brand · audits · ship checklists
```

## Engine (local)

```bash
npm run runes
npm run run          # writes .html + .ai-paste.md
npm run plan
npm run preflight    # gospel + audit + smoke + test
npm run smoke:live   # production probe (innsegall.com)
npm run audit:site   # page inventory → docs/SITE_FULL_AUDIT_LATEST.md
npm run field-report # local anonymized digest → web/blog/ (see FIELD_REPORT_AND_BLOG.md)
```

## Deploy site (Vercel)

1. New Vercel project → this repo
2. **Root directory:** `web`
3. Framework: Other · no build command
4. Add domains: `innsegall.com`, `www.innsegall.com`
5. DNS + Zoho: **`docs/DNS_ZOHO_SETUP.md`**

### Stripe

Test mode: card `4242` · `docs/STRIPE_DASHBOARD_SETUP.md`.  
**Live flip:** `docs/STRIPE_LIVE_FLIP.md` · env in `web/.env.example`.

## Install (users)

```bash
curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash
```

## Share a scout

Battle Scout footer → **Copy for AI assistant** → paste into ChatGPT, Claude, Gemini, or Copilot.  
Marketing pages expose **`#innsegall-ai-bus`** for agents · see **`docs/NORTH_STAR_AUDIT.md`** · **`docs/HOW_TO_SEND.md`**.

## Docs index

Full map: **`docs/DOCS_INDEX.md`**

| Doc | Use |
|-----|-----|
| `OPERATOR_GUIDE.md` | Stack · Vercel · Stripe · DNS |
| `FLOAT_MODE_RUNBOOK.md` | Float mode · blog cadence |
| `FIELD_REPORT_AND_BLOG.md` | Three blog pipelines |
| `SITE_FULL_AUDIT_LATEST.md` | Live page inventory |
| `STRIPE_LIVE_FLIP.md` | Test → live checkout |
| `NORTH_STAR_AUDIT.md` | Lane · pricing · **no pivot** |
| `DISTRIBUTION_PLAYBOOK.md` | SEO first · directories later |
| `LAUNCH_CHECKLIST.md` | Launch path + status |
| `XANO_KEYS_LEFT.md` | Telemetry · smoke **202** |
| `STABILITY.md` | Trust contract |

## Brand

See `docs/BRAND_BIBLE.md` · manifesto: *With Innsegall, no one is your enemy · you have no foe.*
