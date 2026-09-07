# Innsegall · ROI automation queue

Maximize revenue per founder hour · automate what compounds · stay human where trust sells.

---

## ROI matrix (impact × effort)

| Priority | Automation | Impact | Effort | Status |
|----------|------------|--------|--------|--------|
| **P0** | `npm run prep-deploy` (gospel + audit) | Deploy confidence | S | ✅ Shipped |
| **P0** | Install script → `~/.local/bin/innsegall` | Conversion | S | ✅ Shipped |
| **P0** | Stripe webhook → Xano `checkout_complete` | Revenue truth | S | ✅ Shipped (needs env) |
| **P1** | `INNSEGALL_TELEMETRY=1` install_ping | Warrior attribution | S | ✅ Shipped |
| **P1** | `npm run audit` launch gate | Zero bad deploys | S | ✅ Shipped |
| **P1** | Voyage launchd schedule | Retention / habit | S | ✅ User-side |
| **P2** | Blog md→html CI | SEO velocity | M | Manual alpha |
| **P2** | `POST /api/redeem` server ledger | Anti-abuse + ROI on paid | M | Planned |
| **P2** | Stripe Customer Portal | Churn automation | M | Planned |
| **P3** | Auto Field Report publish | Content flywheel | M | Script exists |
| **P3** | OG image on deploy | Social CTR | S | Planned |
| **P3** | Warrior credit auto-issue | Agent scale | L | Xano + rules |

**S/M/L** = small/medium/large engineering days.

---

## Revenue automation flywheel

```
SEO / warriors / word-of-mouth
        ↓
   curl install (automated PATH)
        ↓
   welcome scout + Voyage habit
        ↓
   quota wall ──► $4.20 extra (automated Stripe)
        ↓
   clan FOMO ──► $6.67/mo (automated subscription)
        ↓
   webhook ──► Xano MRR dashboard (automated)
        ↓
   Field Report ← scout_aggregate (opt-in)
```

**Founder time per paying user target:** &lt; 2 minutes (alpha) · &lt; 30 seconds (Valhalla).

---

## What NOT to automate (negative ROI early)

| Task | Why human |
|------|-----------|
| Parley sessions | Trust · liability |
| Warrior credit disputes | Fraud judgment |
| Manifesto / brand posts | Voice |
| LLC / legal | One-time |

---

## Operator commands (automation surface)

```bash
npm run sync-gospel      # llms.txt + gospel JSON + index embed
npm run prep-deploy      # gospel + audit-launch (Vercel prebuild)
npm run audit            # repo P0 gate only
npm run field-report     # anonymized digest → blog md
INNSEGALL_TELEMETRY=1 innsegall runes   # opt-in install_ping
INNSEGALL_WARRIOR_REF=warrior_foo innsegall runes  # attribution
```

---

## Xano ROI (when wired)

| View | Decision it enables |
|------|---------------------|
| Installs/day | SEO + warrior spend |
| checkout_complete / install ratio | Pricing page A/B |
| Clan MRR | Whether to raise price at 1k installs |
| Warrior leaderboard | Who to comp |

**Cost:** $0 marginal if table lives in existing paid Xano workspace.

---

## 90-day automation goal

| Metric | Target |
|--------|--------|
| Deploys without manual gospel edit | 100% |
| Paid licenses without manual `--credit` | 95% |
| Install attribution (warrior ref) | 80% when ref present |
| Founder hours/week on Innsegall | &lt; 5h at 200 installs |

**Valhalla:** automate the receipt · clan the household · gospel the agents · you steer the boat.
