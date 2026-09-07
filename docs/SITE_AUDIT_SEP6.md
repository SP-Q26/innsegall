# Site audit · full · Sep 6 night

**CSS:** v8 · **Pages:** 20 HTML · **Blog:** 9 posts · **Gate:** `npm run preflight` (audit-launch includes claymore)  
**Strategy:** `NORTH_STAR_AUDIT.md` · stay the course · no pivot

---

## Scorecard

| Area | Score | Notes |
|------|-------|-------|
| Brand / voice | 8.5 | Send the scout · claymore · Vinland |
| Homepage | 8.5 | Lay of the land · gospel embed · FAQ schema |
| Alpha / install | 9.0 | curl script · field manual |
| Legal | 8.5 | TOS refunds · privacy local-first |
| Blog / SEO | 8.0 | sitemap · no OG PNG yet |
| Pricing / Stripe UI | 8.0 | Checkout JS · 503 until env |
| AI discoverability | 9.5 | llms.txt · gospel · **ai-bus** (6 marketing pages) · scout-data · ai-paste |
| Accessibility | 7.5 | skip links · some contrast OK |
| Mobile | 8.0 | responsive tokens |
| **Live deploy** | 0 | Not on innsegall.com yet |

**Overall site: 8.4/10 (repo) · N/A live until Vercel**

---

## Page inventory

| URL | File | Status |
|-----|------|--------|
| `/` | index.html | ✅ v8 · gospel |
| `/alpha` | alpha.html | ✅ install |
| `/guide` | guide.html | ✅ |
| `/map` | map.html | ✅ |
| `/boat` | boat.html | ✅ competitor |
| `/clan` | clan.html | ✅ |
| `/warriors` | warriors.html | ✅ |
| `/privacy` | privacy.html | ✅ |
| `/tos` | tos.html | ✅ |
| `/success` | success.html | ✅ license |
| `/blog/*` | 9 + index | ✅ |
| `/llms.txt` | llms.txt | ✅ synced |
| `/.well-known/innsegall-gospel.json` | ✅ synced |
| `/innsegall-ai-bus.json` | ✅ synced · embedded on index · alpha · guide · boat · clan · warriors |

---

## CTA audit

| Rule | Status |
|------|--------|
| Primary: **Send the scout** | ✅ |
| Header: text nav only | ✅ |
| Hero: one horn button | ✅ |
| Sound the Horn = escalation | ✅ |
| Marketing **AI-bus** | ✅ `#innsegall-ai-bus` on key pages |
| Copy for AI (Battle Scout) | ✅ engine paste · not on static HTML |

---

## Post-deploy smoke

```bash
npm run smoke:live
```

Checks: `/` · `/alpha` · `/boat` · `/clan` · gospel · install script · CSS tokens.

---

## Gaps (not Monday AM)

| P | Gap |
|---|-----|
| P2 | Hosted OG image |
| P2 | Customer Portal footer link |
| P3 | Blog md→html CI |
| P3 | `/og/` social cards |

---

*Site is ready in git. DNS is the curtain.*
