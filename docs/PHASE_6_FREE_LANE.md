# Phase 6 · free lane builds (post-sprint)

**Theme:** AI triage at scale · iOS inbox spec locked · ops one command · paid Apple still L5.

**Gates:** `npm run audit:swarm` · `npm run dry-run:lanes` · `npm run gate:launch`

---

## Shipped in Phase 6 wave 1

| Area | What |
|------|------|
| L2 ops | `npm run dry-run:lanes` · license + smoke + self-test + handoff + optional Xano |
| Public schema | `/.well-known/battle-scout-ai-v1.schema.json` |
| Public sample | `/samples/battle-scout-ai-v1.sample.json` (sync from `fixtures/`) |
| Canon | [`FREE_LANE_SPRINT.md`](./FREE_LANE_SPRINT.md) · [`AI_HANDOFF_ONBOARDING.md`](./AI_HANDOFF_ONBOARDING.md) · [`IOS_PRODUCT.md`](./IOS_PRODUCT.md) |

---

## Build queue (still free)

| ID | Build | Done when |
|----|-------|-----------|
| B1 | `innsegall check --json` documented in guide for agent piping | Guide + llms |
| B2 | Seat tokens · `/api/redeem` design doc only | `docs/REDEEM_SEATS.md` |
| B3 | Homebrew tap publish (unsigned CLI) | `packaging/homebrew/` + HOMEBREW.md |
| B4 | iOS i1 · Xcode scaffold in separate repo (optional) | After Mac L5 green |
| B5 | Field Report → issue_spotlight auto-publish guardrails | audit-issue-spotlight |

---

## L5 blocker (operator)

Apple Developer Program · notarized zip · `smoke:live` signed line **ok** · see [`APPLE_DEVELOPER_ID.md`](./APPLE_DEVELOPER_ID.md).

---

*Innsegall only · separate entity and Stripe from other products.*
