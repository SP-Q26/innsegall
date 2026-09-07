# Stripe smoke · Innsegall E2E

**Forked from:** nexus-ops `INDEX_SKELLIE/STRIPE_SMOKE.md` · adapted for Vercel Checkout + license import.

Run after Vercel env + webhook are set · **test mode only**.

---

## Before Pay

| Check | Command / URL |
|-------|----------------|
| Site live | `npm run smoke:live` |
| Checkout API | `curl -sS -X POST https://innsegall.com/api/stripe/checkout -H 'Content-Type: application/json' -d '{"sku":"extra"}' \| head` → JSON with `url` |
| Env set | Vercel → `STRIPE_SECRET_KEY` · redeploy if changed |

---

## Extra run · $4.20

1. Open `https://innsegall.com/#pricing`
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

1. Checkout **Clan** from pricing
2. Same 4242 card
3. Import license · `innsegall plan` shows clan + `valid_until`
4. Stripe Dashboard → cancel test subscription (Customer Portal when linked)

---

## Webhook

Stripe Dashboard → Webhooks → latest `checkout.session.completed`:

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

## Rollback

Revert Vercel env to empty `STRIPE_SECRET_KEY` → checkout returns 503 · site still serves alpha install.

*One 4242 run · one license · scout unblocked.*
