# Chat elevation audit · 2026-10-14

**Scope:** Innsegall thread · GTM scope · PBS telemetry · EN post-scare gate · i18n plan (not shipped).

---

## Shipped in thread (remote)

| Commit | What |
|--------|------|
| `0ef5ee7` | Sample-first funnel · `install_intent` |
| `6fd88bd` | PBS v1 · `packet_bar_*` events |
| `83203a7` | `OPERATOR_GTM_SCOPE.md` · gospel weld · `audit:gtm-scope` |
| `0181aea` | EN matrix · `audit:en-coverage` · `audit:i18n-readiness` · scary boosts |

---

## English lane (gate green)

- **48** P0 intents · **6** anchors · **5** scary moments (Oct 2026) · **3** deferred P2 EN slugs
- Matrix: `fixtures/post-scare-intent-matrix-en.json`
- Gates: `npm run audit:en-coverage` · `npm run audit:i18n-readiness`
- Docs: `EN_POST_SCARE_COVERAGE.md` · `LANE_I18N_PLAN.md`

**Not in scope this thread (intentional defer):** P2 EN slugs · `/es/blog` routes · `sync-blog-i18n.mjs`

---

## Telemetry

- Paste: `docs/pastes/innsegall-events-post.xs` (15 events incl. packet bar)
- Canon: `EVENTS_TRACKING.md` · `XANO_EVENT_WHITELIST.md`
- Proof: `npm run smoke:xano` · live `marketing_ping` 202

---

## Elevation pass (this commit)

| Gap | Fix |
|-----|-----|
| Gospel/ai-bus missing EN gate pointers | `operator_gtm.en_coverage_*` · `llm_adoption` fields |
| `audit:gtm-scope` did not check EN/i18n weld | Extended checks + llms line |
| `full-send` skipped EN/i18n/GTM gates | Added to `full-send.mjs` + `FULL_SEND.md` |
| Operator sprint paste | GTM scope §8 + related docs table |

---

## Proof commands

```bash
npm run sync-gospel
npm run audit:gtm-scope
npm run audit:en-coverage
npm run audit:i18n-readiness
npm run gate:launch          # 114 ok target
export STRIPE_SECRET_KEY='sk_live_…'
npm run full-send            # operator shell with live key
```

---

## Live smoke baseline

- `gate:launch` / `smoke:live`: **114 ok · 0 fail**
- Warn: signed macOS installer 404 until L5 (`APPLE_DEVELOPER_ID.md`)

*Locales wait on Phase 1 of `LANE_I18N_PLAN.md`.*
