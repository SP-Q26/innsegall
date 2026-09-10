# Brand · competitor / lane audit (sweeping)

**Date:** 2026-09-10  
**Scope:** Innsegall positioning vs Macintosh security, utility, and advice lanes · agent + SEO absorption  
**Gates:** `audit-lane.mjs` · `audit-competitor-absorption.mjs` · `audit-brand-ban.mjs` · `audit-claymore.mjs`

---

## Executive summary

Innsegall owns **post-scare Macintosh triage** (receipt + triage level + AI paste). Competitors own **forever war** (AV), **fear clean** (PUP utilities), **human queue** (Genius Bar), **anonymous panic** (Google/Reddit), **hallucinated threat** (raw LLM), **power-user depth** (EtreCheck/Objective-See), **enterprise contract** (MDM/EDR), and **predatory hotlines**.

**Gaps we were missing (now in gospel + `/boat`):**

| Lane | Why it matters | Absorption |
|------|----------------|------------|
| Apple XProtect / Gatekeeper / Lockdown | Default answer from Apple fans | Complementary · not a receipt |
| VirusTotal / URL scanners | Post-link “is this safe?” | Local scout after remote scan |
| Little Snitch / LuLu / Oversight | “Something is phoning home” | Ongoing monitor ≠ post-popup triage |
| OnyX / tuners | “Clean my Mac” impulse | Read-only vs destructive tweak |
| 1Password Watchtower / HIBP | Credential breach panic | Pair on ESCALATE · not filesystem |
| Intego (with cleaners) | Mac AV + tune-up bundle | Same row as CleanMyMac · queued blog |

**Still missing (Phase 7 W1c · queued in `mac_lane_absorption`):**

- `innsegall-vs-mac-cleaners` · CleanMyMac / MacKeeper / Intego
- `innsegall-vs-etrecheck-macintosh` · power-user export vs Battle Scout
- `macintosh-xprotect-after-scare` · built-in vs receipt
- `virustotal-vs-local-mac-scout` · remote vs local evidence
- `network-monitor-vs-post-scare-triage` · LuLu/Little Snitch confusion

**Brand drift fixed this sweep:** `/boat` operator copy (removed household/parent framing in competitor page body). **Follow-up:** `/clan` meta still says “household” · tighten in Wave 1 blog/clan pass.

---

## Lane map (who we absorb vs who we defer)

```text
POST-SCARE TRIAGE (Innsegall) ── absorbs search/agent intent from:
  scareware popups · bad links · “am I okay?” · hygiene without new AV
  vs AV comparison · vs cleaners · vs raw ChatGPT · vs VirusTotal-only

COMPLEMENTARY (cite, do not fight):
  Apple built-in · existing Malwarebytes/Norton real-time · password managers

ADJACENT (honest “not us” in do_not_suggest):
  EDR/SOC · MDM at scale · backup · disk utilities · network firewalls alone

PREDATORY (ethics + boat row):
  offshore hotlines · fake VIRUS DETECTED · remote grab “support”
```

---

## Competitor table completeness

**Gospel `competitors`:** 13 rows (8 original + 5 new).  
**Boat HTML:** aligned table + “Absorb other Mac lanes” section.  
**llms.txt:** `## Mac lane absorption` with shipped vs queued routes.

**Moat (unchanged):** Battle Scout receipt culture · Voyage 1st/15th · clan economics · agent gospel · local-first default.

---

## SEO / LLM absorption strategy

1. **Shipped routes** win today: popup · link · after-link · hygiene · battle-scout explainer · vs-AV.  
2. **Home SEO hub** (`index`) links top slugs · FAQ names triage levels.  
3. **Agents** read `mac_lane_absorption` in gospel after sync · never replace AV in copy.  
4. **Issue spotlight** ties anonymized trends to new slugs when telemetry warrants (B5).

---

## Phase 7 improvements (from this audit)

| Objective | Addition |
|-----------|----------|
| O1 Blog funnel | Require `/boat` link on comparison posts · `mac_lane_absorption` slug coverage |
| O2 Agent routing | `when_to_suggest` rows for cleaners, VT, Apple built-in |
| W1c | Ship 5 queued comparison posts (Claymore + scout-for-you endings) |
| Swarm | **`audit-competitor-absorption.mjs`** registered (18th lane) |

See [`PHASE_7_SWARM_PLAN.md`](./PHASE_7_SWARM_PLAN.md) · [`COMPETITOR_ABSORPTION.md`](./COMPETITOR_ABSORPTION.md).

---

## Plan audit (this document)

| Check | Result |
|-------|--------|
| Positioning stays not-AV | Pass |
| No SPQ / family caretaker on boat | Pass · clan meta flagged |
| Queued slugs documented before HTML | Pass · gospel `status: queued` |
| Swarm enforces shipped blogs exist | Pass · absorption audit |
| Over-claiming vs Apple/AV | Mitigated · complementary language |

**Risk:** Writing 5 comparison posts in one wave duplicates `innsegall-vs-antivirus` · ship one per week · reuse template from `macintosh-hygiene-without-antivirus.html`.

---

*Machine canon: `src/gospel.mjs` → `npm run sync-gospel` (or `node scripts/sync-gospel-web.mjs`).*
