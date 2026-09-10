# Clan seat redeem · design only (Phase 7b)

**Status:** design doc · **no** live `POST /api/redeem` until abuse lane + operator sign-off.

## Problem

Clan plan promises **5 seats** · alpha fulfills quota via signed `innsegall-license.json` after Stripe. We need a path for **seat invites** without sharing one license file or enabling credit farming.

## Non-goals (wave 1)

- No public redeem endpoint in `web/api/` until `INNSEGALL_ALLOW_REDEEM_API=1` in Vercel **and** swarm `audit-redeem-api` passes.
- No email-less magic links stored in git.
- No transfer of horn credits between warriors.

## Proposed shape (wave 2b)

| Piece | Role |
|-------|------|
| `seat_token` | Single-use HMAC · clan owner mints in dashboard (future) or operator CLI |
| `POST /api/redeem` | Body `{ token }` · returns **new** scoped license payload · binds to device id hash |
| Xano `redeemed_sessions` | Replay guard for Stripe + redeem tokens (see `FULL_SWARM_AUDIT.md`) |
| Abuse | Rate limit per IP · token TTL · max 5 active seats per clan subscription id |

## Client today

- **Extra run:** Stripe checkout → `innsegall plan --import-license`
- **Clan:** Stripe subscription → license with `plan: clan` · seats enforced locally until server ledger ships

## Agent / support

- Direct operators to `hello@innsegall.com` for seat disputes during alpha.
- Never ask users to paste license secrets in chat.

## Swarm

- `audit-redeem-design.mjs` · doc exists · no `web/api/redeem.js`
- When implemented · add `audit-redeem-api.mjs` per `PHASE_8_SWARM_PLAN.md`
