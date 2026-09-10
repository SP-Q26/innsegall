# Xano pastes · copy-paste files

Operator-only · paste into Xano editor · not executed by CI.

| File | Use |
|------|-----|
| [`innsegall-events-post.xs`](./innsegall-events-post.xs) | **POST `/innsegall/events`** · full stack: API-key auth precondition · event whitelist · forbidden payload keys · `db.add` |

**Canonical guide:** [`../XANO_PASTES.md`](../XANO_PASTES.md) · keys checklist [`../XANO_KEYS_LEFT.md`](../XANO_KEYS_LEFT.md)

**Auth:** `X-API-Key` header must match Xano env `sk_live_innsegall_ops_` (and optionally `sk_test_innsegall_ops_`). Vercel `XANO_API_KEY` sends the same secret value.

**Allowed events (seven):** `install_ping` · `scout_aggregate` · `marketing_ping` · `issue_spotlight` · `checkout_complete` · `clan_subscription` · `clan_renewal`
