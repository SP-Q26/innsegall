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
| `event` | text | ✓ | One of: `install_ping`, `scout_aggregate`, `checkout_complete` |
| `payload` | json | ✓ | Event-specific · validated before insert |
| `day` | date | ✓ | UTC day bucket · index for rollups |
| `engine_version` | text | | From payload when present |
| `source` | text | | `cli`, `vercel_telemetry`, `stripe_webhook` |

**Indexes:** `(day)`, `(event, day)`, `(created_at DESC)`.

**Xano API group:** `innsegall_ops` · POST endpoint e.g. `/innsegall/events` that inserts one row after middleware validates `event` + `payload` shape (mirror Vercel rules below).

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

If a payload contains forbidden keys (`email`, `path`, `hostname`, `username`, `card`, `html`, …) or path-like strings, **drop the request** · do not sanitize and forward.

---

## Wire Stripe webhook → Xano (optional)

Phase 1 revenue ops without changing checkout UX.

### Option A · Vercel forwards (recommended)

1. Create Xano POST endpoint → insert `innsegall_events` with `source: stripe_webhook`.
2. Set Vercel env: `XANO_EVENTS_URL`, optional `XANO_API_KEY`.
3. Extend `web/api/stripe/webhook.js` on `checkout.session.completed`:

```js
// After stripe signature verify · inside checkout.session.completed handler:
if (process.env.XANO_EVENTS_URL) {
  const session = event.data.object;
  await fetch(process.env.XANO_EVENTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.XANO_API_KEY
        ? { Authorization: `Bearer ${process.env.XANO_API_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      event: "checkout_complete",
      payload: {
        day: new Date().toISOString().slice(0, 10),
        sku: session.metadata?.innsegall_sku || "extra",
        amount_cents: session.amount_total,
        currency: session.currency,
        stripe_session_id: session.id,
      },
      source: "stripe_webhook",
    }),
  });
}
```

4. Redeploy · test with Stripe CLI `stripe trigger checkout.session.completed`.

### Option B · Stripe → Xano direct

Stripe Dashboard → Webhooks → Xano public URL. Duplicate validation in Xano middleware · same payload shape. Use when you want checkout events even if Vercel function is cold-skipped (rare).

**Do not** point Stripe at `/api/telemetry` · that route rejects `checkout_complete` from clients by design.

---

## Vercel telemetry API (Phase 1 · live)

| Route | Method | Behavior |
|-------|--------|----------|
| `/api/telemetry` | POST | `{ event, payload }` · see `web/api/telemetry.js` |

| Env | Purpose |
|-----|---------|
| `XANO_EVENTS_URL` | Forward target · if unset, **204 no-op** (privacy-preserving default) |
| `XANO_API_KEY` | Optional Bearer for Xano |

**Public-allowed events:** `install_ping`, `scout_aggregate` only.

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

1. New table `innsegall_events` (columns above).
2. API group `innsegall_ops` · POST insert + GET rollup by `day` (auth: API key).
3. Paste `XANO_EVENTS_URL` into Vercel Innsegall project.
4. curl smoke:

```bash
curl -sS -X POST https://innsegall.com/api/telemetry \
  -H 'Content-Type: application/json' \
  -d '{"event":"install_ping","payload":{"engine_version":"0.4.0-alpha","macos_major":"14","day":"2026-09-06","install_id":"00000000-0000-4000-8000-000000000001"}}'
```

Expect **204** until `XANO_EVENTS_URL` is set · then **202** and row in Xano.

*Same harness · counts in the longship · no foe.*
