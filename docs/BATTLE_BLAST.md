# Battle Blast · Go live before 1pm

**Wake doc:** `WAKE_BELOW_DECK.md` · **Board:** `BOARD_ROOM_SWARM.md` · **Send:** `HOW_TO_SEND.md`  
**Mission:** Innsegall alpha on **innsegall.com** · low fruit only · back to SPQ by afternoon.  
**Deadline:** **Monday Sep 7, 2026 · 1:00 PM** (your local, UTC-5).  
**Version:** `0.4.0-alpha` · engine + site v8 · gospel synced · **AI paste shipped Sep 6 night**

---

## Executive verdict

| Question | Answer |
|----------|--------|
| Is code ready? | **Yes** · `npm run preflight` PASS (gospel · audit · smoke · test) |
| What blocks 1pm? | **Ops only:** GitHub push · Vercel · DNS SSL · (optional) Stripe test keys |
| Minimum “live”? | Homepage + alpha + curl install from public repo · SSL green |
| Minimum “paid alpha”? | Above + Stripe test + webhook + one 4242 license import |
| Skip tomorrow? | Xano table · OG PNG · blog CI · live Stripe · iOS · Windows |

**Low-fruit thesis:** You already earned the product last night (real hijacker → Battle Scout). Tomorrow is **plumbing**, not more building.

---

## Full audit · Sep 6 night (code lane)

### Product / CLI · 9/10

| Item | Status |
|------|--------|
| `innsegall run` / `runes` / `plan` / `voyage` | ✅ |
| Welcome scout + 1st/15th quota | ✅ |
| Battle Scout HTML (armory · Parley · voyage chart) | ✅ |
| Smoke fixtures LIKELY_OK / FIX_LIST / ESCALATE | ✅ |
| Install → `~/.local/bin/innsegall` | ✅ |
| Field Report script (`npm run field-report`) | ✅ |
| **Copy for AI assistant** + `.ai-paste.md` sidecar | ✅ Sep 6 night |

**Gaps (post-1pm):** server `/api/redeem` · notarized app · warrior credit auto-issue.

### Web / brand · 8.5/10

| Item | Status |
|------|--------|
| Pages: `/` · `/alpha` · `/guide` · `/map` · `/boat` · `/clan` · `/warriors` | ✅ |
| Blog (9 posts) + sitemap | ✅ |
| CSS v8 · calm sea motion · footer nowrap | ✅ |
| CTA: **Send the scout** · header nav only (no duplicate horn) | ✅ |
| Lay of the land section on index | ✅ |
| Refunds hardened (TOS · checkout · success) | ✅ |
| `llms.txt` + gospel JSON + embed | ✅ |

**Gaps:** hosted OG image · Customer Portal link in footer (nice).

### Stack / API · 8/10

| Route | Status |
|-------|--------|
| `POST /api/stripe/checkout` | ✅ · refund text on submit |
| `POST /api/stripe/webhook` | ✅ · Xano forward · 502 if Xano required & fails |
| `GET /api/license` | ✅ |
| `POST /api/telemetry` | ✅ · fixed handler |
| `POST /api/parley` | ✅ · GEMINI optional |

**Gaps:** `XANO_EVENTS_URL` not set until you paste table (optional for 1pm).

### Legal / abuse · 8.5/10

| Item | Status |
|------|--------|
| TOS + Privacy (apex paths) | ✅ |
| Extra run non-refundable · automated license | ✅ |
| PII rejection on telemetry | ✅ |
| Claymore audit (no em dash) | ✅ |

**Rule:** Stay on **Stripe test** until LLC/EIN if you want zero tax headache.

### Ops deploy · 4/10 → **your morning**

| Item | Status |
|------|--------|
| GitHub `innsegall/innsegall` | ❌ no remote · ~71 files uncommitted |
| Vercel project (root `web`) | ❌ |
| DNS → Vercel SSL | 🔄 in progress |
| Zoho `hello@` | 🔄 in progress |
| Stripe test env on Vercel | 🔄 you have Stripe |

