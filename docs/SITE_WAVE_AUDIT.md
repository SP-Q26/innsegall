# Site wave audit (unyielding lane)

**Script:** `node scripts/audit-site-wave.mjs` · wired into `npm run audit:swarm`.

## What it enforces

- **Breakpoints / spacing:** `--bp-narrow` (32.5rem), `--bp-tablet` (48rem); narrow stack for `.avenue-grid`; companion main safe-area; blog `.article-body` rhythm on narrow.
- **Marketing SEO (7 pages):** meta 115–165ch, hosted OG, `og:url` = canonical, Twitter card, CSS cache token.
- **Blog (EN):** every post meta 120–160ch, `og:description` = meta description, `twitter:description`, BlogPosting JSON-LD, field desk + related rail.
- **Funnel:** `#start-here` before hero; nested `/install/ios` + `/install/tablet`; sitemap entries; companion device guide.

## Next wave (not gated yet)

| Item | Why |
|------|-----|
| Home meta trim to ≤160ch | Inventory allows 164ch on index; tighten fixture if SERP snippets clip. |
| ES/PT blog wave meta parity | Wave lane is EN `web/blog/*.html` only; extend mirror for es/pt. |
| `hreflang` on install pages | iOS/tablet install are EN-first; add alternates when locale install copy ships. |
| Blog `article:modified_time` | Optional OG freshness when posts are edited in place. |
| Signed installer 404 | `smoke:live` warns until GitHub release asset is uploaded. |

**Last green:** swarm + `smoke:live` after CSS **v35** wave.
