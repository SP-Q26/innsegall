# Innsegall · Infra fork audit (SPQ + nexus-ops)

**Date:** Sep 6, 2026 · **Goal:** Reuse ops patterns that already paid for themselves on SPQ · rebrand for **innsegall.com** · no WeWeb coupling.

**Forked this session:** see table at bottom · run `npm run preflight` before push.

---

## Executive summary

| Source | Reuse verdict | Innsegall action |
|--------|---------------|------------------|
| **nexus-ops STRIPE_ULTRA** | ✅ High | `STRIPE_DASHBOARD_SETUP.md` · payment log schema lite |
| **SPQ run-alpha-preflight** | ✅ High | `scripts/run-launch-preflight.sh` |
| **SPQ smoke-ephemeris** | ✅ High | `scripts/smoke-live.mjs` |
| **SPQ custom-code Stripe webhook** | 🟡 Pattern only | License on Vercel · Xano = events log only |
| **nexus-ops resend magic link** | ❌ Skip alpha | No accounts · Stripe receipt email enough |
| **SPQ vercel-build / WeWeb** | ❌ Do not fork | Innsegall = static `web/` · no prebuild chain |
| **SPQ public/innsegall/** | ❌ Deprecated | Canonical `innsegall/web/` only |
| **SPQ scripts/ljos-audit.mjs** | ✅ Already shimmed | Points at `innsegall/bin/innsegall.mjs` |
| **house-call docs** | 🟡 Reference | Merged into `DNS_ZOHO_SETUP.md` |

**Time saved Monday:** ~2h (Stripe dashboard doc · DNS/Zoho paste · one preflight command · live smoke curl).

---

## Lane 1 · Stripe (fork from nexus-ops STRIPE_ULTRA)

### What SPQ does (do not copy)

- Checkout created in **Xano** (`stripe/create-checkout-session`)
- Webhook unlocks **niches** + writes `sp_payment_log` + consent chain
- WeWeb front-end · auth required · tier catalog in DB

### What Innsegall already has (better for alpha)

- Checkout + webhook + license on **Vercel** (`web/api/stripe/*`, `web/api/license.js`)
- No login · HMAC `license.json` · CLI import
- Webhook optionally forwards aggregates to Xano (`xano-forward.mjs`)

### Forked artifacts

| SPQ / nexus source | Innsegall fork | Notes |
|--------------------|----------------|-------|
| `nexus-ops/paste/STRIPE_ULTRA/stripe/DASHBOARD_SETUP.md` | `docs/STRIPE_DASHBOARD_SETUP.md` | Vercel webhook URL · $4.20 / $6.67 SKUs |
| `nexus-ops/paste/STRIPE_ULTRA/stripe/ENV.md` | `web/.env.example` + `WIRE_STRIPE_VERCEL.md` | Vercel env not Xano |
| `nexus-ops/.../sp_payment_log_TABLE.md` | `docs/XANO_PAYMENTS_TABLE.md` | Optional P1 · chargeback idempotency |
| `nexus-ops/paste/INDEX_SKELLIE/STRIPE_SMOKE.md` | `docs/STRIPE_SMOKE.md` | 4242 E2E checklist |

### Still borrow (ideas, not code)

- **Idempotency:** `stripe_session_id` unique index (from SPQ webhook v2.6)
- **Test vs live:** separate webhook endpoints + secrets (ENV.md pattern)
- **Decline card:** `4000 0000 0000 0002` for smoke

---

## Lane 2 · Vercel / deploy (fork pattern, not SPQ scripts)

### SPQ (ignore for Innsegall)

```
vercel-build.sh → prepare-vercel-env → bake-app-head → vite build → postbuild
```

### Innsegall (keep minimal)

```
npm run predeploy  → sync-gospel + audit-launch
Vercel: root web · no build command · /api serverless
```

| SPQ artifact | Innsegall equivalent |
|--------------|---------------------|
| `ensure-package-scripts.mjs` | Not needed (no WeWeb strip) |
| `vercel.json` rewrites | `innsegall/web/vercel.json` ✅ |
| `prepare-vercel-env.mjs` | `web/.env.example` + Vercel dashboard |
| Security headers in vercel | Already in `web/vercel.json` ✅ |

**Fork added:** `scripts/smoke-live.mjs` (from `smoke-ephemeris.mjs` path list pattern).

---

## Lane 3 · DNS + email (fork from house-call + ops memory)

| Task | SPQ reference | Innsegall fork |
|------|---------------|----------------|
| Apex + www | house-call `DOMAIN_AUDIT.md` | `docs/DNS_ZOHO_SETUP.md` |
| hello@ mail | Not in SPQ (magic link via Resend/Xano) | Zoho Mail MX/SPF/DKIM paste |
| Domain registered | ✅ innsegall.com | Wire to Vercel |

**Do not fork:** SPQ Resend magic-link stack (`nexus-ops/paste/resend-magic-link-jul14/`) · Innsegall has no auth inbox flow in alpha.

---

## Lane 4 · Xano (fork schema, not SPQ webhook logic)

| SPQ table / endpoint | Innsegall use |
|----------------------|---------------|
| `sp_payment_log` | Optional `innsegall_payments` (P1) · see `XANO_PAYMENTS_TABLE.md` |
| `sp_consent_log` | Skip · TOS acceptance on site only |
| Stripe webhook in Xano | **Skip** · Vercel owns Stripe |
| Telemetry / events | `innsegall_events` · `XANO_PASTES.md` ✅ |

**Reuse from nexus XanoScript quirks:** idempotency query on `stripe_session_id` before insert · flat preconditions · no secrets in git.

---

## Lane 5 · Audit / CI gates (fork from SPQ preflight)

| SPQ script | Innsegall fork | Status |
|------------|----------------|--------|
| `run-alpha-preflight.sh` | `run-launch-preflight.sh` | ✅ added |
| `audit-claymore` | `audit-claymore.mjs` | ✅ already Innsegall |
| `audit-launch.mjs` | ✅ | + `parley.js` in required list |
| `audit-cache-coherence` | N/A | No CACHE_VER / WeWeb |
| `audit-auth-e2e` | N/A | No auth shell |
| `smoke-ephemeris.mjs` | `smoke-live.mjs` | ✅ added |
| `sync-public-alpha.sh` | N/A | No custom-code mirror |

**One command before push:**

```bash
npm run preflight
```

Runs: sync-gospel · audit · smoke · self-test.

---

## Lane 6 · Blog / content pipeline

| SPQ | Innsegall |
|-----|-----------|
| No md→html CI in repo | Blog HTML hand-built · md is source notes |
| Field report / social bots | `scripts/field-report.mjs` ✅ Innsegall-native |
| n8n social workflows | P2 · not forked |

**P2 fork candidate:** small `scripts/sync-blog-html.mjs` (wrap md in blog shell) · not worth Monday morning.

---

## Lane 7 · Git / repo hygiene

| SPQ pattern | Innsegall |
|-------------|-----------|
| `weweb-export` vs `main` | Single `main` · public repo |
| `public/innsegall/MOVED.md` | Do not edit SPQ stub |
| Tag after smoke | `v0.4.0-alpha` |
| Separate Vercel project | Required · never SPQ vercel.json |

---

## Lane 8 · Explicit do-not-fork list

| Artifact | Why skip |
|----------|----------|
| WeWeb MCP / NU / INDEX LOAD | Wrong product |
| `custom-code/xano-stripe-webhook-v*.xs` full paste | Unlocks SPQ niches · not licenses |
| `index-stripe-payment-active.js` | WeWeb checkout modal |
| `prep-weweb-export-preview.sh` | SPQ preview only |
| BTCPay / crypto rails docs | Out of lane |
| Auth magic link / Resend | No accounts in alpha |
| Terminal HUD / intel boot | SPQ shell |

---

## Fork inventory (files added or updated)

| File | Source inspiration |
|------|-------------------|
| `docs/INFRA_FORK_AUDIT.md` | This audit |
| `docs/STRIPE_DASHBOARD_SETUP.md` | nexus `STRIPE_ULTRA/stripe/DASHBOARD_SETUP.md` |
| `docs/DNS_ZOHO_SETUP.md` | house-call `DOMAIN_AUDIT.md` + Zoho operator steps |
| `docs/XANO_PAYMENTS_TABLE.md` | nexus `sp_payment_log_TABLE.md` (lite) |
| `docs/STRIPE_SMOKE.md` | nexus `INDEX_SKELLIE/STRIPE_SMOKE.md` |
| `scripts/run-launch-preflight.sh` | SPQ `run-alpha-preflight.sh` |
| `scripts/smoke-live.mjs` | SPQ `smoke-ephemeris.mjs` |

---

## Monday operator order (infra only)

1. `npm run preflight` (local)
2. Push `innsegall/innsegall` · tag `v0.4.0-alpha`
3. Vercel import · root `web` · env from `STRIPE_DASHBOARD_SETUP.md`
4. DNS + Zoho per `DNS_ZOHO_SETUP.md`
5. `npm run smoke:live` after SSL green
6. `docs/STRIPE_SMOKE.md` 4242 path

*Fork the plumbing · keep the scout on the Mac.*
