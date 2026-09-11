# Stripe product images

Stripe **Product** objects show an image in hosted Checkout and the Dashboard. Innsegall uses **stable URLs on innsegall.com** so test and live products can share the same art; redeploy + sync refreshes what Stripe displays.

## Assets

| File | Purpose |
|------|---------|
| `web/stripe/extra.svg` | Source · Extra scout icon |
| `web/stripe/clan.svg` | Source · Clan icon |
| `web/stripe/msp.svg` | Source · MSP icon |
| `web/stripe/*.png` | Rasterized 512×512 · committed · served statically |

Canonical paths and product IDs: `web/lib/stripe-catalog.mjs` (`checkout_image` + `stripeProductImageUrl()`).

## Workflow

1. Edit SVG if needed.
2. `npm run export:stripe-images` (also runs in `npm run predeploy`).
3. Deploy site so `https://innsegall.com/stripe/*.png` returns **200**.
4. Push URLs to Stripe:

```bash
STRIPE_SECRET_KEY=sk_test_… npm run sync:stripe-images
STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-images
```

## Notes

- Stripe requires **HTTPS** and a fetchable image (PNG/JPEG). SVG is not used on the Product object.
- Live products are **not** auto-copied from test; run sync with `sk_live_…` before live smokes.
- Optional: attach the same URLs in Dashboard manually once; sync script is idempotent.
