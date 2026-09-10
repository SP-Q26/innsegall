# Innsegall · Full Swarm Audit (every lane)

**Date:** Sep 6, 2026 (night) · **Engine:** `0.4.0-alpha` · **Site CSS:** v8  
**Auditor:** Cursor swarm · repo truth + gate runs  
**Deadline context:** Go live **innsegall.com** before **Mon Sep 7 · 1:00 PM** (see `BATTLE_BLAST.md`)

---

## Executive verdict

| Lane | Score | Ship alpha? |
|------|-------|-------------|
| **Product / CLI** | 9.0 / 10 | ✅ |
| **Battle Scout artifact** | 9.0 / 10 | ✅ |
| **Web / brand / SEO** | 8.5 / 10 | ✅ |
| **Stack / API** | 8.0 / 10 | ✅ (env keys pending) |
| **Legal / refunds** | 8.5 / 10 | ✅ |
| **Abuse / fraud (test mode)** | 7.0 / 10 | ✅ test only |
| **Docs / gospel / agent lane** | 8.5 / 10 | ✅ |
| **Automation / gates** | 9.0 / 10 | ✅ |
| **Monetization design** | 8.0 / 10 | ✅ |
| **Ops deploy** | 4.0 / 10 | ⏳ **blocks 1pm** |

**Bottom line:** Code and story are **launch-ready**. Tomorrow morning is **plumbing only** (GitHub · Vercel root `web` · DNS · optional Stripe test). Do not build iOS, Xano tables, or new features before 1pm.

**Wake:** `WAKE_BELOW_DECK.md` · **Shutdown:** Sep 6 night · preflight PASS · docs complete.

---

## Shutdown additions (Sep 6 night)

| Item | Status |
|------|--------|
| AI paste · Copy for AI assistant | ✅ |
| `npm run preflight` | ✅ |
| `npm run smoke:live` | ✅ script ready |
| Board room swarm doc | ✅ |
| HOW_TO_SEND | ✅ |
| STACK/SITE audits Sep 6 | ✅ |
| PHASE2 build swarm | ✅ |
| Git push | ⏳ Monday 8:15 |

---

## Automation gates (ran Sep 6 night)

| Gate | Command | Result |
|------|---------|--------|
| Launch audit | `npm run audit` | **PASS** (claymore · pages · gospel · install) |
| Smoke sweep | `npm run smoke` | **PASS** |
| Self-test | `npm test` | **PASS** |

Claymore fix applied: `docs/BATTLE_BLAST.md` em dashes → ` · ` (audit was failing on 5).

---

## 1 · Product / CLI

### Commands

| Command | Purpose | Status |
|---------|---------|--------|
| `innsegall run` | Hygiene Battle Scout | ✅ |
| `innsegall check` | Quick check alias | ✅ |
| `innsegall runes` / `doctor` | Read-only diagnostics | ✅ |
| `innsegall plan` | Quota + license import | ✅ |
| `innsegall voyage` | 1st/15th health nudges | ✅ |

### Hygiene checks (15)

`launch_ghosts` · `adware_markers` · `hosts_file` · `dns_resolvers` · `system_proxy` · `gatekeeper` · `security_software` · `firefox_profile` · `safari_profile` · `chrome_profile` · `login_items` · `recent_installs` · `config_profiles` · `recent_downloads` · `project_watch`

Launch-item classifier distinguishes **housekeeping** vs true ghosts (Malwarebytes, Epson, Spotify, Steam, WD, Canon, etc.).

### Install path

- Script: `web/scripts/innsegall-alpha-install.sh`
- Target: `~/.local/bin/innsegall` → clone `github.com/SP-Q26/innsegall`
- Requires: macOS 12+ · Node 20+

### Quota / license

- Welcome scout + monthly voyage quota (1st/15th)
- HMAC `license.json` from Stripe session (`GET /api/license`)
- Local replay guard on `stripe_session` / `stripe_subscription`
- **Gap (prod):** server `/api/redeem` + rotated `INNSEGALL_LICENSE_SECRET`

### Parley (CLI + hosted)

- Static Solas in Battle Scout HTML (BYOK path)
- Hosted `POST /api/parley` when `GEMINI_API_KEY` set · static fallback always
- CORS `*` for `file://` Battle Scout opens

**P1 post-launch:** Gate `plan --clan` bypass · notarized binary · seat tokens for clan.

