# Innsegall · Operator guide · stack + your steps

**Purpose:** Everything **you** must provision · separate from **spquant.com / SPQ**.  
**Code status (Sep 6 night):** `npm run preflight` = sync-gospel · audit-launch · smoke · self-test · AI-bus + paste shipped · uncommitted · no remote · push Monday AM.

**Wake:** `WAKE_BELOW_DECK.md` · **North star:** `NORTH_STAR_AUDIT.md` · **Board:** `BOARD_ROOM_SWARM.md` · **Send:** `HOW_TO_SEND.md`

---

## Full audit snapshot

| Area | Score | Status |
|------|-------|--------|
| Brand / copy | 8.5/10 | Manifesto, Voyage, runes, Send the scout |
| Site (`innsegall/web/`) | 8.4/10 | 20 pages · v8 CSS · not live until Vercel |
| Engine (CLI) | 9/10 | Battle Scout · AI paste · voyage · license |
| SEO / AI gospel | 9.5/10 | llms.txt · gospel · **ai-bus** · scout-data · ai-paste |
| Stripe (code) | 8/10 | Checkout + webhook · **needs your keys** |
| Deploy ops | 4/10 | **Blocked:** GitHub, Vercel, DNS, Stripe |

Detail: `NORTH_STAR_AUDIT.md` · `STACK_AUDIT_SEP6.md` · `SITE_AUDIT_SEP6.md` · `FULL_SWARM_AUDIT.md`

---

## Required stack (what Innsegall needs)

### You provision (accounts & DNS)

| Layer | Service | Separate from SPQ? | Required? |
|-------|---------|-------------------|-------------|
| **Domain** | Namecheap `innsegall.com` | ✅ Yes | **Yes** (you have it) |
| **Hosting** | **New Vercel project** | ✅ Yes · not spquant project | **Yes** |
| **Payments** | **New Stripe account** (recommended) | ✅ Yes · clean books | **Yes** for paid tiers |
| **Source** | **New GitHub repo** `innsegall/innsegall` | ✅ Yes · not SPQ repo only | **Yes** for curl install |
| **Email** | `hello@innsegall.com` forward | Optional | Nice · not required for Stripe |
| **LLC / EIN** | Wyoming or home state | Optional at start | Stripe allows **individual** first |

### Vercel runs (no extra services)

| Piece | What |
|-------|------|
| Static site | `web/*.html`, CSS, blog, `llms.txt`, gospel JSON |
| Serverless API | `web/api/stripe/checkout`, `web/api/license`, `web/api/stripe/webhook` |
| NPM dep | `stripe` only (`web/package.json`) |
| Env vars | `STRIPE_SECRET_KEY`, optional webhook + license secret |

**No database · no Redis · no Supabase · no WeWeb.**

### User Mac (alpha product)

| Requirement | Version |
|-------------|---------|
| macOS | 12 Monterey+ |
| Node.js | 20+ |
| git | optional · `project_safe` flow |

### Not in stack (explicitly)

- SPQ Vercel / WeWeb / `spquant.com` infra
- Cloud scan storage
- Login / user accounts server
- Email SaaS (Stripe sends receipts)

---

## Stripe & Vercel: new accounts?

| | Recommendation |
|--|----------------|
| **Vercel** | **Yes · new project.** Import `innsegall/innsegall` · root directory **`web`**. Do not add innsegall.com to the SPQ/spquant Vercel project. |
| **Stripe** | **Yes · new Stripe account** (or new business under Stripe if you already use it for SPQ). Keeps payouts, tax, and branding separate. Start in **test mode** · activate business later. |
| **GitHub** | **Yes · new repo** `innsegall/innsegall` (public for install script). Can live in same GitHub org as SPQ but **different repository**. |

Same *person* can own all accounts · just **different projects/accounts**, not shared Vercel env or domain.

---

## Your step-by-step (minimum path to live + 4242 test)

### Phase A · Code on GitHub (~15 min)

