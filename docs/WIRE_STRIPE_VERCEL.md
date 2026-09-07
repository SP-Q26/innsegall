# Wire Stripe + Vercel · return checklist

One page for when you are back at the keyboard. Site code is ready · you wire keys, DNS, and redeploy.

---

## 1 · Vercel project

| Setting | Value |
|---------|--------|
| Repo | `github.com/innsegall/innsegall` (public for curl install) |
| **Root directory** | `web` |
| Framework | Other · **no build command** (static + `/api`) |
| Domain | `innsegall.com` + `www` (www redirects to apex in `vercel.json`) |

**Environment variables** (Production + Preview for alpha):

| Variable | Example / notes |
|----------|-----------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` from Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` after webhook registered (step 3) |
| `INNSEGALL_LICENSE_SECRET` | Random 32+ byte string · optional · default in `.env.example` works for alpha |

Optional (recommended · created in Stripe test mode Sep 2026):

| Variable | Test value |
|----------|------------|
| `STRIPE_PRICE_EXTRA` | `price_1UCtSDF5SRiYwzwFcmVYwqvf` |
| `STRIPE_PRICE_CLAN` | `price_1UCtknF5SRiYwzwFMhZXP1q2` |

Full catalog: `docs/STRIPE_PRICE_IDS.md` · checkout falls back to inline amounts if unset.

Optional preview base URL before DNS:

| Variable | Example |
|----------|---------|
| `INNSEGALL_SITE_URL` | `https://your-project.vercel.app` |

Copy template: `web/.env.example`

---

## 2 · Redeploy

After env vars are set:

1. Vercel → Project → **Deployments** → Redeploy latest (or push to main).
2. Confirm `/api/stripe/checkout` responds (not 500) · pricing buttons open Stripe.

---

## 3 · Stripe webhook (test mode)

1. Stripe Dashboard → Developers → **Webhooks** → Add endpoint  
   `https://innsegall.com/api/stripe/webhook`
2. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
3. Copy signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel → redeploy again.

---

## 4 · Test checkout (card 4242)

1. Open `https://innsegall.com/#pricing`
2. **Extra run $4.20** → Stripe Checkout  
   - Card: `4242 4242 4242 4242`  
   - Expiry: any future date · CVC: any 3 digits · ZIP: any
3. Land on `/success?session_id=...` · license auto-downloads
4. On your Mac:

```bash
innsegall plan --import-license ~/Downloads/innsegall-license.json
innsegall plan   # should show extra credit or clan
```

5. Repeat for **Clan $6.67/mo** · cancel test sub in Stripe Customer Portal when done.

If checkout fails: check Vercel function logs · confirm `STRIPE_SECRET_KEY` is set · redeploy after any env change.

---

## 5 · DNS (Namecheap → Vercel)

1. Vercel → Domains → add `innsegall.com` and `www.innsegall.com`
2. Namecheap DNS:
   - `@` → **A** `76.76.21.21`
   - `www` → **CNAME** `cname.vercel-dns.com`
3. Wait for SSL · spot-check `/`, `/alpha`, `/privacy`, `/tos`, `/blog`, `/success`

---

## 6 · Public repo + curl install

```bash
curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash
```

Requires public `innsegall/innsegall` on GitHub. Tag `v0.4.0-alpha` after local smoke green:

```bash
npm test && npm run smoke
```

---

## Quick reference

| Doc | Use |
|-----|-----|
| `docs/LAUNCH_CHECKLIST.md` | Full ordered launch path |
| `docs/STRIPE_ASAP.md` | Checkout flow · license shape |
| `web/.env.example` | Env template |

*Light, not war · wire keys, redeploy, 4242, import license, go.*
