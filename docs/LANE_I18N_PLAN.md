# Lane i18n plan · after English gate

**Blocked until:** `npm run audit:en-coverage` green · see `EN_POST_SCARE_COVERAGE.md`

**Isles law:** Same post-scare receipt lane in every language · no fearware · no offshore hotlines · product UI may stay English in phase 1.

---

## Phase 0 · English (now)

| Step | Command |
|------|---------|
| Matrix | `fixtures/post-scare-intent-matrix-en.json` |
| Gate | `npm run audit:en-coverage` |
| Readiness | `npm run audit:i18n-readiness` |
| Deploy | `npm run gate:launch` on `main` |

Do **not** create `/es/blog` until Phase 1 kickoff.

### Chrome · language picker (live on EN site)

| Piece | Spec |
|-------|------|
| **Where** | **Top right** of `site-header` · after Get started / Watch / Help / Clan · `header-end` row |
| **Control** | **Single click** · `<details>` summary shows **EN** (or ES/PT/FR/AR when live) · menu lists locales |
| **Phase 0** | Only **English** navigates · others show **soon** (disabled) until translated guides ship |
| **Auto-detect** | `navigator.languages` → `sessionStorage.innsegall_locale_hint` · **no redirect** on first visit (SEO + shared EN links) |
| **Override** | Cookie `innsegall_locale` (400d) · when a locale goes **live**, picker sets cookie + swaps URL prefix (`/es/blog/…`) |
| **Telemetry** | `marketing_ping` payload includes `locale` (active code) |
| **Scripts** | `web/innsegall-locale.js` · wired in `sync-site-chrome.mjs` |

**Not:** footer-only picker · auto-redirect whole site from browser lang · machine-translated legal without review.

---

## Phase 1 · Spanish + Portuguese (Brazil) · **live**

**Scope:** Full EN **Field Report** blog mirrored at `/es/blog/*` and `/pt/blog/*` (fixtures + `sync:blog-i18n`). Human review ongoing · locale notice on each guide links EN canonical.

**Commands:** `npm run build:blog-i18n-fixtures` (MT cache) · `npm run build:blog-i18n-pilot` (top 20 body MT) · `npm run sync:blog-i18n` · `npm run audit:i18n` · `npm run audit:i18n-pilot`

**Pilot list:** `fixtures/blog-i18n-pilot-top20.json` (20 slugs · editorial QA before fr/ar).

**Original pilot scope (matrix top 20)** still the priority for editorial QA:

| Item | Spec |
|------|------|
| URLs | `/es/blog/{slug}` · `/pt/blog/{slug}` (pt-BR copy) |
| SEO | `hreflang` ↔ EN · `x-default` = EN |
| Fixtures | `fixtures/blog-i18n/es/{slug}.json` · `.../pt/{slug}.json` |
| Build | `sync-blog-i18n.mjs` (future) · rewrites in `vercel.json` |
| CTA | Honest: “El informe se genera en tu Mac” · install may be English |
| Review | Human editor for scam steps · no machine-only legal advice |

**Telemetry:** `marketing_ping.page` = `blog_post` + path prefix or new dim `locale` (future event payload).

---

## Phase 2 · French

- Same top 20 · note `fr-CA` variants in copy where needed
- `/fr/blog/{slug}`

---

## Phase 3 · Arabic

- Top **15** intents · `dir="rtl"` blog shell
- `/ar/blog/{slug}` · MSA · many users keep English macOS UI

---

## Phase 4 · Agents

- `llms-es.txt` or gospel `operator_gtm` locale blocks
- Same **forbidden** behaviors in every language
- Warriors can use locale-specific `?ref=` landing (EN checkout OK)

---

## Glossary (lock before translate)

| EN | ES | pt-BR | Notes |
|----|----|-------|-------|
| Battle Scout | Informe Battle Scout | Relatório Battle Scout | Brand artifact |
| Send the scout | Enviar el explorador | Enviar o scout | CTA |
| You're clear | Estás bien | Você está bem | LIKELY_OK tone |
| not antivirus | no es antivirus | não é antivírus | Lane |

---

## Rollout checklist (each locale batch)

1. `npm run audit:en-coverage`
2. Translate batch · human review
3. `npm run audit:i18n` (future) · hreflang · no fear hooks
4. `npm run audit:swarm` + `audit:seo`
5. `npm run gate:launch`
6. Commit · push · `npm run smoke:live`
7. Xano: optional `locale` dim on pings

---

## Deferred

- Localized Stripe checkout copy (phase 2)
- Localized CLI (not required for SEO phase)
- Windows lane (separate product decision)

*English first · receipt culture everywhere.*
