# Isles portfolio · entity ladder · clean-room ethics

**Not legal advice.** Operator canon for how we ship micro-niche products under one umbrella until money says split.

**Launchpad (tank model):** [`docs/isles/LAUNCHPAD.md`](./isles/LAUNCHPAD.md) · registry · Mac-first GTM · **~30-day juvenile tank** · spin-out when revenue/risk tripwire hits.

**Visibility:** **Internal only** (git `docs/isles/`). No `innsegall.com/isles`. If we ever need a public portfolio hub: **`theisles.xyz`** (not live).

**Related:** `docs/isles/README.md` · `LLC_NOTES.md` · `STRIPE_CATALOG_STATE.md` · `AI_HANDOFF_ONBOARDING.md` · `CODE_OF_CONDUCT.md` · `STABILITY.md`

---

## Why this exists

**The Isles** is our **launchpad**: juvenile **app tanks** for Innsegall, Simple Property, waste/septic/porta, and similar Mac-first niches. We build on a **repeatable stack** (site + checkout + telemetry + honest copy), **acquire apps out** of the tank into their own lanes when money says so, and stay **acquirable** · no skeletons.

**Long game (personal):** portfolio revenue funds **own infra** later · solar, ESS, standalone servers, **ships.network**.

**SPQ / spquant.com** is its own beast (many heads) · **primary engineering home** · not in the juvenile tank · does not use Isles public pages.

---

## Entity model · Collective + DBA

| Layer | What it is | Today |
|-------|------------|--------|
| **The Isles Collective** | **Commerce / holding** entity · one Stripe account · receipts **Isles Co** | **Active** · nominal acquisition ($1) · match Apple + bank to this legal name |
| **DBA / trade names** | Customer-facing brands · separate domains · TOS/privacy per product | **Innsegall** first · Simple Property · waste/septic/porta lanes **planned** |
| **MMI (A Space Odyssey LLC)** | **Separate** · Whispering Woods Luxe / events / keepsakes | **Do not** mix Innsegall checkout onto MMI Stripe |

**Stripe:** Business profile = **The Isles Collective** (live account). Product line items carry brand DBAs (Innsegall, Simple Property, …). See `STRIPE_CATALOG_STATE.md` · `STRIPE_ASAP.md`.

**DBA ≠ liability firewall.** One LLC still shares legal shell until you **spin out**. DBAs give **neutral branding**, **separate customer promises**, and **clean revenue tags** for accounting and buyers.

---

## Product lanes (portfolio map)

| Lane | Brand / DBA | Domain (target) | Risk profile | Status |
|------|-------------|-----------------|--------------|--------|
| Post-scare Mac triage | **Innsegall** | innsegall.com | Security-adjacent · honesty-critical | **Alpha** · this repo |
| Property / simple tools | **Simple Property** (working name) | TBD | Ops / homeowner tools | Planned |
| Roll-off / septic / porta | TBD DBAs | TBD | Scheduling · local service | Planned |

**Stack pattern:** static or WeWeb/Vercel site · **shared** Isles `STRIPE_SECRET_KEY` · **per-app** webhooks + price env · webhook → license or provision · Xano filters on `isles_brand` · metadata **per product** (`innsegall_sku`, `simple_property_sku`, etc.). **Checkout branding gameplan:** `isles/SHARED_STRIPE_CHECKOUT_BRANDING.md`.

**Bundling for exit:** acquirers want **SKU-level ARR**, not one blended story. Tag every payment in Stripe metadata + Xano from day one.

---

## When to split (spin-out LLC)

Split **as soon as money says the risk is worth separating** · not on day zero, not after a lawsuit.

