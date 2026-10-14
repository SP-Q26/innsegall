# Blog sweep audit · latest

**Run:** 2026-10-14 · blog + watch + gospel lane sweep  
**Posts:** 61 · **Field desk:** `fixtures/blog-field-desk.json` v**2026-10-14**  
**Latest Field Glass:** `/blog/field-glass-oct-14-2026` (cadence gate green)

---

## Gates (all passed this sweep)

| Gate | Result |
|------|--------|
| `audit:blog-funnel` | pass · canonical · alpha CTA · CTA strip · field desk · lane phrase |
| `audit:blog-quality` | pass · avg **116/100** (target 115+) |
| `audit:blog-intro-leads` | pass |
| `audit-field-glass-cadence` | pass |
| `audit-vercel-routes` | pass |
| `audit:site` | **81** pages · **0** P0 |
| `audit:site-performance` | pass · defer nav/checkout · CSS cache · `content-visibility` |
| `audit-swarm` | pass (after nav/lane/guide/legal alignment) |

---

## Sync chain (what `sweep:blog` runs)

1. `sync-blog-brand` · `build-seo-batch-20` · competitor absorption · iOS + Chrome Mac batches  
2. `sync-blog-field-desk` · `sync-blog-intro-leads` · `sync-blog-spam-scam-seo`  
3. `sync-blog-seo` · `sync-blog-body-boosts` · `sync-blog-related-rail` · `sync-blog-cta`  
4. `sync-site-chrome` (nav/footer/CSS v on blog + marketing shells)  
5. Audits above · regenerates `SITE_FULL_AUDIT_LATEST.md`

After sweep: `node scripts/sync-gospel-web.mjs` if llms/gospel blog URLs changed · then `npm run smoke:live`.

---

## Operator publish

```bash
cd innsegall
npm run sweep:blog
node scripts/sync-gospel-web.mjs
npm run preflight
npm run gate:launch
git add web/blog fixtures web/guide.html web/install.html web/privacy.html web/tos.html scripts docs/SITE_FULL_AUDIT_LATEST.md docs/BLOG_SWEEP_AUDIT_LATEST.md
# commit + push when ready
```

---

## Notes

- **Perf:** static shell uses single CSS v27, deferred `innsegall-nav.js` + checkout, long-cache on CSS/JS in `vercel.json`, blog cards use `content-visibility: auto`.  
- **Full send:** needs `STRIPE_SECRET_KEY=sk_live_…` for `npm run full-send` (not run in agent env).
