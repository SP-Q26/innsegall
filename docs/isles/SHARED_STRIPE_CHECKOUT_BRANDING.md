# Shared Stripe · checkout branding gameplan (Isles Collective)

**Goal:** One **The Isles Collective** Stripe account (`ISLES CO` on statements) serves **Innsegall**, **Simple Property**, and future tank apps **without** brands overwriting each other’s Checkout look, metadata, or webhooks.

**Not legal advice.** Entity ladder: `ISLES_PORTFOLIO.md` · metadata keys: `isles/STRIPE_METADATA.md`.

---

## What is shared vs per-app

| Layer | Shared (one account) | Per app / per Vercel project |
|-------|----------------------|------------------------------|
| Secret API key | `STRIPE_SECRET_KEY` (`sk_live_…` / `sk_test_…`) | Same value **allowed** on every Isles tank site |
| Statement **prefix** | Dashboard · **ISLES CO** | Suffix per SKU in code (`INNSEGALL`, `INNSEGALL CLAN`, …) |
| Default Checkout chrome | Dashboard **Settings → Branding** (logo, colors, font) | Session override when API supports it (Phase 2) |
| Products & prices | Same Dashboard · **separate products per brand** | `STRIPE_PRICE_*` env **only that app’s** price IDs |
| Webhook | Same account | **Separate endpoint URL + `STRIPE_WEBHOOK_SECRET` per domain** |
| License / fulfillment | · | `INNSEGALL_LICENSE_SECRET` (or SPT equivalent) **never shared** |
| Success / cancel URLs | · | Each site’s `siteOrigin()` · innsegall.com vs simpleproperty… |
| Checkout copy | · | `custom_text` + catalog names in **each repo’s** `checkout.js` |
| Product tile art | · | `https://<brand-domain>/stripe/*.png` + `sync:stripe-images` per catalog |
| Reporting | `isles_portfolio=the_isles` on all | **`isles_brand`** + `<brand>_sku` **required** on every product/session |

**Rule:** Sharing the secret key is fine. **Never** share webhook secrets, price IDs across brands, or license signing secrets.

---

## Why session `branding_settings` is off in code (2026-09-22)

`web/api/stripe/checkout.js` **does not** send `branding_settings` today. A production incident (`checkout_failed` 500) came from:

- Stripe client pinned to `apiVersion: "2024-11-20.acacia"`
- `branding_settings` with `primary_color` / `secondary_color` (invalid for that API; correct shape is Dashboard-style fields on **2025-09-30+**)

Until Phase 2 below, **visual branding = Stripe Dashboard** (account default) + **product images** + **custom_text** in code.

---

## Phase 0 · Now (live · no code change)

**Operator · ~30 minutes once per account mode (test + live):**

1. **Dashboard → Settings → Business**  
   Public name **The Isles Collective** · support email per primary lane or neutral `hello@…` for the account default.

2. **Dashboard → Settings → Branding**  
   Set **neutral Isles** defaults (beam navy `#122A42`, gold `#F4C95D`, logo that works for Collective receipts).  
   This is the **fallback** when a site does not pass session branding.

3. **Per brand · products**  
   - Innsegall: 3 active SKUs · `npm run provision:stripe-catalog` + `sync:stripe-images` with live key.  
   - Simple Property: `provision:stripe-catalog -- --portfolio` · products **inactive** until launch · own price IDs on SPT Vercel only.

4. **Per brand · webhooks**  
   - `https://innsegall.com/api/stripe/webhook` → `STRIPE_WEBHOOK_SECRET` on **innsegall_fe** only.  
   - SPT: its own URL + `whsec_` on **its** Vercel project.  
   Same signing secret must not be copied between projects.

5. **Metadata discipline**  
   Every Checkout session must include `isles_brand` (and app SKU keys). Webhook → Xano filters on `isles_brand` so lanes do not “raid” each other’s ops data.

**Innsegall-only checkout copy:** `CHECKOUT_COPY_AND_BRANDING.md` · `web/lib/isles-checkout-branding.mjs` (constants + `custom_text` helpers).

---

## Phase 1 · Per-brand visuals without Dashboard wars

Use what **does not** fight over account branding:

| Lever | Innsegall | Simple Property (example) |
|-------|-----------|---------------------------|
| Product name + description | Catalog / Dashboard product | Own catalog module |
| Product **image** URL | `innsegall.com/stripe/*.png` | `simpleproperty…/stripe/*.png` |
| `custom_text.submit` / `after_submit` | Refund + ISLES CO reminder in `checkout.js` | SPT repo · own legal copy |
| Statement suffix | `INNSEGALL` / `INNSEGALL CLAN` | `SPT` or agreed suffix (length limits) |
| Hosted Checkout **line item** | Price ID → product | Different price IDs |

Customers still see **ISLES CO** on the card; line item and image carry **brand** identity.

---

## Phase 2 · Session branding (per checkout · same account)

When you want **Innsegall navy/gold** and **SPT different colors** on the same Stripe account:

1. **Bump** Stripe API version in each app’s `checkout.js` to a version that supports [Checkout Session `branding_settings`](https://docs.stripe.com/changelog/clover/2025-09-30/checkout-sessions-branding-settings) (e.g. `2025-09-30.clover` or newer · confirm against `stripe` npm release notes).

2. **Implement per-brand helper** (shared pattern, copy into each repo or shared package later):

```js
// Example shape · verify against Stripe API docs for your pinned version.
branding_settings: {
  background_color: "#122A42",
  button_color: "#F4C95D",
  // logo: { url: "https://innsegall.com/og/innsegall-card.png" }, // when supported
}
```

3. **Do not** reuse `primary_color` / `secondary_color` (legacy / wrong for Sessions).

4. **Gate in code:** `INNSEGALL_CHECKOUT_BRANDING=1` or detect API version so a bad deploy cannot 500 all SKUs again.

5. **Smoke:** `npm run smoke:live` checkout probes must stay **0 fail** after enable.

**Dashboard branding:** Keep a **neutral** Collective default; session params **override per checkout** so SPT deploys do not require Dashboard edits.

---

## Phase 3 · Optional hard separation (later)

Only if lanes fight on Portal, tax, or acquirer rules:

- Stripe **Connect** (platform + connected accounts), or  
- **Spin-out** Stripe account per graduated brand (`ISLES_PORTFOLIO.md` tripwires).

Not required for juvenile tank + shared `sk_live_`.

---

## Checklist · new Isles tank app on shared Collective

- [ ] Products created with `isles_brand`, `isles_lane`, `isles_portfolio` metadata (`provision-stripe-catalog` or portfolio script)
- [ ] Vercel: `STRIPE_SECRET_KEY` (shared) + **app-only** `STRIPE_PRICE_*` + **app-only** `STRIPE_WEBHOOK_SECRET`
- [ ] Webhook endpoint on **that app’s** domain only
- [ ] Product images on **that app’s** domain · `sync:stripe-images`
- [ ] `checkout.js`: `custom_text`, metadata, `siteOrigin()` · no other app’s price IDs
- [ ] Xano (if used): filter events by `isles_brand`
- [ ] Phase 2: session `branding_settings` from app constants · smoke green

---

## Related

| Doc | Use |
|-----|-----|
| `CHECKOUT_COPY_AND_BRANDING.md` | Innsegall copy map |
| `STRIPE_PRODUCT_IMAGES.md` | PNG pipeline |
| `STRIPE_VERCEL_ENV_PACKAGE.md` | Innsegall env paste |
| `STRIPE_CATALOG_STATE.md` | Live product/price IDs |
| `web/lib/isles-checkout-branding.mjs` | Collective constants · future session branding helper |
