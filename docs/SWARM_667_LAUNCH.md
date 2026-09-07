# Swarm 6.67 · Clan launch war council

**Target:** Alpha live on **innsegall.com** · Stripe **test** mode · curl install works  
**Clock:** ~3 hours from swarm start · **code lane is green** · **ops lane is you**

---

## Launch ETA (realistic)

| Phase | Duration | Owner | Done when |
|-------|----------|-------|-----------|
| **T+0** Code freeze + swarm fixes | ~45 min | Agent (this swarm) | Tests green · install script links `innsegall` · docs aligned |
| **T+45** GitHub push | ~15 min | **You** | `github.com/SP-Q26/innsegall` public · `main` pushed |
| **T+60** Vercel import | ~20 min | **You** | Project root `web` · env vars set · preview URL loads |
| **T+80** DNS | ~15–90 min | **You** | `@` A `76.76.21.21` · `www` CNAME · SSL green |
| **T+90** Stripe test E2E | ~30 min | **You** | 4242 → `innsegall-license.json` → `innsegall plan --import-license` |
| **T+120** curl install smoke | ~15 min | **You** | `curl …install.sh \| bash` → `innsegall run` |
| **T+180** **ALPHA LIVE** | · | Clan | Homepage + alpha + guide/map/clan/warriors · blog indexed |

**Honest ETA:** If you start GitHub+Vercel **now**, **~2–3 hours** to alpha (DNS is the variable).  
**If Stripe still waiting:** Site can go live **today** without checkout; pricing buttons show “unavailable” until keys land.

---

## Clan positions (subagents · this swarm)

| Seat | Role | Agent | Mission | Status |
|------|------|-------|---------|--------|
| **1** | Horn Bearer | [Horn Bearer](acf14162-b506-48bb-a080-160531e68f83) | Web/CSS/sitemap/rewrites audit | ✅ CSS v6 sitewide · battle-scout rewrite |
| **2** | Shield | [Shield](8a3d0801-7e6e-430e-9bf9-eaecee360105) | Abuse · Stripe · license | ✅ TEST-only ruling · checkout origin pinned |
| **3** | Battle Scout | [Battle Scout](eb7ea73d-7279-48a3-8d34-40c9aee18426) | CLI · install · tests | ✅ Install PATH fix · 62 tests pass |
| **4** | Chieftain | Parent agent | Integrate fixes · launch doc | ✅ This file |
| **5** | Beacon | **You** | GitHub · Vercel · DNS · Stripe | ⏳ Blocking launch |

---

## Launch scorecard (post-swarm 6.67)

| Lane | Score | Notes |
|------|-------|-------|
| Engine + CLI | **9/10** | Welcome scout · DOS terminal · map/warriors |
| Web + SEO | **8.5/10** | 11 pages · 9 blog posts · guide/map/clan/warriors |
| Brand | **8.5/10** | Clan FOMO · army CTAs · gospel |
| Abuse (test) | **7/10** | Honor system OK for alpha · no live keys |
| Ops deploy | **3/10** | Needs GitHub remote + Vercel + DNS |
| **Overall alpha** | **8/10** | **Shippable when ops completes** |

---

## Your 90-minute checklist (do in order)

```bash
# 1. Push repo (from innsegall/)
git remote add origin git@github.com:innsegall/innsegall.git  # if missing
git push -u origin main
git tag v0.4.0-alpha && git push origin v0.4.0-alpha

# 2. Vercel: New project → innsegall/innsegall → Root Directory: web
#    Env: STRIPE_SECRET_KEY=sk_test_…
#         INNSEGALL_LICENSE_SECRET=$(openssl rand -base64 32)

# 3. Namecheap DNS → Vercel records (see LAUNCH_CHECKLIST.md)

# 4. Smoke live
curl -sI https://innsegall.com/alpha | head -3
curl -sI https://innsegall.com/guide | head -3
curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash

# 5. Stripe 4242 on /#pricing and /clan
```

---

## What we will NOT block launch on (post-alpha)

- Hosted OG PNG (`/og/innsegall-card.png`)
- Xano telemetry (no-op until `XANO_EVENTS_URL`)
- Server-side `/api/redeem` (local replay guard only)
- Notarized `.dmg`
- Live Stripe keys / LLC

---

## Clan manifesto (launch night)

> Solo scouts tire. The clan holds the line.  
> Free Voyages on the 1st & 15th · welcome scout for first blood ·  
> $6.67/mo when the household needs you.  
> Agents enlist at `/warriors` · horn credits for ethical referrals.

**Sound the Horn.**
