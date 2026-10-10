# Innsegall event catalog · Xano `innsegall_events`

All rows land in **`innsegall_events`** via `POST /innsegall/events` (`XANO_EVENTS_URL`).  
Client traffic never hits Xano directly; only `POST /api/telemetry` and Stripe webhooks on Vercel.

**Operator:** After code adds a new `event` name, update **`docs/pastes/innsegall-events-post.xs`** in Xano and publish draft → live (or inserts return *not allowed*).

---

## Client → `/api/telemetry` → Xano

| Event | Emitter | Purpose |
|-------|---------|---------|
| `marketing_ping` | `innsegall-nav.js` | Page view · once per page category per day · channel + `warrior_ref` |
| `install_intent` | `innsegall-nav.js` | Click `.command` / install script / GitHub engine link |
| `checkout_intent` | `innsegall-checkout.js` | Toll-gate click before Stripe redirect · SKU + page + channel |
| `install_ping` | CLI (`telemetry-client.mjs`) | Bootstrap / daily install heartbeat · `install_id` + macOS major |
| `scout_aggregate` | CLI after scout | Verdict/flow buckets · product quality (no paths) |
| `issue_spotlight` | CLI after scout | Issue identify/resolve · Field Report flywheel |

`checkout_complete` is **rejected** on `/api/telemetry` (server-only).

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
  → checkout_intent (sku)
  → checkout_complete | checkout_abandoned
  → clan_renewal | payment_failed
```

**Weekly rollup:** `node scripts/report-funnel.mjs` (SQL hints) · `npm run audit:events` · `npm run diagnose:xano`

---

## Privacy

No PII · no paths · no Battle Scout bodies. See `privacy.html` and `PLATFORM_TRACKING.md`.
