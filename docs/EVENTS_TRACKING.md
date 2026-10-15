# Innsegall event catalog · Xano `innsegall_events`

All rows land in **`innsegall_events`** via `POST /innsegall/events` (`XANO_EVENTS_URL`).  
Client traffic never hits Xano directly; only `POST /api/telemetry` and Stripe webhooks on Vercel.

**Operator:** After code adds a new `event` name, update **`docs/pastes/innsegall-events-post.xs`** in Xano and publish draft → live (or inserts return *not allowed*).

**GTM · surface → event mapping:** `docs/OPERATOR_GTM_SCOPE.md` §5

---

## Client → `/api/telemetry` → Xano

| Event | Emitter | Purpose |
|-------|---------|---------|
| `marketing_ping` | `innsegall-nav.js` | Page view · once per page category per day · channel + `warrior_ref` |
| `install_intent` | `innsegall-nav.js` | Click `.command` / install script / GitHub · copy install line · sample report link (`asset` enum) |
| `checkout_intent` | `innsegall-checkout.js` | Toll-gate click before Stripe redirect · SKU + page + channel |
| `install_ping` | CLI (`telemetry-client.mjs`) | Bootstrap / daily install heartbeat · `install_id` + macOS major |
| `scout_aggregate` | CLI after scout | Verdict/flow buckets · product quality (no paths) |
| `issue_spotlight` | CLI after scout | Issue identify/resolve · Field Report flywheel |
| `packet_bar_copy_link` | Battle Scout HTML · companion | Copy share link · `context`: `battle_scout` \| `sample_report` |
| `packet_bar_copy_ai_paste` | Battle Scout HTML · companion | **Copy for AI** · `triage_level` + `ver`: `innsegall-battle-scout-ai/v1` |
| `packet_bar_share_html` | Battle Scout HTML (mobile share) | Native share / export scout HTML path |
| `packet_bar_pdf` | Battle Scout HTML (when PDF ships) | PDF export · today maps to markdown download hook |

`checkout_complete` is **rejected** on `/api/telemetry` (server-only).

Packet bar payloads use the same web dims as `install_intent`: `day` · `page` · `ref_channel` · `session_id` · optional `warrior_ref`. No scout bodies · no paths.

### `marketing_ping` · `page` enum

`home` · `alpha` · `guide` · `map` · `boat` · `clan` · `warriors` · `blog` · `blog_post` · `privacy` · `tos` · `success` · `install` · `ios` · `tablet` · `watch` · `companion` · `supplies` · `msp` · `stability` · `sample` · `other`

### `ref_channel`

`direct` · `search` · `agent` · `social` · `warrior` · `internal` · `unknown`

---

## Stripe webhook → Xano (server-only)

Configure in Stripe Dashboard → Webhooks (same endpoint as today):

| Stripe type | Xano `event` |
|-------------|----------------|
| `checkout.session.completed` | `checkout_complete` |
| `checkout.session.expired` | `checkout_abandoned` |
| `customer.subscription.created` | `clan_subscription` |
| `customer.subscription.updated` | `clan_subscription` |
| `customer.subscription.deleted` | `clan_subscription` |
| `invoice.paid` (`subscription_cycle`) | `clan_renewal` |
| `invoice.payment_failed` | `payment_failed` |

---

## Funnel (organic growth)

```text
marketing_ping (page + channel)
  → install_intent (command / oneliner / github)
  → install_ping (CLI)
  → scout_aggregate + issue_spotlight
  → packet_bar_* (receipt share · Copy for AI on web)
  → checkout_intent (sku)
  → checkout_complete | checkout_abandoned
  → clan_renewal | payment_failed
```

**Weekly rollup:** `node scripts/report-funnel.mjs` (SQL hints) · `npm run audit:events` · `npm run diagnose:xano`

**Dims:** `page` · `ref_channel` · `sku` · `macos_major` (CLI) · `asset` (install_intent) · `context` / `triage_level` (packet bar)

---

## Privacy

No PII · no paths · no Battle Scout bodies. See `privacy.html` and `PLATFORM_TRACKING.md`.
