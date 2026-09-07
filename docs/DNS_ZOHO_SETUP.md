# DNS + Zoho Mail · innsegall.com

**Forked from:** SPQ `docs/house-call/DOMAIN_AUDIT.md` · operator paste for Monday morning.

Domain is **registered**. This doc wires **Vercel SSL** + **hello@innsegall.com**.

---

## 1 · Vercel domain attach

1. Vercel → Innsegall project → **Settings → Domains**
2. Add `innsegall.com` and `www.innsegall.com`
3. Vercel shows required DNS records (confirm against table below)

`web/vercel.json` already redirects **www → apex**.

---

## 2 · Namecheap (or registrar) DNS

| Host | Type | Value | Purpose |
|------|------|-------|---------|
| `@` | **A** | `76.76.21.21` | Apex → Vercel |
| `www` | **CNAME** | `cname.vercel-dns.com` | www → Vercel |

**TTL:** Automatic or 300s during cutover.

Wait 5–30 min · Vercel shows **Valid Configuration** + SSL issued.

**Smoke after SSL:**

```bash
npm run smoke:live
# or: node scripts/smoke-live.mjs --base=https://innsegall.com
```

---

## 3 · Zoho Mail · hello@innsegall.com

1. Zoho Mail → add domain **innsegall.com**
2. Create mailbox **hello@** (or alias to your main inbox)
3. Zoho provides MX / SPF / DKIM records · add at registrar:

Typical Zoho MX (verify in Zoho UI · values change by region):

| Host | Type | Priority | Value |
|------|------|----------|-------|
| `@` | MX | 10 | `mx.zoho.com` |
| `@` | MX | 20 | `mx2.zoho.com` |
| `@` | MX | 50 | `mx3.zoho.com` |

**SPF** (TXT on `@`):

```text
v=spf1 include:zoho.com ~all
```

**DKIM:** Zoho gives `zoho._domainkey` TXT · paste exactly.

**DMARC** (optional P1, TXT `_dmarc`):

```text
v=DMARC1; p=none; rua=mailto:hello@innsegall.com
```

4. Verify domain in Zoho · send test to hello@ from Gmail
5. Site mailto links already use `hello@innsegall.com` (privacy · warriors · Parley escalation)

**Do not** point MX at Vercel · email is Zoho only.

---

## 4 · Optional records

| Record | When |
|--------|------|
| `getinnsegall.com` redirect | Marketing alias · P2 |
| GitHub Pages / docs subdomain | Not needed alpha |
| Stripe DKIM | Stripe Dashboard if using custom receipt domain · P2 |

---

## 5 · Verification checklist

- [ ] `https://innsegall.com/` loads · CSS v8
- [ ] `https://www.innsegall.com/` redirects to apex
- [ ] `/scripts/innsegall-alpha-install.sh` returns 200
- [ ] `/.well-known/innsegall-gospel.json` returns 200
- [ ] Inbound mail to hello@ works
- [ ] Outbound from hello@ (Zoho) not spam-foldered on first send

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| SSL pending | DNS propagation · remove conflicting A/CNAME at registrar |
| www cert error | Ensure www CNAME only · not A record |
| Mail not arriving | MX priority · SPF include · wait 1h propagation |
| Zoho verify fails | Turn off email forwarding at registrar if enabled |

*Mist lifts when DNS and the horn share one name.*
