# Stripe deep audit · The Isles Collective · 2026-09-22

**MCP account (after refresh):** `acct_1UCtAeFDJKTJlxOc` · **The Isles Collective** · **livemode only** in Cursor Stripe plugin (no test/sandbox context returned).  
**Receipt branding (operator):** **Isles Co** on card/bank statements · full legal name **The Isles Collective** in Dashboard.  
**Repo audit:** `node scripts/audit-stripe.mjs` · **pass** (code + doc IDs · not live API).

---

## Executive summary

| Area | Status | Action |
|------|--------|--------|
| Code (Checkout + webhook + catalog) | **Green** | Keep `STRIPE_PRICE_*` env aligned with canonical prices below |
| Live products | **Resolved 2026-09-22** | Duplicate trio **deactivated** · **3 active** canonical products only |
| Live prices | **Resolved 2026-09-22** | `innsegall_*` lookup keys on **canonical** prices |
| Product metadata | **Resolved 2026-09-22** | `isles_portfolio` / `isles_brand` / `isles_lane` on all three canonical live products |
| Test sandbox | **P0 MCP gap** | Reconnect **test mode** in Stripe integration or run `sk_test_…` locally · see § Sandbox |
| Docs entity name | **Resolved** | Canon = **The Isles Collective** + **Isles Co** receipts |

---

## Account · branding (2026-09-22 pass)

| Item | Status |
|------|--------|
| Statement prefix | **ISLES CO** (Dashboard) |
| Checkout session | Colors + Isles metadata + suffix in `checkout.js` |
| Dashboard logo/icon | **Empty** · upload in Settings → Branding (see `CHECKOUT_COPY_AND_BRANDING.md`) |
| Support email on account | Set to **hello@innsegall.com** (product domain only) |
| Simple Property SKUs | `provision:stripe-portfolio` · inactive tank products |

## Account · branding (audit notes)

| Field | Value |
|-------|--------|
| Stripe account ID | `acct_1UCtAeFDJKTJlxOc` |
| Dashboard display name | **The Isles Collective** |
| Statement descriptor (operator) | **Isles Co** (short · receipts) |
| Innsegall on product line | Product **names** stay Innsegall-branded (correct DBA pattern) |

**Not audited via API:** live webhook list (blocked in agent session). Confirm in Dashboard → Developers → Webhooks → `https://innsegall.com/api/stripe/webhook` · same four events as `STRIPE_CATALOG_STATE.md`.

---

## Live catalog (API read · 2026-09-22)

### Canonical set · **keep for Vercel Production**

Use these in `STRIPE_PRICE_*` (matches `STRIPE_LIVE_FLIP.md` and `web/lib/stripe-catalog.mjs` `live_*_id` fields):

| SKU | Product | Price | Amount | lookup_key |
|-----|---------|-------|--------|------------|
| `extra` | `prod_VEoWuOFwUVENSz` | `price_1UEKtpFDJKTJlxOcJn43NZI2` | $4.20 once | `innsegall_extra` |
| `clan` | `prod_VEoXxxCbhp5UBE` | `price_1UEKu4FDJKTJlxOcooxy8Zv5` | $6.67/mo | *(none)* |
| `msp` | `prod_VEoX9hJDYQTlck` | `price_1UEKu6FDJKTJlxOcMJmWUzim` | $3.00/seat/mo | *(none)* |

Images: `https://innsegall.com/stripe/{extra,clan,msp}.png` on all six products.

### Duplicate set · **deactivated (live · 2026-09-22)**

| SKU | Product | Status |
|-----|---------|--------|
| `extra` | `prod_VDK62giZUcpP6x` | **inactive** |
| `clan` | `prod_VDKPAidRCPD8vW` | **inactive** |
| `msp` | `prod_VEoW9HK9Jun9It` | **inactive** |

Lookup keys `innsegall_clan` and `innsegall_msp_seat` were **transferred** to canonical prices. Do not reactivate dupes.

**Note:** Git `test_product_id` strings match these IDs for **test mode** objects (separate from live). Test catalog is unchanged; run `provision:stripe-catalog` with `sk_test_…` if test objects need refresh.

