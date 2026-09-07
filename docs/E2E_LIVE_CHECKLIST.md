# Live E2E checklist · $4.20 toll gate

**Purpose:** Prove production Stripe → license → import → panic scout on a real Mac.

---

## Preconditions

- [ ] `STRIPE_SECRET_KEY` live in Vercel  
- [ ] `STRIPE_WEBHOOK_SECRET` set · webhook endpoint active  
- [ ] `innsegall` alpha installed on Mac (`curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash`)  
- [ ] Welcome scout already used OR test on off-voyage day  

---

## Steps

1. Open [innsegall.com/#pricing](https://innsegall.com/#pricing)  
2. Click **One panic scout · $4.20** · complete Stripe Checkout (live card)  
3. Land on `/success?session_id=…`  
4. **Take your writ** → save as `~/Downloads/innsegall-license.json`  
5. Terminal:
   ```bash
   innsegall plan --import-license ~/Downloads/innsegall-license.json
   innsegall plan
   ```
   Expect extra credit visible.  
6. Off-voyage day:
   ```bash
   innsegall run
   ```
   Battle Scout opens · verdict renders.  
7. Optional: tap **Copy Battle Scout for AI** · paste into assistant.

---

## Automated probes (no charge)

```bash
npm run smoke:live
node scripts/dry-test-license.mjs
```

---

## Rollback

- Stripe Dashboard → refund only if license not delivered  
- Per Terms: extra run **final** after `license.json` delivery  

*Operator canon · Phase 3.*
