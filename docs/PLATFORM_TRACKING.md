# Platform tracking · Innsegall (no ad pixels)

**Goal:** Know which pages and channels drive installs and clan signups **without** third-party analytics.

---

## Design principles

| Principle | Implementation |
|-----------|----------------|
| No Google/Meta pixels | v0.1 promise in privacy |
| No PII in payloads | Page category + channel enum only |
| Client never hits Xano | `POST /api/telemetry` → Vercel → Xano |
| Once per page per day | `sessionStorage` dedupe in `innsegall-nav.js` |
| Operator truth in Xano | Aggregate by `day` · `event` · `payload.page` |

---

## Event · `marketing_ping`

Fired from `web/innsegall-nav.js` on marketing pages.

```json
{
  "event": "marketing_ping",
  "payload": {
    "day": "2026-09-09",
    "page": "clan",
    "ref_channel": "search",
    "session_id": "uuid-v4",
    "warrior_ref": "warrior_demo"
  }
}
```

### `page` (enum)

`home` · `alpha` · `guide` · `map` · `boat` · `clan` · `warriors` · `blog` · `blog_post` · `privacy` · `tos` · `success` · `other`

### `ref_channel` (enum)

| Channel | Detection |
|---------|-----------|
| `direct` | No referrer |
| `search` | Google, Bing, DuckDuckGo, etc. |
| `agent` | ChatGPT, Claude, Perplexity, Copilot user agents |
| `social` | Twitter/X, Reddit, Facebook, LinkedIn |
| `warrior` | `?ref=warrior_*` query |
| `internal` | Same-site navigation |
| `unknown` | Everything else |

`warrior_ref` is set only when `ref_channel === "warrior"`.

---

## Xano operator checklist

1. Paste **`docs/pastes/innsegall-events-post.xs`** into `POST /innsegall/events` (includes `marketing_ping` in whitelist + API-key auth precondition)
2. Set Xano env `sk_live_innsegall_ops_` (+ optional `sk_test_innsegall_ops_`) and matching Vercel `XANO_API_KEY` (see `XANO_KEYS_LEFT.md`)
3. Publish Xano draft → live · redeploy Vercel after env change
4. `npm run smoke:xano` (direct + prod telemetry)

---

## Queries (examples)

**Daily uniques by page (approx):**

```sql
SELECT day, payload->>'page' AS page, COUNT(*) AS pings
FROM innsegall_events
WHERE event = 'marketing_ping'
GROUP BY day, payload->>'page'
ORDER BY day DESC, pings DESC;
```

**Agent vs search vs warrior (channel mix):**

```sql
SELECT day, payload->>'ref_channel' AS channel, COUNT(*)
FROM innsegall_events
WHERE event = 'marketing_ping'
GROUP BY day, channel;
```

**Funnel proxy (same day):**

Join `marketing_ping` page=`alpha` with `install_ping` counts · not 1:1 (install is CLI) but directionally useful.

---

## Related events

| Event | Source | Use |
|-------|--------|-----|
| `install_ping` | CLI | Beachhead install count |
| `scout_aggregate` | CLI | Category buckets · product quality |
| `checkout_complete` | Stripe | Revenue |
| `clan_subscription` | Stripe | MRR |
| `marketing_ping` | Site nav | Top-of-funnel |
| `issue_spotlight` | CLI after scout | Issue identify/resolve · blog flywheel (`ISSUE_SPOTLIGHT_LOOP.md`) |

---

## Privacy copy

Documented in `privacy.html` §4: anonymous page-category pings · no ad trackers.
