# Xano · innsegall_payments (optional P1)

**Forked from:** nexus-ops `STRIPE_ULTRA/xano/sp_payment_log_TABLE.md` · lite version for Innsegall (no niches · no consent chain).

**Alpha today:** Vercel webhook + `innsegall_events` is enough. Add this table when you want **chargeback bundles** and **revenue reconciliation** without parsing Stripe Dashboard.

Stripe truth stays on Vercel · this table is **audit mirror only**.

---

## Table `innsegall_payments`

| Column | Type | Notes |
|--------|------|-------|
| `id` | int | PK auto |
| `created_at` | timestamp | default now |
| `stripe_session_id` | text | **Unique** · idempotency key |
| `stripe_subscription_id` | text | nullable · clan |
| `stripe_customer_id` | text | nullable |
| `stripe_webhook_event_id` | text | `evt_…` |
| `sku` | text | `extra` · `clan` |
| `amount_cents` | int | |
| `currency` | text | default `usd` |
| `payment_status` | enum | `succeeded` · `refunded` · `disputed` |
| `license_issued` | boolean | true after `/api/license` first fetch (optional ping) |
| `day` | date | UTC bucket |

**Indexes:** unique on `stripe_session_id` · index `(day, sku)`

---

## Idempotency (from SPQ webhook v2.6 pattern)

Before insert on `checkout.session.completed`:

1. Query `innsegall_payments` where `stripe_session_id` = session.id
2. If row exists and `payment_status` = `succeeded` → return 200 skip
3. Else insert row from webhook payload

Vercel webhook already logs to `innsegall_events` · this table is for **finance ops** not product unlock (unlock = license file on Mac).

---

## Optional endpoint

`POST /innsegall/payments` (internal) · same **`X-API-Key`** precondition as `innsegall/events` · see [`pastes/innsegall-events-post.xs`](./pastes/innsegall-events-post.xs) step 0 · [`XANO_PASTES.md`](./XANO_PASTES.md).

Or: extend Vercel webhook to dual-write (second fetch) · only after table exists.

---

## What we deliberately omit (vs SPQ)

| SPQ column | Innsegall |
|------------|-----------|
| `niche_slug` / `unlocked_count` | N/A |
| `tos_consent_id` | Site TOS only |
| `user_id` | No accounts |
| `email` | Stripe receipt only · not stored in Xano alpha |

See `pastes/innsegall-events-post.xs` and `XANO_PASTES.md` for `innsegall_events` (required for telemetry aggregates).