---

## What “live” means at 1pm (pick tier)

### Tier A · Marketing live (45 min ops) · **acceptable**

- [ ] `innsegall.com` loads `/` and `/alpha`
- [ ] `curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash` works
- [ ] Public GitHub repo with this tree
- [ ] `hello@innsegall.com` receives mail (Zoho verified)

Pricing buttons may 503 until Stripe env is set · **say “alpha · scouts free” in any post.**

### Tier B · Paid test live (+30 min) · **target if Stripe keys ready**

- [ ] Vercel env: `STRIPE_SECRET_KEY` · `INNSEGALL_LICENSE_SECRET` · `STRIPE_WEBHOOK_SECRET`
- [ ] Webhook `https://innsegall.com/api/stripe/webhook` registered
- [ ] One **$4.20** 4242 checkout → `license.json` → `innsegall plan --import-license`
- [ ] One **Clan** 4242 sub → import → cancel in Stripe Dashboard

### Tier C · Not tomorrow

- Xano `innsegall_events` (paste from `XANO_PASTES.md` when you have 20 min)
- Live Stripe keys
- Field Report auto-publish cron
- iOS / Windows ports

---

## Battle schedule · Monday morning

Times assume you start ~8:00 AM. Compress if DNS already green tonight.

| Time | Action | Owner | Done when |
|------|--------|-------|-----------|
| **8:00** | Coffee · open this doc | You | · |
| **8:05** | `cd ~/SPQ/innsegall` · **`npm run preflight`** | You | All passed |
| **8:15** | Commit + push (commands below) | You | GitHub `main` + tag `v0.4.0-alpha` |
| **8:30** | Vercel: import repo · root **`web`** · add domain | You | Preview URL works |
| **8:35** | Namecheap: `@` A `76.76.21.21` · `www` CNAME `cname.vercel-dns.com` | You | Vercel domain ✅ |
| **8:40** | Zoho: verify MX/SPF/DKIM · send test to Gmail | You | `hello@` works |
| **9:00** | SSL propagation wait · **`npm run smoke:live`** | You | `https` green |
| **9:15** | Stripe env on Vercel + webhook + redeploy | You | Checkout opens |
| **9:30** | 4242 E2E + curl install on your Mac | You | License imports |
| **9:45** | One Battle Scout on your Mac · screenshot for social | You | Receipt in hand |
| **10:00** | **FREEZE Innsegall code** · switch head to SPQ | You | No more commits until tonight |
| **10:00–1:00** | SPQ only · Innsegall = monitor Stripe webhook logs if bored | You | · |
| **12:45** | 5-min live check: `/` · `/alpha` · install one-liner | You | · |
| **1:00** | **BLAST** · post / tell clan / optional HN or Mac forum | You | 🎯 |

**If DNS slips:** Ship Vercel preview URL + GitHub install instructions until apex SSL is green · swap links when ready.

---

## Copy-paste · GitHub push

```bash
cd ~/SPQ/innsegall
npm run predeploy    # gospel + audit
npm run smoke

# Create repo at github.com/new → innsegall/innsegall (public, empty)

git add -A
git commit -m "$(cat <<'EOF'
Innsegall 0.4.0-alpha · battle blast ready.

Site v8, gospel, Stripe webhook, refunds, Xano forward, Parley API.
EOF
)"
git remote add origin https://github.com/innsegall/innsegall.git   # if missing
git push -u origin main
git tag v0.4.0-alpha && git push origin v0.4.0-alpha
```

---

## Copy-paste · Vercel env

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
INNSEGALL_LICENSE_SECRET=<openssl rand -base64 32>
# Optional later:
# XANO_EVENTS_URL=https://....xano.io/api:GROUP/innsegall/events
# XANO_API_KEY=...
# GEMINI_API_KEY=...
```

**Build command:** empty (static + `/api`). **Root:** `web`. **Install command:** runs from `web/package.json` automatically.

---

## Copy-paste · live smoke (9:30 AM)

```bash
# Site
curl -sI https://innsegall.com/ | head -3
curl -sI https://innsegall.com/alpha | head -3
curl -sI https://innsegall.com/llms.txt | head -3

