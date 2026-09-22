# Checkout copy & Isles Collective branding

**Stripe account:** The Isles Collective · **statement prefix:** `ISLES CO` · **legal name on account:** The Isles Collective.  
**Innsegall** is the first **product lane** on this account; more Isles tank apps (Simple Property, etc.) share the same processor until spin-out.

---

## What customers see

| Surface | Copy / branding |
|---------|------------------|
| Hosted Checkout | Product name + description from `web/lib/stripe-catalog.mjs` (or Dashboard after provision) |
| Checkout colors | Beam navy `#122A42` · horn gold `#F4C95D` via `branding_settings` in `web/api/stripe/checkout.js` |
| Submit footer | Refund / cancel rules per SKU (`custom_text.submit`) |
| After pay | Statement reminder: **ISLES CO** · `hello@innsegall.com` |
| Success page | License delivery · ISLES CO note · Terms link |
| Card / bank | Prefix **ISLES CO** + suffix **INNSEGALL** / **INNSEGALL CLAN** / **INNSEGALL MSP** on one-time / subs |

---

## Code map

| File | Role |
|------|------|
| `web/lib/stripe-catalog.mjs` | Innsegall SKU names, amounts, Isles metadata |
| `web/lib/isles-checkout-branding.mjs` | Collective constants · Checkout colors · statement suffix |
| `web/lib/isles-portfolio-products.mjs` | Tank SKUs (Simple Property · inactive until launch) |
| `web/api/stripe/checkout.js` | Session create · metadata · branding |
| `web/innsegall-checkout.js` | Front-end toll gate + warrior ref |
| `scripts/provision-stripe-catalog.mjs` | Dashboard sync · `--portfolio` for tank products |

---

## Provision commands

```bash
# Innsegall SKUs (test or live key)
STRIPE_SECRET_KEY=sk_test_… npm run provision:stripe-catalog

# Simple Property tank products only (inactive · metadata + optional prices)
STRIPE_SECRET_KEY=sk_live_… npm run provision:stripe-catalog -- --portfolio

# Both
STRIPE_SECRET_KEY=sk_test_… npm run provision:stripe-catalog -- --with-portfolio
```

Then `npm run sync:stripe-images` for Innsegall product art on `innsegall.com/stripe/*.png`.

---

## Dashboard hygiene (operator)

1. **Settings → Business → Public details:** support email `hello@innsegall.com` · support URL `https://innsegall.com/tos` (or `/alpha` until dedicated support page).
2. **Settings → Branding:** upload logo + icon (use `innsegall.com/og/innsegall-card.png` or favicon until Isles hub art exists). Checkout inherits account branding when session `branding_settings` is set.
3. **Products:** only **three active** Innsegall SKUs for checkout · Simple Property rows stay **inactive** until domain launch.
4. **Customer Portal:** enable cancel for subscriptions · link from post-purchase email if configured.

---

## Multi-lane metadata (Xano / reporting)

Every Checkout session includes:

- `isles_portfolio` = `the_isles`
- `isles_brand` = `innsegall` (future: `simple_property`, …)
- `isles_lane` = e.g. `innsegall_extra`
- `innsegall_sku` / `innsegall_plan` for this repo

Webhook forwards Isles keys to Xano on `checkout_complete`. See `docs/isles/STRIPE_METADATA.md`.

---

## Copy checklist before live flip

- [ ] Home `#pricing` · Clan · MSP pages match catalog amounts ($4.20 · $6.67 · $3/seat)
- [ ] Terms §9 refunds aligned with Checkout `custom_text`
- [ ] Production `STRIPE_PRICE_*` = canonical live prices (`STRIPE_CATALOG_STATE.md`)
- [ ] One test checkout per SKU · confirm statement line and product image
- [ ] `npm run smoke:live` green
