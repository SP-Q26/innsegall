# Xano · what's left (keys only)

**Status:** Table `innsegall_events` + `POST /innsegall/events` built and tested (`{"ok":true,"id":1}`).  
**You are here:** custom handshake keys · not Meta API · not user JWT.

---

## Done already

- [x] Table `innsegall_events`
- [x] API group `innsegall_ops` · endpoint `POST /innsegall/events`
- [x] Validation stack (event whitelist · forbidden payload keys)
- [ ] Whitelist includes **`marketing_ping`** (site page-category pings · see `docs/PLATFORM_TRACKING.md`)
- [ ] Whitelist includes **`issue_spotlight`** (identify/resolve category signals · see `docs/ISSUE_SPOTLIGHT_LOOP.md`)
- [x] Run & Debug insert works

---

## Your checklist (~15 min)

### 1 · Generate secrets (terminal)

```bash
openssl rand -base64 32   # prod
openssl rand -base64 32   # preview (optional but recommended)
```

Prefix optional: `sk_live_innsegall_ops_…` / `sk_test_innsegall_ops_…`

### 2 · Xano → Settings → Environment variables

| Name | Value |
|------|--------|
| `vercel_prod_key` | prod string |
| `vercel_preview_key` | preview string |

### 3 · Precondition (top of `POST /innsegall/events` stack)

```text
(http.headers.x_api_key == $env.vercel_prod_key) || (http.headers.x_api_key == $env.vercel_preview_key)
```

- Error: `Unauthorized: Invalid Vercel Handshake Token` · **401**
- Turn **off** default user/JWT auth on this endpoint

### 4 · Publish Xano draft → live

### 5 · Vercel (`spq/innsegall_fe`)

| Variable | Production | Preview |
|----------|------------|---------|
| `XANO_EVENTS_URL` | `https://x8ki-letl-twmt.n7.xano.io/api:innsegall_ops/innsegall/events` | same or preview instance |
| `XANO_API_KEY` | same as `vercel_prod_key` | same as `vercel_preview_key` |

**Redeploy** after save (env does not apply until new deploy).

### 6 · Smoke

```bash
cd innsegall
export XANO_EVENTS_URL='https://x8ki-letl-twmt.n7.xano.io/api:innsegall_ops/innsegall/events'
export XANO_API_KEY='your_prod_key'
npm run smoke:xano
npm run smoke:xano -- --base=https://innsegall.com
```

| Result | Meaning |
|--------|---------|
| Direct Xano `ok` | Precondition + table wired |
| Prod `202` + `forwarded:true` | Vercel → Xano live |
| Prod `204` | `XANO_EVENTS_URL` missing on Vercel |
| Direct without header → 401 | Lock is working |

---

## Repo already wired

- `web/lib/xano-forward.mjs` sends **`X-API-Key`** (matches precondition)
- `web/api/telemetry.js` → `vercel_telemetry`
- `web/api/stripe/webhook.js` → `stripe_webhook`
- Full paste reference: `docs/XANO_PASTES.md`

---

## Do not use

- Xano **Metadata / backend** API key (workspace admin)
- Auth **user JWT** on this route
- Public endpoint without precondition

---

*Table built · API tested · keys + Vercel redeploy · smoke · onward.*
