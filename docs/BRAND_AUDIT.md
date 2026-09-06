# Innsegall · Full brand audit · Sep 6, 2026

**Auditor:** Cursor swarm prep · **Scope:** customer-facing + CLI + gospel + legal  
**Canon:** `docs/BRAND_BIBLE.md` · `GAELIC_VOICE.md` (SPQ house-call)  
**Overall score:** **7.5 / 10** · strong manifesto lane · drift on Mac/Macintosh, Voyages vs scouts, and `doctor` leftovers

---

## Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Manifesto & tone** | 9/10 | “No enemy · no foe” on index, Battle Scout footer, gospel · calm, anti-scareware |
| **Naming system** | 8/10 | Innsegall, Battle Scout, Voyage, Clan, Sound the Horn · XX only internal |
| **Macintosh positioning** | 6/10 | Hero says Macintosh; many “Mac health”, “Mac triage”, flow “Is my Mac okay?” |
| **Artifact lexicon** | 8/10 | Voyage chart strong · “2 scouts/mo” vs “2 Voyages on 1st/15th” mixed |
| **CLI voice** | 7/10 | `runes` shipped · help still “audit”, alpha step still **Doctor** |
| **Battle Scout copy** | 8/10 | Gaelic bookends · manifesto in markdown · flow labels generic |
| **Site / SEO** | 8/10 | JSON-LD, llms.txt, gospel embed · FAQ pricing wording stale |
| **Legal ↔ product** | 7/10 | TOS §9 “2 Battle Scouts/month” ≠ voyage model (1st & 15th) |
| **Monetization voice** | 8/10 | Stripe CTAs on index · horn mailto = support OK |
| **AI gospel** | 9/10 | fren-not-foe in JSON · voyage block · scout structured data |

---

## What’s on brand (keep)

- Hero: *Know you're okay* · *Between popups and Genius Bar*
- CTAs: **Sound the Horn** · **Bring your clan** · **Run the check**
- Manifesto in hero, org schema, Battle Scout footer
- **Not antivirus** · read-only · local-first · no fake viruses
- Voyage = 1st & 15th health tracker + browser Battle Scout
- `innsegall runes` · *Read the runes* · *Solas on the path*
- Gospel stance: *fren not foe · clarity not combat*

---

## P0 · Fix before live (swarm 2)

| ID | Issue | Where |
|----|-------|-------|
| B1 | Install step label **Doctor** | `web/alpha.html` step 2 |
| B2 | FAQ JSON-LD: “2 Battle Scouts per month” | `web/index.html` · should be **2 Voyages · 1st & 15th** |
| B3 | Trust strip “2 free scouts/mo” | `web/index.html` → **2 Voyages · 1st & 15th** |
| B4 | TOS free tier: calendar-month scouts | `web/tos.html` §9 → voyage schedule |
| B5 | `package.json` description mentions **XX for Mac** | internal leak in npm metadata |
| B6 | Flow label **Is my Mac okay?** | `src/constants.mjs` · customer card title |

---

## P1 · Polish (swarm 2)

| ID | Issue | Where |
|----|-------|-------|
| B7 | “Mac health” / “Mac triage” in customer copy | index, alpha, tos meta, history-chart, voyage chart |
| B8 | CLI header “Battle Scout for Mac” | `bin/innsegall.mjs` |
| B9 | `innsegall check` help: “Run audit” | → send the scout / read-only check |
| B10 | MONETIZATION.md launchd doc missing `--open` | docs |
| B11 | `public/innsegall/` stale SPQ-era site | MOVED.md exists · do not serve |
| B12 | llms.txt `$4.2` vs `$4.20` | sync from gospel |
| B13 | Index FAQ visible copy vs JSON-LD drift | pricing FAQ paragraph |
| B14 | Add **runes** to gospel `install` steps | `src/gospel.mjs` |

---

## P2 · Later

- Hosted `og/innsegall-card.png` (1200×630) replace SVG data URI
- Native review of Gaelic phrases
- Notarized app · App Store name **Innsegall** (never XX)
- Customer Portal copy for Clan
- Battle Scout: optional Gaelic one-liner on LIKELY_OK only

---

## Voice quick reference (for swarm)

| Use | Avoid |
|-----|-------|
| Macintosh (positioning) | Mac (except “your Mac” in casual body) |
| Battle Scout | Incident Card, report, scan results |
| Voyage (1st & 15th) | monthly scout quota (ambiguous) |
| Read the runes | doctor, diagnose, scan |
| Sound the Horn | contact support, alert us |
| Clan | family plan, seats bundle |
| Know you're okay | you're safe, 100% secure |
| Post-scare triage | antivirus, malware remover |
| fren not foe (gospel/agents) | war, fight, enemy hunting |

---

## Swarm 2 assignment map

| Agent | Scope | Out of scope |
|-------|--------|--------------|
| **2A · Web + legal** | B1–B4, B7 (web), B13 | Stripe API, engine |
| **2B · Engine + CLI** | B5–B6, B8–B9, B7 (src) | web HTML |
| **2C · Gospel + docs** | B10–B12, B14, sync-gospel | render HTML |

---

## Swarm 2 results (Sep 6, 2026)

| Agent | Scope | Status |
|-------|--------|--------|
| **2A** | Web + legal (alpha, index, tos, privacy) | ✅ P0 B1–B4, B7, B13 |
| **2B** | Engine + CLI (constants, bin, history-chart, package) | ✅ P0 B5–B6, B8–B9 · tests pass |
| **2C** | Gospel + docs sync | ✅ B10, B12, B14 · llms + .well-known synced |

**Post-swarm score:** **8.5 / 10** · P0 brand blockers cleared · P2 (og PNG, Gaelic review) remains.

---

*Audit complete · swarm 2 executes P0 + P1 from this doc.*
