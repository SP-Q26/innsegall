# SEO and organic growth · Innsegall

**Goal:** Help people after a scare find calm, keyword-rich field guides—not spam. Baseline ~2–15 Google visits/day (Oct 2026).

## Cadence

| Rhythm | Action |
|--------|--------|
| **Weekly** | **Field Glass** post (`web/blog/field-glass-*.html`) · map trends → existing field guides |
| **On ship** | Bump `fixtures/blog-field-desk.json` · run `node scripts/sync-blog-field-desk.mjs` |
| **On new post** | `fixtures/blog-posts-seo.json` · `sync-blog-seo.mjs` · `web/vercel.json` rewrite · `web/sitemap.xml` · card on `web/blog/index.html` |
| **Intro copy** | `fixtures/blog-intro-leads.json` (problem → calm steps → scout) · `npm run sync:blog-intro-leads` · bump `version` when leads change |
| **Before deploy** | `npm run predeploy` or `npm run audit:swarm` + `npm run audit:seo` |

## Copy law (customer-facing)

- No operator desk, float mode, phase roadmaps, or `github.com/.../blob/main/docs/*` links on marketing HTML.
- Gate: `node scripts/audit-customer-copy.mjs` (in swarm).
- Tone: guide · help · reduce worry · **not antivirus** · local Battle Scout.

## Keyword lanes (natural use)

- Fake virus popup Mac · Safari scare notification · clicked suspicious link
- Do I need antivirus Mac 2026 · post-scare triage · Battle Scout for AI
- Malwarebytes vs Innsegall · Genius Bar vs scout · Time Machine after scare

## Levers

- Structured data: `sync-pages-seo.mjs` · `audit-seo.mjs`
- Agent discovery: `llms.txt` · `innsegall-ai-bus.json` · gospel sync
- Internal links: field-desk aside on every blog · `/boat` lane guide · `/alpha` CTA

## Oct 2 2026 sweep (reference)

- New post: `/blog/field-glass-oct-2-2026`
- Field desk version `2026-10-02` · 61 posts synced
- Customer-copy scrub on install, ios, alpha, msp, guide, stability, stripe desk meta
- Swarm + SEO green · deploy `main` when ready
