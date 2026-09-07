# Innsegall · North star audit · Sep 6, 2026

**Question:** If we change direction, the time is now. Are we on true north?

**Verdict:** **Stay the course on lane and pricing shape** · fix brand drift and ship a unified **AI-bus** on marketing surfaces · defer MSP flip until 400 installs.

**Cross-links:** `WAKE_BELOW_DECK.md` · `BOARD_ROOM_SWARM.md` · `OPERATOR_GUIDE.md` · `SITE_AUDIT_SEP6.md` · `README.md`

---

## True north star (one sentence)

> **After a scare on a Macintosh, Innsegall answers “am I okay right now?” with a local Battle Scout receipt agents can read · families pay for unlimited scouts · we never sell fear.**

Everything else is tactics.

---

## What we are / are not

| We are | We are not |
|--------|------------|
| Post-scare triage · between popups and Genius Bar | Antivirus · always-on scanner |
| Read-only scout · Battle Scout artifact | Remote grab · fake VIRUS DETECTED |
| Voyage rhythm (1st & 15th) · habit without nagware | Forever-scan subscription |
| AI-discoverable (gospel · llms.txt · AI-bus · paste) | SEO “best Mac antivirus” spam |
| Clan household ($6.67) · 5 seats | Enterprise SOC · guild codes |

**Beachhead:** Tired Norseman on a Mac after popup or bad link · see `TARGET_DEMO_400.md`.

---

## Financial model · current path

| Tier | Price | Role |
|------|-------|------|
| Free | $0 | 2 **Voyages**/mo (1st & 15th) · habit + chart |
| Extra scout | $4.20 once | Panic monetization · quota wall |
| Clan | $6.67/mo | **Primary MRR** · 5 seats · unlimited |

**Unit economics:** High margin · no scan storage · Stripe ~3%.

**Year-1 honest band:** $500–$3k MRR organic (`REVENUE_PROJECTION.md`).

**What moves MRR:** Clan attach after ESCALATE or household panic · not warrior credits.

---

## Four alternatives (if we pivoted)

### A · Clan-only subscription (drop $4.20)

| | |
|--|--|
| **Shape** | Free 2 Voyages · only upsell = Clan $6.67 (or $7.99) |
| **Pros** | One paid story · less checkout friction · pro pricing page |
| **Cons** | Lose impulse $4.20 · quota wall feels harsh without middle tier |
| **MRR @ 2k installs** | Similar if clan conv rises 5% → 7% |
| **Fit** | Medium · simplifies brand |

### B · Solo unlimited ($9.99/mo) · kill seat math

| | |
|--|--|
| **Shape** | One plan: unlimited scouts for one Mac · optional “household +$5” later |
| **Pros** | Stripe-simple · matches “I just want calm” |
| **Cons** | Kills differentiated clan FOMO · worse vs “family AV” anchor |
| **Fit** | Low · weakens household wedge |

### C · MSP / freelancer first (B2B flip)

| | |
|--|--|
| **Shape** | $19–29/mo · 10 white-label Battle Scouts for clients · consumer free forever |
| **Pros** | Higher ARPU · `project_safe` flow already exists |
| **Cons** | Wrong for first 400 · sales motion · support load |
| **Fit** | **Phase 2** after beachhead · not now |

### D · Agent-bus as product (distribution > checkout)

| | |
|--|--|
| **Shape** | Consumer stays free/cheap · revenue from Parley · warriors · Field Glass B2B |
| **Pros** | Matches AI discovery thesis · low CAC |
| **Cons** | No near-term revenue · needs Parley + redeem live |
| **Fit** | **Distribution layer now** · **revenue layer still Clan + $4.20** |

### E · Panic-only (no subscription until Parley)

| | |
|--|--|
| **Shape** | Free Voyages · $4.20 per extra run forever · no Clan sub |
| **Pros** | Pure anti-subscription positioning |
| **Cons** | No recurring · harder LTV · competitors own “family plan” narrative |
| **Fit** | Low · Clan is the steal |

---

## Recommendation · stay on course

