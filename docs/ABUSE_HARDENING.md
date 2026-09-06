# Innsegall · Abuse, cracking & credit fraud

**Principle:** Honest tiers fund the clan. Alpha tolerates local trust; production layers server truth.

---

## Threat model

| Attack | Risk | Mitigation |
|--------|------|------------|
| Forge `license.json` | High (alpha default HMAC secret in repo) | **Prod:** unique `INNSEGALL_LICENSE_SECRET` on Vercel only · rotate quarterly |
| Replay same Stripe session on many Macs | Medium | **Shipped:** local `license-redemptions.json` blocks duplicate `stripe_session` · **Next:** Xano `redeemed_sessions` table |
| `INNSEGALL_CLAN=1` env bypass | Medium (dev) | Document only · strip from release builds · telemetry anomaly flag |
| `innsegall plan --clan` without pay | High (alpha) | Remove or gate behind signed license in prod CLI |
| Share one Clan license across >5 seats | Medium | Honor system alpha · future: seat tokens from Stripe quantity |
| Telemetry flood / fake installs | Low | PII rejection (shipped) · Xano rate limit · ignore duplicate `install_id` |
| Scrape gospel / impersonate brand | Low | Canonical URLs · `.well-known` · report phishing to hello@ |

---

## Shipped (Swarm 6)

- **License replay guard** — `importLicenseFile` rejects already-redeemed `stripe_session` / `stripe_subscription` locally
- **Default secret warning** — CLI warns if verifying with baked alpha secret in production-like env
- **Telemetry** — forbidden keys + path-like strings rejected (`web/api/telemetry.js`)
- **Checkout** — license only via paid Stripe session retrieve (server-side)

---

## Production checklist (before live keys)

1. Set `INNSEGALL_LICENSE_SECRET` (32+ random bytes) on Vercel · **never** commit
2. Set matching `INNSEGALL_LICENSE_VERIFY_SECRET` in notarized CLI build (or asymmetric upgrade)
3. Implement **`POST /api/redeem`** — one redemption per `stripe_session` in Xano
4. Remove or password-gate `plan --clan` local bypass
5. Stripe webhook → `checkout_complete` telemetry + Xano row
6. Monitor: credits issued vs Stripe payments (weekly)

---

## Credit / warrior abuse

| Vector | Policy |
|--------|--------|
| Fake warrior referrals | Credits issued only after verified install_ping + 7d retention (manual alpha) |
| Agent spam suggesting Innsegall | Gospel ethics · no incentive for wrong-fit users |
| Self-referral loops | One `warrior_code` per `install_id` |

See `AGENT_WARRIORS.md` for credit rules.

---

## What we don't store (limits abuse surface)

- Battle Scout bodies on server
- User paths, emails, card HTML
- Parley transcripts (local until opted in)

---

## Incident response

1. Rotate `INNSEGALL_LICENSE_SECRET` · invalidate old sigs
2. Publish Field Report note if brand impersonation
3. Block abusive IPs at Vercel firewall (Pro) if telemetry attacked