# Install
curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash
innsegall runes
innsegall run --smoke

# Paid (if Stripe wired)
open "https://innsegall.com/#pricing"
# 4242 → success → innsegall plan --import-license ~/Downloads/innsegall-license.json
```

---

## 1pm blast · what to say (low fruit)

**Full copy:** `HOW_TO_SEND.md`

**One-liner:**
*Sent a scout across your Mac after a scare · read-only · no upload · know you're okay.*

**Link:** `https://innsegall.com/alpha`

**Do not promise:** antivirus · removal guarantee · Windows · phone app yet.

**Channels (pick one, not all):**

1. Personal network / clan · “I built this after a bad link night”
2. Mac forum / subreddit · link blog post `fake-virus-popup-macintosh`
3. `hello@` signature · innsegall.com

**Do not:** spend morning on new features · merge SPQ and Innsegall repos · live Stripe without LLC comfort.

---

## SPQ handoff rules (after 10 AM freeze)

| Innsegall | SPQ |
|-----------|-----|
| Monitor Vercel deploy email | Normal canvas / weweb-export work |
| Reply `hello@` if urgent | Terminal / auth gates |
| 15 min/day max on Innsegall | Full focus until SPQ tasks done |

**Innsegall lives in `~/SPQ/innsegall`** · separate Vercel project · zero SPQ `vercel.json` coupling.

---

## Rollback (if something breaks at noon)

1. Vercel → previous deployment → Promote
2. Stripe → disable webhook temporarily
3. Site still useful: GitHub raw install script until DNS fixed

---

## Post-1pm backlog (when SPQ breathes)

| Priority | Task | ROI |
|----------|------|-----|
| P1 | Xano table + `XANO_EVENTS_URL` | Revenue truth |
| P2 | `POST /api/redeem` server ledger | Abuse |
| P3 | OG image `/og/innsegall-card.png` | Social CTR |
| P4 | Field Report weekly cron | SEO flywheel |
| P5 | iOS companion spec (read-only scout viewer) | Distribution |

**Next platform build:** **iOS companion** (share Battle Scout · clan) before Windows.

---

## Doc map

| Doc | When |
|-----|------|
| **`WAKE_BELOW_DECK.md`** | **First open Monday AM** |
| **`BOARD_ROOM_SWARM.md`** | What the board says |
| **`HOW_TO_SEND.md`** | Blast + AI paste |
| **This file** | Hour-by-hour Monday |
| `STACK_AUDIT_SEP6.md` · `SITE_AUDIT_SEP6.md` | Tonight's full audits |
| `PHASE2_BUILD_SWARM.md` | After 1pm |
| `LAUNCH_CHECKLIST.md` | Full ordered path |
| `WIRE_STRIPE_VERCEL.md` · `STRIPE_DASHBOARD_SETUP.md` | Stripe wiring |
| `DNS_ZOHO_SETUP.md` | DNS + hello@ |
| `INFRA_FORK_AUDIT.md` | SPQ/nexus forks |
| `XANO_PASTES.md` | When Xano ready |
| `FULL_SWARM_AUDIT.md` | Deep scorecard |

---

## Shutdown log · Sep 6 night

- `npm run preflight` PASS  
- Docs: WAKE · BOARD · HOW_TO_SEND · STACK/SITE audits · PHASE2 swarm  
- ~80 files uncommitted · push Monday 8:15  
- Below deck · zzz  

*The mist is loud · the scout is calm · ship the receipt · then back to the longship.*

**Code freeze now. Ops tomorrow before 1. SPQ owns the afternoon.** See `WAKE_BELOW_DECK.md` when you surface.
