# Innsegall · Launch checklist

Ordered ops path from repo to paid alpha on **innsegall.com**. No SPQ coupling.

---

## 1 · GitHub repo `innsegall/innsegall`

- [ ] Create public repo **github.com/innsegall/innsegall** (or org fork you control)
- [ ] Push this tree · root = product monorepo (`bin/`, `src/`, `web/`, `docs/`)
- [ ] Tag `v0.4.0-alpha` after smoke green
- [ ] Set `INNSEGALL_REPO_URL` in install script env if not using default org URL
- [ ] README + `docs/` ship with repo · no secrets in git

**Smoke before push:**

```bash
npm test
npm run smoke
```

---

## 2 · Vercel project (site only)

- [ ] New Vercel project → import **innsegall/innsegall**
- [ ] **Root directory:** `web` (not repo root)
- [ ] Framework: **Other** · **Build command:** empty (or `cd .. && npm run predeploy` if gospel must bake on every deploy)
- [ ] **Output:** static + `/api` serverless (default for `web/api/`)
- [ ] Install deps: Vercel reads `web/package.json` (`stripe` for Checkout + webhook)
- [ ] Separate project from **SPQ** · own env vars · own domain

**Pre-deploy gospel sync (local or CI):**

```bash
npm run predeploy   # or: npm run sync-gospel
```

Writes `web/llms.txt`, `web/.well-known/innsegall-gospel.json`, and gospel block in `web/index.html`.

---

## 3 · DNS (Namecheap → Vercel)

- [ ] Vercel → Project → Domains → add `innsegall.com` and `www.innsegall.com`
- [ ] Namecheap DNS:
  - `@` → **A** `76.76.21.21`
  - `www` → **CNAME** `cname.vercel-dns.com`
- [ ] Wait for SSL · confirm `www` → apex redirect (`web/vercel.json` already has rule)
- [ ] Spot-check: `/`, `/privacy`, `/tos`, `/blog`, `/alpha`, `/llms.txt`

---

## 4 · Stripe test mode (card `4242`)

Dashboard + Vercel env · see `STRIPE_ASAP.md` for detail.

- [ ] Stripe account · products **Extra scout** ($4.20 one-time) and **Clan** ($6.67/mo)
- [ ] Vercel env (all environments for alpha):

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (after webhook registered) |
| `INNSEGALL_LICENSE_SECRET` | random 32+ byte string · **same** as local if testing import |

Optional: `STRIPE_PRICE_EXTRA`, `STRIPE_PRICE_CLAN` if not hardcoded in API.

- [ ] Webhook endpoint: `https://innsegall.com/api/stripe/webhook`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
- [ ] Redeploy after env set

**E2E test (test mode):**

1. Open `https://innsegall.com/#pricing`
2. **Extra run** → Checkout → card `4242 4242 4242 4242` · any future expiry · any CVC
3. Land on `/success` · download `license.json`
4. Local: `innsegall plan --import-license ~/Downloads/innsegall-license.json`
5. `innsegall plan` shows credit or clan
6. Repeat for **Clan** subscription · cancel via Stripe Customer Portal when done testing

---

## 5 · Voyage schedule smoke (CLI)

Confirms free-tier calendar enforcement before you tell users to install.

```bash
innsegall runes
innsegall run --smoke          # or: npm run smoke
innsegall plan                 # free · next voyage date
innsegall voyage --force       # chart + card on non-1st/15th
innsegall voyage --install-schedule   # launchd plist · optional on ship machine
```

- [ ] `npm run smoke` passes · `.smoke/smoke-voyage.html` has voyage chart
- [ ] Quota block message points at **site pricing** (not mailto)
- [ ] Install script works: `curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash`

---

## 6 · Go-live toggle

**Stay on test keys until LLC/EIN/receipts are ready** · then flip once.

- [ ] Stripe Dashboard → **Activate account** · live mode
- [ ] Replace Vercel env: `sk_live_...`, live webhook `whsec_...`, live Price IDs
- [ ] Re-run 4242-style test with a real $4.20 charge (or small live test) · refund in Dashboard
- [ ] Confirm site CTAs use Checkout API · no `mailto:` on pricing
- [ ] Customer Portal link in footer for Clan manage/cancel
- [ ] Monitor webhook delivery in Stripe · first 24h

**Rollback:** revert env to test keys · redeploy · licenses issued under live keys remain valid until `valid_until`.

---

## Quick reference

| Doc | Use |
|-----|-----|
| `STRIPE_ASAP.md` | Checkout + webhook + license shape |
| `MONETIZATION.md` | Pricing · quota · phases |
| `README.md` | Vercel root `web` · env table |
| `web/.env.example` | Local / Vercel env template |

*Repo → Vercel → DNS → Stripe test → voyage smoke → live keys.*
