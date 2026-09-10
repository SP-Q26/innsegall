# Innsegall · Xano data layer (Swarm 5C)

Operator analytics only · **never** user Battle Scout bodies. Same paid Xano workspace as SPQ is fine if tables are namespaced `innsegall_*`.

Cross-stack overview: [`STACK_AND_DATA.md`](./STACK_AND_DATA.md).

---

## Table: `innsegall_events`

Single append-only log. Rollups and Field Report backfill read from here in Phase 3.

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | int (auto) | ✓ | Primary key |
| `created_at` | timestamp | ✓ | Default `now()` |
| `event` | text | ✓ | See **Allowed events** below (seven types) |
| `payload` | json | ✓ | Event-specific · validated before insert |
| `day` | date | ✓ | UTC day bucket · index for rollups |
| `engine_version` | text | | From payload when present |
| `source` | text | | `cli`, `vercel_telemetry`, `stripe_webhook` |

**Indexes:** `(day)`, `(event, day)`, `(created_at DESC)`.

**Xano API group:** `innsegall_ops` · POST **`/innsegall/events`**

- **Paste stack:** [`pastes/innsegall-events-post.xs`](./pastes/innsegall-events-post.xs) · guide [`XANO_PASTES.md`](./XANO_PASTES.md)
- **Auth:** `X-API-Key` header · must match Xano env `sk_live_innsegall_ops_` or `sk_test_innsegall_ops_` (first precondition in paste)
- **Validation:** event whitelist · forbidden payload keys (mirror `web/api/telemetry.js` + Stripe forwarder)

### Allowed events (Xano whitelist)

| `event` | Typical `source` | Who may POST |
|---------|------------------|--------------|
| `install_ping` | `vercel_telemetry` | CLI via `/api/telemetry` |
| `scout_aggregate` | `vercel_telemetry` | CLI via `/api/telemetry` |
| `marketing_ping` | `vercel_telemetry` | Site nav via `/api/telemetry` |
| `issue_spotlight` | `vercel_telemetry` | CLI via `/api/telemetry` |
| `checkout_complete` | `stripe_webhook` | Vercel Stripe webhook only |
| `clan_subscription` | `stripe_webhook` | Vercel Stripe webhook only |
| `clan_renewal` | `stripe_webhook` | Vercel Stripe webhook only |

---

## Event types & payload shapes

### `install_ping` (CLI · opt-in Phase 2)

Fired once per install or upgrade · no IP stored.

```json
{
  "event": "install_ping",
  "payload": {
    "engine_version": "0.4.0-alpha",
    "macos_major": "14",
    "day": "2026-09-06",
    "install_id": "a7f3c9e2-4b1d-4a8e-9c0f-1d2e3f4a5b6c"
  }
}
```

| Field | Type | Rules |
|-------|------|-------|
| `engine_version` | string | Semver-ish · max 32 chars |
| `macos_major` | string | Major only · `"13"`, `"14"`, `"15"` |
| `day` | string | ISO date `YYYY-MM-DD` |
| `install_id` | string | Random UUID · **not** tied to Apple ID or serial |

### `scout_aggregate` (CLI · opt-in Phase 2)

Same anonymized buckets as local Field Report · one row per share, not per scout.

```json
{
  "event": "scout_aggregate",
  "payload": {
    "day": "2026-09-06",
    "engine_version": "0.4.0-alpha",
    "total_scouts": 12,
    "by_verdict": { "clear": 8, "fix_list": 3, "escalate": 1, "unknown": 0 },
    "by_flow": { "mac_hygiene": 7, "clicked_bad_link": 4, "project_safe": 1, "other": 0 },
    "password_flags": 1,
    "download_flags": 2,
    "top_attention_checks": [
      { "bucket": "adware_leftovers", "count": 3 },
      { "bucket": "dns", "count": 2 }
    ],
    "report_hash": "a1b2c3d4e5f6"
  }
}
```

Bucket names must match `field-report.mjs` anonymization map · never raw check IDs from cards.

### `marketing_ping` (site · via `/api/telemetry`)

Page-category + channel only · no ad pixels. See [`PLATFORM_TRACKING.md`](./PLATFORM_TRACKING.md).

```json
{
  "event": "marketing_ping",
  "payload": {
    "day": "2026-09-09",
    "page": "clan",
    "ref_channel": "search",
    "session_id": "uuid-v4"
  }
}
```

### `issue_spotlight` (CLI · via `/api/telemetry`)

Category-level identify/resolve · no paths or card bodies. See [`ISSUE_SPOTLIGHT_LOOP.md`](./ISSUE_SPOTLIGHT_LOOP.md).

```json
{
  "event": "issue_spotlight",
  "payload": {
    "day": "2026-09-09",
    "event_type": "identified",
    "issue_key": "clicked_bad_link:browser_profile",
    "issue_slug": "after-suspicious-link-macintosh",
    "flow": "clicked_bad_link",
    "attention_buckets": ["browser_profile"],
    "fix_categories": ["credential_rotation"],
    "engine_version": "0.4.0-alpha",
    "content_hash": "abc123..."
  }
}
```

### `checkout_complete` (server only)

**Not accepted on `/api/telemetry`.** Emitted from Vercel Stripe webhook (or Xano Stripe addon) after verified `checkout.session.completed`.

```json
{
  "event": "checkout_complete",
  "payload": {
    "day": "2026-09-06",
    "sku": "extra",
    "amount_cents": 420,
    "currency": "usd",
    "stripe_session_id": "cs_test_a1..."
  }
}
```

