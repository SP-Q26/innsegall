# LLC state · Delaware vs Wyoming (not legal advice)

**Short answer for Innsegall today:** If you're **solo, bootstrapping, not raising VC in the next 12 months**, **Wyoming** or your **home state** usually beats Delaware. If you're **raising institutional money soon**, talk to a lawyer about **Delaware C-Corp**, not an LLC.

Consult a CPA or attorney licensed in your state before filing. Stripe does not require an LLC to go live.

---

## Comparison

| | **Wyoming LLC** | **Delaware LLC** | **Home state LLC** |
|--|-----------------|------------------|---------------------|
| **Filing cost** | Low (~$100) | ~$90 + higher ongoing | Varies |
| **Annual fees** | ~$60 | ~$300 min franchise tax | Varies |
| **Privacy** | Strong (common for small internet cos) | Moderate | Varies |
| **Investor expectation** | Neutral for LLC | Strong for **C-Corp**, not LLC | Neutral |
| **Case law** | Good | Excellent (if you litigate) | State-dependent |
| **"No state income tax"** | WY only if **no nexus elsewhere** | DE only if no nexus elsewhere | You pay where you live/work |

**Myth:** Wyoming does **not** let you avoid income tax in the state where you actually live and run the business. You still file (and often pay) where you are.

---

## When Wyoming makes sense

- Single-member or small family SaaS
- No immediate VC · Stripe + Vercel + you at a laptop
- You want low fees + simple annual report
- You're okay registering as a **foreign LLC** in your home state if required (many states require this if you "do business" there)

---

## When Delaware makes sense

- You're forming a **C-Corp** for a priced round
- Lawyers/investors already said "DE C-Corp"
- You expect complex equity, board, or acquisition in DE-friendly courts

**Delaware LLC** alone is a common mistake for tiny SaaS — you pay DE fees **and** often home-state foreign LLC fees without the VC benefits of a DE corp.

---

## Practical path for Innsegall

1. **Stripe tonight:** Start as **individual** or existing entity · add LLC later in Stripe Settings → Business details.
2. **LLC this week:** If no VC plan → **Wyoming LLC** *or* **home state** (simplest compliance if you only work from one state).
3. **EIN:** Free from IRS after LLC approval · needed for business bank account.
4. **Bank:** Mercury/Brex/etc. · connect to Stripe.

---

## After LLC

- Update Stripe business name + EIN
- Update `innsegall.com` privacy/tos entity name
- Optional: `hello@` only for legal/support · **not** required for payments

---

*Entity choice is tax and liability · payment flow is Stripe + license file regardless.*
