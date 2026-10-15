# Operator GTM scope · relentless audit · deploy at every turn

**Updated:** 2026-10-14 · **Lane:** Innsegall only · Isles `isles_brand=innsegall` · **Not** SPQ · **Not** MMI/WWL Stripe  
**Canon stack:** `LANE_OWNERSHIP.md` · `EVENTS_TRACKING.md` · `AI_HANDOFF_ONBOARDING.md` · `ROADMAP_5K_MRR.md` · `EN_POST_SCARE_COVERAGE.md` · `LANE_I18N_PLAN.md`

This doc is the **operator truth** for who buys Innsegall worldwide, why, how we reach them without fearware, and how every product surface maps to telemetry and revenue. Agents: compact routing lives in gospel `operator_gtm` + `llms.txt` § Operator GTM.

---

## 1 · Law (non-negotiable)

| Rule | Meaning |
|------|---------|
| **Post-scare receipt** | Read-only scout · Battle Scout HTML · not AV · not “100% clean” |
| **Own the moment → receipt → agent** | SEO/guides · shareable card · `llms.txt` + local scout before invented malware |
| **Forbidden** | Fear counts · fake infections · offshore hotlines · `audit-operator-voice` drift on **guest** marketing HTML (use **household helper** · clan seats) |
| **Stripe** | Isles business profile · line items say Innsegall · metadata `isles_brand=innsegall` |
| **Privacy** | No PII in git · no scout bodies in telemetry · see `EVENTS_TRACKING.md` |

**Voice:** “Know you're okay” · “Send the scout” · “Bring your clan” · never “INfected” theater.

---

## 2 · What they buy (job to be done)

Nobody buys a CLI. They buy **relief from not-knowing** after a fear spike:

| Job | Product answer |
|-----|----------------|
| Am I okay *right now*? | `LIKELY_OK` / `FIX_LIST` / `ESCALATE` on Battle Scout |
| Prove it to partner, parent, IT, insurer | Share HTML · **Copy for AI** · `packet_bar_*` telemetry |
| Avoid another scary AV subscription | Read-only · Clan below another AV seat |
| Repeat scares in the family | **Clan** · 5 seats · unlimited scouts · shared receipts |
| Quarterly drift without nagware | **Voyage** 1st & 15th · chart |

**Worldwide:** English-first Mac markets (Tier A–B). Macintosh-only wedge is intentional.

---

## 3 · Buyer profiles (six · prioritized)

### P1 · Household helper (primary · Clan MRR)

- **Who:** Adult who gets the panic call for a parent, partner, or teen’s Mac. 35–65 · US/UK/CA/AU/NZ/EU · often not “family IT.”
- **Why buy:** Needs a **artifact to send back** · guilt + urgency · repeat incidents.
- **Reach:** SEO (`check-parent-mac-after-scare`, remote-access guides) · scam-awareness communities (helpful, not spam) · Facebook groups · `ref_channel: search|social`.
- **Path:** Blog → **sample report** → install on their Mac or parent’s → **Clan** after second scare.
- **SKU:** **Clan** $6.67/mo · 5 seats.

### P2 · Post-scare solo Mac user

- **Who:** Fake fullscreen virus, Apple ID lock page, keychain loop, remote-access panic.
- **Why buy:** Closure in minutes without fake support or MacKeeper.
- **Reach:** `/watch` · scary-moment field guides · narrow Apple Search Ads (post-L5) · debunk creators (`warrior_ref`).
- **Path:** Guide → `install_intent` `sample_report` → alpha → Extra scout or Clan.
- **SKU:** **Extra scout** $4.20 → **Clan** if recurring.

### P3 · Indie Mac / creative freelancer

- **Who:** Designer, dev, writer · one Mac · client files.
- **Why buy:** Professional receipt after sketchy link · hates bloated AV.
- **Reach:** HN · Mastodon · r/macapps · `DISTRIBUTION_PLAYBOOK.md` directories.
- **Path:** Demo → `innsegall run` · **Copy for AI** for client thread.
- **SKU:** Clan or Extra scout.

### P4 · Small MSP / Mac admin (10–50 seats)

- **Who:** One-person IT · agency admin · volunteer school/church Mac person.
- **Why buy:** Repeatable triage narrative · shareable HTML for clients.
- **Reach:** `MSP_OUTREACH_BRIEF.md` · MSP pack · outbound to Mac-heavy shops.
- **SKU:** **MSP** (scale after ~20 clans organic).

