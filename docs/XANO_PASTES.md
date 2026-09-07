# Xano pastes · Innsegall ops

Copy-paste setup for **innsegall_events** · Stripe webhook lines · no PII.

---

## 1 · Table `innsegall_events`

Create table in Xano (editor DB):

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | integer | auto | PK |
| `created_at` | timestamp | now() | |
| `event` | text | | `install_ping` · `scout_aggregate` · `checkout_complete` · `clan_subscription` · `clan_renewal` |
| `payload` | json | | Event body |
| `day` | date | | UTC bucket `YYYY-MM-DD` |
| `engine_version` | text | nullable | |
| `source` | text | | `vercel_telemetry` · `stripe_webhook` · `cli` |

**Indexes:** `day` · `(event, day)` · `created_at DESC`

---

## 2 · API group `innsegall_ops`

**Base URL example:** `https://x8xx-xx-xx.xano.io/api:YOUR_GROUP_ID`

### Endpoint · POST `/innsegall/events`

**Auth:** API key (Bearer) · header `Authorization: Bearer YOUR_KEY`

**Input (JSON body):**

```json
{
  "event": "checkout_complete",
  "payload": {
    "day": "2026-09-06",
    "sku": "extra",
    "amount_cents": 420,
    "currency": "usd",
    "stripe_session_id": "cs_test_..."
  },
  "day": "2026-09-06",
  "engine_version": null,
  "source": "stripe_webhook",
  "received_at": "2026-09-06T10:00:00.000Z"
}
```

**Xano function stack (paste logic):**

1. **Input** · accept `event`, `payload`, `day`, `engine_version`, `source`, `received_at` (optional)
2. **Conditional** · reject if `payload` contains forbidden keys: `email`, `path`, `hostname`, `html`, `card_json`, `customer_email`
3. **Conditional** · allow `event` in:
   - `install_ping`
   - `scout_aggregate`
   - `checkout_complete`
   - `clan_subscription`
   - `clan_renewal`
4. **Add record** → `innsegall_events`
   - `event` = input.event
   - `payload` = input.payload
   - `day` = input.day OR today UTC
   - `engine_version` = input.engine_version OR payload.engine_version
   - `source` = input.source
5. **Response** · `201` `{ "ok": true, "id": record.id }`

---

## 3 · Vercel env (Innsegall project)

```env
XANO_EVENTS_URL=https://x8xx-xx-xx.xano.io/api:YOUR_GROUP_ID/innsegall/events
XANO_API_KEY=your_xano_api_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
INNSEGALL_LICENSE_SECRET=random-32-byte-string
```

Redeploy after setting env.

---

## 4 · Stripe webhook (Dashboard)

| Field | Value |
|-------|--------|
| URL | `https://innsegall.com/api/stripe/webhook` |
| Events | `checkout.session.completed` · `customer.subscription.updated` · `customer.subscription.deleted` · `invoice.paid` |

**Flow:**

```
Stripe POST → Vercel webhook.js (signature verify)
  → forwardToXano("checkout_complete", payload)
  → Xano row in innsegall_events
  → 200 { received: true, xano: { forwarded: true } }
```

If `XANO_EVENTS_URL` is set and Xano insert fails · webhook returns **502** so Stripe retries.

---

## 5 · Smoke curls

**Telemetry (client-allowed):**

```bash
curl -sS -X POST https://innsegall.com/api/telemetry \
  -H 'Content-Type: application/json' \
  -d '{"event":"install_ping","payload":{"engine_version":"0.4.0-alpha","macos_major":"14","day":"2026-09-06","install_id":"00000000-0000-4000-8000-000000000001"}}'
```

Expect `204` without Xano · `202` with Xano.

**Direct Xano (operator):**

```bash
curl -sS -X POST "$XANO_EVENTS_URL" \
  -H "Authorization: Bearer $XANO_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"event":"checkout_complete","payload":{"day":"2026-09-06","sku":"extra","amount_cents":420,"currency":"usd","stripe_session_id":"cs_test_smoke"},"day":"2026-09-06","source":"manual_smoke"}'
```

---

## 6 · Rollup view (optional Phase 2)

Table view or function **`innsegall_daily_rollup`**:

- Group by `day`, `event`
- Sum `payload.amount_cents` where `event = checkout_complete`
- Count rows where `event = install_ping`

Feeds Field Report blog backfill · no user data.

*Counts in the longship · revenue on the ledger · no foe.*