---

## 2 · Battle Scout artifact

| Item | Status |
|------|--------|
| Verdict human copy (`VERDICT_HUMAN` / leader line) | ✅ |
| Fixes ladder (`fixes.mjs`) | ✅ |
| Structured JSON-LD + agent meta | ✅ smoke |
| No evidence paths in `scout_aggregate` telemetry | ✅ smoke |
| Armory · voyage chart · Parley embed (`render.mjs`) | ✅ |
| Share / mailto export | ✅ |
| Smoke fixtures: LIKELY_OK · FIX_LIST · ESCALATE | ✅ |

**Gap:** Parley live rate limit / abuse cap on `/api/parley` (not in audit-launch).

---

## 3 · Web / brand / SEO

### Pages (20 HTML + APIs)

| Route | File | Notes |
|-------|------|-------|
| `/` | `index.html` | Lay of the land · gospel embed · FAQ schema |
| `/alpha` | `alpha.html` | Install · primary CTA |
| `/guide` · `/map` · `/boat` | ✅ | Onboarding + competitor lane |
| `/clan` · `/warriors` | ✅ | Monetization + referrals |
| `/privacy` · `/tos` | ✅ | Apex rewrites |
| `/success` | ✅ | License download + refund microcopy |
| Blog | 9 posts + index | Sitemap listed |

### Brand v8

| Rule | Status |
|------|--------|
| Primary CTA **Send the scout** (not “Run the check”) | ✅ sitewide |
| **Sound the Horn** = escalation only | ✅ |
| Header: text nav only · no duplicate gold horn | ✅ |
| Hero: single horn CTA per page | ✅ |
| Claymore ` · ` not em dash in customer copy | ✅ `audit-claymore` |
| CSS `innsegall.css?v=8` on all 20 pages | ✅ |
| Calm sea motion · footer link nowrap | ✅ |

### SEO / discoverability

| Item | Status |
|------|--------|
| `sitemap.xml` | ✅ |
| `robots.txt` | ✅ |
| `llms.txt` + `/.well-known/innsegall-gospel.json` | ✅ synced |
| Index FAQ + Product JSON-LD | ✅ |
| Hosted OG PNG (`og:image` on index) | ❌ P2 (alpha uses inline SVG on some pages) |
| `www` → apex redirect in `vercel.json` | ✅ |

**Minor:** `/map` CTA still says “Sound the Horn” (intentional escalation page · not onboarding).

---

## 4 · Stack / API

### Vercel (`web/vercel.json`)

- Security headers: `nosniff` · `DENY` frame · referrer policy
- Clean URLs · trailing slash off
- Rewrites for all marketing routes + blog slugs

### API routes

| Route | Method | Status | Env |
|-------|--------|--------|-----|
| `/api/stripe/checkout` | POST | ✅ | `STRIPE_SECRET_KEY` |
| `/api/stripe/webhook` | POST | ✅ | `STRIPE_WEBHOOK_SECRET` · optional `XANO_EVENTS_URL` |
| `/api/license` | GET | ✅ | `STRIPE_SECRET_KEY` · `INNSEGALL_LICENSE_SECRET` |
| `/api/telemetry` | POST | ✅ fixed | optional `XANO_EVENTS_URL` |
| `/api/parley` | POST | ✅ | optional `GEMINI_API_KEY` |

Webhook: forwards `checkout_complete` · `clan_subscription` · `clan_renewal` to Xano; **502** if Xano URL set and forward fails (Stripe retries).

Telemetry: PII key denylist · path-like rejection · client events `install_ping` · `scout_aggregate` · `marketing_ping` · `issue_spotlight` · Xano paste `docs/pastes/innsegall-events-post.xs` (auth + 7-event whitelist).

**Gaps:**

- `parley.js` not listed in `audit-launch.mjs` required files (add P1)
- No Vercel env until operator paste
- Install script clones GitHub repo that **does not exist yet**

---

## 5 · Legal / refunds

| Item | Status |
|------|--------|
| TOS §9 extra run final after `license.json` | ✅ |
| Clan cancel in Stripe · no prorated refunds | ✅ |
| Checkout `custom_text` on submit (extra vs clan) | ✅ |
| Index pricing note + FAQ | ✅ |
| Success page refund microcopy | ✅ |
| Gospel `pricing.refunds` + `field_credits` | ✅ synced |

