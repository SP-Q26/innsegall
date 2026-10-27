# Daily Field Glass + i18n runbook

**Goal:** One calm EN desk per day when the news cycle moves · same-day **es** + **pt** mirrors · clear path to **install** and **Send the scout**.

## Operator loop (≈20 min after headlines)

1. **Edit** `fixtures/watch-hub.json`
   - Bump `version` and `latest_field_glass` (slug `field-glass-{mon}-{d}-2026`, title, description, date, read_minutes).
   - Prepend archive row · update `field_glass_desk` (intro, feel_rows, news_brief, habits, prev_href).
2. **Add slug** to `fixtures/blog-i18n-wave5-growth.json` `slugs` array (keep recent desks for re-translate if copy changed).
3. **Bump** `fixtures/blog-field-desk.json` `version` + “today’s desk” link (human-forward bullets).
4. **Run** `npm run flywheel:daily` (or `--skip-i18n` if translate is blocked).
5. **Gate** `npm run audit:swarm` · **ship** `main` · `npm run smoke:live`.

## What the flywheel does

| Step | Script |
|------|--------|
| EN HTML + watch + RSS + sitemap + vercel | `sync-watch-hub.mjs` |
| Field desk on all blogs + SEO | `sync-blog-field-desk` · issue spotlight · `sync-blog-seo` |
| es/pt bundles | `build:blog-i18n-wave5` + `sync:blog-i18n` (before cadence gate) |
| Voice + CTAs + chrome | `apply:adoption-voice` |
| Related rails + gospel | related rail · site-chrome · gospel |
| Cadence + SEO gates | `audit-field-glass-cadence` · `audit:seo` |

Standalone after manual edits: `npm run flywheel:field-glass` (includes cadence · run i18n first if slug is in wave5).

## Voice (human-forward)

- Lead with **what you can do tonight** · not doom.
- Field desk opener: **“Worried after a scare?”** · link **sample** + **install** before pricing.
- News brief: name the headline · map to **one field guide** · default **scout**.

## Conversion path

Home / blog → **sample receipt** → **install** → **alpha (send scout)**. Field desk and Oct desks repeat that chain; telemetry intents: `sample_report`, `install`, `copy_terminal`.

## Cadence audit

`npm run audit:field-glass-cadence` · P0 if desk older than `max_field_glass_age_days` (default 3) · warns after ~1 day.
