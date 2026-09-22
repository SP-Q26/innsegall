# Copy & SEO review · 2026-09-22

**Scope:** innsegall.com marketing + blog · user intent · discoverability (search, FAQ, agents).  
**Automated gates (ran clean):** `audit:blog-quality` (avg 110) · `audit:blog-funnel` · `audit:structured-data` · `audit:discovery` · `audit:operator-voice` · `audit:lane` · `audit:privacy` · `audit:site` (0 P0).

---

## Verdict

| Layer | Score | Notes |
|-------|------:|-------|
| Technical SEO | 9.5/10 | Canonicals, sitemap (49 URLs), BlogPosting JSON-LD, FAQPage on home |
| Blog corpus | 9.5/10 | 23 posts · scare, compare, voyage, Field Glass · funnel CTAs wired |
| Homepage UX | 8.5→9/10 | **Fixed:** empty “Post-scare guides” hub · FAQ links to field guides |
| Blog hub UX | 8.5→9/10 | **Fixed:** “Start here” row · richer meta description |
| Agent gospel | 9.5/10 | `llms.txt`, ai-bus, gospel JSON · field_guides list matches blog |

**Float priority:** keep Field Glass cadence · add posts only for **proven search gaps** below.

---

## Intent map (what users seek → where we answer)

| User intent | Primary URL | Support |
|-------------|-------------|---------|
| Fake virus / scareware popup on Mac | `/blog/fake-virus-popup-macintosh` | Home FAQ · gospel `when_to_suggest` |
| Clicked phishing / bad link | `/blog/clicked-suspicious-link-macintosh` | `/blog/after-suspicious-link-macintosh` (trends) |
| “Is this antivirus?” | `/boat` · `/blog/innsegall-vs-antivirus-macintosh` | Home ladder · FAQ |
| Malwarebytes / Norton / Bitdefender | `/blog/innsegall-vs-antivirus-macintosh` | Gospel complementary_tools |
| CleanMyMac / MacKeeper | `/blog/innsegall-vs-mac-cleaners` | |
| EtreCheck / deep export | `/blog/innsegall-vs-etrecheck-macintosh` | |
| KnockKnock / BlockBlock / LuLu | `/blog/knockknock-*` · `/blog/blockblock-*` · `/blog/network-monitor-*` | Scout-first in gospel |
| VirusTotal only | `/blog/virustotal-vs-local-mac-scout` | |
| Apple XProtect after scare | `/blog/macintosh-xprotect-after-scare` | |
| What is Battle Scout / triage levels | `/blog/what-is-a-battle-scout` | Home · sample demo |
| Voyage 1st & 15th | `/blog/voyage-health-tracker-1st-15th` | Home · alpha |
| Install / Gatekeeper | `/install` · `/alpha#gatekeeper` | `llms.txt` install block |
| Pricing / panic $4.20 / clan | `/` `#pricing` · `/supplies` · `/clan` | FAQ · Stripe posts |
| Paste scout to AI | `/guide#ai-handoff` | Home `#ai-share` · sample JSON |
| MSP seats | `/msp` | `/supplies` |
| iOS / iPad read-only | `/ios` · `/tablet` · `/companion` | Blog i0 post |

---

## Gaps (content backlog · not blockers)

Queries we do **not** yet own with a dedicated post (consider one post each when float allows):

| Query cluster | Suggested angle |
|---------------|-----------------|
| Safari hijack / search engine changed Mac | Post-scare triage · extensions · DNS on card |
| Calendar / notification spam Mac | Scareware adjacent · not AV |
| “Someone remote accessed my Mac” | ESCALATE lane · credentials · when Genius Bar |
| Mac slow after download | Overlap stale launch items · link existing post |
| OnyX / maintenance myths | Short compare · read-only vs destructive |
| Business / school Mac policy | MSP page + ESCALATE · not consumer AV |

**Do not** chase Windows/Linux · enterprise EDR · or cleaner fear keywords (lane drift).

---

## Copy consistency notes

| Topic | Canon |
|-------|--------|
| Free Voyage schedule | **1st & 15th** · 10:00 local launchd |
| Clan / MSP Voyage schedule | **Mon & Thu** · unlimited scouts · 5 seats (clan) |
| “Not antivirus” | Every money page + blog meta band |
| Clan seats | “5 seats” / “clan roster” · `household` appears in some clan copy (family OK · not caretaker voice) |
| CTA | **Send the scout** · not “Run a scout” |

---

## Changes applied (2026-09-22)

1. **`web/index.html`** · six-card “Post-scare guides” hub · FAQ links + new “suspicious link” + AI assistant questions · FAQPage schema for suspicious link.
2. **`web/blog/index.html`** · “Start here” trio · meta description expanded for search snippets.
3. **`web/innsegall.css` v14** · `32.5rem` mobile tightening · `48rem` tablet (hero row, pricing 3-col, guides 2→3 col) · safe-area footer · `audit:responsive-spacing`.
4. **`web/index.html` funnel** · pricing before clan · Field Report hub links `/boat` · removed thin “Lane” strip · copy tightened on hero + checkout note.

---

## Operator recheck after deploy

```bash
npm run audit:site
npm run audit:blog-quality
npm run smoke:live
```

Spot-check in browser: home `#field-report-routes` · `/blog` start-here row · rich results preview (FAQ + software).

---

## Related

`FIELD_REPORT_AND_BLOG.md` · `SITE_FULL_AUDIT_LATEST.md` · `FLOAT_MODE_RUNBOOK.md` · `DOCS_INDEX.md`
