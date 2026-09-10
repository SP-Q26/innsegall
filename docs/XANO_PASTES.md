# Xano pastes · Innsegall ops

Copy-paste setup for **innsegall_events** · Stripe webhook lines · no PII.

---

## 1 · Table `innsegall_events`

Create table in Xano (editor DB):

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | integer | auto | PK |
| `created_at` | timestamp | now() | |
| `event` | text | | `install_ping` · `scout_aggregate` · `marketing_ping` · `issue_spotlight` · `checkout_complete` · `clan_subscription` · `clan_renewal` |
| `payload` | json | | Event body |
| `day` | date | | UTC bucket `YYYY-MM-DD` |
| `engine_version` | text | nullable | |
| `source` | text | | `vercel_telemetry` · `stripe_webhook` · `cli` · `vercel_marketing` |

**Indexes:** `day` · `(event, day)` · `created_at DESC`

---

## 2 · API group `innsegall_ops`

**Base URL example:** `https://x8xx-xx-xx.xano.io/api:YOUR_GROUP_ID`

### Endpoint · POST `/innsegall/events`

**Auth:** custom server handshake (not Xano Meta API key · not user JWT)

Xano does not issue per–API-group runtime keys on all plans. You **invent** the secret and store it in two places:

| Where | Name | Role |
|-------|------|------|
| **Xano** → Settings → Environment variables | `vercel_prod_key` · `vercel_preview_key` | Precondition compares incoming header |
| **Vercel** → `XANO_API_KEY` | prod value on Production · preview value on Preview | Server sends header on forward |

Generate (operator terminal):

```bash
openssl rand -base64 32   # prod → prefix sk_live_innsegall_ops_… if you like
openssl rand -base64 32   # preview → sk_test_innsegall_ops_…
```

**Do not use:** Metadata / backend API keys (workspace admin) · Auth user tokens (JWT).

**Endpoint settings:** turn **off** default user authentication on this route.

**Function stack · position 1 · Precondition:**

```text
(http.headers.x_api_key == $env.vercel_prod_key) || (http.headers.x_api_key == $env.vercel_preview_key)
```

(Error: `Unauthorized: Invalid Vercel Handshake Token` · type **401**.)

Vercel / smoke send header `X-API-Key: <same string as XANO_API_KEY>` via `web/lib/xano-forward.mjs`.

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
   - `marketing_ping`
   - `issue_spotlight`
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
XANO_EVENTS_URL=https://x8ki-letl-twmt.n7.xano.io/api:innsegall_ops/innsegall/events
XANO_API_KEY=sk_live_innsegall_ops_...   # must match vercel_prod_key in Xano env
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
  -H "X-API-Key: $XANO_API_KEY" \
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

---

## 7 · Post-build wire (XanoScript / `innsegall_ops`)

**When your table + `POST /innsegall/events` are pushed to draft (or live):**

### A · Copy the API URL from Xano

Dashboard → **API** → group **`innsegall_ops`** → endpoint **`POST /innsegall/events`** → copy full URL.

Shape (one of):

```text
https://x8ki-letl-twmt.n7.xano.io/api:innsegall_ops/innsegall/events
https://{instance}.xano.io/api:innsegall_ops/innsegall/events
```

### B · Vercel env (`spq/innsegall_fe` · Production + Preview)

| Variable | Value |
|----------|--------|
| `XANO_EVENTS_URL` | Full POST URL from step A (no trailing slash) |
| `XANO_API_KEY` | Same string as `vercel_prod_key` / `vercel_preview_key` in Xano env (`X-API-Key` header) |

Redeploy after save.

### C · Smoke (operator machine)

```bash
export XANO_EVENTS_URL='https://YOUR_INSTANCE.xano.io/api:innsegall_ops/innsegall/events'
export XANO_API_KEY='your_key'
node scripts/smoke-xano.mjs
node scripts/smoke-xano.mjs --base=https://innsegall.com   # after Vercel redeploy
```

| Result | Meaning |
|--------|---------|
| Direct Xano `ok` | Table + auth + validation wired |
| Prod `204` | Vercel env not set yet |
| Prod `202` + `forwarded:true` | End-to-end live |

### D · Event map (already coded in repo)

| `event` | Source in Vercel | `source` field |
|---------|------------------|----------------|
| `install_ping` | `POST /api/telemetry` | `vercel_telemetry` |
| `scout_aggregate` | `POST /api/telemetry` (CLI) | `vercel_telemetry` |
| `marketing_ping` | `POST /api/telemetry` (site nav) | `vercel_telemetry` |
| `issue_spotlight` | `POST /api/telemetry` (CLI after scout) | `vercel_telemetry` |
| `checkout_complete` | Stripe webhook | `stripe_webhook` |
| `clan_subscription` | Stripe sub updated/deleted | `stripe_webhook` |
| `clan_renewal` | Stripe `invoice.paid` cycle | `stripe_webhook` |

Payload shape matches `web/lib/xano-forward.mjs` · forbidden keys enforced on both sides.

### E · Stripe checkout row

After a test or live checkout, confirm a row:

- `event` = `checkout_complete`
- `payload.sku` = `extra` or `clan`
- `payload.stripe_session_id` = `cs_...`
- No email or card bodies in `payload`

*Xano built · wire Vercel · smoke · onward.*
