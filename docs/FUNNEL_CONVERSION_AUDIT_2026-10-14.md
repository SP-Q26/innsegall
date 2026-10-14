# Funnel conversion audit · October 14, 2026

## Diagnosis (visits ≫ installs)

| Factor | Effect |
|--------|--------|
| Blog SEO | Users fix the scare in the **browser** · job done without CLI |
| Trust gap | `curl \| bash` + unsigned `.command` · scared users hesitate |
| Wrong device | iOS/iPad traffic · scout runs on Mac only |
| Lane filter | “Not antivirus” · AV shoppers leave |
| Measurement | Compare `marketing_ping` → `install_intent` → `install_ping` in Xano |

## Shipped improvements (this pass)

1. **Sample before install** on `/alpha` · hero + section order (preview above Gatekeeper help).
2. **Home hero** · “See sample report” beside Send the scout.
3. **Blog CTAs** · `browser_first` slugs push sample → install; others add sample link (`fixtures/blog-cta-variants.json`).
4. **Telemetry** · `install_intent` assets `copy_terminal` · `sample_report` · `copy_block` (nav wiring).
5. **Gate** · `node scripts/audit-funnel-conversion.mjs` (add to swarm when stable).

## Weekly operator query

```text
marketing_ping (blog_post, alpha, home)
  → install_intent (sample_report, copy_terminal, command, oneliner)
  → install_ping
```

`node scripts/report-funnel.mjs` when Xano is wired.

## Still structural (not copy)

- L5 notarized installer (smoke warns 404)
- Homebrew tap publish (T11)
- Post-scare distribution vs generic SEO
