# Innsegall · Stack, separation & data (brother guide)

**TL;DR:** Same **Vercel login** · **new project**. Same **GitHub account** · **new repo** (tiny). **New Stripe** for money. **Xano** only for **your** anonymized ops data · never user Battle Scout bodies. You will **not** run out of Git space stacking Innsegall separately from SPQ.

---

## What to combine vs keep separate

| Thing | Combine with SPQ? | Recommendation |
|-------|-------------------|----------------|
| **Vercel account** | ✅ Same login is fine | **New project** named `innsegall` · root `web` · domain `innsegall.com` only on this project |
| **Vercel email** | ✅ Same email | **No new email needed** for Vercel |
| **GitHub account** | ✅ Same user/org | **New repo** `innsegall/innsegall` · do not bury inside SPQ export |
| **Git storage** | ❌ Don't merge repos | Innsegall ≈ **&lt;5 MB**. SPQ is huge (GIFs, WeWeb export). **Separate repo = faster clones + no asset bloat** |
| **Stripe** | ❌ | **New Stripe account** (or separate Stripe business) · clean payouts & tax |
| **Domain** | ❌ | `innsegall.com` only on Innsegall Vercel project |
| **WeWeb / SPQ canvas** | ❌ | Never |
| **Xano (your paid)** | ⚠️ Shared instance OK | **Separate tables / API group** `innsegall_*` · see below |
| **hello@ email** | Optional | Forward at Namecheap · not required for Stripe test |

### Vercel free (Hobby) reality

- Multiple projects per account · Innsegall static + 3 serverless functions is **well within** free tier
- Bandwidth: marketing site + blog is low until you blow up
- **Limits:** serverless invocations · if checkout spikes, upgrade one project later
- **spquant.com** and **innsegall.com** as **two projects** under one Vercel team = normal

---

## Git: will you run out of space?

| Repo | Typical size | Risk |
|------|--------------|------|
| `innsegall/innsegall` | ~2–10 MB | **None** for years |
| `SPQ` (weweb-export) | 100 MB–GB+ | GIF history · audit scripts |

**Rules:**
- Never commit `.smoke/` Desktop paths or user cards
- No GIF packs in Innsegall repo
- If you must monorepo temporarily: use `innsegall/` subfolder in SPQ **but** deploy Vercel with root `innsegall/web` only

**GitHub free:** unlimited public repos · soft recommend &lt;1 GB per repo · Innsegall is nowhere close.

---

## Xano: what is OK to combine?

Your paid Xano can host **operator analytics** for Innsegall in a **dedicated API group** · same Xano workspace as SPQ is fine if tables are namespaced.

### ✅ OK to store (anonymized / ops)

| Event | Fields | Why |
|-------|--------|-----|
| `install_ping` | version, macos_major, day, random_install_id | Count installs · no IP required |
| `scout_aggregate` | verdict_bucket, flow, check_buckets[], engine_version, day | Same shape as Field Report blog |
| `marketing_ping` | page, ref_channel, session_id, day | Top-of-funnel · no ad pixels (`PLATFORM_TRACKING.md`) |
| `issue_spotlight` | issue_key, event_type, buckets, content_hash | Issue flywheel · no PII (`ISSUE_SPOTLIGHT_LOOP.md`) |
| `checkout_complete` | sku, amount, stripe_session_id (no card) | Revenue ops |
| `clan_subscription` | Stripe sub status | MRR |
| `clan_renewal` | invoice id, amount | Renewals |

### ❌ NEVER send to Xano (brand + privacy)

- File paths, hostnames, usernames
- Battle Scout HTML/JSON bodies
- Email addresses from users (unless they emailed you support)
- Password-entered flags tied to identifiable sessions
- Raw Stripe customer PII beyond what Stripe already holds

### Architecture (alpha)

```
Mac CLI (opt-in later) ──► POST innsegall.com/api/telemetry
                              │
                              ▼ (if XANO_EVENTS_URL set)
                         Xano innsegall_events table
                              │
                              ▼
                    Your dashboard / Field Report backfill
```

**Phase 1 (now):** Vercel webhook → Xano for Stripe events only (you paste endpoint).  
**Phase 2:** CLI `innsegall telemetry --share` sends **category aggregates** after scout.  
**Phase 3:** Auto Field Report from Xano rollups.

Env (Vercel Innsegall project only):

| Variable | Purpose |
|----------|---------|
| `XANO_EVENTS_URL` | POST anonymized JSON to `innsegall/events` |
| `XANO_API_KEY` | `X-API-Key` handshake · same value as Xano `sk_live_innsegall_ops_` / `sk_test_innsegall_ops_` |

See `docs/XANO_DATA.md` for table schema (swarm 5).

---

## Recommended final stack

```
innsegall.com
  ├── Vercel project "innsegall" (same account as SPQ)
  │     ├── static web/
  │     └── api/ stripe + license + telemetry
  ├── GitHub innsegall/innsegall (public)
  ├── Stripe account Innsegall (test → live)
  ├── Namecheap DNS
  └── Xano innsegall_* tables (optional · your paid)
        └── NOT user card storage

spquant.com
  └── SPQ Vercel project · WeWeb · unchanged
```

---

## Your 10-step wiring (unchanged, clarified)

1. **GitHub** new repo · push `innsegall/` tree  
2. **Vercel** same account → **Add project** → import repo · root **`web`**  
3. **Stripe** new account · test keys  
4. Vercel env: `STRIPE_SECRET_KEY` (+ optional `XANO_EVENTS_URL`)  
5. **DNS** innsegall.com → this project only  
6. 4242 test checkout  
7. (Optional) Xano table + webhook URL in Vercel  
8. curl install smoke  
9. Keep SPQ project untouched  
10. Live keys when LLC ready  

Detail: `OPERATOR_GUIDE.md` · `WIRE_STRIPE_VERCEL.md`

*Same harness · different longship · no foe.*

---

## Xano detail (Swarm 5C)

Table schema, example rows, forbidden fields, Stripe→Xano wiring, and CLI telemetry plan live in **[`XANO_DATA.md`](./XANO_DATA.md)**. Endpoint paste: **[`pastes/innsegall-events-post.xs`](./pastes/innsegall-events-post.xs)**.

The live route is `POST /api/telemetry` (`web/api/telemetry.js`): client events `install_ping` · `scout_aggregate` · `marketing_ping` · `issue_spotlight` · PII denylist · forwards to `XANO_EVENTS_URL` when set · otherwise **204 no-op**. Stripe webhook forwards `checkout_complete` · `clan_*` server-side only.