### P5 · AI-forward user + routing agents

- **Who:** Pastes into ChatGPT/Claude · wants structured `innsegall-battle-scout-ai/v1`.
- **Why buy:** Grounded triage beats hallucinated malware lists.
- **Reach:** `llms.txt` · warriors · `AI_HANDOFF_ONBOARDING.md` · ai-bus.
- **Path:** Sample paste JSON → alpha → install.
- **SKU:** Install + Clan for household machines.

### P6 · Hygiene pragmatist (retention)

- **Who:** Burned by cleaners · wants rhythm not realtime AV.
- **Why buy:** Voyage 1st/15th · chart · “insurance against drift.”
- **Reach:** Hygiene blog · Field Glass · clan autopilot copy.
- **SKU:** **Clan** (unlimited scouts).

### Anti-personas (do not chase)

Enterprise EDR · Windows-only · fear-affiliate keywords · crack/piracy forums · “best antivirus 2026” comparison shoppers who want a scanner badge.

---

## 4 · Geography (worldwide tiers)

| Tier | Markets | GTM |
|------|---------|-----|
| **A** | US, UK, CA, AU, NZ | SEO + communities + Stripe live |
| **B** | IE, SG, IN (EN), ZA, EU (EN) | Same guides · support load gates localization |
| **C** | DE/FR/JP… | New field guides only when Tier A/B CAC proven |

---

## 5 · Funnel · weaponize every surface (on-brand)

Canonical chain (`EVENTS_TRACKING.md`):

```text
marketing_ping → install_intent → install_ping → scout_aggregate → packet_bar_* → checkout_intent → checkout_complete
```

| Surface | Deploy | Event / asset | CTA | Objection killed |
|---------|--------|---------------|-----|----------------|
| Blog scary-moment post | `browser_first` CTA in `fixtures/blog-cta-variants.json` | `install_intent` `sample_report` | `/samples/battle-scout-demo` | “Another scam site?” |
| `/alpha` | Sample **before** `#gatekeeper` | `sample_report` · `copy_terminal` | Lay of the land headline | “CLI is for hackers” |
| `/index` hero | Sample link in hero | `marketing_ping` `home` | Demo → alpha | Trust before install |
| Battle Scout HTML | Copy for AI · share · download | `packet_bar_copy_ai_paste` · `packet_bar_share_html` | Receipt proof | “You're just saying OK” |
| `/clan` | Seats · shared scouts | `checkout_intent` `sku=clan` | $6.67 vs AV seat | “Another subscription” |
| `/warriors` | `?ref=` | `warrior_ref` on pings | Agent distribution | · |
| `/boat` | Lane vs AV/cleaners | `marketing_ping` `boat` | Honest scope | Wrong buyer self-selects |
| `llms.txt` + gospel | When-to-suggest bullets | Agent → alpha | Scout before fiction | AI spiral |
| CLI | `install_ping` · aggregates | No paths in payload | Local truth | Cloud upload fear |
| Stripe webhook | `checkout_complete` only server | `isles_brand` metadata | Live toll-gate | Payment trust |

**Deploy checklist (no new fear surfaces):**

1. Every new field guide → `sync-blog-cta.mjs` · sample-first if browser trap.
2. Every deploy → `npm run gate:launch` when promoting revenue paths.
3. Xano paste parity → `innsegall-events-post.xs` before new event names ship.
4. Gospel/llms → `npm run sync-gospel` after `src/gospel.mjs` edits.

---

## 6 · Objection matrix (streamline onboarding)

| Stage | Objection | Response (copy + product) |
|-------|-----------|---------------------------|
| Land | “Scam site?” | `/boat` · gospel · AJ Nichols footer · sample without install |
| Sample | “Fake data?” | Labeled demo · LIKELY_OK · `/privacy` |
| Install | “Too technical” | `Innsegall-Install.command` · `/install` · L5 notarized zip when live |
| Run | “Steals files?” | Read-only · local card · telemetry without bodies |
| LIKELY_OK | “Don't believe you” | Named checks · Copy for AI |
| ESCALATE | “More scared now” | Fix list · Parley · no cleaner upsell |
| Pay | “Subscription fatigue” | Clan = 5 seats · Extra = one-off |
| Wrong device | “Fix my iPhone” | `/ios` `/tablet` · Mac runs scout |

