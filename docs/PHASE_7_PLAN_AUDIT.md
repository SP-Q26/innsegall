# Phase 7 plan audit · meta-review

**Audited artifacts:** [`PHASE_7_PLAN.md`](./PHASE_7_PLAN.md) · [`PHASE_7_SWARM_PLAN.md`](./PHASE_7_SWARM_PLAN.md)  
**Baseline:** `gate:launch` **25 ok · 0 fail** · signed installer **warn** · swarm **17 lanes PASS** after landing unity (`76b7380`).

This document audits the **plan**, not the product. No Phase 7 builds were executed.

---

## Verdict

| Area | Rating | Notes |
|------|--------|-------|
| Alignment with free-lane map | **Pass** | Waves map to B1–B5 + L5 · defers iOS binary |
| Positioning risk | **Pass with watch** | Funnel work must not reintroduce family/caretaker copy |
| Operator realism | **Pass** | L5 correctly gated on Apple · not hidden in “wave 1” |
| Swarm plan completeness | **Pass with gaps** | See G1–G4 below |
| Sequencing | **Pass** | W1 before W4 redeem impl is correct |

**Recommendation:** Approve Phase 7 planning docs · start **Wave 1** only after explicit kickoff · do not register new swarm lanes until first script has real checks.

**Update 2026-09-10:** Competitor sweep shipped · `audit-competitor-absorption.mjs` live · see [`BRAND_COMPETITOR_AUDIT_2026-09-10.md`](./BRAND_COMPETITOR_AUDIT_2026-09-10.md).

---

## Strengths

1. **Clear north star:** Absorb blog/agent traffic into `/alpha` without changing product lane.  
2. **Reuses Phase 6 assets:** Public schema + sample + landing unity are prerequisites, already live.  
3. **Swarm-first culture:** New lanes paired with features matches how landing unity shipped.  
4. **Honest metrics:** Telemetry aggregates only · no scout-body KPIs.  
5. **Phase 7b fence:** Redeem API + iOS scaffold deferred with explicit gates.

---

## Gaps (must resolve during Wave 1 kickoff)

| ID | Gap | Mitigation |
|----|-----|------------|
| G1 | **Blog posts lack gospel inject today** · `sync-gospel-web` skips `blog/*.html` | Decide: per-post inject vs shared `sync-blog-chrome` block · `audit-gospel-coverage` must match choice |
| G2 | **`audit-blog-funnel` scope creep** · N posts × many rules | Start with `BLOG_SEO_SLUGS` + index only · expand in W1b |
| G3 | **`INNSEGALL_REQUIRE_SIGNED_INSTALLER` env** not implemented | Implement in `smoke-live.mjs` when L5 near · document in DISTRIBUTION_PLAYBOOK |
| G4 | **Homebrew tap** may be org-policy blocked | W3a exit = doc + formula in repo · live tap is optional success |
| G5 | **Stripe live** smoke already hits live checkout | Plan should note: no “flip” work in Phase 7 unless keys rotate · avoid duplicate STRIPE doc edits |

---

## Risks

| Risk | Likelihood | Impact | Control |
|------|------------|--------|---------|
| SEO JSON-LD duplication hurts rich results | Medium | Medium | `audit-structured-data` one FAQ owner (home) |
| Blog CTA fatigue | Low | Low | One CTA block · Claymore voice audit |
| Redeem doc triggers premature API work | Medium | High | `audit-redeem-design` forbids vercel route until flag |
| Swarm runtime > 3 min | Medium | Low | Split `audit:phase7` for content-only PRs |
| Agent over-recommendation | Low | Medium | llms “when not to suggest” stays in gospel |

---

## Consistency check vs canon

| Canon doc | Phase 7 plan |
|-----------|----------------|
| `FREE_LANE_SPRINT.md` L0–L5 | Waves respect L5 paid gate · L3 extended in W1/W2 |
| `PHASE_6_FREE_LANE.md` B1–B5 | All referenced in waves 2–3 |
| `AI_HANDOFF_ONBOARDING.md` | W2a JSON pipe supports handoff |
| `NO` SPQ bridge | Plan states non-goal · pass |
| `audit-claymore.mjs` | Swarm plan requires blog lane to reuse brand-ban or duplicate em-dash rule |

---

## Swarm plan audit (PHASE_7_SWARM_PLAN.md)

| Check | Result |
|-------|--------|
| New lanes have owner wave | Yes |
| Bootstrap commands marked “not now” | Yes |
| Rollback strategy | Weak but acceptable (warn env is design-only) |
| Overlap with `audit-landing-unity` | **Overlap risk** · merge blog checks into landing-unity extension OR blog-funnel · pick one in kickoff to avoid duplicate failures |
| `audit-macos-release` vs `smoke-live` | Complementary · document single source of truth for signed URL |
| Lane count 17→24 | Acceptable if phased registration |

**Swarm plan verdict:** **Approve rough plan** · consolidate landing-unity vs blog-funnel before writing both scripts.

---

## Pre-wave checklist (operator + agent)

- [ ] `FREE_LANE_SPRINT.md` “Next phase” points to `PHASE_7_PLAN.md`  
- [ ] Wave 1 kickoff issue: G1 gospel-on-blog decision  
- [ ] L5 calendar: Apple enroll date (operator)  
- [ ] `gate:launch` green on `main` after each wave merge  

---

## Post-audit actions (documentation only · done in this commit)

- Phase 7 plan + swarm rough + this audit committed to `docs/`  
- **Not done:** swarm script creation · blog template edits · Apple release  

---

*Audit date: 2026-09-10 · re-run this audit when Wave 1 scope or L5 timeline changes.*
