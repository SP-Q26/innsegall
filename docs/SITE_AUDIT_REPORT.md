# Innsegall · Full site audit report · Sep 6, 2026 (post-swarm 2)

**Scope:** `innsegall/web/` + deploy path + Stripe readiness (code only)  
**Engine smoke:** `npm test` + `npm run smoke` · **ALL PASSED** (~112s)  
**Overall site score:** **8.6 / 10** · ship-ready · wire Stripe + Vercel on return

---

## Executive summary

The site is **on-brand**, **SEO/AI-ready**, and **Stripe-wired in code**. Legal pages match the Voyage model. Remaining gaps are **blog markdown links**, **gospel “Mac health” drift**, **success page polish**, and **ops** (Vercel env, DNS, public GitHub repo) · all assigned to swarm 3–4 or your return checklist.

**Deploy verdict:** **GO** after swarm 3–4 land · then wire `STRIPE_SECRET_KEY` + DNS.

---

## Smoke & engine (full run)

| Suite | Result | Notes |
|-------|--------|-------|
| `npm test` | ✅ 57 assertions | license, gospel ref, scout structured data |
| `npm run smoke` | ✅ 26 checks + self-test subprocess | tiers, parley, voyage chart |
| Desktop HTML write | ⚠️ EPERM (sandbox) | `.smoke/` artifacts OK · smoke-card has **Is my Macintosh okay?** |
| `cli-smoke.json` | ⚠️ stale flow_label | P3 · regenerate on next smoke commit |

---

## Pages

| Page | Grade | Findings |
|------|-------|----------|
| **/** `index.html` | **A** | Manifesto, Voyage copy, Stripe checkout buttons, FAQ JSON-LD aligned, gospel embed |
| **/alpha** | **A-** | Runes step fixed · curl one-liner · engine version in hero (acceptable) |
| **/success** | **B** | Works · minimal brand shell · no header/footer · assign swarm 4 |
| **/tos** | **A-** | Voyage §9 · Stripe Checkout · mailto = legal/support only |
| **/privacy** | **B+** | Voyage schedule §3 · header CTA still “Mac alpha” in subject |
| **/blog** | **B** | Links to raw `.md` files · browsers show markdown not HTML |
| **/blog/*.md** | **B** | Content good · not in sitemap as posts |

---

## SEO & AI discovery

| Item | Status |
|------|--------|
| Title / description / canonical | ✅ all pages |
| OG / Twitter | ✅ SVG data URI (replace with `/og/innsegall-card.png` later) |
| Schema.org | ✅ Org, SoftwareApp, FAQ, Blog, alpha WebPage |
| `sitemap.xml` | ✅ incl. llms.txt + gospel JSON |
| `robots.txt` | ✅ AI agent pointers |
| `llms.txt` | ✅ runes, $4.20, when_to_suggest |
| `.well-known/innsegall-gospel.json` | ⚠️ “Mac health” ×2 (swarm 3) |
| Battle Scout `#innsegall-scout-data` | ✅ engine |

---

## CTAs & monetization

| CTA | Path | Status |
|-----|------|--------|
| Extra run $4.20 | `POST /api/stripe/checkout` | ✅ code · needs `STRIPE_SECRET_KEY` |
| Clan $6.67 | same | ✅ |
| Free / install | `/alpha` | ✅ |
| Sound the Horn (support) | `mailto:hello@` | ✅ intentional · not billing |
| License import | `/success` → CLI | ✅ documented |

---

## Brand alignment (post-swarm 2)

| Check | Status |
|-------|--------|
| No XX in customer surfaces | ✅ |
| No Doctor on site | ✅ Read the runes |
| Voyage 1st & 15th | ✅ index, tos, pricing |
| Macintosh positioning | ✅ mostly · gospel drift remains |
| Manifesto / fren not foe | ✅ |

See `docs/BRAND_AUDIT.md` for score history.

---

## API & Vercel

| Route | Status |
|-------|--------|
| `/api/stripe/checkout` | ✅ `price_data` fallback · no Price IDs required for test |
| `/api/license` | ✅ session → signed license |
| `/api/stripe/webhook` | ⚠️ alpha logging only · raw body may need Vercel tuning |
| `vercel.json` rewrites | ✅ alpha, legal, blog, success, llms |
| `web/package.json` | ✅ stripe dep |

**Env required (you wire on return):** `STRIPE_SECRET_KEY`, `INNSEGALL_LICENSE_SECRET` (optional match to CLI)

---

## P0 · Before first paid checkout

| ID | Item | Owner |
|----|------|-------|
| S1 | Vercel env + redeploy | You |
| S2 | DNS `innsegall.com` → Vercel | You |
| S3 | Public `github.com/SP-Q26/innsegall` for curl install | You |
| S4 | Swarm 3 gospel Macintosh sync | Agent |

---

## P1 · Swarm 3–4

| ID | Item | Swarm |
|----|------|-------|
| S5 | Gospel “Mac health” → Macintosh | 3 |
| S6 | `PRICING.free.note` voyage wording | 3 |
| S7 | Battle Scout card voice (voyage banner) | 3 |
| S8 | Blog HTML or cleanUrls for `.md` posts | 4 |
| S9 | `success.html` brand shell + import steps | 4 |
| S10 | `docs/WIRE_STRIPE_VERCEL.md` one-pager for your return | 4 |
| S11 | sitemap individual blog URLs | 4 |
| S12 | privacy/tos header “Mac alpha” → Macintosh | 4 |

---

## P2 · Later

- Hosted `og/innsegall-card.png`
- Stripe Customer Portal link on site
- Blog RSS
- Webhook durable license store (KV)
- Notarized .dmg

---

## File inventory (`innsegall/web/`)

```
index.html  alpha.html  success.html  privacy.html  tos.html
innsegall.css  vercel.json  sitemap.xml  robots.txt  llms.txt
.well-known/innsegall-gospel.json
api/stripe/checkout.js  api/stripe/webhook.js  api/license.js
lib/license.mjs  package.json  .env.example
scripts/innsegall-alpha-install.sh
blog/index.html  blog/*.md
```

---

## Your return checklist (Stripe + Vercel)

1. Vercel → innsegall project → root **`web`** → env:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `INNSEGALL_LICENSE_SECRET=` (optional · default works for alpha)
2. Redeploy
3. Test: `/#pricing` → 4242 → `/success` → download license → `innsegall plan --import-license`
4. Namecheap DNS if not live
5. Push repo · verify curl install

Detail: `docs/LAUNCH_CHECKLIST.md` · `docs/WIRE_STRIPE_VERCEL.md` (swarm 4)

---

## Swarm 3–4 results (same session)

| Swarm | Done |
|-------|------|
| **3** | Gospel Macintosh health · PRICING.free.note · voyage banner on Battle Scout · field-report hint · sync-gospel |
| **4** | Blog HTML posts · success page brand shell · WIRE_STRIPE_VERCEL.md · sitemap · legal mailto subjects |

**Post-swarm engine:** `npm test` + `npm run smoke` · re-run on your machine before deploy.

---

*Light, not war · wire Stripe when you're back: `docs/WIRE_STRIPE_VERCEL.md`.*
