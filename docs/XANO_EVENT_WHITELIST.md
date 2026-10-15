# Innsegall · Xano event whitelist and the 502 pattern

Innsegall telemetry is **not** “open POST to Xano.” The live endpoint `POST /innsegall/events` (API group `innsegall_ops`) runs a **hard-coded allow list** of `event` strings. Anything else is rejected before `db.add`.

That design is intentional: no surprise event types, no PII keys in payload, one table (`innsegall_events`) for funnel SQL.

---

## Request path

```text
Browser / CLI
  → POST https://innsegall.com/api/telemetry  (client events only)
  → Vercel validates CLIENT_EVENTS + payload shape + no PII
  → forwardToXano() with X-API-Key

Stripe
  → POST https://innsegall.com/api/stripe/webhook  (signature verified)
  → maps Stripe type → canonical event name
  → forwardToXano() with X-API-Key

Xano POST /innsegall/events
  → precondition: X-API-Key matches sk_live_innsegall_ops_ / sk_test…
  → precondition: event ∈ $allowed_events
  → precondition: payload keys ∩ forbidden_keys = ∅
  → db.add innsegall_events
```

Git source of truth for the allow list: **`docs/pastes/innsegall-events-post.xs`** (step 1 · `$allowed_events`).  
Repo guard: **`npm run audit:events`** (same 15 names as the paste).

---

## What “whitelist drift” means

**Drift** = Vercel (or git) emits an `event` string that **live Xano** does not yet include in `$allowed_events`.

Typical cause: you deployed Innsegall frontend/API with new telemetry (e.g. Oct 2026 `checkout_abandoned`, `payment_failed`, PBS `packet_bar_*`) but **did not** paste the updated `.xs` stack and **publish draft → live** on Xano in the same window.

Xano does not auto-sync from git. The canvas stack is manual until Isles Receipt Ops migrates this hub to the Ships workspace.

---

## Why you see 502 (not 403 on the browser)

| Layer | On whitelist miss |
|--------|-------------------|
| **Xano** | HTTP **400** (inputerror) · body like `Event type 'payment_failed' is not allowed.` |
| **Vercel forwarder** | Catches non-OK Xano response · throws · returns **502** to the caller |

Callers:

| Caller | User-visible effect |
|--------|---------------------|
| **`/api/telemetry`** | **502** JSON `forward_failed` · marketing/checkout intents lost for that request · page still works |
| **Stripe webhook** | **502** `xano_forward_failed` · **Stripe retries** · Dashboard shows failed deliveries for that event type |

So Stripe can look “half green”: older events (e.g. `checkout.session.completed` → `checkout_complete`) still **200** if that name was on the old whitelist, while **new** handlers (`checkout.session.expired`, `invoice.payment_failed`) **502** until Xano is republished.

This is **not** a broken Stripe secret, wrong webhook URL, or Innsegall checkout bug. It is **code ahead of paste**.

---

## Allowed events (current paste · 15)

| `event` | Source |
|---------|--------|
| `marketing_ping` | `innsegall-nav.js` |
| `install_intent` | nav / install CTAs |
| `checkout_intent` | `innsegall-checkout.js` |
| `install_ping` | CLI |
| `scout_aggregate` | CLI |
| `issue_spotlight` | CLI |
| `packet_bar_copy_link` | Battle Scout / PBS |
| `packet_bar_copy_ai_paste` | PBS |
| `packet_bar_share_html` | PBS |
| `packet_bar_pdf` | PBS |
| `checkout_complete` | Stripe webhook only |
| `checkout_abandoned` | Stripe `checkout.session.expired` |
| `clan_subscription` | Stripe subscription events |
| `clan_renewal` | Stripe `invoice.paid` (cycle) |
| `payment_failed` | Stripe `invoice.payment_failed` |

`checkout_complete` is **server-only**; `/api/telemetry` returns **403** if a client sends it.

---

## Fix checklist (whitelist 502)

1. Open Xano · `innsegall_ops` · `POST innsegall/events`.
2. Replace stack with **`docs/pastes/innsegall-events-post.xs`** (full stack, not a fragment).
3. Confirm env vars `sk_live_innsegall_ops_` / optional test key · JWT auth **off** on this route.
4. **Publish draft → live** (not “saved in editor only”).
5. Stripe → Webhooks → **Resend** failed events for the new types.
6. Smoke:
   ```bash
   cd innsegall
   npm run audit:events
   npm run smoke:xano -- --base=https://innsegall.com
   ```
7. Expect **202** + `forwarded: true` on telemetry · webhook **200** + `xano.forwarded: true`.

Other 502 causes (different fixes): stale `XANO_EVENTS_URL`, `XANO_API_KEY` mismatch → see `docs/XANO_KEYS_LEFT.md`.

---

## Adding a new event (process)

1. Add name to **`web/api/telemetry.js`** `CLIENT_EVENTS` (if browser) or **`web/api/stripe/webhook.js`** mapping (if Stripe).
2. Add to **`docs/pastes/innsegall-events-post.xs`** `$allowed_events`.
3. Add to **`scripts/audit-events.mjs`** `CANON_EVENTS`.
4. Document in **`docs/EVENTS_TRACKING.md`**.
5. **Ship Vercel + Xano publish in one operator window** (duplicate-first if you prefer staging on preview Xano).

Until Isles hub on Ships Xano: this paste discipline applies per brand; FieldDrop/Berth will get their own `isles_events` partition with the same whitelist pattern.

---

*Yard pass pricing note (FieldDrop): $49/mo live SKU · scale copy/catalog when tiers change.*
