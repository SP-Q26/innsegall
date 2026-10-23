# Xano pastes · copy-paste files

Operator-only · paste into Xano editor · not executed by CI.

| File | Use |
|------|-----|
| [`innsegall-events-post.xs`](./innsegall-events-post.xs) | **POST `/innsegall/events`** · full stack: API-key auth precondition · event whitelist · forbidden payload keys · `db.add` |
| [`innsegall-issue-spotlight-get.xs`](./innsegall-issue-spotlight-get.xs) | **GET `/innsegall/issue_spotlight`** · export recent `issue_spotlight` rows for `npm run flywheel:issue-spotlight` |

**Canonical guide:** [`../XANO_PASTES.md`](../XANO_PASTES.md) · keys checklist [`../XANO_KEYS_LEFT.md`](../XANO_KEYS_LEFT.md)

**Auth:** `X-API-Key` header must match Xano env `sk_live_innsegall_ops_` (and optionally `sk_test_innsegall_ops_`). Vercel `XANO_API_KEY` sends the same secret value.

**Allowed events (fifteen):** `install_ping` · `scout_aggregate` · `marketing_ping` · `issue_spotlight` · `checkout_intent` · `install_intent` · `packet_bar_copy_link` · `packet_bar_copy_ai_paste` · `packet_bar_share_html` · `packet_bar_pdf` · `checkout_complete` · `checkout_abandoned` · `clan_subscription` · `clan_renewal` · `payment_failed`
