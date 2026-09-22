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

**Operator:** Stripe LIVE flip in progress · **push `main`** (includes `bfb6519` + this audit) · blog is primary float-mode SEO lever.

### Production probe (2026-09-22 · before push)

| Path | HTTP |
|------|------|
| `/` | 200 |
| `/blog` | 200 |
| `/blog/field-glass-sep-22-2026` | **404** (not deployed yet) |
| `/blog/knockknock-vs-post-scare-triage` | **404** |
| `/blog/blockblock-vs-post-scare-triage` | **404** |
| `/blog/after-suspicious-link-macintosh` | 200 |

After `git push origin main`, re-run `npm run smoke:live` · expect **0 fail** on blog paths.

---

## Page inventory

| Route | Index | Sitemap | Blog idx | Rewrite | Meta | Issues |
|-------|:-----:|:-------:|:--------:|:-------:|-----:|--------|
| `/` | ✓ | ✓ | · | · | 165 | — |
| `/alpha` | ✓ | ✓ | · | · | 146 | — |
| `/blog` | ✓ | ✓ | · | · | 120 | — |
| `/blog/after-suspicious-link-macintosh` | ✓ | ✓ | ✓ | ✓ | 153 | — |
| `/blog/auto-voyage-first-sail` | ✓ | ✓ | ✓ | ✓ | 140 | — |
| `/blog/blockblock-vs-post-scare-triage` | ✓ | ✓ | ✓ | ✓ | 141 | — |
| `/blog/clicked-suspicious-link-macintosh` | ✓ | ✓ | ✓ | ✓ | 148 | — |
| `/blog/fake-virus-popup-macintosh` | ✓ | ✓ | ✓ | ✓ | 144 | — |
| `/blog/field-desk-stripe-live-sep-2026` | ✓ | ✓ | ✓ | ✓ | 143 | — |
| `/blog/field-glass-sep-19-2026` | ✓ | ✓ | ✓ | ✓ | 142 | — |
| `/blog/field-glass-sep-2026` | ✓ | ✓ | ✓ | ✓ | 145 | — |
| `/blog/field-glass-sep-22-2026` | ✓ | ✓ | ✓ | ✓ | 126 | — |
| `/blog/field-report-2026-09-06` | ✓ | ✓ | ✓ | ✓ | 140 | — |
| `/blog/innsegall-ios-companion-i0` | ✓ | ✓ | ✓ | ✓ | 139 | — |
| `/blog/innsegall-vs-antivirus-macintosh` | ✓ | ✓ | ✓ | ✓ | 146 | — |
| `/blog/innsegall-vs-etrecheck-macintosh` | ✓ | ✓ | ✓ | ✓ | 138 | — |
| `/blog/innsegall-vs-mac-cleaners` | ✓ | ✓ | ✓ | ✓ | 146 | — |
| `/blog/join-the-innsegall-clan` | ✓ | ✓ | ✓ | ✓ | 148 | — |
| `/blog/knockknock-vs-post-scare-triage` | ✓ | ✓ | ✓ | ✓ | 140 | — |
| `/blog/macintosh-hygiene-without-antivirus` | ✓ | ✓ | ✓ | ✓ | 148 | — |
| `/blog/macintosh-xprotect-after-scare` | ✓ | ✓ | ✓ | ✓ | 153 | — |
| `/blog/network-monitor-vs-post-scare-triage` | ✓ | ✓ | ✓ | ✓ | 148 | — |
| `/blog/stale-launch-items-macintosh` | ✓ | ✓ | ✓ | ✓ | 151 | — |
| `/blog/virustotal-vs-local-mac-scout` | ✓ | ✓ | ✓ | ✓ | 153 | — |
| `/blog/voyage-health-tracker-1st-15th` | ✓ | ✓ | ✓ | ✓ | 150 | — |
| `/blog/what-is-a-battle-scout` | ✓ | ✓ | ✓ | ✓ | 152 | — |
| `/boat` | ✓ | ✓ | · | · | 151 | — |
| `/clan` | ✓ | ✓ | · | · | 135 | — |
| `/companion` | ✓ | ✓ | · | · | 152 | — |
| `/guide` | ✓ | ✓ | · | · | 124 | — |
| `/install` | ✓ | ✓ | · | · | 139 | — |
| `/ios` | ✓ | ✓ | · | · | 147 | — |
| `/map` | ✓ | ✓ | · | · | 144 | — |
| `/msp` | ✓ | ✓ | · | · | 139 | — |
| `/privacy` | ✓ | ✓ | · | · | 153 | — |
| `/stability` | ✓ | ✓ | · | · | 125 | — |
| `/success` | no | ✗ | · | · | 101 | — |
| `/supplies` | ✓ | ✓ | · | · | 127 | — |
| `/tablet` | ✓ | ✓ | · | · | 148 | — |
| `/tos` | ✓ | ✓ | · | · | 150 | — |
| `/warriors` | ✓ | ✓ | · | · | 146 | — |

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