**Highest leverage:** notarized installer (L5) · weekly `report-funnel.mjs` · wire `packet_bar_copy_link` when “copy receipt link” ships.

---

## 7 · Channel weaponization (maintenance mode)

| Channel | Cost | Fit | Operator action |
|---------|------|-----|-----------------|
| SEO + `/watch` | Time | Highest intent | Field Glass · scary-moment batch · `audit:seo` |
| Sample-first funnel | Shipped | Converts visits | `audit:funnel-conversion` |
| r/macapps · IH · HN | Low | Indie + helper | `docs/pastes/community-*.md` |
| Warriors + llms | Low | Agents | `WARRIORS_FIELD_REPORT.md` |
| Apple Search Ads | Paid | After organic CAC known | `docs/isles/GTM_MAC_FIRST.md` |
| Broad Meta/TikTok | **Defer** | Wrong ICP burn | · |

**Beachhead numbers:** `TARGET_DEMO_400.md` · **MRR math:** `ROADMAP_5K_MRR.md`.

---

## 8 · Relentless audit runbook (paste each sprint)

**Repo:** `~/innsegall` or `SPQ/innsegall`

### P0 launch gate

```bash
npm run gate:launch
# audit:swarm + smoke:live + smoke:links-live + smoke:checkout-toll-gate @ innsegall.com
```

### Ethics / Isles

```bash
npm run audit:isles
npm run audit:discovery
npm run audit:gtm-scope
```

### Git (before push)

```bash
npm run audit:git
```

### Swarm + funnel

```bash
npm run audit:swarm
npm run audit:events
npm run audit:funnel-conversion
```

### Stripe (when taking money)

```bash
npm run audit:stripe-live
npm run audit:stripe-sandbox   # test mode
```

### SEO / site

```bash
npm run audit:seo
npm run audit:blog-quality
npm run audit:blog-funnel
npm run audit:site
npm run audit:client-facing
```

### Smoke (targeted)

```bash
npm run smoke:live
npm run smoke:links-live
npm run smoke:checkout-toll-gate
npm run smoke:xano
npm run smoke:webhook-signed
```

### CLI

```bash
npm run smoke
npm run test
```

### Sprint report (fill every time)

| Field | Source |
|-------|--------|
| `gate:launch` | pass/fail + first warn |
| `audit:en-coverage` | 48 P0 intents · scary boosts · Field Glass |
| `audit:i18n-readiness` | EN green · no premature `/es` routes |
| First P0 | `audit:swarm` lane name |
| Funnel leak | Xano: page with `marketing_ping` but no `install_intent` · or `install_intent` without `install_ping` |
| Copy/ethics | `audit:operator-voice` · Isles ethics |
| Xano | New events accepted? `smoke:xano` |

```bash
node scripts/report-funnel.mjs
```

---

## 9 · Telemetry rollups (weekly · no PII)

Dims: `page` · `ref_channel` · `sku` · `asset` · `macos_major` · `triage_level` (packet bar) · `context` (packet bar link).

| Question | SQL hint (Postgres/Xano) |
|----------|---------------------------|
| Which guides drive visits? | `marketing_ping` GROUP BY `payload->>'page'` |
| Sample vs install click? | `install_intent` GROUP BY `payload->>'asset'` |
| Receipt engagement? | `event LIKE 'packet_bar_%'` |
| Clan intent → paid? | `checkout_intent` sku=clan → `checkout_complete` |

Full catalog: `EVENTS_TRACKING.md`.

---

## 10 · Related docs (weld map)

| Doc | Role |
|-----|------|
| `TARGET_DEMO_400.md` | First 400 install map |
| `DISTRIBUTION_PLAYBOOK.md` | Directories · communities |
| `docs/isles/GTM_MAC_FIRST.md` | Paid + ads rules |
| `FUNNEL_CONVERSION_AUDIT_2026-10-14.md` | Sample-first implementation |
| `L5_OPERATOR_RUNBOOK.md` | Signed installer |
| `MSP_OUTREACH_BRIEF.md` | P4 outbound |
| `PLATFORM_TRACKING.md` | Xano table · examples |
| `XANO_EVENT_WHITELIST.md` | Republish discipline |
| `EN_POST_SCARE_COVERAGE.md` | English matrix gate · `npm run audit:en-coverage` |
| `LANE_I18N_PLAN.md` | Locales after EN · es/pt/fr/ar |

---

*Know the lay of the land · send the scout · bring your clan · prove it in telemetry.*