| Field | Type | Rules |
|-------|------|-------|
| `sku` | string | `extra` \| `clan` |
| `amount_cents` | number | Integer · from Stripe line item |
| `currency` | string | Lowercase ISO · usually `usd` |
| `stripe_session_id` | string | `cs_…` only · no customer email |

---

## Example rows (as stored)

| event | day | payload (abbrev) |
|-------|-----|------------------|
| `install_ping` | 2026-09-06 | `{ engine_version, macos_major, install_id }` |
| `scout_aggregate` | 2026-09-06 | `{ total_scouts: 12, by_verdict, report_hash }` |
| `checkout_complete` | 2026-09-06 | `{ sku: "clan", amount_cents: 667, stripe_session_id }` |
| `marketing_ping` | 2026-09-09 | `{ page: "alpha", ref_channel: "agent", session_id }` |
| `issue_spotlight` | 2026-09-09 | `{ event_type: "identified", issue_key, content_hash }` |
| `clan_subscription` | 2026-09-06 | `{ status, stripe_subscription_id }` (Stripe webhook) |
| `clan_renewal` | 2026-10-06 | `{ stripe_invoice_id, amount_cents }` (Stripe webhook) |

---

## NEVER store (hard rules)

Applies to Xano **and** anything POSTed through `web/api/telemetry.js`.

| Category | Examples |
|----------|----------|
| Paths | `/Users/…`, `~/Desktop`, `C:\`, `.ssh`, project roots |
| Hostnames | Machine name, Bonjour name, LAN IPs |
| Identity | Email, name, Apple ID, Stripe customer email |
| Scout bodies | Full card JSON, HTML exports, Parley transcripts |
| Credentials | Passwords, tokens, license file contents |
| Raw Stripe PII | Card numbers, billing address beyond country if needed for tax |

**Flags are OK as counts only:** `password_flags`, `download_flags` in aggregates · not tied to session IDs.

If a payload contains forbidden keys (`email`, `path`, `hostname`, `html`, `card_json`, `customer_email`, …) or path-like strings, **drop the request** · do not sanitize and forward.

Xano paste enforces top-level payload key denylist; Vercel telemetry also scans nested values (`web/api/telemetry.js`).

---

## Wire Stripe webhook → Xano (live)

**Shipped:** `web/api/stripe/webhook.js` calls `forwardToXano()` from `web/lib/xano-forward.mjs` with header **`X-API-Key`** (not Bearer · not Xano Meta API key).

Events: `checkout_complete` · `clan_subscription` · `clan_renewal` · `source: stripe_webhook`.

If `XANO_EVENTS_URL` is set and forward fails · webhook returns **502** (Stripe retries).

**Do not** point Stripe at `/api/telemetry` · that route rejects `checkout_complete` from clients by design.

Setup: paste [`pastes/innsegall-events-post.xs`](./pastes/innsegall-events-post.xs) · env per [`XANO_KEYS_LEFT.md`](./XANO_KEYS_LEFT.md) · smoke `npm run smoke:xano`.

---

## Vercel telemetry API (Phase 1 · live)

| Route | Method | Behavior |
|-------|--------|----------|
| `/api/telemetry` | POST | `{ event, payload }` · see `web/api/telemetry.js` |

| Env | Purpose |
|-----|---------|
| `XANO_EVENTS_URL` | Forward target · if unset, **204 no-op** (privacy-preserving default) |
| `XANO_API_KEY` | Same secret as Xano `sk_live_innsegall_ops_` / `sk_test_innsegall_ops_` · sent as **`X-API-Key`** |

**Client-allowed on `/api/telemetry`:** `install_ping` · `scout_aggregate` · `marketing_ping` · `issue_spotlight`.

**Server-only via Stripe webhook → Xano:** `checkout_complete` · `clan_subscription` · `clan_renewal`.

---

## CLI Phase 2 plan

Goal: opt-in aggregate sharing after local scout · default **off**.

| Step | Work |
|------|------|
| 2.1 | `innsegall config telemetry off\|on` in `~/.innsegall/config.json` |
| 2.2 | `innsegall telemetry --share` · builds slice via `safeCardSlice` + `aggregateSlices` from last N local cards (same as Field Report) |
| 2.3 | POST `https://innsegall.com/api/telemetry` with `{ event: "scout_aggregate", payload: agg }` |
| 2.4 | `innsegall install` / first-run prints install_id · optional `install_ping` if telemetry on |
| 2.5 | `--dry-run` prints JSON to stdout · no network |
| 2.6 | Docs in `OPERATOR_GUIDE.md` · manifesto line: *share counts, not your story* |

**Quota:** max 1 `scout_aggregate` per UTC day per install_id (enforce in Xano or Vercel edge later).

**Phase 3:** Xano scheduled task → daily rollup → webhook or git-less markdown for Field Report blog backfill.

---

## Quick Xano setup checklist

1. Table `innsegall_events` (columns above).
2. API group `innsegall_ops` · paste **`pastes/innsegall-events-post.xs`** · turn off user/JWT auth on route.
3. Xano env: `sk_live_innsegall_ops_` · optional `sk_test_innsegall_ops_`.
4. Vercel: `XANO_EVENTS_URL` + `XANO_API_KEY` · redeploy.
5. curl smoke:

```bash
curl -sS -X POST https://innsegall.com/api/telemetry \
  -H 'Content-Type: application/json' \
  -d '{"event":"install_ping","payload":{"engine_version":"0.4.0-alpha","macos_major":"14","day":"2026-09-06","install_id":"00000000-0000-4000-8000-000000000001"}}'
```

Expect **204** until `XANO_EVENTS_URL` is set · then **202** and row in Xano.

*Same harness · counts in the longship · no foe.*
