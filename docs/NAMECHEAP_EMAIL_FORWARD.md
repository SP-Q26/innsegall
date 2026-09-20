# Namecheap email forwarding · innsegall.com

**Use when:** you want `hello@` / `horn@` to land in an inbox you already read · no Zoho mailbox yet.

**Limit:** forward only · you usually **cannot send as** `@innsegall.com` from Gmail without a real mailbox or SMTP later.

---

## Steps (~5 min)

1. Log in to **Namecheap** → **Domain List** → **Manage** next to `innsegall.com`.
2. Open **Redirect Email** (sometimes under **Domain** → **Redirect Email** or **Email Forwarding**).
3. Add forwards:

   | Alias | Forward to |
   |-------|------------|
   | `hello` | your real inbox (Gmail, etc.) |
   | `horn` | same inbox (optional · warriors brand) |

4. Save · wait up to **30–60 minutes** (often faster).
5. Test: send from an external address to `hello@innsegall.com` · confirm it arrives.

---

## Do not break the site

- **Do not** add MX records for forwarding if Namecheap’s UI does it automatically for “Redirect Email” only.
- **Website DNS stays on Vercel** (`@` A `76.76.21.21`, `www` CNAME) · see `DNS_ZOHO_SETUP.md` §2.

---

## Later (send as @innsegall.com)

When you need **outbound** from `hello@` (Stripe support, replies): Zoho or Google Workspace + MX · `DNS_ZOHO_SETUP.md`.

---

*Forward now · full mailbox when live weekend needs send-as.*
