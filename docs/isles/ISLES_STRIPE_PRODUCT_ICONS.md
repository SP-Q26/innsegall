# Isles Stripe product icons · Innsegall lane

**Law:** One `checkout_image` per SKU · unique PNG on `https://innsegall.com/stripe/{extra,clan,msp}.png`. No shared tiles across SKUs or brands.

| SKU | Glyph |
|-----|--------|
| `extra` | Scout beam · single run |
| `clan` | Three household rings |
| `msp` | Roster grid · per seat |

**Ops:** `npm run export:stripe-images` → deploy → `STRIPE_SECRET_KEY=sk_live_… npm run sync:stripe-images` · audit: `npm run audit:stripe-product-images`.

Portfolio cross-lane: SPQ `docs/isles/ISLES_STRIPE_PRODUCT_ICONS.md` (full matrix).
