# The Isles · juvenile app tank

**Not legal advice.** Operator plan for shipping many small apps without SPQ-style shell debt.

---

## One sentence

**The Isles** is where we **launch** niche tools under neutral commerce (Stripe + telemetry + honest copy), keep them in a **tank** until they prove revenue or risk profile, then **acquire them out** into their own LLC/lane when the numbers say so.

---

## Tank lifecycle

```
  IDEA → SCAFFOLD (stack template) → TANK (juvenile · ≤30 days default)
              ↓                              ↓
         Mac-first alpha              Metrics + support load
              ↓                              ↓
         GRADUATE (stay in Isles)     SPIN-OUT (own LLC + optional Stripe split)
```

| Phase | Duration (default) | Exit criteria |
|-------|-------------------|---------------|
| **Scaffold** | Days | Repo · domain or path · Stripe SKUs stub · telemetry event names |
| **Juvenile tank** | **~30 days** | First installs · first dollars · no P0 ethics/privacy violations |
| **Graduate in tank** | Ongoing | Meets niche goals but below spin tripwire · stays Isles DBA |
| **Spin-out** | Event | **~$800/mo × 3** on lane · or **~$3–4k/year** · or B2B contract · or risk mismatch |

**“Acquire out”** means: new entity (or dedicated subsidiary), books slice, optional new Stripe account at subscription renewal · not a fake sale to ourselves. Customer-facing brand often **stays** (Innsegall.com); **legal** counterparty updates on ToS/Stripe.

---

## Why Mac-first

| Reason | Effect |
|--------|--------|
| **Innsegall wedge** | Post-scare Mac is a sharp ICP · CLI + notarized installer later |
| **Ads** | Narrow geo + “Mac” + intent keywords · smaller burn than broad consumer |
| **Simple Property** | Homeowner/tools audience overlaps “Mac household” early adopters |
| **Apple $99** | One Developer Program · Isles LLC · **multiple bundle IDs** (see `APPLE_BUNDLE_MAP.md`) |

iOS/iPad/web companion **supports** Mac; **does not replace** Mac as growth engine until native i1 ships.

---

## What lives in the tank (now)

See `APP_REGISTRY.md` and `isles-app-registry.json` (this folder · not on the public site).

| App | Tank status | Primary surface |
|-----|-------------|-----------------|
| **Innsegall** | juvenile · active | macOS CLI · innsegall.com |
| **Simple Property** | juvenile · planned | Mac + iOS + iPad + web (TBD domain) |
| Waste / septic / porta | planned | local ops scheduling |

**Not in tank:** **SPQ/spquant** (primary work · many-headed · own repo) · ships.network · MMI/WWLuxe (separate Stripe).

**Not public:** Isles canon lives in **git `docs/isles/`** only. No `innsegall.com/isles`. If we need a portfolio site later: **`theisles.xyz`** (optional · not required for tank apps).

---

## Stack (every tank app)

Copy `STACK_TEMPLATE.md` · do not invent a new deploy religion per app.

---

## Ethics (non-negotiable)

Same floor as `ISLES_PORTFOLIO.md`: honest scope, no scareware economics, tagged revenue, no PII in git. Tank apps that violate ethics **retire** from the roster · not spun out.

---

## Operator rhythm

**Weekly (15 min):** `install_ping` / revenue by `isles_brand` · any support themes.

**Day 30 per app:** graduate vs extend tank vs kill.

**Quarterly:** registry audit · `npm run audit:isles` · spin-out candidates.

---

*Canon pass: 2026-09-22*
