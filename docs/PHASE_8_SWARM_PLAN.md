# Phase 8 · swarm plan (rough · do not execute)

**Prerequisite:** Phase 7 waves 1–3 green · `audit-competitor-absorption` all rows `shipped` or removed from queue.

---

## Baseline (carry forward from Phase 7)

18 repo lanes + engine smoke + self-test + license dry-test + visual checklist (see `audit-swarm.mjs`).

---

## Proposed Phase 8 lanes (register only when scripts exist)

| Lane | Script | Wave | Checks (summary) |
|------|--------|------|------------------|
| **Operator voice** | `audit-operator-voice.mjs` | W1 | No `household`/`caretaker` on marketing HTML · clan uses team/seats · boat/index aligned |
| **Voyage onboarding** | `audit-voyage-onboarding.mjs` | W1 | guide + alpha mention bootstrap schedule · plist docs link |
| **Spotlight publish** | `audit-spotlight-publish.mjs` | W2 | Frontmatter contract · no paths · issue_spotlight type · Claymore |
| **Partner escalation** | `audit-partner-lane.mjs` | W3 | `PARTNER_ESCALATION.md` exists · Horn/Parley links · no offshore numbers in copy |
| **iOS spec drift** | `audit-ios-spec.mjs` | W4 | `IOS_PRODUCT.md` matches gospel paste format · no FS claims |
| **Redeem surface** | `audit-redeem-api.mjs` | W4b | Only if `/api/redeem` ships · mirrors `REDEEM_SEATS.md` |

---

## Extensions to existing lanes

| Lane | Phase 8 change |
|------|----------------|
| `audit-competitor-absorption.mjs` | Fail if any `queued` row remains after P7 closeout |
| `audit-blog-funnel.mjs` (P7) | Require `report_type: issue_spotlight` posts link `/boat` |
| `audit-landing-unity.mjs` | Clan page lane phrase + operator CTA |
| `audit-discovery.mjs` | `PHASE_8_PLAN.md` linked from Phase 7 doc |
| `audit-telemetry.mjs` (new or launch) | `voyage_completed` / `warrior_ref` in whitelist if added |

---

## CI scripts (planned)

| npm script | Purpose |
|------------|---------|
| `audit:phase8` | operator-voice + voyage-onboarding + spotlight |
| `gate:launch` | unchanged |

---

## Out of scope

- App Store review automation  
- Live payment fuzzing in CI  
- Cross-repo iOS build in SPQ monorepo  

---

*Rough only · kickoff after Phase 7 exit checklist in `PHASE_8_PLAN_AUDIT.md`.*
