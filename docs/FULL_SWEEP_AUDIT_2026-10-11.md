# Innsegall · full sweep audit (site · lane · brand · copy)

**Date:** 2026-10-11 · **Production:** innsegall.com  
**Commands run:** `audit:swarm` · `smoke:live` · lane/copy/brand child audits · `audit:site`

---

## Executive scorecard (9+ target)

| Dimension | Score | Gate |
|-----------|------:|------|
| **Site / deploy** | 9.6/10 | Swarm PASS · smoke **98 ok / 0 fail** · inventory **76 pages · 0 P0** |
| **SEO / discoverability** | 9.4/10 | Sitemap + JSON-LD · Field Glass cadence · blog quality **110 avg** |
| **Lane clarity** | 9.5/10 | `audit-lane` · boat gospel · not antivirus · complementary tools canon |
| **Branding / shell** | 9.5/10 | Header/footer unity · claymore · brand-ban · Isles colophon |
| **Copy / voice** | 9.3/10 | Customer copy · operator voice · no scareware CTAs |
| **News / watch** | 9.4/10 | Oct 11 Field Glass · RSS · watch hub · desk on all posts |

**Overall:** **9.4/10** · float-mode green · improvements below are P1/P2 polish, not launch blockers.

---

## What passed (no action)

- Full **swarm** (launch, SEO, social preview, Stripe, telemetry, companion, spacing, blog funnel/quality, Isles ethics, install flow, …)
- **Live smoke:** all marketing + blog routes **200** · Stripe checkout live · telemetry **202** to Xano
- **Brand stack:** lexicon, Claymore, competitor absorption, Objective-See complements, landing unity
- **Lane:** `/boat` client copy · gospel `lane_guide` public · no competitor_boat leak
- **Abuse / privacy / Stripe** repo audits

---

## Shipped in this sweep (repo)

| Change | Why |
|--------|-----|
| **Gospel `llmsTxt()`** | Safari + watch + Field Glass blocks now generated from canon (fixes `sync-gospel` wiping hand-edited llms sections) |
| **`when_to_suggest`** | Remote-access fear · calendar spam invites |
| **AI-bus hints** | Macintosh watch / Field Glass desk for agents |
| **Homepage Field Report grid** | Oct 11 Field Glass · someone-remoted guide · `/watch` in lead |
| **`audit-llms-watch.mjs`** | Brand-stack gate: llms ↔ `watch-hub.json` |
| **`audit-landing-unity`** | Index must link `/watch` + Field Glass |

---

## P1 · next 1–2 weeks (operator + light git)

| Item | Owner | Notes |
|------|--------|------|
| **Voyage Oct 15** | Product copy | Field desk already points at sail · post-day: bump desk + short Field Glass “after sail” |
| **Signed Mac installer** | Ops | smoke warns **404** on GitHub zip · expected until Apple Developer L5 |
| **Xano events whitelist** | Ops | Repaste `docs/pastes/innsegall-events-post.xs` if any new event types 502 |
| **`npm run gate:launch`** | CI habit | Swarm + live smoke + checkout toll gate after each content push |
| **Issue spotlight publish** | Content | `publish:issue-spotlights:telemetry:dry` when scout aggregates justify a post |

---

## P2 · brand & copy polish (optional)

| Item | Impact |
|------|--------|
| Homepage hero | Add one-line “iPhone/iPad panic → `/ios`” for pocket scares (nav already has Field Glass) |
| `ios-tablet-panic-hub.json` version bump | Cosmetic `data-panic-version` when hub copy changes materially |
| AI-bus `compiled_at` | Updates on every `sync-gospel` (runtime date) · no manual bump needed |
| Directory / PH snuff | Per `FLOAT_MODE_RUNBOOK` · defer until 4+ weeks blog cadence |

---

## P3 · scale (post–Simple Property MVP)

- Notarized `.zip` · Homebrew tap prominence on `/install`
- Narrow Mac ads · MSP outbound
- Native iOS App Store (explicitly snuffed in float)

---

## Re-run checklist

```bash
cd innsegall
npm run sync-gospel    # after gospel.mjs edits
node scripts/sync-watch-hub.mjs
node scripts/sync-site-chrome.mjs
npm run audit:swarm
npm run smoke:live
npm run audit:site
```

**Canon:** `docs/FLOAT_MODE_RUNBOOK.md` · `docs/FIELD_REPORT_AND_BLOG.md` · `docs/BRAND_BIBLE.md`
