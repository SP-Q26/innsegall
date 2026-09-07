# Stripe LIVE flip · T-minus gate

**When:** After `npm run gate:launch` is **0 fail** on test mode.

**Order:** Stripe Dashboard → Vercel Production env → redeploy → one real $4.20 → flip checklist below.

---

## 1 · Pre-flight (test mode green)

```bash
cd innsegall
npm run gate:launch
```

Expect:

- `SWARM AUDIT PASS`
- Live smoke: checkout URL contains `/test/` (test mode) until step 2
- License + webhook + telemetry probes green

---

## 2 · Stripe Dashboard (live mode)

Toggle **Live** (top-right) · create **new** live objects (do not reuse test IDs):

| SKU | Type | Amount | Vercel env |
|-----|------|--------|------------|
| Extra scout | One-time | $4.20 | `STRIPE_PRICE_EXTRA` = `price_live_…` |
| Clan | Monthly | $6.67 | `STRIPE_PRICE_CLAN` = `price_live_…` |

Developers → API keys:

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from **live** endpoint |
| `INNSEGALL_LICENSE_SECRET` | **Rotate** · `openssl rand -base64 32` |

New webhook endpoint (live):

- URL: `https://innsegall.com/api/stripe/webhook`
- Events: `checkout.session.completed` · `customer.subscription.updated` · `customer.subscription.deleted` · `invoice.paid`

---

## 3 · Vercel (`innsegall_fe` · Production only)

Update **Production** env vars (not Preview unless you want live charges on preview):

1. Paste live keys + price IDs + rotated `INNSEGALL_LICENSE_SECRET`
2. **Redeploy** production (Git push or Deployments → Redeploy)
3. Stripe Dashboard → Webhook → **Send test event** → confirm **200**

---

## 4 · Live smoke (you)

```bash
npm run smoke:live
```

Checkout line should say `(live)` not `(test)`.

**One real panic scout:**

1. `innsegall.com` → Extra run $4.20 → pay with real card
2. `/success` → download `license.json`
3. Mac: `innsegall plan --import-license ~/Downloads/innsegall-license.json`
4. `innsegall run` · credit consumed once

---

## 5 · Rollback

If anything breaks before announcing:

1. Vercel → revert deployment to last green
2. Restore `sk_test_…` + test price IDs + old `INNSEGALL_LICENSE_SECRET` (licenses minted with new secret won't verify on old secret)

---

## Phase 2 shipped (code)

| Feature | Status |
|---------|--------|
| Default-on anonymous telemetry | CLI · gospel · privacy |
| Update check on boot/scan | `ops-boot.mjs` |
| `scout_aggregate` daily | telemetry-client |
| Opt-out | `innsegall plan --telemetry-off` |

---

*Test green → live keys → one real payment → announce.*
