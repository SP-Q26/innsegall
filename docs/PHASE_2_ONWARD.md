# Phase 2 · ONWARD · Sep 7, 2026

**Brand VP lane:** sleek · secure · ancient · shareable receipts · wealth without scare.

---

## Shipped (this wave)

| ID | Deliverable | Path |
|----|-------------|------|
| P2-1 | Public LIKELY_OK Battle Scout demo | `/samples/battle-scout-demo` |
| P2-2 | Guide embed · iframe preview | `/guide#battle-scout-sample` |
| P2-3 | Rune shield favicon + `brand-mark.svg` | `web/favicon.svg` · `web/brand-mark.svg` |
| P2-4 | OG card SVG master (gold beam + runes) | `web/og/innsegall-card.svg` |
| P2-5 | Success page onward + share language | `web/success.html` |
| P2-6 | CSS v12 · scout preview frame | `web/innsegall.css?v=12` |
| P2-7 | Export script in prep-deploy | `scripts/export-sample-scout.mjs` |

---

## Gates

```bash
npm run export:sample-scout   # regen demo HTML
npm run audit:swarm           # all lanes
npm run gate:launch           # swarm + live smoke
```

---

## Still open (P2 next)

| ID | Item |
|----|------|
| P2-8 | Rasterize `og/innsegall-card.svg` → PNG for social (replace PNG when ready) |
| P2-9 | Sync inline header SVG sitewide via `sync-site-chrome` on every deploy |
| P2-10 | Field Report blog hero · rune divider on posts |
| P2-11 | Xano `scout_aggregate` wire when `XANO_EVENTS_URL` set |
| P2-12 | One live $4.20 E2E · license import smoke on Mac |

---

## Score target

**9.2 / 10** visual brand · **0 fail** live smoke · receipts shareable by default.

*Onward.*
