# Stripe Checkout · AI agent smoke (test mode)

Repeatable **4242** path for Cursor/browser automation · sandbox only.

## Preconditions

- Vercel `STRIPE_SECRET_KEY` = `sk_test_…`
- Production `success_url` / `cancel_url` use **`https://innsegall.com`** when `VERCEL_ENV=production` (`siteOrigin()` in `web/lib/stripe-catalog.mjs`). Optional `INNSEGALL_SITE_URL` only for preview deploys.

## 1 · Create session

```bash
curl -sS -X POST https://innsegall.com/api/stripe/checkout \
  -H 'Content-Type: application/json' \
  -d '{"sku":"extra","warrior_ref":"warrior_ai_smoke"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).url'
```

Use the **full** URL including the `#fid…` hash (truncated URLs show “link is incomplete”).

Confirm test mode: URL contains `cs_test_`.

## 2 · Hosted Checkout (browser)

| Field | Test value |
|-------|------------|
| Email | `ai-smoke@innsegall.com` (any valid format) |
| Card | `4242 4242 4242 4242` |
| Expiry | any future · e.g. `12/34` |
| CVC | `123` |
| Name | `AI Smoke Test` |
| ZIP | `10001` |
| Phone | required if **Save my information** is on · e.g. `(201) 555-0123` |

**Automation tips**

- Tab from email until **Card number** appears in the accessibility tree (Stripe expands the card accordion).
- Fill via element refs (`Card number`, `Expiration`, `CVC`, …) once visible.
- Optional: check **I am an AI agent acting on behalf of someone else** (Stripe test UI).
- Click **Pay** · wait for redirect.

## 3 · Verify (no browser)

```bash
SESSION_ID=cs_test_…   # from success URL or Stripe Dashboard
curl -sS "https://innsegall.com/api/license?session_id=$SESSION_ID" | jq '{plan,sig: (.sig!=null)}'
```

Stripe Dashboard: session `payment_status: paid` · metadata `innsegall_sku` · `warrior_ref`.

## Reference run (2026-09-11)

- Session: `cs_test_a1k5PDb4dMlpPsm8aXyxdgLkBsVnnRtG4FwWveAYoDw14Z89Btc5g9xWmn`
- Paid **$4.20** test · `warrior_ref=warrior_ai_smoke`
- License API on **innsegall.com**: `plan: extra` · signed `sig`

*Decline path: card `4000 0000 0000 0002` · no license.*
