# Stripe · MSP roster pack

**SKU:** `msp` · **$3.00 USD / seat / month** · **10–100 seats** per subscription · unlimited scouts per billed seat.

Not EDR · complements XProtect and existing tools · see `docs/MSP_OUTREACH_BRIEF.md`.

---

## Dashboard (test or live)

1. **Product:** Innsegall MSP · per seat  
2. **Price:** recurring monthly · **$3.00** · usage type **licensed** (per-seat quantity at checkout)  
3. Copy **Price ID** → Vercel `STRIPE_PRICE_MSP_SEAT`  
4. Optional **lookup_key:** `innsegall_msp_seat` (matches `web/lib/stripe-catalog.mjs`)

If env is unset, checkout uses inline `price_data` at **300** cents (same as catalog).

---

## Checkout

- Page: [innsegall.com/msp](https://innsegall.com/msp)  
- API: `POST /api/stripe/checkout` · `{ "sku": "msp", "quantity": 10, "warrior_ref": "warrior_…" }`  
- Metadata: `innsegall_sku=msp` · `innsegall_seats=<quantity>` · optional `warrior_ref`

---

## License

Success page delivers `innsegall-license.json` with `plan: "msp"` and `seats` count.

```bash
innsegall plan --import-license ~/Downloads/innsegall-license.json
```

Seat redeem for end clients remains **design-only** (`docs/REDEEM_SEATS.md`) · alpha uses install link + operator import on admin Mac.

---

## Webhook / Xano

`checkout_complete` payload includes `seats` and `warrior_ref` when present.

---

## Vercel env

```text
STRIPE_PRICE_MSP_SEAT=price_…   # optional · inline fallback OK for test
```

Same webhook events as Clan · `customer.subscription.*` · `invoice.paid`.