1. Create **public** repo `github.com/SP-Q26/innsegall`.
2. Push the `innsegall/` folder contents as repo root (`bin/`, `src/`, `web/`, `docs/`, `package.json`).
3. Locally: `cd innsegall && npm test && npm run smoke` (both green before push).
4. Tag optional: `v0.4.0-alpha`.

### Phase B · Vercel (~10 min)

5. [vercel.com](https://vercel.com) → **Add New Project** → import `innsegall/innsegall`.
6. Settings:
   - **Root Directory:** `web`
   - **Framework Preset:** Other
   - **Build Command:** leave empty (or `cd .. && npm run sync-gospel` if you want gospel baked each deploy)
   - **Install Command:** default (`npm install` in `web/`)
7. Deploy once (preview URL) before custom domain.

### Phase C · Stripe test mode (~15 min)

8. [stripe.com](https://stripe.com) → **new account** for Innsegall → stay in **Test mode**.
9. You do **not** need to create products manually · code uses inline prices ($4.20 / $6.67). Optional: create products later for reporting.
10. Developers → **API keys** → copy **Secret key** `sk_test_...`.

### Phase D · Wire Vercel env + redeploy (~5 min)

11. Vercel project → **Settings → Environment Variables** (Production + Preview):

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `INNSEGALL_LICENSE_SECRET` | any long random string (optional · default works for alpha) |

12. **Redeploy** (env only applies after redeploy).

### Phase E · DNS (~10 min + propagation)

13. Vercel → **Domains** → add `innsegall.com` and `www.innsegall.com`.
14. Namecheap → DNS:
    - `@` → **A** `76.76.21.21`
    - `www` → **CNAME** `cname.vercel-dns.com`
15. Wait for SSL · open `https://innsegall.com/`

### Phase F · Stripe webhook (optional for alpha · ~5 min)

License downloads on `/success` without webhook. Webhook = ops logging + future renewals.

16. Stripe → Webhooks → `https://innsegall.com/api/stripe/webhook`
17. Events: `checkout.session.completed`, `invoice.paid`, subscription updated/deleted
18. Copy `whsec_...` → Vercel `STRIPE_WEBHOOK_SECRET` → redeploy

### Phase G · End-to-end test (~5 min)

19. `https://innsegall.com/#pricing` → **Pay $4.20**
20. Card `4242 4242 4242 4242` · any future date · any CVC
21. `/success` downloads `innsegall-license.json`
22. On your Mac:
    ```bash
    innsegall plan --import-license ~/Downloads/innsegall-license.json
    innsegall plan
    ```
23. Repeat **Clan** test · cancel test subscription in Stripe Dashboard.

### Phase H · Install smoke (~5 min)

24. `curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash`
25. `innsegall runes` → `innsegall run`

---

## Checklist (printable)

```
[ ] GitHub innsegall/innsegall public
[ ] Vercel NEW project · root web
[ ] Stripe NEW account · test mode
[ ] STRIPE_SECRET_KEY in Vercel
[ ] Redeploy
[ ] DNS innsegall.com → Vercel
[ ] 4242 checkout works
[ ] license import on Mac
[ ] curl install works
```

---

## When you go live (later)

- Stripe → activate account · switch to **live** keys in Vercel
- LLC + EIN on Stripe business profile
- `hello@` forwarding for support (optional)
- Customer Portal for Clan cancel (Stripe Dashboard → settings)

---

## Doc map

| File | Use |
|------|-----|
| **This file** | Stack + your steps |
| `NORTH_STAR_AUDIT.md` | Lane · pricing · AI-bus · no pivot |
| `WIRE_STRIPE_VERCEL.md` | Stripe/Vercel detail |
| `LAUNCH_CHECKLIST.md` | Full launch phases |
| `SITE_AUDIT_REPORT.md` | Technical site audit |
| `BRAND_AUDIT.md` | Voice / naming audit |

*Innsegall on its own island · SPQ stays on spquant.com.*
