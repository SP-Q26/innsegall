# Full send · Innsegall production gate

Operator-only · same discipline as Simple Property `full-send` · **Innsegall repo root only.**

---

## Prerequisites

```bash
cd ~/innsegall
export STRIPE_SECRET_KEY='sk_live_…'   # required · from Stripe Dashboard (not Vercel pull)
```

Optional for toll-gate metadata checks on created sessions:

```bash
# same shell · already exported above
```

Xano / webhook optional smokes need `XANO_EVENTS_URL` + `XANO_API_KEY` and `STRIPE_WEBHOOK_SECRET` locally · not required for `full-send` exit code unless you add them manually after.

---

## One command

```bash
npm run full-send
```

### Chain (in order)

1. **`check:git-identity`** · noreply author
2. **`audit:git`** · main vs origin · workspace hygiene signal
3. **`preflight`** · gospel · chrome · license dry-test · audit-launch · smoke · self-test
4. **`audit-stripe.mjs`** · repo catalog vs docs
5. **`audit:stripe-live`** · live Stripe API vs `web/lib/stripe-catalog.mjs` (needs `sk_live_`)
6. **Marketing / blog gates** · copy · SEO · blog quality/funnel · **`audit:en-coverage`** · **`audit:i18n-readiness`** · **`audit:gtm-scope`** · **`audit:oar`** · discovery · client-facing · site inventory
7. **`gate:launch`** · swarm + `smoke:live` + `smoke:links-live` + `smoke:checkout-toll-gate`

If any step fails · fix · re-run from the failed step · do not push.

---

## After green

```bash
npm run audit:git
git push origin main    # only when operator asks
```

Wait for Vercel Production · then:

```bash
npm run smoke:live
npm run smoke:xano -- --base=https://innsegall.com   # if telemetry wired
STRIPE_WEBHOOK_SECRET=whsec_… npm run smoke:webhook-signed
```

---

## Lighter paths

| Goal | Command |
|------|---------|
| Repo only before commit | `npm run preflight` |
| Prod probes only | `npm run gate:launch` |
| Blog regen + gates | `npm run sweep:blog` |
| Stripe repo audit (no API) | `node scripts/audit-stripe.mjs` |

---

## Related

- `LANE_ISOLATION.md` · agent law
- `FLOAT_MODE_RUNBOOK.md` · float-mode ops
- `BLOG_SWEEP_AUDIT_LATEST.md` · last blog sweep
