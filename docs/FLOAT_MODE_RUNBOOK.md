# Float mode · Innsegall live + blog SEO

**When:** Stripe LIVE is green · site deployed · operator wants **low touch** ops while building Simple Property.

---

## Definition of done (float)

| Check | Command / signal |
|-------|------------------|
| Production deploy | `git push origin main` · Vercel `innsegall_fe` |
| Live smoke | `npm run smoke:live` · **0 fail** on pages (signed zip **warn** OK) |
| Swarm (repo) | `npm run audit:swarm` · claymore + self-test green |
| Stripe | Operator · `docs/STRIPE_LIVE_FLIP.md` |
| Telemetry | **202** or **204** on `/api/telemetry` · not **502** |

---

## Snuff (do not do in float)

- Public Isles hub (`theisles.xyz` only if ever needed · internal canon in `docs/isles/`)
- SPQ / ships.network GTM on innsegall.com
- Directory blitz / Product Hunt sprint
- Paid Mac ads before 4+ weeks of blog cadence
- Native iOS App Store · MSP outbound sales
- Blocking launch on notarized `.zip` (curl + `.command` are canonical pre-L5)

---

## Improve (one-time · operator)

1. Push `main` (includes `web/` commit)
2. Stripe LIVE + webhook **200**
3. One real Extra purchase smoke
4. `npm run sync:stripe-images` with live key after deploy

---

## ROI (ongoing · ~2 h/month)

| Cadence | Action |
|---------|--------|
| Every 1–2 weeks | Field Glass or comparison blog post |
| Per post | `fixtures/blog-posts-seo.json` · `npm run predeploy` · push |
| Optional | DEV.to canonical cross-post · one r/macapps thread/month |
| Monthly | Glance Vercel errors · Stripe webhook log |

**Blog publish checklist:** `docs/FIELD_REPORT_AND_BLOG.md` · rewrite in `vercel.json` · `sitemap.xml` · `blog/index.html` card · auto-covered by `smoke-live` blog glob.

---

## Scale (after Simple Property MVP)

- One Apple Developer enrollment · Innsegall + Simple Property installers (`docs/isles/APPLE_BUNDLE_MAP.md`)
- L5 notarized releases · Homebrew tap · narrow Mac ads

---

## Audits

| Report | Command |
|--------|---------|
| **Full page inventory** | `npm run audit:site` → `docs/SITE_FULL_AUDIT_LATEST.md` |
| Blog SEO | `npm run audit:blog-quality` · `audit:blog-funnel` |
| Launch gate | `npm run gate:launch` |

---

## Related

- `docs/FIELD_REPORT_AND_BLOG.md`
- `docs/DOCS_INDEX.md`
- `docs/SITE_FULL_AUDIT_LATEST.md`
- `docs/DISTRIBUTION_PLAYBOOK.md`
- `docs/OPERATOR_GUIDE.md`