| Tripwire | Meaning | Typical action |
|----------|---------|----------------|
| **~$800/mo sustained** (e.g. 3 months) on one lane | Real recurring product · support + liability matter | **Product LLC** (or dedicated subsidiary) · consider **separate Stripe account** at renewal boundaries |
| **~$3–4k/year** on one lane (even if choppy) | Not a one-off · worth its own books | File entity if not done · tighten ToS entity name · CPA slice |
| **First B2B contract** that names an entity (MSP, property mgmt, waste hauler) | Counterparty diligence | Match **legal name on contract** to Stripe · spin if Isles is too muddy |
| **Materially different risk** (e.g. Innsegall vs septic scheduling) | One bad line shouldn’t empty the whole portfolio | Spin the **hot** lane first |

**Principle:** immoral shortcuts can raise capital fast; we **don’t** take that trade. Clean split when revenue justifies it so **one product’s mess doesn’t attach to the rest** · and so buyers don’t inherit hidden debt.

---

## Ethics · legal care · moral floor

We aim to be **legal, fair, and boring in the books** · not merely “not caught yet.”

### Product promises

- **Say what the software does and does not do** (Innsegall: read-only scout · not AV · not 100% safe).
- **No fear marketing** · no fake infections · no offshore scareware numbers (gospel `forbidden` · `AI_HANDOFF_ONBOARDING.md`).
- **AI paste:** triage from **evidence only** · `innsegall-battle-scout-ai/v1` · no inventing malware.

### Data & privacy

- Battle Scouts stay **local** unless the operator exports them.
- Telemetry: **category counts / install pings** · opt-out supported · not selling scout contents (`docs/STABILITY.md` · `audit-privacy` lane).
- **No personal PII in git** (operator emails, machine `.lan` commits) · repo hygiene is ethics hygiene.

### Money

- **Signed licenses** · replay resistance · no operator `--credit` in distributed builds without `INNSEGALL_OPERATOR`.
- Stripe: real SKUs · real webhooks · license API matches session shape (`audit-abuse` · `audit-stripe`).
- Report income honestly; entity choice is CPA/lawyer, not “hide it in metadata.”

### Conduct

- `CODE_OF_CONDUCT.md` for contributors; **hello@innsegall.com** for users.
- Competitor lane: we compete on **honest evidence**, not PUP patterns (`COMPETITOR_LANE.md`).

### Repo gates (audit yourself)

```bash
npm run audit:swarm          # full lanes incl. privacy, abuse, stripe, AI handoff
npm run audit:discovery      # trust surfaces + ISLES_PORTFOLIO canon
node scripts/audit-isles-ethics.mjs
```

---

## Innsegall · Stripe operator truth

- **Target account:** **The Isles Collective** (test/live IDs in `STRIPE_CATALOG_STATE.md`).
- **Branding:** Innsegall on Checkout line items · **Isles Co** on card statements · Collective on Stripe business profile.
- **Live webhook:** finish per `STRIPE_LIVE_FLIP.md` before taking money.

---

## Sister bets (not Isles lanes)

| Project | Role | Note |
|---------|------|------|
| **SPQ / spquant.com** | **Primary engineering focus** · many-headed product | **Not** a tank app · own repo/ops · Isles docs do not market SPQ |
| **ships.network** | Next-tier infra / network bet | Long horizon · funded by portfolio + SPQ recovery |

Isles micro-SaaS does **not** block SPQ work; it **shouldn’t** duplicate SPQ’s WeWeb/git skeleton problems. One clean lane at a time.

---

## Operator checklist · before first Isles dollar

1. [ ] Stripe business profile = **The Isles Collective** (legal name matches filings).
2. [ ] DBA registered when required in your state (often after revenue, not before · confirm locally).
3. [ ] Live webhook + `INNSEGALL_LICENSE_SECRET` rotated on Vercel prod.
4. [ ] `innsegall.com` privacy/tos entity name matches Stripe profile.
5. [ ] Product metadata on every SKU for later spin-out reporting.
6. [ ] Tripwire calendar reminder: review split at **$800/mo** or **~$3–4k/year** per lane.

---

## Doc drift

When entity status changes, update **this file** and the **Operator truth** block at the top of `STRIPE_CATALOG_STATE.md`.

*Last canon pass: 2026-09-22 · operator + agent aligned on Isles + DBA, split on revenue/risk, no skeleton strategy.*
