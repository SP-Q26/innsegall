# Phase 3 · SHIP IT ALL · Sep 7, 2026

**Brand VP wave:** social OG · demo on money path · blog polish · gates green · onward.

---

## Shipped

| ID | Deliverable |
|----|-------------|
| P3-1 | OG PNG rasterized from `web/og/innsegall-card.svg` · `scripts/export-og-png.mjs` |
| P3-2 | Battle Scout preview on index · clan · success |
| P3-3 | Clan solo vs shield compare on index |
| P3-4 | Blog rune dividers + `blog-prose` · `scripts/sync-blog-brand.mjs` |
| P3-5 | Blog `.md` → clean URL redirect in `vercel.json` |
| P3-6 | CSS v13 · blog + clan-compare styles |
| P3-7 | Gospel lexicon · "triage rhythm" not "Mac health" |
| P3-8 | Battle Scout · native share on mobile · clipboard on desktop |
| P3-9 | Smoke gate · `INNSEGALL_SUPPORT_DIR` in subprocess self-test |
| P3-10 | `predeploy` chain · OG PNG + blog brand + chrome sync |

---

## Gates

```bash
npm install
npm run export:og-png
npm run sync:blog-brand
npm run predeploy
npm run audit:swarm
npm run gate:launch
```

---

## Operator · live E2E (P3-11)

See `docs/E2E_LIVE_CHECKLIST.md` · one live $4.20 checkout on Mac:

1. `innsegall.com` → Extra run $4.20  
2. Success → download `license.json`  
3. `innsegall plan --import-license ~/Downloads/innsegall-license.json`  
4. `innsegall run` → panic scout unlocks  

---

## Still env-dependent

| Item | When |
|------|------|
| `XANO_EVENTS_URL` | Paste from `docs/XANO_PASTES.md` · telemetry auto-forwards |

*Onward.*
