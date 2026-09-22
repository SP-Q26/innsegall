# Checkout copy & Isles Collective branding (Innsegall)

**Stripe account:** The Isles Collective · **statement prefix:** `ISLES CO` · **legal name on account:** The Isles Collective.  
**Innsegall** is one **product lane** on this account; Simple Property and other tanks share the **same** `sk_live_` with **separate** webhooks, price env, and (eventually) session branding. See **`docs/isles/SHARED_STRIPE_CHECKOUT_BRANDING.md`**.

---

## What customers see (Innsegall)

| Surface | Source |
|---------|--------|
| Hosted Checkout layout · logo · default colors | **Stripe Dashboard → Settings → Branding** (account default) · optional **session** override in Phase 2 of shared gameplan |
| Product name + description | Live **Price** → Product (from `STRIPE_PRICE_*` or catalog provision) |
| Product image on Checkout | `https://innsegall.com/stripe/*.png` on Product · `npm run sync:stripe-images` |
| Submit footer (refunds, Clan cancel) | **`custom_text`** in `web/api/stripe/checkout.js` |
| After pay reminder | **`custom_text.after_submit`** · ISLES CO + `hello@innsegall.com` |
| Success page | `/success` · license delivery · Terms |
| Card / bank line | Prefix **ISLES CO** + suffix **INNSEGALL** / **INNSEGALL CLAN** / **INNSEGALL MSP** (code + Dashboard) |

**Code does not send `branding_settings` today** (API version mismatch caused prod `checkout_failed` until removed). Visual brand = Dashboard + product art until Phase 2 in the shared gameplan.

---

## Code map

| File | Role |
|------|------|
| `web/lib/stripe-catalog.mjs` | SKU names, amounts, live/test price IDs, `checkout_image` paths |
| `web/lib/isles-checkout-branding.mjs` | ISLES CO constants · statement suffix · metadata helper · **future** session `branding_settings` builder |
| `web/lib/isles-stripe-metadata.mjs` | `isles_brand=innsegall` on products/sessions |
| `web/api/stripe/checkout.js` | Session create · `custom_text` · metadata · descriptors |
| `web/innsegall-checkout.js` | Front-end toll gate + warrior ref |
| `scripts/provision-stripe-catalog.mjs` | Dashboard product sync |
| `scripts/sync-stripe-product-images.mjs` | Push image URLs to Stripe Products |

---

## Operator · Dashboard (Innsegall lane)

1. **Settings → Business:** support `hello@innsegall.com` · `https://innsegall.com/tos` (or `/alpha`).
2. **Settings → Branding:** logo/icon (e.g. `innsegall.com/og/innsegall-card.png` or `/favicon.svg`) · colors `#122A42` / `#F4C95D` as **account default** (other Isles apps may override per-session later).
3. **Products:** three **active** Innsegall SKUs only · portfolio/SPT products **inactive** until launch.
4. **Customer Portal:** cancel for subscriptions · link from receipt email if configured.

---

## Provision & images

```bash
STRIPE_SECRET_KEY=sk_live_… npm run export:stripe-images   # or predeploy
STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-images
STRIPE_SECRET_KEY=sk_live_… npm run provision:stripe-catalog
```

Details: `STRIPE_PRODUCT_IMAGES.md` · IDs: `STRIPE_CATALOG_STATE.md`.

---

## Metadata (reporting · no cross-lane raids)

Every Checkout session includes Isles keys + Innsegall plan keys. Webhook forwards to Xano; filter reports on **`isles_brand=innsegall`**. Full key list: `docs/isles/STRIPE_METADATA.md`.

---

## Copy checklist

- [ ] Home `#pricing` · Clan · MSP match catalog ($4.20 · $6.67 · $3/seat min 10)
- [ ] Terms §9 aligned with `custom_text`
- [ ] Production `STRIPE_PRICE_*` = live IDs in `STRIPE_CATALOG_STATE.md`
- [ ] `npm run smoke:checkout-toll-gate` · manual open + back out (`STRIPE_SMOKE.md`)
- [ ] One live checkout per SKU · statement line + product image
- [ ] `npm run gate:launch` green
