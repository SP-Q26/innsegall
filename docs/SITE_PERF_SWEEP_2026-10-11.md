# Site performance sweep · 2026-10-11

## Goals

Snappy static loads · one font bundle · long-cache shell assets · defer non-critical nav decoration · accessible form controls.

## Changes

| Area | Action |
|------|--------|
| **CSS cache** | `innsegall.css?v=27` sitewide via `sync-site-chrome.mjs` |
| **Fonts** | `scripts/site-fonts.mjs` · DM Sans 400/600 + Cormorant 600/700 · `display=swap` · injected after site CSS |
| **Vercel** | `Cache-Control` immutable on CSS/JS shell · 7d on raster/SVG |
| **Nav** | Beam signals via `requestIdleCallback` (fallback `setTimeout`) |
| **Forms** | `.field-input` + `:focus-visible` · MSP seats use class not inline styles |
| **Blog grids** | `content-visibility: auto` on `.card-grid > .card` |
| **Gate** | `npm run audit:site-performance` · swarm lane |

## Verify

```bash
node scripts/sync-site-chrome.mjs
npm run audit:site-performance
npm run audit:swarm
```