---

## Metadata gap (Isles portfolio)

**Code** (`web/lib/stripe-catalog.mjs` + `isles-stripe-metadata.mjs`) attaches:

`isles_portfolio`, `isles_brand`, `isles_lane`, `isles_tank_phase`, `innsegall_sku`, `innsegall_plan`

**Dashboard products today:** only `innsegall_sku` / `innsegall_plan` (+ `innsegall_seats` on clan).

**Impact:** Xano/reporting filters on `isles_brand` miss Dashboard-created checkouts unless webhook copies from session metadata (checkout **does** pass `catalog.metadata` on `price_data` fallback · env price path uses product metadata only).

**Fix:** PATCH each **canonical** product metadata in Dashboard or run `scripts/provision-stripe-catalog.mjs` when available with `sk_live_…` / `sk_test_…`.

---

## Test sandbox

| Check | Result |
|-------|--------|
| Cursor Stripe MCP `list_available_accounts_or_orgs` | **No test account** returned (only live Isles Collective) |
| Git documented test account | `acct_1UCtB2F5SRiYwzwF` · **not verified this session** |
| Preview / local | Use `sk_test_…` from Dashboard (test mode toggle) · same Collective account |

**Sandbox setup checklist:**

1. Dashboard → **Test mode** → Developers → API keys → `sk_test_…`
2. Vercel **Preview** env: test `STRIPE_*` + test `STRIPE_PRICE_*` (see `STRIPE_PRICE_IDS.md` after provision)
3. Test webhook endpoint → `STRIPE_WEBHOOK_SECRET` on Preview
4. `STRIPE_SECRET_KEY=sk_test_… npm run sync:stripe-images`
5. `npm run smoke:live` against preview URL or production with test key only if Vercel test keys on Production (avoid mixing)

**Provision (operator Mac):**

```bash
STRIPE_SECRET_KEY=sk_test_… node scripts/provision-stripe-catalog.mjs
# then paste printed STRIPE_PRICE_* into Vercel Preview
```

---

## Vercel env matrix (reminder)

| Env | `STRIPE_SECRET_KEY` | Price IDs |
|-----|---------------------|-----------|
| Production | `sk_live_…` | Canonical live table above |
| Preview | `sk_test_…` | Test prices from provision output / `STRIPE_PRICE_IDS.md` |

Never put `sk_live_…` on Preview. Rotate `INNSEGALL_LICENSE_SECRET` on live flip.

---

## Code paths (verified)

| Piece | Behavior |
|-------|----------|
| `web/api/stripe/checkout.js` | Uses `STRIPE_PRICE_*` if set · else inline `price_data` with full `catalog.metadata` |
| `web/api/stripe/webhook.js` | `checkout.session.completed` · subscription · `invoice.paid` subscription_cycle |
| `web/lib/stripe-catalog.mjs` | Amounts 420 / 667 / 300 · MSP qty 10–100 |
| Images | `npm run sync:stripe-images` · hosted on innsegall.com |

---

## Doc / git drift to fix

| Doc | Issue |
|-----|--------|
| `STRIPE_CATALOG_STATE.md` | **The Isles Collective** |
| `STRIPE_PRICE_IDS.md` | Test account name · duplicate product warning |
| `docs/isles/STRIPE_METADATA.md` | Account name |
| `web/lib/isles-stripe-metadata.mjs` | **The Isles Collective** in comments |

**Do not** change canonical `live_product_id` / `live_price_id` in code unless operator confirms Vercel migration to new prices.

---

## Smoke matrix

| Probe | Command |
|-------|---------|
| Repo | `node scripts/audit-stripe.mjs` |
| Hosted checkout | `npm run smoke:live` (mode in URL: `/test/` vs live) |
| E2E 4242 | `docs/STRIPE_SMOKE.md` |
| Live flip | `docs/STRIPE_LIVE_FLIP.md` |

---

## Related

`STRIPE_CATALOG_STATE.md` · `STRIPE_LIVE_FLIP.md` · `docs/isles/STRIPE_METADATA.md` · `ISLES_PORTFOLIO.md`
