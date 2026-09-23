# Innsegall docs index

**As of:** 2026-09-23 · **Production:** `https://innsegall.com` (Vercel `innsegall_fe` · repo `SP-Q26/innsegall` · root `web/`)  
**Mode:** **Float** · blog SEO + low-touch ops while Simple Property ships · see `FLOAT_MODE_RUNBOOK.md`

---

## Start here (operator)

| Doc | Use |
|-----|-----|
| `OPERATOR_GUIDE.md` | Accounts · Vercel · Stripe · DNS · day-one steps |
| `FLOAT_MODE_RUNBOOK.md` | What to do / snuff / ROI while floating |
| `STRIPE_LIVE_FLIP.md` | Test → live keys · webhook · proof purchase |
| `STRIPE_DEEP_AUDIT_2026-09-22.md` | Live API audit · duplicates · Collective branding |
| `CHECKOUT_COPY_AND_BRANDING.md` | Innsegall checkout copy · ISLES CO · images |
| `isles/SHARED_STRIPE_CHECKOUT_BRANDING.md` | **Shared Collective Stripe** · per-app webhooks/prices · branding phases |
| `STRIPE_VERCEL_ENV_PACKAGE.md` | Copy-paste Vercel env · 3 SKUs · minimal Dashboard |
| `SITE_FULL_AUDIT_LATEST.md` | Page inventory · regen with `npm run audit:site` |
| `FIELD_REPORT_AND_BLOG.md` | Three blog pipelines · publish checklist |
| `COPY_SEO_REVIEW_2026-09-22.md` | Intent map · copy/SEO review · content gaps |
| `XANO_KEYS_LEFT.md` | Telemetry wire · `smoke:live` **202** |
| `DISTRIBUTION_PLAYBOOK.md` | Directories deferred in float · SEO first |

**Proof commands:**

```bash
npm run audit:git      # identity · main vs origin · workspace · pre-commit
npm run predeploy      # gospel + blog chrome sync
npm run audit:site     # writes SITE_FULL_AUDIT_LATEST.md
npm run gate:launch    # swarm + smoke:live (0 fail target)
```

---

## Product · brand · lane

| Doc | Use |
|-----|-----|
| `NORTH_STAR_AUDIT.md` | Pricing · AI-bus · **no pivot** (strategy) |
| `HOW_TO_SEND.md` | Blast / share copy |
| `STABILITY.md` | Trust contract |
| `MONETIZATION.md` | Tiers · quota · phases |
| `ISLES_PORTFOLIO.md` | Internal Isles canon · not on innsegall.com |

---

## Blog · Field Report · discovery

| Doc | Use |
|-----|-----|
| `FIELD_REPORT_AND_BLOG.md` | **Canon** · `field_report` vs `issue_spotlight` vs editorial |
| `SEO_PAIN_POINTS_REDDIT_QUORA.md` | Reddit / Quora / Apple forums → **20-post batch** · `npm run build:seo-batch-20` |
| `ISSUE_SPOTLIGHT_LOOP.md` | Scout → Xano → `publish-issue-spotlights` |
| `WARRIORS_FIELD_REPORT.md` | `?ref=warrior_*` attribution rules |
| `ROI_AUTOMATION.md` | Automation ROI · `npm run field-report` |

---

## Stripe · deploy · infra

| Doc | Use |
|-----|-----|
| `STRIPE_DASHBOARD_SETUP.md` | Dashboard setup |
| `STRIPE_CATALOG_STATE.md` | Product / price IDs |
| `STRIPE_PRICE_IDS.md` | Env var reference |
| `STRIPE_PRODUCT_IMAGES.md` | `sync:stripe-images` |
| `LAUNCH_CHECKLIST.md` | End-to-end launch (with 2026-09 status) |
| `DNS_ZOHO_SETUP.md` | Apex + www + mail |
| `INFRA_FORK_AUDIT.md` | Forked patterns from SPQ / nexus-ops |

---

## Internal portfolio (Isles)

| Doc | Use |
|-----|-----|
| `isles/README.md` | Isles doc map |
| `isles/LAUNCHPAD.md` | Tank apps · ethics |
| `docs/isles/*` | Per-app specs · **not public** |

---

## Archive (Sep 6 pre-launch snapshots)

Historical · scores and “not deployed” lines are **stale**. Use `SITE_FULL_AUDIT_LATEST.md` and `OPERATOR_GUIDE.md` for current ops.

| Doc | Note |
|-----|------|
| `WAKE_BELOW_DECK.md` | Monday Sep 7 battle plan |
| `BATTLE_BLAST.md` | Hour-by-hour blast |
| `BOARD_ROOM_SWARM.md` | Executive read Sep 6 |
| `SITE_AUDIT_SEP6.md` · `STACK_AUDIT_SEP6.md` | Pre-live audits |
| `FULL_SWARM_AUDIT.md` · `SITE_AUDIT_REPORT.md` | Swarm outputs |

---

## Repo root

`README.md` · `web/README.md` · `web/.env.example`
