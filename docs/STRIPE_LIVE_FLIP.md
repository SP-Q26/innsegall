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

| SKU | Type | Amount | Vercel env (live IDs · 2026-09-10) |
|-----|------|--------|-------------------------------------|
| Extra scout | One-time | $4.20 | `STRIPE_PRICE_EXTRA` = `price_1UEKtpFDJKTJlxOcJn43NZI2` |
| Clan | Monthly | $6.67 | `STRIPE_PRICE_CLAN` = `price_1UEKu4FDJKTJlxOcooxy8Zv5` |
| MSP seat | Monthly | $3.00/seat | `STRIPE_PRICE_MSP_SEAT` = `price_1UEKu6FDJKTJlxOcMJmWUzim` |

Full product IDs and lookup keys: `docs/STRIPE_CATALOG_STATE.md`.  
Product images: deploy `web/stripe/*.png` then `STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-images` · `docs/STRIPE_PRODUCT_IMAGES.md`.

Developers → API keys:

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from **live** endpoint |
| `INNSEGALL_LICENSE_SECRET` | **Rotate** · `openssl rand -base64 32` |

New webhook endpoint (live) · **required** (none registered as of 2026-09-10):

- URL: `https://innsegall.com/api/stripe/webhook`
- Events: `checkout.session.completed` · `customer.subscription.updated` · `customer.subscription.deleted` · `invoice.paid`
- After save: Stripe → **Send test event** → Vercel logs show **200**

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

**Minimum live matrix:**

1. **Extra** · `innsegall.com` → Extra run $4.20 → real card → import license → one scout
2. **Clan** · `/clan?buy=clan` → subscribe → `innsegall plan` shows clan + `valid_until`
3. **MSP** · `/msp` → 10 seats checkout → license `plan: msp` + `seats: 10`
4. **Warrior ref** · checkout with `?ref=warrior_test` or POST `warrior_ref` · webhook metadata includes ref

Decline card `4000 0000 0000 0002` on one SKU · confirm no license issued.

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
