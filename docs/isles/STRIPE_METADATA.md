# Isles Stripe metadata

Every product created on **The Isles Collective** Stripe account (receipts **Isles Co**) should carry:

| Key | Example | Purpose |
|-----|---------|---------|
| `isles_portfolio` | `the_isles` | Constant · filter all tank revenue |
| `isles_brand` | `innsegall` · `simple_property` | App id · matches registry |
| `isles_tank_phase` | `juvenile` · `graduated` · `spin_out` | Lifecycle |
| `isles_lane` | `innsegall_extra` | SKU-specific routing |
| `<brand>_sku` | `innsegall_sku=extra` · `simple_property_sku=plus` | Per-app SKU (keep) |
| `<brand>_plan` | `innsegall_plan=clan` · `simple_property_plan=plus` | Plan tier |

**Simple Property (tank):** provision with `npm run provision:stripe-catalog -- --portfolio` · products stay **inactive** until launch · see `web/lib/isles-portfolio-products.mjs`.

**Helper (Innsegall repo):** `web/lib/isles-stripe-metadata.mjs` · `islesProductMetadata(appId, lane, extra)`.

**Xano:** copy `isles_brand` from webhook metadata on `checkout.session.completed`.

**MMI / WWLuxe:** never set `isles_portfolio` on MMI account products.
