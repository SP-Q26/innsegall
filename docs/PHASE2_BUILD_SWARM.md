# Phase 2 build swarm · after Monday 1pm blast

**Start when:** Tier A or B live · SPQ afternoon block done · **not before 10am freeze lifts** (evening or Tue).

**Swarm audit of Phase 2:** run after each wave · `npm run preflight` + manual checklist below.

---

## Wave 1 · Ops truth (highest ROI)

| Task | Doc | Effort |
|------|-----|--------|
| Xano `innsegall_events` live | `XANO_PASTES.md` | 20 min |
| Vercel `XANO_EVENTS_URL` + key | same | 5 min |
| Stripe webhook → Xano verified | `STRIPE_SMOKE.md` | 10 min |
| `innsegall_payments` table (optional) | `XANO_PAYMENTS_TABLE.md` | 30 min |

**Swarm says:** CFO + CTO agree · do this before marketing spend.

---

## Wave 2 · Abuse hardening

| Task | Doc |
|------|-----|
| Rotate `INNSEGALL_LICENSE_SECRET` | `ABUSE_HARDENING.md` |
| `POST /api/redeem` | `ABUSE_HARDENING.md` |
| Gate `plan --clan` env bypass | same |
| Parley rate limit | new · low priority |

**Swarm says:** CISO blocks live Stripe until redeem ships OR explicit accept risk.

---

## Wave 3 · Product polish

| Task | Notes |
|------|-------|
| Stripe Customer Portal footer | Clan cancel |
| Hosted OG `/og/innsegall.png` | Social CTR |
| Clan seat tokens (5 imports) | `MONETIZATION.md` |
| iOS companion spec | read-only scout · no scanner |

**Swarm says:** CPO · seat tokens before public clan codes.

---

## Wave 4 · Growth automation

| Task | Doc |
|------|-----|
| Field Report weekly cron | `field-report.mjs` |
| Warrior ledger auto | `AGENT_WARRIORS.md` |
| Blog md→html script | `ROI_AUTOMATION.md` |
| Warrior ref in `install_ping` | telemetry |

---

## Phase 2 swarm audit (run when wave completes)

```bash
cd ~/SPQ/innsegall
npm run preflight
npm run smoke:live
# Manual: 4242 · AI paste copy · webhook 200 in Stripe dashboard
```

| Check | Pass? |
|-------|-------|
| No P0 in audit-launch | |
| Claymore clean | |
| Webhook 200 + Xano row | |
| License import still works | |
| AI paste includes JSON block | |
| SPQ still unaffected | |

---

## What Phase 2 is NOT

- Windows port  
- Public clan leaderboards  
- Merging into SPQ repo  
- Live Stripe without LLC decision  
- WeWeb anything  

---

*Phase 1 was the scout. Phase 2 is the ledger and the seats.*
