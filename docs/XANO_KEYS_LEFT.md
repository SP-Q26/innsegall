# Xano · what's left (keys only)

**Status:** Table `innsegall_events` + `POST /innsegall/events` built and tested (`{"ok":true,"id":1}`).  
**Prod smoke (2026-09-22):** `npm run smoke:live` · telemetry **202** on `innsegall.com` when Xano + Vercel keys match · float ops `FLOAT_MODE_RUNBOOK.md`.  
**You are here:** paste stack parity on **live** (§3–4) · optional preview key · issue spotlight publish when aggregates warrant.

---

## Mandatory after 2026-10-10 Vercel deploy (`f581fb6`)

**Oct 10** shipped four new event names from Vercel (`checkout_intent` · `install_intent` · `checkout_abandoned` · `payment_failed`) plus Stripe webhook handlers for `checkout.session.expired` and `invoice.payment_failed`. Git paste **`innsegall-events-post.xs`** lists **fifteen** allowed events (incl. PBS v1 `packet_bar_*`) · see `docs/pastes/README.md` · **republish Xano** after git adds names.

**Rule:** Any Vercel deploy that adds or renames an `event` string **must** ship with the same **publish draft → live** on Xano **in the same window**. If live Xano still has the old whitelist:

- Stripe may show **200** on Oct-era `checkout.session.completed` deliveries.
- **Recents fail 502** on `checkout.session.expired` · `invoice.payment_failed` · or telemetry intents · body `xano_forward_failed` · Xano message `Event type '…' is not allowed`.

That is **code ahead of paste** · not Stripe · not a broken webhook secret. Fix: repaste §3 · **publish live** · Stripe → resend failed webhook events · `npm run smoke:xano -- --base=https://innsegall.com`.

---

## Done already

- [x] Table `innsegall_events`
- [x] API group `innsegall_ops` · endpoint `POST /innsegall/events`
- [ ] Stack matches **`docs/pastes/innsegall-events-post.xs`** (auth + all **11** events + forbidden keys)
- [x] Run & Debug insert works (with correct key)

---

## Your checklist (~15 min)

### 1 · Generate secrets (terminal)

```bash
openssl rand -base64 32   # prod
openssl rand -base64 32   # preview (optional)
```

Prefix when you store the value: `sk_live_innsegall_ops_…` / `sk_test_innsegall_ops_…`

### 2 · Xano → Settings → Environment variables

**Variable names in Xano** (must match the paste `$env.*` paths):

| Xano env var name | Used for |
|-------------------|----------|
| `sk_live_innsegall_ops_` | Production · Vercel Production `XANO_API_KEY` |
| `sk_test_innsegall_ops_` | Preview (optional) · Vercel Preview `XANO_API_KEY` |

The **value** is your random secret (often prefixed `sk_live_innsegall_ops_` for readability). The **name** is literally `sk_live_innsegall_ops_` in Xano.

If you only run production, create `sk_live_innsegall_ops_` only and edit the paste precondition to drop the `|| sk_test…` branch.

### 3 · Replace endpoint stack

Paste **`docs/pastes/innsegall-events-post.xs`** · publish draft → live.

Auth step 0 (from paste · uses `$env.$http_headers`, not `http.headers`):

```text
var $api_key {
  value = ($env.$http_headers|get:"x-api-key"|to_text|trim)|first_notempty:($env.$http_headers|get:"X-API-Key"|to_text|trim)
}
precondition (($api_key == $env.sk_live_innsegall_ops_) || ($api_key == $env.sk_test_innsegall_ops_)) { ... }
```

- Turn **off** default user/JWT auth on this route

### 4 · Publish Xano draft → live

### 5 · Vercel (`spq/innsegall_fe` or Innsegall project)

| Variable | Production | Preview |
|----------|------------|---------|
| `XANO_EVENTS_URL` | `https://xfog-zdyr-rbyx.n7e.xano.io/api:innsegall_ops/innsegall/events` | same or preview instance |
| `XANO_API_KEY` | same **value** as Xano `sk_live_innsegall_ops_` | same **value** as Xano `sk_test_innsegall_ops_` |

**Redeploy** after save (env does not apply until new deploy).

### 6 · Smoke

```bash
cd innsegall
export XANO_EVENTS_URL='https://xfog-zdyr-rbyx.n7e.xano.io/api:innsegall_ops/innsegall/events'
export XANO_API_KEY='<exact value stored in Xano sk_live_innsegall_ops_>'
npm run smoke:xano
npm run smoke:xano -- --base=https://innsegall.com
```

| Result | Meaning |
|--------|---------|
| `rejects missing X-API-Key (403)` | Auth precondition wired · good |
| Direct Xano `ok` + `response ok/id` | Key matches · insert works |
| Prod `202` + `forwarded:true` | Vercel → Xano live |
| Prod `204` | `XANO_EVENTS_URL` missing on Vercel (redeploy after env) |
| Prod `502` + `hint: xano_key_mismatch` | `XANO_API_KEY` ≠ value in `sk_live_innsegall_ops_` · or JWT still on route |
| Direct with key → 403 | `XANO_API_KEY` ≠ value in `sk_live_innsegall_ops_` |

**502 quick diagnose:** `npm run diagnose:xano` (from `innsegall/`).

### Wire health (nothing wrong when this passes)

| Symptom | Cause | Fix |
|---------|--------|-----|
| Prod **502** + `workspace no longer exists` | Stale URL (legacy `x8ki-letl-twmt.n7.xano.io`) | `https://xfog-zdyr-rbyx.n7e.xano.io/api:innsegall_ops/innsegall/events` · redeploy Vercel |
| Prod **502** + `xano_key_mismatch` | `XANO_API_KEY` ≠ Xano env `sk_live_innsegall_ops_` | Match values · turn off JWT on route |
| Prod **502** + `Event type '…' is not allowed` | Live stack missing events from **`f581fb6`** paste | Repaste §3 · publish live · see section above |
| Prod **202** + `forwarded: true` | **Healthy** · events land in `innsegall_events` | Run funnel SQL in `PLATFORM_TRACKING.md` |

Historical note: brief **502**s before the URL/key fix did **not** break the site · telemetry failed silently from the browser’s perspective (install/checkout still worked).

---

## Repo already wired

- `web/lib/xano-forward.mjs` sends **`X-API-Key`** (matches precondition)
- `web/api/telemetry.js` → `vercel_telemetry`
- `web/api/stripe/webhook.js` → `stripe_webhook`
- Full paste: `docs/pastes/innsegall-events-post.xs` · guide: `docs/XANO_PASTES.md`

---

## Do not use

- Xano **Metadata / backend** API key (workspace admin)
- Auth **user JWT** on this route
- Public endpoint without precondition
- Same env var twice in the OR branch (both sides must be different vars if you use two keys)

---

*Table built · paste stack · keys + Vercel redeploy · smoke · onward.*
