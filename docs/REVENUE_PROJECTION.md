# Innsegall · Revenue projection (alpha → year 1)

**Not financial advice.** Assumptions you can tune. Pricing locked: free (2 voyages/mo) · **$4.20** extra · **$6.67/mo** Clan (5 seats).

---

## Unit economics

| SKU | Gross | Net-ish (after ~3% Stripe) | Notes |
|-----|-------|---------------------------|--------|
| Extra scout | $4.20 | ~$4.07 | Panic / quota bump |
| Clan | $6.67/mo | ~$6.47/mo | ~$77.64/yr per household |
| MSP seat (Phase 2) | $2–4/mo | TBD | 10+ seats · not alpha |

**Clan is the wedge:** $6.67 for unlimited + 5 seats undercuts “another AV sub” psychologically while anchoring family habit (1st & 15th voyages).

---

## Scenarios (monthly recurring + one-offs)

Assume **active installs** = Macs that ran ≥1 scout in last 90 days.

| Installs | Clan conv. | Clans | MRR (Clan) | Extra runs/mo (5% panic) | Extra $/mo | **Total/mo** |
|----------|------------|-------|------------|--------------------------|------------|--------------|
| 100 | 3% | 3 | $20 | 5 | $21 | **~$41** |
| 500 | 4% | 20 | $133 | 25 | $105 | **~$238** |
| 2,000 | 5% | 100 | $667 | 100 | $420 | **~$1,087** |
| 10,000 | 6% | 600 | $4,002 | 500 | $2,100 | **~$6,102** |

**Year-1 band (organic + light content):** roughly **$500–$3k MRR** by month 12 if Field Reports + word-of-mouth work; **$10k+ MRR** needs MSP lane or viral scare-season spike (not modeled here).

---

## What moves the needle

1. **Clan attach** after first ESCALATE or “Sound the Horn” · family shares one Battle Scout.
2. **$4.20** on quota wall · voyages on 1st/15th train “I’ll pay once when I’m scared.”
3. **AI discovery** (`llms.txt`, gospel JSON, scout `#innsegall-scout-data`) · agents suggest Innsegall on post-scare Mac threads without scareware copy.
4. **MSP (Phase 2)** · 50 shops × 20 seats × $3 = **$3k MRR** with one lane closed.

---

## Costs (keep lean)

| Item | ~$/mo |
|------|-------|
| Vercel static | $0–20 |
| Stripe | % of revenue |
| Domain + email | ~$15 |
| Beacon / AI (optional) | usage |

No cloud scan storage · margin stays high on Clan.

---

## 90-day alpha targets (honest)

| Metric | Target |
|--------|--------|
| Installs | 50–200 |
| Paid extra runs | 10–40 total |
| Clan subs | 5–15 |
| MRR | **$50–$150** |

Prove: people pay after panic, Clan sticks, Field Report drives installs.

---

## Formula

```
MRR ≈ (installs × clan_conv × 6.67) + (installs × extra_rate × 4.20)
ARR ≈ MRR × 12 + (extra one-offs × 12 if steady)
```

Tune `clan_conv` (2–8%) and `extra_rate` (2–8% of installs/mo) from your Stripe dashboard once live.