| Decision | Choice | Why |
|----------|--------|-----|
| **Lane** | Post-scare Mac triage | White space validated · `COMPETITOR_LANE.md` |
| **Free tier** | 2 Voyages · 1st & 15th | Habit without nagware · chart = retention |
| **Panic SKU** | Keep **$4.20** | Proves willingness to pay · low support |
| **MRR SKU** | Keep **Clan $6.67** | Household wedge · undercuts AV psych |
| **Do not** | Raise prices or add tiers pre-blast | Complexity kills clarity |
| **Do not** | Pivot to MSP before 400 installs | Wrong GTM stage |
| **Do** | Ship **AI-bus** on site + keep gospel sync | Agents are free marketing |
| **Phase 2** | Seat tokens · `/api/redeem` · MSP lite | After Stripe E2E green |

**Optional tweak (post-90-day):** Clan → **$7.77/mo** if conversion &lt; 3% with zero churn complaints on $6.67. Not before data.

---

## Brand audit · clarity vs confusion

### Canon lexicon (customer-facing)

| Say | Retired / internal only |
|-----|-------------------------|
| **Send the scout** | run the check · install · doctor |
| **Battle Scout** | Incident Card · scan results |
| **Voyage** (1st & 15th) | 2 scouts/month (ambiguous) |
| **Clan** ($6.67 household) | family plan · guild codes |
| **War-band of scribes** / warriors page | warrior credits (on homepage) |
| **Sound the Horn** | contact support (escalation only) |
| **Copy for AI assistant** | dump logs · export |
| **Macintosh** (positioning) | XX · Ljós · House Call |

### P0 leaks fixed this audit

| Issue | Where | Fix |
|-------|-------|-----|
| Operator copy (“toll gate until env keys”) | `web/index.html` | Replaced with customer-safe alpha note |
| **run the check** | blog, map, engine fixes | → **Send the scout** / **send the scout again** |
| Warrior credits on homepage | index lay of land | → war-band / Field Report credits |
| BRAND_AUDIT lists “Run the check” as on-brand | `BRAND_AUDIT.md` | Updated to Send the scout |

### P1 still worth a pass (post-blast)

- Battle Scout verdict codes in marketing (LIKELY_OK visible · OK in FAQ)
- “Solas” in steps without gloss (power users fine · one line enough)
- Hosted OG image (data URI works · not pro for social)
- `public/innsegall/` stub in SPQ repo · never serve

### Reports (Battle Scout) · score 8.5/10

- Manifesto footer · Gaelic bookends · **Copy for AI assistant** ✅
- `#innsegall-scout-data` + `#innsegall-scout-paste` ✅
- Fix copy still said “run the check again” → aligned ✅

---

## AI-bus · functional parity

SPQ pattern: DOM JSON bus + global · zero extra fetches.

| Surface | ID / URL | Status |
|---------|----------|--------|
| Gospel | `#innsegall-gospel` · `/.well-known/innsegall-gospel.json` | ✅ |
| **Marketing AI-bus** | `#innsegall-ai-bus` · `window.__INNSEGALL_AI_BUS` · `/innsegall-ai-bus.json` | ✅ index · alpha · guide · boat · clan · warriors |
| Battle Scout context | `#innsegall-scout-data` | ✅ |
| Full audit paste | `#innsegall-scout-paste` | ✅ |
| Crawler | `/llms.txt` | ✅ |
| Parley delegate | `parley/tools.mjs` · `/api/parley` | ✅ alpha |

**Agent read order:** `llms.txt` → `#innsegall-ai-bus` on site → gospel JSON → user’s Battle Scout paste.

---

## Pro / sleek checklist

| Area | Status |
|------|--------|
| CSS v8 · text nav · no emoji CTAs | ✅ |
| No em dash in customer copy (claymore) | ✅ gate |
| No internal codenames on site | ✅ |
| Operator leaks on marketing pages | ✅ fixed index |
| Stripe CTAs labeled in brand voice | ✅ toll gate = checkout only |
| AI discovery complete | ✅ bus + gospel + paste |

---

## 90-day success metrics (unchanged)

| Metric | Target |
|--------|--------|
| Installs | 50–200 alpha |
| Clan subs | 5–15 |
| MRR | $50–$150 |
| Proof | Paid after panic · Field Report → install |

---

## Decision log

| Date | Decision |
|------|----------|
| Sep 6, 2026 | **No pricing pivot** · brand + AI-bus hardening before blast |
| TBD | Revisit Clan price after 90d Stripe data |
| TBD | MSP lane at 400+ installs |

---

*North star: know you're okay · receipt culture · clan MRR · agents as distribution. Ship plumbing · preach calm.*
