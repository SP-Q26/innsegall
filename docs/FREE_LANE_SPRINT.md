# Free lane sprint · master doc (Sep 2026)

Parallel workstreams that **do not** require Apple Developer Program enrollment ($99/yr). Paid gate is isolated to **L5**.

**Gates (all lanes):** `npm run audit:swarm` · `npm run gate:launch` before any production tag.

---

## Lane map

| Lane | Owner focus | Deliverable | Paid deps |
|------|-------------|-------------|-----------|
| **L0** | Merge / deploy | Green swarm · Vercel prod · changelog · phase ship notes | None |
| **L1** | Xano / telemetry | Event whitelist · paste stack · operator docs | None |
| **L2** | Dry-run matrix | CLI + license + telemetry rehearsals without live charges | None |
| **L3** | AI handoff | Agent gospel · paste surfaces · warrior loop | None |
| **L4** | iOS product | Spec + schema · **no Xcode** in free lane | None |
| **L5** | Paid Apple gate | Developer ID · notarize Mac installer · later TestFlight | **$99/yr** |

---

## L0 · merge / deploy

**Goal:** Shippable Mac alpha + honest site · no broken install story.

| Task | Done when |
|------|-----------|
| `main` green on swarm + launch gate | CI/local exit 0 |
| `web/` on Vercel · `innsegall.com` routes | `/alpha` · `/stability` · telemetry 202 |
| Phase ship doc current | [`PHASE_5_SHIPPED.md`](./PHASE_5_SHIPPED.md) |
| Distribution + changelog | [`DISTRIBUTION_PLAYBOOK.md`](./DISTRIBUTION_PLAYBOOK.md) · `CHANGELOG.md` |
| Live smoke optional | `npm run smoke:live` · installer HEAD probe |

**Out of scope:** App Store · iOS binary · notarized zip (L5).

---

## L1 · Xano / telemetry doc

**Goal:** Operator analytics only · never user Battle Scout bodies.

| Task | Done when |
|------|-----------|
| Table + event contract documented | [`XANO_DATA.md`](./XANO_DATA.md) |
| Paste deployed to Xano editor | [`XANO_PASTES.md`](./XANO_PASTES.md) · [`pastes/innsegall-events-post.xs`](./pastes/innsegall-events-post.xs) |
| Vercel forwarder matches whitelist | `web/api/telemetry.js` · `npm run diagnose:xano` → **202** |
| Keys checklist | [`XANO_KEYS_LEFT.md`](./XANO_KEYS_LEFT.md) empty or waived |
| Stack overview | [`STACK_AND_DATA.md`](./STACK_AND_DATA.md) |

**Future iOS events:** document new `ios_*` event names here + in Xano paste **before** i2 TestFlight · still aggregate-only.

---

## L2 · dry-run matrix

**Goal:** Rehearse money + license + telemetry paths without flipping Stripe live or posting PII.

| Surface | Command / script | Expect |
|---------|------------------|--------|
| License / credits | `node scripts/dry-test-license.mjs` | Swarm lane OK |
| Xano wire | `npm run diagnose:xano` | 202 · no scout body in payload |
| CLI telemetry dry | `innsegall` telemetry flags per [`XANO_DATA.md`](./XANO_DATA.md) § dry-run | JSON stdout · no network when `--dry-run` |
| Self-test | `npm run self-test` / swarm self-test lane | Cards in support dir only |
| Smoke (local) | `node scripts/smoke.mjs` | Battle Scout HTML valid |
| Smoke (live) | `npm run smoke:live` | Site + optional release artifact |

**Matrix rule:** every row must pass before claiming “ops ready” · live Stripe flip is a **separate** operator doc (not part of free lane definition).

---

## L3 · AI handoff

**Goal:** Models send users to **local Mac scout** · then paste `#innsegall-scout-paste`.

**Canon:** [`AI_HANDOFF_ONBOARDING.md`](./AI_HANDOFF_ONBOARDING.md) · [`AI_ONBOARDING.md`](./AI_ONBOARDING.md)

| Task | Done when |
|------|-----------|
| `llms.txt` + ai-bus + gospel synced | `npm run sync-gospel` after `src/gospel.mjs` edits |
| Swarm ai-bus lane | `audit-ai-bus.mjs` · scout_for_you + `llm_adoption` |
| Warriors + ref attribution | `/warriors` · `marketing_ping` |
| Blog CTAs | scout-for-you endings · `sync-blog-cta` policy |
| Paste format documented | `innsegall-battle-scout-ai/v1` in onboarding + iOS plan |

**Cross-ref:** iOS consumes the same paste JSON · [`IOS_PRODUCT.md`](./IOS_PRODUCT.md).

---

## L4 · iOS (documentation only)

**Goal:** Companion app spec · shared schema · TestFlight criteria · **no repo binary**.

**Canon:** [`IOS_PRODUCT.md`](./IOS_PRODUCT.md)

| Task | Done when |
|------|-----------|
| Positioning vs Mac CLI | Table + non-goals signed off |
| MVP screens defined | Inbox · badge · Voyage · alpha link |
| Data boundaries | No Mac FS · sandbox import only |
| Phases i0–i3 | i0 = doc merge (this sprint) |
| Fixtures list (optional) | Sample v1 JSON from demo + self-test exports |

**Explicit:** Lane 4 does **not** open Xcode or App Store Connect in the free sprint.

---

## L5 · paid Apple gate

**Goal:** Trust on Mac first · iOS TestFlight second.

**Canon:** [`APPLE_DEVELOPER_ID.md`](./APPLE_DEVELOPER_ID.md) · [`PHASE_5_SHIPPED.md`](./PHASE_5_SHIPPED.md) operator table A1–A4

| Step | Done when |
|------|-----------|
| Enroll The Isles LLC · Team ID | Developer ID Application cert in keychain |
| Notarized `InnsegallInstaller.zip` | `npm run release:macos-installer` · staple OK |
| GitHub Release on `latest` | `smoke:live` signed line **ok** |
| `/alpha` primary download | Clean Mac Gatekeeper smoke |
| iOS (later) | TestFlight per [`IOS_PRODUCT.md`](./IOS_PRODUCT.md) · after Mac trust green |

---

## Sprint coordination

1. **L0** unblocks marketing truth · everything else assumes prod site matches git.
2. **L1 + L2** can run in parallel · both must be green before scaling installs.
3. **L3** depends on gospel sync · not on Apple.
4. **L4** only needs schema stability from Mac render · no backend change required for i0.
5. **L5** starts when operator accepts $99/yr · do not block L0–L4 on enrollment.

---

## Quick commands

```bash
npm run audit:swarm
npm run gate:launch
npm run dry-run:lanes
npm run diagnose:xano
npm run sync-gospel              # after gospel edits
npm run sync:battle-scout-sample # after fixture edits
```

---

*Last updated · free lane sprint · Sep 2026*
