# Stripe smoke · Innsegall E2E

**Forked from:** nexus-ops `INDEX_SKELLIE/STRIPE_SMOKE.md` · adapted for Vercel Checkout + license import.

Run after Vercel env + webhook are set · **test mode** until `STRIPE_LIVE_FLIP.md`.

**Catalog truth:** `docs/STRIPE_CATALOG_STATE.md` · automated probes: `npm run smoke:live` + `npm run audit:stripe`.

---

## Before Pay

| Check | Command / URL |
|-------|----------------|
| Site live | `npm run smoke:live` |
| Checkout extra | `curl -sS -X POST https://innsegall.com/api/stripe/checkout -H 'Content-Type: application/json' -d '{"sku":"extra"}' \| head` → JSON with `url` |
| Checkout clan | `curl … -d '{"sku":"clan"}'` |
| Checkout msp | `curl … -d '{"sku":"msp","quantity":10}'` |
| Warrior ref | `curl … -d '{"sku":"extra","warrior_ref":"warrior_smoke"}'` → session metadata (Dashboard after pay) |
| Env set | Vercel → `STRIPE_SECRET_KEY` + price IDs + `STRIPE_WEBHOOK_SECRET` · redeploy if changed |

---

## Extra run · $4.20

1. Open `https://innsegall.com/#pricing` or `/?buy=extra`
2. Click **Extra run** (or POST checkout as above)
3. Card `4242 4242 4242 4242` · any future expiry · any CVC
4. Land on `/success?session_id=cs_test_...`
5. License auto-downloads or:  
   `curl -fsS "https://innsegall.com/api/license?session_id=cs_test_..." -o ~/Downloads/innsegall-license.json`
6. Mac:

```bash
innsegall plan --import-license ~/Downloads/innsegall-license.json
innsegall plan
```

Expect: extra credit or plan line updated.

---

## Clan · $6.67/mo

1. Checkout **Clan** from pricing or `/clan?buy=clan`
2. Same 4242 card
3. Import license · `innsegall plan` shows clan + `valid_until`
4. Stripe Dashboard → cancel test subscription (Customer Portal when linked)

---

## MSP · $3.00/seat/mo (min 10 seats)

1. Open `https://innsegall.com/msp` · choose 10 seats (or POST `{"sku":"msp","quantity":10}`)
2. Same 4242 card
3. License JSON: `plan: "msp"` · `seats: 10` (or quantity chosen)
4. Cancel test subscription in Dashboard when done

---

## Warrior referral metadata

1. Visit `https://innsegall.com/?ref=warrior_smoke` then buy extra (or pass `warrior_ref` in checkout POST)
2. Stripe Dashboard → Payment / Checkout session → metadata includes `warrior_ref`

---

## Webhook

Stripe Dashboard → Webhooks → `we_1UCuYlF5SRiYwzwF20nJM9fT` (test) → latest `checkout.session.completed`:

- Response **200**
- Body includes `"received": true`
- If `XANO_EVENTS_URL` set: `"xano": { "forwarded": true }`

---

## Decline path

Card `4000 0000 0000 0002` → payment fails · no license file.

---

## Console checks (browser)

On `/success` after pay:

- Network tab: `GET /api/license?session_id=...` → **200** JSON with `sig`
- No console errors on download

---

## Live smoke (after flip)

See `STRIPE_LIVE_FLIP.md` · `smoke:live` checkout URL must show `(live)` not `(test)`.

---

## Rollback

Revert Vercel env to empty `STRIPE_SECRET_KEY` → checkout returns 503 · site still serves alpha install.

*Test: one 4242 run per SKU you care about · one license each · scout unblocked.*
