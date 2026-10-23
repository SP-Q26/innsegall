# i18n growth progress · Oct 23, 2026

**Repo:** `SP-Q26/innsegall` · **`main`** only · not SPQ `weweb-export`.

## Shipped (baseline)

| Metric | Status |
|--------|--------|
| EN blog posts | 66 → **67** after Oct 23 Field Glass |
| es/pt HTML parity | `npm run audit:i18n` |
| Body-reviewed tier | Waves 1–5 · **67/67** (Oct 23 Field Glass) |
| Locale homes | `/es` · `/pt` · hero + notice |
| EN blog nudge | `innsegall-locale-blog.js` on `/blog/*` |

## Growth wave 5 (shipped locally · push when ready)

| Item | Detail |
|------|--------|
| Fixture | `fixtures/blog-i18n-wave5-growth.json` |
| First slug | `field-glass-oct-23-2026` |
| Build | `npm run build:blog-i18n-wave5` |
| Ship | `npm run sync:blog-i18n` · `npm run sync:site-chrome` |
| Audit | `npm run audit:i18n-wave5` |

**Rule:** Every new EN Field Report or Field Glass post adds its slug to wave5 (or next growth batch) before push · MT + human spot-check on scam steps.

## Deferred

- `/fr/blog` · `/ar/blog` repo ship
- Full home translation below hero
- Localized Stripe checkout

## Metrics (operator)

- Search Console · `/es/blog` · `/pt/blog` impressions
- `marketing_ping` · `route_locale` + `page=blog_post`
- Field Glass cadence · `npm run flywheel:field-glass` · `npm run audit:field-glass-cadence`
- Issue spotlight · `npm run flywheel:issue-spotlight` (Xano GET paste live)
