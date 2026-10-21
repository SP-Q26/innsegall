# Agent law · lane isolation (Innsegall)

**This lane only.** Do not patch SPQ, WeWeb export, or Simple Property (Deposit Desk) while working Innsegall unless the operator explicitly switches repos.

---

## Lane map

| | **Innsegall** | **Not this lane** |
|--|---------------|-------------------|
| **Product** | Battle Scout · [innsegall.com](https://innsegall.com) | SPQ / Signal Prime · spquant.com |
| **Stack** | Static `web/` + Vercel `/api` | WeWeb export · `weweb-export` · `public/data/*.json` |
| **Repo** | `SP-Q26/innsegall` | `SP-Q26/SPQ` · `SP-Q26/Simple-Property` |
| **Cursor folder** | `innsegall/` repo root only | Do not bulk-edit parent `SPQ/` for Innsegall convenience |
| **Production branch** | `main` | Never `weweb-export` |

---

## Hard rules

1. **No dirty trees in other repos.** On **SPQ**, use `weweb-export` only for WeWeb preview — **never** create `weweb-export` on **innsegall** (see `docs/GIT_BRANCH_LAW.md`). Do not bulk-edit SPQ from an Innsegall task or leave uncommitted work in Simple Property for convenience.
2. **Commits / push only when the operator asks.** Before push: `npm run audit:git` (or `npm run check:git-identity`).
3. **Git identity:** noreply GitHub only · no personal email in commits or tracked files (`@gmail`, `*.lan`, real names).
4. **No secrets in git:** `.env`, `sk_live_`, `whsec_`, `re_` stay in Vercel / local `web/.env.local` only.
5. **Isles Stripe** is shared with Deposit Desk · metadata `isles_brand=innsegall` on Innsegall products only · never mix SKUs or copy Deposit Desk catalog into Innsegall handlers.
6. **Customer copy:** no em dash U+2014 in customer `web/` surfaces (match Deposit Desk / WW canon).
7. **WeWeb MCP:** integrated Cursor MCP is for **SPQ canvas only** · not used for Innsegall · no shell `mcp-remote` for WeWeb.

---

## Production bar · full send

Deposit Desk uses `npm run full-send` with mandatory live Stripe key. Innsegall mirrors that discipline:

```bash
cd ~/innsegall   # repo root · not SPQ parent
export STRIPE_SECRET_KEY='sk_live_…'   # Dashboard · Vercel secrets are not pullable
npm run full-send
```

See **`docs/FULL_SEND.md`** for the exact chain.

**`gate:launch`** (prod green) runs:

| Step | Script |
|------|--------|
| Swarm | `npm run audit:swarm` |
| Live site | `npm run smoke:live` |
| Links | `npm run smoke:links-live` |
| Checkout toll | `npm run smoke:checkout-toll-gate` |

Optional when Xano / webhooks matter: `npm run smoke:xano` · `npm run smoke:webhook-signed` · `npm run audit:events`.

---

## Stripe alignment

| Check | Innsegall |
|-------|-----------|
| Code vs catalog | `node scripts/audit-stripe.mjs` (every serious push) |
| Live Dashboard vs git | `npm run audit:stripe-live` (requires `STRIPE_SECRET_KEY=sk_live_…`) |
| Hosted product images | `https://innsegall.com/stripe/*.png` · `npm run sync:stripe-images` |
| Checkout smoke | `smoke:live` · `docs/STRIPE_SMOKE.md` · no fake `cs_*` entitlement probes on prod |

Stripe MCP (Cursor user MCP) can compare live product IDs to `web/lib/stripe-catalog.mjs` · MCP does not replace git canon or Vercel env.

---

## Blogs · copy · forms (marketing push)

```bash
npm run audit:copy
npm run audit:seo
npm run audit:blog-quality
npm run audit:blog-funnel
npm run audit:discovery
npm run audit:client-facing
npm run audit:site
npm run sweep:blog    # regenerate all posts from fixtures before big blog ship
```

**Voice:** post-scare Mac triage · calm · not antivirus scareware · `hello@innsegall.com` only in customer copy.

---

## Deploy

| | |
|--|--|
| **Vercel** | Project `innsegall_fe` · root `web/` · branch `main` · apex `innsegall.com` |
| **After env change** | Redeploy Production |
| **Ops docs** | `STRIPE_SMOKE.md` · `STRIPE_CATALOG_STATE.md` · `STRIPE_LIVE_FLIP.md` · `BATTLE_BLAST.md` · `XANO_KEYS_LEFT.md` |

---

## Agent checklist (every session)

1. Confirm workspace = **innsegall** repo · branch **`main`** · clean or intentional diff only here.
2. Do not touch SPQ / Simple Property unless operator switches lane.
3. For launch green: `STRIPE_SECRET_KEY` set → `npm run full-send` or `preflight` + `gate:launch`.
4. Report failures with **script name + first P0 / FAIL line** · no drive-by commits.

---

## Parity reference (sibling lane)

Simple Property Deposit Desk: `docs/LANE_ISOLATION.md` · `docs/FULL_SEND_STRIPE.md` · `npm run full-send` in **SP-Q26/Simple-Property** only.
