# Innsegall

**Macintosh triage · Battle Scout · not antivirus.**

Standalone product repo. Not coupled to SPQ.

## Wake Monday

```bash
cd ~/SPQ/innsegall && npm run preflight
```

Open **`docs/WAKE_BELOW_DECK.md`** · **`docs/NORTH_STAR_AUDIT.md`** (lane · no pivot) · then `BATTLE_BLAST.md` · blast by **1pm**.

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
npm run smoke:live   # after innsegall.com is live
npm run field-report
```

## Deploy site (Vercel)

1. New Vercel project → this repo
2. **Root directory:** `web`
3. Framework: Other · no build command
4. Add domains: `innsegall.com`, `www.innsegall.com`
5. DNS + Zoho: **`docs/DNS_ZOHO_SETUP.md`**

### Stripe (test mode · card 4242)

See `docs/STRIPE_DASHBOARD_SETUP.md` and `web/.env.example`.

## Install (users)

```bash
curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash
```

## Share a scout

Battle Scout footer → **Copy for AI assistant** → paste into ChatGPT, Claude, Gemini, or Copilot.  
Marketing pages expose **`#innsegall-ai-bus`** for agents · see **`docs/NORTH_STAR_AUDIT.md`** · **`docs/HOW_TO_SEND.md`**.

## Docs index

| Doc | Use |
|-----|-----|
| `WAKE_BELOW_DECK.md` | Monday wake |
| `NORTH_STAR_AUDIT.md` | Lane · pricing · AI-bus · **no pivot** |
| `BATTLE_BLAST.md` | Hour schedule |
| `BOARD_ROOM_SWARM.md` | Executive read |
| `HOW_TO_SEND.md` | Blast copy |
| `LAUNCH_CHECKLIST.md` | Full ops |
| `DISTRIBUTION_PLAYBOOK.md` | Directories · communities · Homebrew |
| `STABILITY.md` | Stability contract · trust |
| `XANO_KEYS_LEFT.md` | Telemetry wire · fix 502 |
| `STACK_AUDIT_SEP6.md` | Stack audit |
| `SITE_AUDIT_SEP6.md` | Site audit |

## Brand

See `docs/BRAND_BIBLE.md` · manifesto: *With Innsegall, no one is your enemy · you have no foe.*
