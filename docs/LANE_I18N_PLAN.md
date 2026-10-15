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

---

## Phase 1 · Spanish + Portuguese (Brazil)

**Scope:** Top **20** matrix intents (popup · link · remote · Terminal · notifications · parent Mac · AV comparison).

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
