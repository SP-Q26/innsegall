# Stripe → Vercel env package · Innsegall (3 SKUs)

**Account:** The Isles Collective · `acct_1UCtAeFDJKTJlxOc` (live)  
**Only secrets from Stripe:** `sk_*` and `whsec_*` (API keys + webhook signing secret).  
**Everything else below is copy-paste from git** (price IDs are not secrets).

---

## Avoid the Dashboard product UI

Refresh test catalog from terminal (uses `web/lib/stripe-catalog.mjs`):

```bash
cd ~/innsegall
STRIPE_SECRET_KEY=sk_test_… npm run provision:stripe-catalog
STRIPE_SECRET_KEY=sk_test_… npm run sync:stripe-images
```

Script prints the three `STRIPE_PRICE_*` lines for Vercel Preview.

Live Innsegall products are already canonical · use **Live price IDs** in § Production below (no product hunt).

---

## Three products (reference)

| SKU | Name | Amount | Mode | Live price ID | Live product | Lookup key |
|-----|------|--------|------|---------------|--------------|------------|
| `extra` | Innsegall Extra Scout | $4.20 once | payment | `price_1UEKtpFDJKTJlxOcJn43NZI2` | `prod_VEoWuOFwUVENSz` | `innsegall_extra` |
| `clan` | Innsegall Clan · 5 seats | $6.67/mo | subscription | `price_1UEKu4FDJKTJlxOcooxy8Zv5` | `prod_VEoXxxCbhp5UBE` | `innsegall_clan` |
| `msp` | Innsegall MSP · per seat | $3.00/seat/mo · min 10 | subscription | `price_1UEKu6FDJKTJlxOcMJmWUzim` | `prod_VEoX9hJDYQTlck` | `innsegall_msp_seat` |

**Test IDs (if not reprovisioning):** `docs/STRIPE_PRICE_IDS.md` · historical products in `STRIPE_CATALOG_STATE.md`.

---

## Stripe UI · 2 clicks for secrets only

1. **Developers → API keys** → Reveal **Secret key** (`sk_test_…` or `sk_live_…`).
2. **Developers → Webhooks** → your `https://innsegall.com/api/stripe/webhook` endpoint → **Signing secret** (`whsec_…`).

Test endpoint ID (if already created): `we_1UCuYlF5SRiYwzwF20nJM9fT` · **Live needs its own endpoint** + separate `whsec_`.

**Webhook events (check all four):**

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`

---

## Vercel Preview · full package (test mode)

Project: **innsegall_fe** · Root: **web** · Environment: **Preview**

```env
# ── Stripe (test) ──
STRIPE_SECRET_KEY=sk_test_PASTE_FROM_DASHBOARD
STRIPE_WEBHOOK_SECRET=whsec_PASTE_FROM_TEST_WEBHOOK
STRIPE_PRICE_EXTRA=price_1UCtSDF5SRiYwzwFcmVYwqvf
STRIPE_PRICE_CLAN=price_1UCtknF5SRiYwzwFMhZXP1q2
STRIPE_PRICE_MSP_SEAT=price_1UEKt7F5SRiYwzwFEgfNLWJw

# ── License HMAC (generate once · same value until you rotate) ──
INNSEGALL_LICENSE_SECRET=PASTE_openssl_rand_base64_32
INNSEGALL_LICENSE_VERIFY_SECRET=PASTE_same_as_above_for_cli_notarized_builds

# ── Site (optional Preview override) ──
# INNSEGALL_SITE_URL=https://your-preview-url.vercel.app

# ── Xano (optional · revenue + telemetry) ──
XANO_EVENTS_URL=https://xfog-zdyr-rbyx.n7e.xano.io/api:innsegall_ops/innsegall/events
XANO_API_KEY=PASTE_same_as_Xano_sk_test_innsegall_ops_

# ── Optional ──
# GEMINI_API_KEY=
```

Generate license secret:

```bash
openssl rand -base64 32
```

---

## Vercel Production · full package (live mode)

Environment: **Production** · only after `STRIPE_LIVE_FLIP.md` checklist.

```env
# ── Stripe (live) ──
STRIPE_SECRET_KEY=sk_live_PASTE_FROM_DASHBOARD
STRIPE_WEBHOOK_SECRET=whsec_PASTE_FROM_LIVE_WEBHOOK
STRIPE_PRICE_EXTRA=price_1UEKtpFDJKTJlxOcJn43NZI2
STRIPE_PRICE_CLAN=price_1UEKu4FDJKTJlxOcooxy8Zv5
STRIPE_PRICE_MSP_SEAT=price_1UEKu6FDJKTJlxOcMJmWUzim

# ── License (rotate on live flip) ──
INNSEGALL_LICENSE_SECRET=PASTE_new_openssl_rand_base64_32
INNSEGALL_LICENSE_VERIFY_SECRET=PASTE_match_notarized_cli

# ── Xano (production) ──
XANO_EVENTS_URL=https://xfog-zdyr-rbyx.n7e.xano.io/api:innsegall_ops/innsegall/events
XANO_API_KEY=PASTE_same_as_Xano_sk_live_innsegall_ops_

# ── Optional ──
# GEMINI_API_KEY=
```

Do **not** set `INNSEGALL_SITE_URL` on Production · code uses `https://innsegall.com`.

---

## Verify without Dashboard

```bash
cd ~/innsegall
npm run smoke:live
npm run smoke:checkout-toll-gate
npm run smoke:xano
```

Checkout URLs containing `/test/` = test keys on that deploy · no `/test/` = live keys.

---

## Same Stripe account · Simple Property

Innsegall uses **only** the six vars above for Stripe. Simple Property uses **different** `STRIPE_PRICE_*` keys on their Vercel project · same `sk_live_` / `sk_test_` if same Collective account · **different** `STRIPE_WEBHOOK_SECRET` per webhook endpoint.

*Never commit `sk_*`, `whsec_*`, or license secrets.*
