# Stripe catalog state · operator truth

**Entity (Stripe):** **The Isles Collective** · receipts **Isles Co** · Innsegall as product DBA on line items.  
**Portfolio canon:** `docs/ISLES_PORTFOLIO.md` · metadata `docs/isles/STRIPE_METADATA.md`.  
**Deep audit:** `docs/STRIPE_DEEP_AUDIT_2026-09-22.md` (live duplicate products · MCP test gap).

Canonical amounts and metadata live in `web/lib/stripe-catalog.mjs`. Price IDs are **not secrets** · set in Vercel so Checkout matches Dashboard.

---

## Accounts

| Mode | Dashboard name | Stripe ID |
|------|----------------|-----------|
| Test / sandbox | The Isles Collective (test mode) | `acct_1UCtB2F5SRiYwzwF` *(historical doc ID · confirm in Dashboard)* |
| Live | The Isles Collective | `acct_1UCtAeFDJKTJlxOc` |

**Cursor Stripe MCP (2026-09-22):** only **live** `acct_1UCtAeFDJKTJlxOc` exposed · reconnect plugin for test sandbox reads.

---

## Live mode · canonical (use in Vercel Production)

| SKU | Product | Price | Lookup key | Amount |
|-----|---------|-------|------------|--------|
| `extra` | `prod_VEoWuOFwUVENSz` | `price_1UEKtpFDJKTJlxOcJn43NZI2` | `innsegall_extra` | $4.20 one-time |
| `clan` | `prod_VEoXxxCbhp5UBE` | `price_1UEKu4FDJKTJlxOcooxy8Zv5` | *(set optional)* | $6.67/mo |
| `msp` | `prod_VEoX9hJDYQTlck` | `price_1UEKu6FDJKTJlxOcMJmWUzim` | *(set optional)* | $3.00/seat/mo |

**Live cleanup (2026-09-22):** Duplicate live products deactivated · only the three canonical rows below are **active** for checkout. Details: `STRIPE_DEEP_AUDIT_2026-09-22.md`.

**Webhook (live):** create/verify in Dashboard → `https://innsegall.com/api/stripe/webhook` · events below · `STRIPE_WEBHOOK_SECRET` on Production.

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_EXTRA=price_1UEKtpFDJKTJlxOcJn43NZI2
STRIPE_PRICE_CLAN=price_1UEKu4FDJKTJlxOcooxy8Zv5
STRIPE_PRICE_MSP_SEAT=price_1UEKu6FDJKTJlxOcMJmWUzim
INNSEGALL_LICENSE_SECRET=                # rotate · openssl rand -base64 32
```

---

## Test mode (sandbox)

Provision fresh test objects (recommended after account rename):

```bash
STRIPE_SECRET_KEY=sk_test_… npm run provision:stripe-catalog
STRIPE_SECRET_KEY=sk_test_… npm run sync:stripe-images
```

Paste printed `STRIPE_PRICE_*` into **Vercel Preview** (not Production).

**Historical test IDs (may be stale after reprovision):**

| SKU | Product | Price | Lookup key |
|-----|---------|-------|------------|
| `extra` | `prod_VDK62giZUcpP6x` | `price_1UCtSDF5SRiYwzwFcmVYwqvf` | `innsegall_extra` |
| `clan` | `prod_VDKPAidRCPD8vW` | `price_1UCtknF5SRiYwzwFMhZXP1q2` | `innsegall_clan` |
| `msp` | `prod_VEoW9HK9Jun9It` | `price_1UEKt7F5SRiYwzwFEgfNLWJw` | `innsegall_msp_seat` |

**Webhook (test):** `we_1UCuYlF5SRiYwzwF20nJM9fT` → same URL · Preview `STRIPE_WEBHOOK_SECRET`.

Events: `checkout.session.completed` · `customer.subscription.updated` · `customer.subscription.deleted` · `invoice.paid`

---

## Product images

Square PNGs: `web/stripe/{extra,clan,msp}.png` · `npm run export:stripe-images` if sources change.

```bash
STRIPE_SECRET_KEY=sk_test_… npm run sync:stripe-images
STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-images
```

---

## Smoke matrix

| Probe | Command |
|-------|---------|
| Repo | `node scripts/audit-stripe.mjs` |
| Deep audit doc | `docs/STRIPE_DEEP_AUDIT_2026-09-22.md` |
| Hosted checkout | `npm run smoke:live` |
| Live flip | `docs/STRIPE_LIVE_FLIP.md` |

*Do not commit `sk_*` or `whsec_*`.*
