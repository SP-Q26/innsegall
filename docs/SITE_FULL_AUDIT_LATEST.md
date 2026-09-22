# Innsegall.com · full site audit

**Generated:** 2026-09-22 · `node scripts/audit-site-inventory.mjs`  
**Project:** Vercel `innsegall_fe` · root `web/`  
**Commands:** `npm run audit:site` · `npm run gate:launch` · `npm run smoke:live`

---

## Summary

| Metric | Count |
|--------|------:|
| HTML surfaces | 42 |
| Indexable marketing + blog | 40 |
| Blog posts | 23 |
| P0 inventory issues | 0 |
| Sitemap URLs | 49 |

**Operator:** Stripe LIVE flip in progress · push `main` after `npm run predeploy` · blog is primary float-mode SEO lever.

---

## Page inventory

| Route | Index | Sitemap | Blog idx | Rewrite | Meta | Issues |
|-------|:-----:|:-------:|:--------:|:-------:|-----:|--------|
| `/` | ✓ | ✓ | · | · | 165 | ok |
| `/alpha` | ✓ | ✓ | · | · | 146 | ok |
| `/blog` | ✓ | ✓ | · | · | 145 | ok |
| `/blog/after-suspicious-link-macintosh` | ✓ | ✓ | ✓ | ✓ | 153 | ok |
| `/blog/auto-voyage-first-sail` | ✓ | ✓ | ✓ | ✓ | 140 | ok |
| `/blog/blockblock-vs-post-scare-triage` | ✓ | ✓ | ✓ | ✓ | 141 | ok |
| `/blog/clicked-suspicious-link-macintosh` | ✓ | ✓ | ✓ | ✓ | 148 | ok |
| `/blog/fake-virus-popup-macintosh` | ✓ | ✓ | ✓ | ✓ | 144 | ok |
| `/blog/field-desk-stripe-live-sep-2026` | ✓ | ✓ | ✓ | ✓ | 143 | ok |
| `/blog/field-glass-sep-19-2026` | ✓ | ✓ | ✓ | ✓ | 142 | ok |
| `/blog/field-glass-sep-2026` | ✓ | ✓ | ✓ | ✓ | 145 | ok |
| `/blog/field-glass-sep-22-2026` | ✓ | ✓ | ✓ | ✓ | 126 | ok |
| `/blog/field-report-2026-09-06` | ✓ | ✓ | ✓ | ✓ | 140 | ok |
| `/blog/innsegall-ios-companion-i0` | ✓ | ✓ | ✓ | ✓ | 139 | ok |
| `/blog/innsegall-vs-antivirus-macintosh` | ✓ | ✓ | ✓ | ✓ | 146 | ok |
| `/blog/innsegall-vs-etrecheck-macintosh` | ✓ | ✓ | ✓ | ✓ | 138 | ok |
| `/blog/innsegall-vs-mac-cleaners` | ✓ | ✓ | ✓ | ✓ | 146 | ok |
| `/blog/join-the-innsegall-clan` | ✓ | ✓ | ✓ | ✓ | 148 | ok |
| `/blog/knockknock-vs-post-scare-triage` | ✓ | ✓ | ✓ | ✓ | 140 | ok |
| `/blog/macintosh-hygiene-without-antivirus` | ✓ | ✓ | ✓ | ✓ | 148 | ok |
| `/blog/macintosh-xprotect-after-scare` | ✓ | ✓ | ✓ | ✓ | 153 | ok |
| `/blog/network-monitor-vs-post-scare-triage` | ✓ | ✓ | ✓ | ✓ | 148 | ok |
| `/blog/stale-launch-items-macintosh` | ✓ | ✓ | ✓ | ✓ | 151 | ok |
| `/blog/virustotal-vs-local-mac-scout` | ✓ | ✓ | ✓ | ✓ | 153 | ok |
| `/blog/voyage-health-tracker-1st-15th` | ✓ | ✓ | ✓ | ✓ | 150 | ok |
| `/blog/what-is-a-battle-scout` | ✓ | ✓ | ✓ | ✓ | 152 | ok |
| `/boat` | ✓ | ✓ | · | · | 151 | ok |
| `/clan` | ✓ | ✓ | · | · | 135 | ok |
| `/companion` | ✓ | ✓ | · | · | 152 | ok |
| `/guide` | ✓ | ✓ | · | · | 124 | ok |
| `/install` | ✓ | ✓ | · | · | 139 | ok |
| `/ios` | ✓ | ✓ | · | · | 147 | ok |
| `/map` | ✓ | ✓ | · | · | 144 | ok |
| `/msp` | ✓ | ✓ | · | · | 139 | ok |
| `/privacy` | ✓ | ✓ | · | · | 153 | ok |
| `/stability` | ✓ | ✓ | · | · | 125 | ok |
| `/success` | no | ✗ | · | · | 101 | ok |
| `/supplies` | ✓ | ✓ | · | · | 127 | ok |
| `/tablet` | ✓ | ✓ | · | · | 148 | ok |
| `/tos` | ✓ | ✓ | · | · | 150 | ok |
| `/warriors` | ✓ | ✓ | · | · | 146 | ok |

---

## Blog SEO (float mode)

- **Cadence:** Field Glass or comparison post every 1–2 weeks.
- **Publish checklist:** `fixtures/blog-posts-seo.json` → sync scripts → `vercel.json` rewrite → `sitemap.xml` → `blog/index.html` card → `smoke-live` path.
- **Quality gate:** `npm run audit:blog-quality` (target avg 95+).
- **Funnel gate:** `npm run audit:blog-funnel`.

---

## Live probes (run after deploy)

```bash
npm run smoke:live
npm run gate:launch   # swarm + live smoke
```

Expected pre-L5: signed `InnsegallInstaller.zip` **warn** only.

---

## Related docs

- `docs/FLOAT_MODE_RUNBOOK.md` · snuff / improve / ROI / scale
- `docs/STRIPE_LIVE_FLIP.md` · payments (operator)
- `docs/DISTRIBUTION_PLAYBOOK.md` · directories (low priority in float)
- `docs/OPERATOR_GUIDE.md` · stack truth
