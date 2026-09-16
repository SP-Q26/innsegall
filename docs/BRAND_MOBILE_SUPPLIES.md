# Brand · mobile lattice & supplies voice

**Sep 2026** · extends [BRAND_BIBLE.md](./BRAND_BIBLE.md)

## Mobile / tablet (i0)

- **Mac runs the scout** · iPhone/iPad **hold the receipt** (companion inbox · local storage only).
- **Voyage:** Mac checks for engine updates → runs hygiene → **opens Battle Scout in the browser** · user imports JSON or uses **Copy for LLM** on phone/tablet.
- Tone: calm · weary road · **not** antivirus · **not** scareware.

## Supplies for the road (payments)

| SKU | Voice | Meaning |
|-----|--------|---------|
| **extra** | Panic scout / horn credit | One off-calendar scout after Stripe + `innsegall import` |
| **clan** | Clan passage | Unlimited household scouts · Mon/Thu voyage on Mac |
| **msp** | MSP roster | Seat packs for war-bands |

**Toll gate** = Stripe Checkout (hosted) · Innsegall does not store card data.  
**CLI:** `innsegall supplies <sku>` · **browser:** `/supplies` · **legacy:** `/?buy=extra` on home.

## Audit lanes

- `audit-brand-mobile.mjs` · ios / tablet / companion markup + CSS lattice
- `audit-voyage-preflight.mjs` · git preflight + browser open + voyage banner
- `audit-supplies-routes.mjs` · CLI + web alignment
