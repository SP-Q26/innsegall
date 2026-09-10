# Stack audit · full · Sep 6 night

**Version:** 0.4.0-alpha · **Gate:** `npm run preflight` PASS

---

## Architecture

```
User Mac (Node 20+ · macOS 12+)
  └─ innsegall CLI → checks → Battle Scout HTML + .ai-paste.md
       └─ optional: telemetry install_ping (opt-in)

innsegall.com (Vercel · root web/)
  ├─ static HTML/CSS/blog/gospel
  └─ serverless API
       ├─ POST /api/stripe/checkout
       ├─ POST /api/stripe/webhook
       ├─ GET  /api/license
       ├─ POST /api/telemetry
       └─ POST /api/parley (GEMINI optional)

Optional: Xano innsegall_events (telemetry + webhook mirror)
Stripe: Checkout + Customer Portal (portal link P1)
GitHub: innsegall/innsegall (public · install script)
```

**Not in stack:** WeWeb · SPQ vercel.json · user DB · cloud scan storage · Resend auth.

---

## Scorecard

| Layer | Score | Status |
|-------|-------|--------|
| CLI engine | 9.0 | 15 checks · quota · license HMAC |
| Battle Scout render | 9.0 | Parley · armory · AI paste |
| API routes | 8.5 | All implemented · env-dependent |
| Security headers | 9.0 | vercel.json nosniff · DENY frame |
| Abuse (test mode) | 7.0 | OK for alpha · redeem P1 |
| Observability | 6.0 | Xano optional · no APM |
| Deploy ops | 4.0 | **Blocked: GitHub · Vercel · DNS** |
| SPQ isolation | 10.0 | Separate project · correct |

**Overall stack: 8.2/10 · ship-ready code · ops pending**

---

## API matrix

| Route | Auth | PII | Forward |
|-------|------|-----|---------|
| checkout | Stripe key | No | Stripe |
| webhook | Stripe sig | No | Optional Xano |
| license | session_id | No | Stripe retrieve |
| telemetry | Public | **Rejected** | Optional Xano |
| parley | Public CORS | Card-bound | Optional Gemini |

---

## CLI matrix

| Command | Purpose |
|---------|---------|
| `run` | Battle Scout + ai-paste sidecar |
| `runes` / `doctor` | Diagnostics |
| `plan` | Quota · import license |
| `voyage` | 1st/15th schedule |
| `render` | Regenerate HTML/md/ai-paste |

---

## Env vars (Vercel)

| Var | Tier A | Tier B |
|-----|--------|--------|
| (none) | ✅ site | |
| `STRIPE_SECRET_KEY` | | ✅ |
| `STRIPE_WEBHOOK_SECRET` | | ✅ |
| `INNSEGALL_LICENSE_SECRET` | | ✅ |
| `XANO_EVENTS_URL` | optional | optional |
| `GEMINI_API_KEY` | optional | optional |

---

## Forks from SPQ/nexus (time saved)

See `INFRA_FORK_AUDIT.md` · preflight · smoke-live · Stripe/DNS docs.

**Do not fork:** WeWeb build chain · Xano niche webhook · index-stripe-payment-active.js

---

## Phase 2 stack (post-1pm)

| Item | File |
|------|------|
| Server redeem | `ABUSE_HARDENING.md` |
| Xano events | `pastes/innsegall-events-post.xs` · `XANO_PASTES.md` · `XANO_KEYS_LEFT.md` |
| Payment log | `XANO_PAYMENTS_TABLE.md` |
| Seat tokens | `MONETIZATION.md` § Phase 2 |
| OG asset | CDN or `/public/og/` |

---

*Stack is calm. Wire the harbor tomorrow.*
