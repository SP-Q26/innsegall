# Blog sweep audit · latest

**Run:** 2026-10-13 · `npm run sweep:blog` (or manual chain below)  
**Posts:** 60 · **Field desk:** `fixtures/blog-field-desk.json` v**2026-10-11**  
**Latest Field Glass:** `/blog/field-glass-oct-11-2026` (cadence gate green)

---

## Gates (all passed this sweep)

| Gate | Result |
|------|--------|
| `audit:blog-funnel` | pass · canonical · alpha CTA · CTA strip · field desk · lane phrase |
| `audit:blog-quality` | pass · avg **116/100** (target 115+) |
| `audit:blog-intro-leads` | pass |
| `audit-field-glass-cadence` | pass |
| `audit-vercel-routes` | pass |
| `audit:seo` + structured data | pass |
| `audit:site` | **80** pages · **1** P0 (non-blog: `/install` meta 111ch) |

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
npm run audit:launch   # optional full repo swarm
git add web/blog fixtures docs/SITE_FULL_AUDIT_LATEST.md docs/BLOG_SWEEP_AUDIT_LATEST.md
# commit + push when ready
```

**Checklist for new post:** `docs/FIELD_REPORT_AND_BLOG.md` · fixture → build script → `vercel.json` rewrite → `sitemap.xml` → `blog/index.html` card.

---

## Related

- `SITE_FULL_AUDIT_LATEST.md` · per-route inventory  
- `FIELD_REPORT_AND_BLOG.md` · publish workflow  
- `FLOAT_MODE_RUNBOOK.md` · float-mode SEO cadence
