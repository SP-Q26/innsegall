# Xano · what's left (keys only)

**Status:** Table `innsegall_events` + `POST /innsegall/events` built and tested (`{"ok":true,"id":1}`).  
**You are here:** custom handshake keys · not Meta API · not user JWT.

---

## Done already

- [x] Table `innsegall_events`
- [x] API group `innsegall_ops` · endpoint `POST /innsegall/events`
- [ ] Stack matches **`docs/pastes/innsegall-events-post.xs`** (auth + all 7 events + forbidden keys)
- [ ] **`marketing_ping`** + **`issue_spotlight`** in whitelist (included in paste)
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
| `XANO_EVENTS_URL` | `https://x8ki-letl-twmt.n7.xano.io/api:innsegall_ops/innsegall/events` | same or preview instance |
| `XANO_API_KEY` | same **value** as Xano `sk_live_innsegall_ops_` | same **value** as Xano `sk_test_innsegall_ops_` |

**Redeploy** after save (env does not apply until new deploy).

### 6 · Smoke

```bash
cd innsegall
export XANO_EVENTS_URL='https://x8ki-letl-twmt.n7.xano.io/api:innsegall_ops/innsegall/events'
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
