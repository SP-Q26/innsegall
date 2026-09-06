# Stripe ASAP · one-click pay · no email

**Goal:** User hits **Extra run $4.20** or **Clan $6.67/mo** → pays → **downloads `license.json`** (or pastes into CLI) → runs scout. Zero `hello@` step.

**Stack:** Stripe Checkout · Vercel serverless on **innsegall** project only (not SPQ) · HMAC-signed license · local `innsegall plan --import-license`.

---

## Day 0 · You (Stripe Dashboard) · ~30 min

1. Create Stripe account · business name **Innsegall** (LLC can be added later · sole prop OK to start).
2. **Products**
   - `Extra scout` · one-time · **$4.20 USD**
   - `Clan` · recurring · **$6.67/mo USD**
3. Enable **Checkout** · collect billing address optional (off for speed).
4. **Success URLs** (set per Payment Link or in API):
   - `https://innsegall.com/success?session_id={CHECKOUT_SESSION_ID}`
5. **Webhook endpoint** (after deploy): `https://innsegall.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
6. Copy keys to Vercel env (innsegall project):
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `INNSEGALL_LICENSE_SECRET` (random 32+ bytes · not Stripe)

**Fastest tonight:** Stripe **Payment Links** for both SKUs · point success URL at `/success` once API exists. Replace mailto on site same day.

---

## Day 1 · Build (minimal)

```
innsegall/web/
  api/
    stripe/
      checkout.js      # POST { sku: "extra" | "clan" } → { url }
      webhook.js       # verify signature · issue/update license record
    license/
      [session_id].js  # GET · Stripe retrieve session · return signed license.json
  success.html         # poll/download license · copy CLI one-liner
```

### Flow · Extra run ($4.20)

```
Pricing CTA → POST /api/stripe/checkout { sku: "extra" }
  → Stripe Checkout Session (mode: payment)
  → redirect success?session_id=cs_...
  → success page fetches GET /api/license?session_id=cs_...
  → JSON { plan, extra_credits, sig, expires_at }
  → Download + show: innsegall plan --import-license ~/Downloads/license.json
```

### Flow · Clan ($6.67/mo)

```
CTA → checkout { sku: "clan" } · mode: subscription
  → webhook on checkout.session.completed + invoice.paid
  → license { plan: "clan", seats: 5, stripe_sub_id, valid_until }
  → success page same download path
  → renewals: webhook extends valid_until · cancel → downgrade at period end
```

### License payload (signed)

```json
{
  "product": "Innsegall",
  "plan": "extra" | "clan",
  "extra_credits": 1,
  "seats": 5,
  "issued_at": "ISO",
  "valid_until": "ISO | null for extra one-shot credit",
  "stripe_session": "cs_...",
  "sig": "base64url(hmac-sha256)"
}
```

CLI verifies `sig` with embedded public constant or fetches JWKS later · alpha: shared secret in binary is fine.

### Storage (alpha)

- **No user DB required:** license derived from Stripe session on each `/api/license` call (idempotent).
- Optional: Vercel KV or Stripe metadata `license_issued=1` to prevent double credit on refresh.

---

## Day 2 · CLI + site

| Task | File |
|------|------|
| `innsegall plan --import-license <path>` | `src/quota.mjs` + `bin/innsegall.mjs` |
| Remove mailto from quota block message | `quota.mjs` |
| Pricing CTAs → `fetch('/api/stripe/checkout')` or Payment Link URLs | `web/index.html` |
| Customer Portal link (manage/cancel clan) | Stripe Dashboard · footer |

**Self-test:** verify license sig · import grants credit/clan · expired license rejected.

---

## Day 3 · Polish

- Stripe **Customer Portal** for Clan cancel/update card
- `innsegall plan` shows `valid_until` + portal link
- Receipt email: Stripe sends automatically · we don't operate inbox
- Terms: paid = license to use quota features · refund policy one line in TOS

---

## What we deliberately skip (alpha)

- Accounts / login
- Email verification
- Seat device binding (Phase 2 · 5 tokens in license)
- App Store / notarized dmg billing

Privacy story stays: **payment goes to Stripe · license file stays on Mac**.

---

## Vercel wiring

- Project root: `innsegall/web`
- `package.json` in web: `{ "dependencies": { "stripe": "^17" } }`
- `vercel.json` add rewrite if needed for `/api/*` (default for `/api` folder)

---

## LLC · attach to Stripe when ready

Stripe asks legal entity · you can start as **individual/sole prop** and update to LLC when filed · no code change.

See `LLC_NOTES.md` for DE vs WY vs home state.

---

## Launch checklist

- [ ] Stripe products live
- [ ] Webhook secret in Vercel
- [ ] `/success` downloads license
- [ ] `innsegall plan --import-license` works
- [ ] Site CTAs no mailto
- [ ] Test card 4242… end-to-end
- [ ] Live mode toggle when LLC/EIN on file (optional)

*One click · one file · back to the scout.*
