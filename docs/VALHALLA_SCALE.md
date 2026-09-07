# Innsegall · Scale to Valhalla (automation map)

**Valhalla** = sustainable clan revenue with minimal founder hours · automation where it compounds, humans where trust matters.

---

## Automation tiers

### Tier 0 · Now (alpha ship)

| System | Automates | Owner |
|--------|-----------|-------|
| Vercel static + `/api` | Site, checkout, license download | Deploy hook |
| `innsegall voyage --install-schedule` | 1st/15th scouts via launchd | User Mac |
| `sync-gospel-web.mjs` | llms.txt + gospel JSON | `npm run predeploy` |
| Field Report script | Anonymized blog digests | Cron local / manual |
| Telemetry → Xano | Install + aggregate counts | Env var |

### Tier 1 · First 400 installers

| System | Automates |
|--------|-----------|
| Stripe webhooks → Xano | Revenue truth, `checkout_complete` |
| `POST /api/redeem` | One license per session (server) |
| Warrior `ref` in install_ping | Credit ledger |
| Blog SEO pipeline | md → html script in CI |
| Vercel preview per PR | innsegall repo only |

### Tier 2 · 1k+ · product maturity

| System | Automates |
|--------|-----------|
| Notarized `.dmg` | No Node install friction |
| Stripe Customer Portal | Clan cancel/upgrade |
| Email-less license refresh | Subscription `valid_until` poll |
| Parley routing | Static → BYOK → Beacon queue |
| OG image generation | Card screenshot on deploy |

### Tier 3 · Valhalla (clan flywheel)

| System | Automates |
|--------|-----------|
| Clan seat invites | Magic link per seat (Xano auth) |
| MSP white-label | Custom gospel subdomain |
| Agent marketplace | Verified warrior registry API |
| Regional Field Reports | Auto-publish from aggregates only |

---

## What stays human

- Parley sessions (bounded help)
- Warrior credit disputes (alpha)
- Brand voice on manifesto posts
- Abuse incident response

---

## Infra stack (recommended)

```
GitHub innsegall/innsegall  →  Vercel project (root web)
                           →  Stripe (Innsegall account)
                           →  Xano (innsegall_* tables, same workspace as SPQ OK)
Namecheap DNS               →  Vercel
User Mac                    →  CLI + local quota + Battle Scout
```

**Do not merge** into SPQ repo for scale · separate deploy cadence, separate blast radius.

---

## Revenue automation path

```
Visitor → SEO / warrior ref
       → alpha install → install_ping
       → free Voyages (habit)
       → panic month → $4.20 extra OR $6.67 clan
       → Stripe → license.json → local import
       → webhook → Xano (truth)
       → retained user → Parley / Beacon (later)
```

---

## KPI dashboard (Xano views)

- Daily installs (unique `install_id`)
- Voyages vs extra vs clan (from aggregates)
- MRR (Stripe sync)
- Warrior ref leaderboard (counts only)
- Churn (subscription ended)

---

## When to hire / outsource

| Trigger | Role |
|---------|------|
| 50+ Parley requests/mo | Part-time Mac helper |
| Support email > 2h/day | VA + playbook |
| 5k installs | Security review contractor |

Until then: **automate the receipt, clan the household, gospel the agents.**
