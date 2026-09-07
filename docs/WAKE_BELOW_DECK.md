# Wake below deck · Innsegall battle plan

**You went to sleep:** Sep 6, 2026 (night) · **Wake for:** Monday Sep 7 · **Blast by:** 1:00 PM local (UTC-5)  
**Version:** `0.4.0-alpha` · site CSS v8 · gospel synced · **AI-bus on marketing pages** · **AI paste shipped**

> **First command after coffee:** `cd ~/SPQ/innsegall && npm run preflight`

---

## Shutdown verdict (night of Sep 6)

| Gate | Result |
|------|--------|
| `npm run preflight` | **sync-gospel · audit-launch · smoke · self-test** (claymore inside audit) |
| Strategy | **No pivot** · see `NORTH_STAR_AUDIT.md` |
| Git | **Uncommitted work** · no remote · last commit `f9f695f` |
| Live site | **Not deployed yet** · ops is the only blocker |
| SPQ | **Untouched tonight** · correct |

**Ship thesis:** Product is done. Tomorrow is plumbing + one blast. **No new features before 1pm.**

---

## 60-second wake sequence

```bash
cd ~/SPQ/innsegall
npm run preflight
open docs/WAKE_BELOW_DECK.md    # this file
open docs/NORTH_STAR_AUDIT.md   # financial + brand + AI-bus verdict (Sep 6 wake audit)
open docs/BOARD_ROOM_SWARM.md     # what the board says
open docs/HOW_TO_SEND.md          # blast copy + AI paste
```

Then follow **Battle schedule** in `BATTLE_BLAST.md` (8:00–1:00).

---

## What shipped while you slept (do not rebuild)

| Feature | Where |
|---------|--------|
| **Marketing AI-bus** | `#innsegall-ai-bus` · `web/innsegall-ai-bus.json` · index · alpha · guide · boat · clan · warriors |
| **Copy for AI assistant** | Battle Scout footer · full audit paste |
| `.ai-paste.md` sidecar | Every `innsegall run` |
| `npm run preflight` | One gate before push |
| `npm run smoke:live` | After SSL green |
| Infra forks from SPQ/nexus | `INFRA_FORK_AUDIT.md` |
| Stripe/DNS/Zoho pastes | `STRIPE_DASHBOARD_SETUP.md` · `DNS_ZOHO_SETUP.md` |

---

## Tier pick (1pm)

| Tier | You need | Say in public |
|------|----------|---------------|
| **A** (floor) | GitHub · Vercel · DNS · Zoho | “Alpha · scouts free · innsegall.com/alpha” |
| **B** (target) | + Stripe test · 4242 · license import | “$4.20 panic scout · $6.67 clan” |
| **C** (skip) | Xano · live Stripe · iOS | Not Monday |

---

## Morning block (copy from BATTLE_BLAST)

1. **8:05** `npm run preflight`
2. **8:15** Commit + push + tag `v0.4.0-alpha`
3. **8:30–9:00** Vercel + DNS + Zoho (`DNS_ZOHO_SETUP.md`)
4. **9:15** Stripe env + webhook (`STRIPE_DASHBOARD_SETUP.md`)
5. **9:30** `npm run smoke:live` + 4242 (`STRIPE_SMOKE.md`)
6. **10:00** **CODE FREEZE** → SPQ
7. **1:00** Send (`HOW_TO_SEND.md`)

---

## Doc map (read order)

| # | Doc | Purpose |
|---|-----|---------|
| 1 | **WAKE_BELOW_DECK.md** | This file · wake |
| 2 | **`NORTH_STAR_AUDIT.md`** | Lane · pricing · **no pivot** · AI-bus verdict |
| 3 | `BATTLE_BLAST.md` | Hour-by-hour Monday |
| 4 | `BOARD_ROOM_SWARM.md` | Executive unanimous read |
| 5 | `HOW_TO_SEND.md` | Blast copy · AI paste · channels |
| 6 | `STACK_AUDIT_SEP6.md` | Full stack audit tonight |
| 7 | `SITE_AUDIT_SEP6.md` | Full site audit tonight |
| 8 | `PHASE2_BUILD_SWARM.md` | After 1pm · next build wave |
| 9 | `LAUNCH_CHECKLIST.md` | Long-form ops |
| 10 | `INFRA_FORK_AUDIT.md` | SPQ/nexus reuse |

---

## If you only do three things

1. **Push repo** · public `innsegall/innsegall`
2. **Vercel root `web`** · SSL on `innsegall.com`
3. **Run scout on your Mac** · screenshot · send one message

---

*Below deck now. Mist waits. Scout is ready.*
