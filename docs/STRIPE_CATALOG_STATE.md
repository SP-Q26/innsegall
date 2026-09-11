# Stripe catalog state · operator truth

**Last synced:** 2026-09-10 · via Stripe MCP on **The Isles LLC** accounts.

Canonical amounts and metadata live in `web/lib/stripe-catalog.mjs`. Price IDs below are **not secrets** · still set them in Vercel env so Checkout matches Dashboard receipts.

---

## Accounts

| Mode | Account | Stripe ID |
|------|---------|-----------|
| Test / sandbox | The Isles LLC sandbox | `acct_1UCtB2F5SRiYwzwF` |
| Live | The Isles LLC | `acct_1UCtAeFDJKTJlxOc` |

---

## Test mode (sandbox)

| SKU | Product | Price | Lookup key | Amount |
|-----|---------|-------|------------|--------|
| `extra` | `prod_VDK62giZUcpP6x` | `price_1UCtSDF5SRiYwzwFcmVYwqvf` | `innsegall_extra` | $4.20 one-time |
| `clan` | `prod_VDKPAidRCPD8vW` | `price_1UCtknF5SRiYwzwFMhZXP1q2` | `innsegall_clan` | $6.67/mo |
| `msp` | `prod_VEoW9HK9Jun9It` | `price_1UEKt7F5SRiYwzwFEgfNLWJw` | `innsegall_msp_seat` | $3.00/seat/mo |

**Webhook (test):** `we_1UCuYlF5SRiYwzwF20nJM9fT` → `https://innsegall.com/api/stripe/webhook`  
Events: `checkout.session.completed` · `customer.subscription.updated` · `customer.subscription.deleted` · `invoice.paid`

**Vercel (test / Preview):** paste `docs/STRIPE_PRICE_IDS.md` block including `STRIPE_PRICE_MSP_SEAT=price_1UEKt7F5SRiYwzwFEgfNLWJw`.

---

## Live mode (created · webhook pending)

| SKU | Product | Price | Lookup key | Amount |
|-----|---------|-------|------------|--------|
| `extra` | `prod_VEoWuOFwUVENSz` | `price_1UEKtpFDJKTJlxOcJn43NZI2` | `innsegall_extra` | $4.20 one-time |
| `clan` | `prod_VEoXxxCbhp5UBE` | `price_1UEKu4FDJKTJlxOcooxy8Zv5` | `innsegall_clan` *(set in Dashboard if missing)* | $6.67/mo |
| `msp` | `prod_VEoX9hJDYQTlck` | `price_1UEKu6FDJKTJlxOcMJmWUzim` | `innsegall_msp_seat` *(set in Dashboard if missing)* | $3.00/seat/mo |

**Webhook (live):** **none yet** · create before live flip:

1. Dashboard → **Live** → Developers → Webhooks → Add endpoint  
2. URL: `https://innsegall.com/api/stripe/webhook`  
3. Same four events as test  
4. Copy signing secret → Vercel Production `STRIPE_WEBHOOK_SECRET`

**Vercel (Production live flip):**

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...          # from live endpoint above
STRIPE_PRICE_EXTRA=price_1UEKtpFDJKTJlxOcJn43NZI2
STRIPE_PRICE_CLAN=price_1UEKu4FDJKTJlxOcooxy8Zv5
STRIPE_PRICE_MSP_SEAT=price_1UEKu6FDJKTJlxOcMJmWUzim
INNSEGALL_LICENSE_SECRET=                # rotate · openssl rand -base64 32
```

---

## Product images (Checkout + Dashboard)

Square **512×512 PNG** assets in git: `web/stripe/{extra,clan,msp}.png` (sources: `.svg` · `npm run export:stripe-images`).

| SKU | Hosted URL (test + live products use the same URL) |
|-----|---------------------------------------------------|
| `extra` | `https://innsegall.com/stripe/extra.png` |
| `clan` | `https://innsegall.com/stripe/clan.png` |
| `msp` | `https://innsegall.com/stripe/msp.png` |

After deploy (or when art changes):

```bash
npm run export:stripe-images
# deploy innsegall.com
STRIPE_SECRET_KEY=sk_test_… npm run sync:stripe-images
STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-images
```

Stripe re-fetches the URL when you run sync · updating PNG on the site updates Checkout art without recreating products.

---

## Smoke matrix

| Probe | Command / action |
|-------|------------------|
| Repo catalog | `npm run audit:stripe` |
| Hosted checkout (all SKUs) | `npm run smoke:live` (extra + clan + msp POST) |
| Full E2E (4242) | `docs/STRIPE_SMOKE.md` |
| Live flip gate | `docs/STRIPE_LIVE_FLIP.md` |

*Do not commit `sk_*` or `whsec_*`.*
