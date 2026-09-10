# Issue spotlight loop · scout → blog → LLM discovery

**Goal:** When a user **identifies** or **resolves** an issue on their Macintosh, Innsegall emits an **anonymized category signal**. Aggregated signals become **Field Report issue posts** that LLMs and search can cite · driving installs and warrior credits.

---

## Loop (end to end)

```mermaid
flowchart LR
  A[Battle Scout run] --> B{identify or resolve?}
  B -->|FIX_LIST / ESCALATE| C[issue_spotlight identified]
  B -->|clear after fix_list| D[issue_spotlight resolved]
  C --> E[POST /api/telemetry]
  D --> E
  E --> F[Xano innsegall_events]
  F --> G[publish-issue-spotlights.mjs]
  G --> H[/blog/issue-slug]
  H --> I[llms.txt + sitemap + agents]
```

---

## What fires automatically (CLI)

After every `innsegall run` / `check` / `voyage`:

1. Compare current card to **previous** local card (`loadPreviousCard`)
2. **`identified`** · verdict FIX_LIST or ESCALATE with attention categories
3. **`resolved`** · same `issue_key` as prior scout · prior was fix_list/escalate · now clear
4. `sendIssueSpotlight` → `POST /api/telemetry` · event `issue_spotlight`
5. Dedupe · one signal per `issue_key` + `event_type` per UTC day per install

**Never sent:** paths, emails, card bodies, filenames, user inputs text.

---

## Telemetry payload

```json
{
  "event": "issue_spotlight",
  "payload": {
    "day": "2026-09-09",
    "event_type": "identified",
    "issue_key": "clicked_bad_link:browser_profile",
    "issue_slug": "after-suspicious-link-macintosh",
    "flow": "clicked_bad_link",
    "attention_buckets": ["browser_profile"],
    "fix_categories": ["credential_rotation"],
    "engine_version": "0.4.0-alpha",
    "content_hash": "abc123..."
  }
}
```

Add **`issue_spotlight`** to Xano allowed-events whitelist (`docs/XANO_PASTES.md`).

---

## Publish (operator / cron)

Aggregate Xano rows (or local fixtures) · write blog HTML + markdown:

```bash
# Test with fixtures (creates real posts under web/blog/)
npm run publish:issue-spotlights

# Preview only
npm run publish:issue-spotlights:dry

# From local card history (operator machine)
node scripts/publish-issue-spotlights.mjs --from-cards
```

Posts include:

- YAML frontmatter · `report_type: issue_spotlight`
- `innsegall_agent_hint` JSON block for LLM RAG
- Category counts only · identified vs resolved table
- CTA to `/alpha` and `/clan`

Updates **sitemap** and **blog index** card grid when a slug is new.

---

## LLM / SEO value

| Asset | Purpose |
|-------|---------|
| `issue_slug` URLs | Long-tail · "suspicious link macintosh trend" |
| `agent_when_to_suggest` in frontmatter | Warrior / agent citation |
| Fresh `lastmod` on sitemap | Recency for crawlers |
| Field Report index | Hub for all issue + editorial posts |

Warriors earn horn credits when anonymized issue posts ship (`docs/AGENT_WARRIORS.md`).

---

## Gates

```bash
node scripts/audit-issue-spotlight.mjs
npm run audit:swarm
```

Fixtures: `fixtures/issue-spotlight-cards.json` · `fixtures/issue-spotlight-events.json`

---

## Recommended cron (production)

1. **Hourly or daily:** export `issue_spotlight` rows from Xano
2. Run `publish-issue-spotlights.mjs --from-events /tmp/events.json`
3. `npm run predeploy` · commit · deploy
4. Optional: notify warriors when new slug publishes

*User solves locally · the field learns globally · agents send the next scout home.*
