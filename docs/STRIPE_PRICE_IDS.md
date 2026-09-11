# Stripe price IDs · Innsegall

**Account (test):** The Isles LLC sandbox · `acct_1UCtB2F5SRiYwzwF`  
**Account (live):** The Isles LLC · `acct_1UCtAeFDJKTJlxOc`  
**Full matrix:** `docs/STRIPE_CATALOG_STATE.md`

---

## Products + prices (test)

| SKU | Product | Price ID | Lookup key | Amount |
|-----|---------|----------|------------|--------|
| `extra` | `prod_VDK62giZUcpP6x` | `price_1UCtSDF5SRiYwzwFcmVYwqvf` | `innsegall_extra` | $4.20 one-time |
| `clan` | `prod_VDKPAidRCPD8vW` | `price_1UCtknF5SRiYwzwFMhZXP1q2` | `innsegall_clan` | $6.67/mo |
| `msp` | `prod_VEoW9HK9Jun9It` | `price_1UEKt7F5SRiYwzwFEgfNLWJw` | `innsegall_msp_seat` | $3.00/seat/mo · qty 10–100 |

See `docs/STRIPE_MSP_PACK.md` for MSP checkout.

---

## Vercel env paste (test)

```env
STRIPE_SECRET_KEY=sk_test_...          # Dashboard → Developers → API keys
STRIPE_WEBHOOK_SECRET=whsec_...        # Test endpoint we_1UCuYlF5SRiYwzwF20nJM9fT
STRIPE_PRICE_EXTRA=price_1UCtSDF5SRiYwzwFcmVYwqvf
STRIPE_PRICE_CLAN=price_1UCtknF5SRiYwzwFMhZXP1q2
STRIPE_PRICE_MSP_SEAT=price_1UEKt7F5SRiYwzwFEgfNLWJw
INNSEGALL_LICENSE_SECRET=              # openssl rand -base64 32
```

Checkout works without `STRIPE_PRICE_*` (inline `price_data` fallback) · prefer env IDs so Dashboard and receipts match.

---

## Webhook (test · registered)

| Field | Value |
|-------|--------|
| Endpoint ID | `we_1UCuYlF5SRiYwzwF20nJM9fT` |
| URL | `https://innsegall.com/api/stripe/webhook` |
| Events | `checkout.session.completed` · `customer.subscription.updated` · `customer.subscription.deleted` · `invoice.paid` |

Copy **Signing secret** into Vercel `STRIPE_WEBHOOK_SECRET` (test). Never commit the secret.

---

## Live price IDs (Production env only)

| SKU | Price ID |
|-----|----------|
| `extra` | `price_1UEKtpFDJKTJlxOcJn43NZI2` |
| `clan` | `price_1UEKu4FDJKTJlxOcooxy8Zv5` |
| `msp` | `price_1UEKu6FDJKTJlxOcMJmWUzim` |

Live webhook: **create manually** before flip · see `STRIPE_LIVE_FLIP.md`.

---

## Live flip

1. Toggle Dashboard to **Live** on `acct_1UCtAeFDJKTJlxOc`
2. Use live price IDs above (products already created 2026-09-10)
3. New **live** webhook + `sk_live_…` / `whsec_…`
4. Rotate `INNSEGALL_LICENSE_SECRET`

See `STRIPE_DASHBOARD_SETUP.md` · E2E: `STRIPE_SMOKE.md`.
