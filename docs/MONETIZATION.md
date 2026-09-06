# Innsegall · Monetization & quota enforcement

**Pricing (locked alpha)**

| Tier | Price | What you get |
|------|-------|----------------|
| **Free** | $0 | 2 **Voyages** per month · auto on the **1st** and **15th** |
| **Extra scout** | **$4.20** one-time | +1 run anytime (panic link, extra check) |
| **Clan** | **$6.67/mo** | 5 seats · **unlimited** scouts · share Battle Scouts |

Clan at $6.67 for a household is intentionally a steal · land MSP/family wedge early.

---

## How you get paid (phases)

### Phase 0 · Alpha now (Stripe Checkout)

Paid tier is **self-serve** · no email receipt step.

| Channel | How |
|---------|-----|
| **Extra run** | Site CTA → `POST /api/stripe/checkout` (`sku: extra`) → Stripe Checkout **$4.20** → `/success` → download signed `license.json` → `innsegall plan --import-license` |
| **Clan** | Site CTA → Checkout **$6.67/mo** subscription → webhook issues clan license (5 seats) → same import path · renewals via webhook |
| **MSP pilot** | 10-seat bundle later · not alpha |

**Operator override (support only):** `innsegall plan --credit 1` or `--clan` on a user's Mac if Stripe/webhook failed · not the default path.

**No cloud account required for free tier** · keeps privacy story true.

```
User clicks "Extra run" on site
    → Stripe Checkout ($4.20)
    → Webhook → license API
    → Signed license.json downloaded or pasted
    → innsegall plan --import-license <file>
```

```
User clicks "Bring your clan"
    → Stripe Subscription ($6.67/mo)
    → Webhook sets plan=clan + seat_count=5
    → License refresh monthly
```

**Stack:** Stripe Checkout + Customer Portal · Vercel serverless on `innsegall.com/api/stripe` (separate from SPQ) · HMAC license via `INNSEGALL_LICENSE_SECRET` · no user card data on Mac.

See `STRIPE_ASAP.md` and `LAUNCH_CHECKLIST.md` for deploy + test card **4242**.

### Phase 1 · Expand revenue

| Lane | Model |
|------|--------|
| **Family** | Clan plan (primary) |
| **MSP / IT** | Per-seat $2–4/mo · white-label Battle Scout |
| **Beacon** | Human Parley · revenue share |
| **Intel** | Field Glass B2B · not consumer PII |

Long-term: **MSP seats** > one-off $4.20. Alpha $4.20 is panic monetization + habit.

---

## Enforcement model

### What runs today (local)

| File | Role |
|------|------|
| `~/Library/Application Support/Innsegall/quota.json` | Plan, voyage slots, extra credits |
| `license.json` | Stripe-signed plan + credits |

**Free tier rule:**

1. **Voyage** on calendar **1st** and **15th** · updates Voyage chart · counts as included scout
2. Any **manual** `innsegall run` when both voyages are used → needs **extra credit** ($4.20) or **clan**
3. **Clan** · unlimited · `innsegall plan --clan` or env `INNSEGALL_CLAN=1` (alpha)

Local files can be edited by determined users · alpha accepts that. **Paid enforcement = signed license from Stripe webhook**, not honor system.

### Auto-run on 1st & 15th (Macintosh)

```bash
# Install schedule (once)
innsegall voyage --install-schedule

# Manual voyage today (only on 1st or 15th unless --force)
innsegall voyage
```

Uses **launchd** · runs `innsegall voyage --quiet --open` at 10:00 local on days 1 and 15 · saves card · refreshes chart · **Battle Scout** opens in your browser.

### Quota decision tree

```
innsegall run / voyage
    │
    ├─ clan plan? ──► allow
    ├─ smoke/force? ──► allow (dev)
    │
    ├─ today is 1 or 15 AND slot not used? ──► allow (voyage)
    │
    ├─ extra_credits > extra_used? ──► allow (consume credit)
    │
    └─ else ──► block · message with $4.20 + clan + next voyage date
```

---

## Operator commands (alpha)

```bash
innsegall plan                    # show status
innsegall plan --clan              # after clan payment
innsegall plan --credit 1          # after $4.20 payment (you grant)
innsegall plan --free              # reset free tier
innsegall voyage                   # scheduled hygiene + chart
innsegall voyage --install-schedule
```

---

## Site CTAs → money

| CTA | Backend |
|-----|---------|
| Extra run · $4.20 | `POST /api/stripe/checkout` → Checkout → `/success` → `license.json` |
| Bring your clan · $6.67 | Same API · subscription mode · Customer Portal for cancel |
| Pricing FAQ | On index · quota block links here |

---

## What to build next (priority)

1. **Live mode** · swap test keys when LLC/EIN ready (`LAUNCH_CHECKLIST.md` §6)
2. **Clan seats** · 5 device tokens in license (Phase 2)
3. **Notarized app** · license in Keychain
4. **MSP bundle** · per-seat pricing

---

*Two voyages a month · chart tells the story · panic pays $4.20 · families pay $6.67.*
