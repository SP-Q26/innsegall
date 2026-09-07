# Stripe Dashboard · Innsegall test mode

**Forked from:** nexus-ops `STRIPE_ULTRA/stripe/DASHBOARD_SETUP.md` · rebranded for Vercel Checkout (not Xano).

**Mode:** Test (toggle top-right in Dashboard)

---

## 1 · Products + prices

| Product | Billing | Amount | Test IDs |
|---------|---------|--------|----------|
| **Extra scout** | One-time | **$4.20 USD** | `prod_VDK62giZUcpP6x` · `price_1UCtSDF5SRiYwzwFcmVYwqvf` |
| **Clan** | Recurring monthly | **$6.67 USD** | `prod_VDKPAidRCPD8vW` · `price_1UCtknF5SRiYwzwFMhZXP1q2` |

Vercel env: `STRIPE_PRICE_EXTRA` · `STRIPE_PRICE_CLAN` · full paste in `docs/STRIPE_PRICE_IDS.md`. Checkout falls back to inline `price_data` if env unset.

---

## 2 · API keys

Developers → API keys:

| Key | Where |
|-----|--------|
| Secret `sk_test_…` | Vercel env `STRIPE_SECRET_KEY` only |
| Publishable `pk_test_…` | Not required (hosted Checkout) |

Never commit keys · never put in git or gospel JSON.

---

## 3 · Webhook

Developers → Webhooks → Add endpoint:

| Field | Value |
|-------|--------|
| URL | `https://innsegall.com/api/stripe/webhook` |
| Events | `checkout.session.completed` · `customer.subscription.updated` · `customer.subscription.deleted` · `invoice.paid` |
| Signing secret | Vercel env `STRIPE_WEBHOOK_SECRET` |

After first test payment: open event → confirm **200** · body `{ "received": true, ... }`.

If `XANO_EVENTS_URL` is set and forward fails, endpoint returns **502** (Stripe retries).

---

## 4 · Test cards

| Field | Value |
|-------|--------|
| Success | `4242 4242 4242 4242` |
| Expiry | any future |
| CVC | any 3 digits |
| ZIP | any |
| Decline | `4000 0000 0000 0002` |

---

## 5 · Success / cancel URLs

Set by API (`web/api/stripe/checkout.js`) · no Dashboard override needed:

- Success: `https://innsegall.com/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel: `https://innsegall.com/#pricing`

---

## 6 · Customer Portal (Clan manage / cancel)

Settings → Billing → Customer portal → enable.

Add portal link to site footer when live (P1). Clan cancel = Stripe portal · no prorated refunds (TOS §9).

---

## Prod flip (later)

| Test | Live |
|------|------|
| `sk_test_…` | `sk_live_…` |
| Test webhook `whsec_…` | New live endpoint `whsec_…` |
| Test mode products | Live products (same amounts) |

Rotate `INNSEGALL_LICENSE_SECRET` when flipping live · see `ABUSE_HARDENING.md`.

Full E2E: `docs/STRIPE_SMOKE.md` · env paste: `docs/WIRE_STRIPE_VERCEL.md`.
