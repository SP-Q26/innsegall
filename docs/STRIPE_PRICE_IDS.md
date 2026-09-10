# Stripe price IDs · Innsegall

**Account (test):** The Isles LLC sandbox · `acct_1UCtB2F5SRiYwzwF`  
**Created:** 2026-09-07

Copy these into Vercel env (test mode). Live mode needs new products on `acct_1UCtAeFDJKTJlxOc` with the same amounts.

---

## Products + prices (test)

| SKU | Product | Price ID | Amount |
|-----|---------|----------|--------|
| `extra` | Innsegall Extra Scout · `prod_VDK62giZUcpP6x` | `price_1UCtSDF5SRiYwzwFcmVYwqvf` | $4.20 one-time |
| `clan` | Innsegall Clan · 5 seats · `prod_VDKPAidRCPD8vW` | `price_1UCtknF5SRiYwzwFMhZXP1q2` | $6.67/mo |
| `msp` | Innsegall MSP · per seat · create in Dashboard | `STRIPE_PRICE_MSP_SEAT` (set after create) | $3.00/seat/mo · qty 10–100 |

See `docs/STRIPE_MSP_PACK.md` for MSP checkout.

---

## Vercel env paste (test)

```env
STRIPE_SECRET_KEY=sk_test_...          # Dashboard → Developers → API keys
STRIPE_WEBHOOK_SECRET=whsec_...        # After webhook registered (step below)
STRIPE_PRICE_EXTRA=price_1UCtSDF5SRiYwzwFcmVYwqvf
STRIPE_PRICE_CLAN=price_1UCtknF5SRiYwzwFMhZXP1q2
STRIPE_PRICE_MSP_SEAT=                 # optional · per-seat monthly · docs/STRIPE_MSP_PACK.md
INNSEGALL_LICENSE_SECRET=              # openssl rand -base64 32
```

Checkout works without `STRIPE_PRICE_*` (inline `price_data` fallback) · prefer env IDs so Dashboard and receipts match.

---

## Webhook (not created yet)

Register in Stripe Dashboard (test mode):

| Field | Value |
|-------|--------|
| URL | `https://innsegall.com/api/stripe/webhook` |
| Events | `checkout.session.completed` · `customer.subscription.updated` · `customer.subscription.deleted` · `invoice.paid` |

Until DNS points at Vercel, use your Vercel preview URL: `https://<project>.vercel.app/api/stripe/webhook` for smoke only · switch to production domain before launch.

---

## Live flip

1. Toggle Dashboard to **Live** on `acct_1UCtAeFDJKTJlxOc`
2. Recreate both products (same names, amounts, metadata)
3. New live webhook + `sk_live_…` / `whsec_…`
4. Rotate `INNSEGALL_LICENSE_SECRET`

See `STRIPE_DASHBOARD_SETUP.md` · E2E: `STRIPE_SMOKE.md`.