**Operator:** Stay on **Stripe test** until LLC/EIN if avoiding live tax surface.

---

## 6 · Abuse / fraud

See `ABUSE_HARDENING.md`. Summary:

| Threat | Alpha | Production |
|--------|-------|------------|
| Forge license | Warn on default secret | Unique Vercel secret + CLI verify secret |
| Replay Stripe session | Local redemption file | Xano `redeemed_sessions` |
| `INNSEGALL_CLAN=1` bypass | Documented dev only | Remove / gate |
| Telemetry flood | PII rejection | Xano rate limit |
| Parley prompt injection / cost | Static fallback | Rate limit + auth optional |

**Test launch:** acceptable. **Live keys:** complete production checklist in `ABUSE_HARDENING.md` first.

---

## 7 · Docs / gospel / agent lane

| Doc | Role |
|-----|------|
| `BATTLE_BLAST.md` | Monday 1pm playbook |
| `LAUNCH_CHECKLIST.md` · `WIRE_STRIPE_VERCEL.md` | Ops |
| `pastes/innsegall-events-post.xs` · `XANO_PASTES.md` · `XANO_KEYS_LEFT.md` | Table + API paste + keys |
| `AGENT_WARRIORS.md` | Field credits · warrior refs |
| `VOICE_VINLAND.md` | Lexicon |
| `COMPETITOR_BOAT.md` + `/boat` | Lane clarity |
| `AI_GOSPEL.md` · gospel JSON | Agent discoverability |

Gospel sync: `npm run sync-gospel` → `llms.txt` · `.well-known` · index embed.

---

## 8 · Monetization

| SKU | Price (design) | Flow |
|-----|----------------|------|
| Extra run | One-time | Checkout → `/success` → `license.json` → `plan --import-license` |
| Clan | Subscription | Stripe sub · `valid_until` on license |

Highest ROI lever: **clan conversion** (see `REVENUE_PROJECTION.md`).

Warrior / field credits: manual alpha · rules in `AGENT_WARRIORS.md`.

---

## 9 · Platform roadmap (agreed · not 1pm scope)

1. **Now:** Macintosh CLI alpha  
2. **Next:** iOS companion (read Battle Scout · clan share · not a scanner)  
3. **Later:** Windows · Linux last  

---

## 10 · Ops deploy (P0 for 1pm)

| Step | Owner | Status |
|------|-------|--------|
| Commit ~71 changed files | You | ❌ uncommitted |
| Create `github.com/SP-Q26/innsegall` · push · tag `v0.4.0-alpha` | You | ❌ no remote |
| Vercel project · root directory `web` | You | ❌ |
| DNS `@` A `76.76.21.21` · `www` CNAME `cname.vercel-dns.com` | You | ❌ |
| Zoho MX / SPF / DKIM for `hello@innsegall.com` | You | ❌ |
| Vercel env: Stripe · license secret · webhook secret | You | ❌ |
| Stripe webhook → `https://innsegall.com/api/stripe/webhook` | You | ❌ |
| E2E: 4242 checkout → license import | You | ❌ |

### Tier definitions

| Tier | Includes | Acceptable for 1pm? |
|------|----------|---------------------|
| **A** | Site SSL · `/` · `/alpha` · curl install | ✅ minimum |
| **B** | + Stripe test · webhook · one license import | ✅ target |
| **C** | + Xano live · live Stripe · OG asset | ❌ skip |

---

## Prioritized backlog

### P0 (Monday morning)

1. GitHub repo + push  
2. Vercel deploy + domain  
3. Smoke live: `/` · `/alpha` · install one-liner  

### P1 (week of launch)

1. Rotate `INNSEGALL_LICENSE_SECRET`  
2. `POST /api/redeem` + Xano table (`pastes/innsegall-events-post.xs` · `XANO_PASTES.md`)  
3. Add `web/api/parley.js` to `audit-launch.mjs`  
4. Hosted OG image on index  
5. Stripe Customer Portal link in footer  

### P2 (post-alpha)

1. Blog md→html CI  
2. Notarized Mac app  
3. Parley rate limits  
4. iOS companion spec  
5. Windows port  

---

## Swarm sign-off

```
npm run audit   → PASS
npm run smoke   → PASS
npm test        → PASS
```

**Ship alpha when ops completes.** Return to SPQ after 1pm per `BATTLE_BLAST.md`.
