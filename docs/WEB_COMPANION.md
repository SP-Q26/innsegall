# Web companion · iPhone & iPad (no App Store)

**URL:** https://innsegall.com/companion  
**Shipped:** i0.5 web · microbrew distribution · **no** Apple Developer Program required.

## What it is

A **local-first inbox** in the browser for `innsegall-battle-scout-ai/v1` JSON from your Mac Battle Scout. Same triage badge mental model as the future native app · **no on-device scout** · **no upload** to Innsegall servers.

## Install (1 tap)

1. Open **/companion** in Safari on iPhone or iPad.
2. **Share → Add to Home Screen**.
3. Optional: import the [sample JSON](https://innsegall.com/samples/battle-scout-ai-v1.sample.json) to try the inbox.

## Mac workflow

1. `innsegall run` on the Mac · **Copy for LLM** or export JSON from the Battle Scout footer.
2. AirDrop, Notes, or paste into the companion import field on phone/tablet.

## Privacy

- Reports live in **localStorage** on that browser only (max 48 cards).
- Clearing site data removes the inbox.
- Not antivirus · does not scan the phone.

## Audits

```bash
node scripts/audit-companion-web.mjs
npm run audit:swarm   # includes companion lane
```

## Native app (later)

When Apple enrollment happens, TestFlight app can reuse the same schema and inbox UX · see [`IOS_PRODUCT.md`](./IOS_PRODUCT.md). **App Store optional** · web companion remains supported.

## Related

- [`IOS_PRODUCT.md`](./IOS_PRODUCT.md) · i1 native target  
- [`APPLE_DEVELOPER_ID.md`](./APPLE_DEVELOPER_ID.md) · Mac L5 + optional native iOS  
