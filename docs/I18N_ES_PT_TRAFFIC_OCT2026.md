# es / pt-BR i18n · traffic-led wave (Oct 2026)

**Signal:** Organic Field Report traffic rising on `/es/blog` and `/pt/blog` · keep English gate for new EN posts · **unfreeze es/pt only** (not fr/ar blog ship · not MSP surface).

**Canon:** `LANE_I18N_PLAN.md` · `OPERATOR_GTM_SCOPE.md` · receipts + no fearware in every language.

---

## What is live

| Surface | URL | Notes |
|---------|-----|--------|
| Full blog mirror | `/es/blog/*` · `/pt/blog/*` | 66 posts · hreflang ↔ EN |
| Locale homes | `/es` · `/pt` | Hero + notice · body mostly EN below fold |
| Picker | Header | `es` + `pt-BR` **live** · cookie + prefix swap |
| Telemetry | `marketing_ping` | `locale` + `route_locale` on every ping |

---

## Editorial tiers

| Tier | Slugs | Notice on page | Build |
|------|-------|----------------|-------|
| **Pilot top 20** | `fixtures/blog-i18n-pilot-top20.json` | “cuerpo revisado” / pilot copy | `npm run build:blog-i18n-pilot` |
| **Wave 2 (20)** | `fixtures/blog-i18n-wave2.json` | Same pilot notice · iPhone/iPad + Chrome/Safari | `npm run build:blog-i18n-wave2` |
| **Wave 3 (20)** | `fixtures/blog-i18n-wave3.json` | Same pilot notice · comparisons + hygiene + Voyage | `npm run build:blog-i18n-wave3` |
| **Rest** | Remaining slugs (~7) | Title/nav MT · body MT in bundle · standard notice | `npm run build:blog-i18n-fixtures` |

After any fixture change: **`npm run sync:blog-i18n`** · **`npm run sync:site-chrome`** · gates below.

---

## EN → locale nudge (no auto-redirect)

On **English** `/blog/{slug}` only: if `navigator.language` is `es` or `pt`, a dismissible bar links to the `hreflang` alternate (`innsegall-locale-blog.js`). Session dismiss per slug · SEO-safe.

---

## Operator loop (each batch)

```bash
cd innsegall
npm run build:blog-i18n-wave3    # or wave2 / pilot / full --force when needed
npm run sync:blog-i18n
npm run sync:site-chrome
npm run audit:i18n
npm run audit:i18n-pilot
npm run audit:i18n-wave2
npm run audit:i18n-wave3
npm run audit:i18n-chrome
npm run gate:launch
```

Human QA: scam steps · Innsegall lane (not AV theater) · CTA honesty (“informe en tu Mac”).

---

## Deferred (still frozen)

- `/fr/blog` · `/ar/blog` repo ship
- Localized Stripe checkout
- Full home translation below hero
- Windows / new product lanes

---

## Metrics to watch (Xano / Vercel)

- `marketing_ping` where `route_locale` ∈ `es` · `pt-BR` and `page` = `blog_post`
- `checkout_intent` / `install_intent` with locale dims
- Search Console · `/es/blog` · `/pt/blog` impressions (operator)

*Traffic proved demand · ship quality in es/pt before widening fr/ar.*
