# Full page and link audit · 2026-10-08

**Git:** `main` @ `272c882`  
**Prod:** `https://innsegall.com`  
**Commands run:** `audit-site-inventory.mjs` · `audit-links.mjs` · `audit-blog-funnel.mjs` · `audit-structured-data.mjs` · `smoke-live.mjs` · `smoke-links-live.mjs`

---

## Verdict

| Layer | Result |
|--------|--------|
| Site inventory | **PASS** · **0** P0 |
| Repo internal links | **PASS** |
| Blog funnel | **PASS** |
| Structured data | **PASS** |
| Live HTTP smoke | **90 ok · 0 fail** |
| Live link crawl | **75 ok · 0 fail** |

**Warn (non-fail):** GitHub `InnsegallInstaller.zip` **404** (pre-L5 signed installer).

---

## Counts

| Metric | Value |
|--------|------:|
| HTML surfaces | 68 |
| Indexable marketing + blog | 66 |
| Blog posts | 48 |
| Sitemap URLs | 75 |
| Vercel rewrites | 70 |
| smoke-live checks | 90 ok |
| Link-crawl URLs (200) | 75 |
| Crawled off-sitemap (via links) | `/samples/battle-scout-demo` |

---

## Marketing routes (live 200)

`/alpha` · `/guide` · `/stability` · `/map` · `/watch` · `/boat` · `/clan` · `/warriors` · `/msp` · `/install` · `/ios` · `/tablet` · `/companion` · `/supplies` · `/privacy` · `/tos` · `/blog` · `/`  
`/success` · **noindex** · not in sitemap · **200** in smoke-live only.

---

## Blog posts (48)

All **indexable** · **sitemap** · **blog index** · **vercel rewrite** · live **200**:

- after-suspicious-link-macintosh  
- apple-support-call-popup-scam-mac  
- auto-voyage-first-sail  
- blockblock-vs-post-scare-triage  
- check-parent-mac-after-scare  
- clicked-bad-link-iphone-ipad-guide  
- clicked-suspicious-link-macintosh  
- do-i-need-antivirus-mac-2026  
- downloads-folder-quarantine-mac-check  
- fake-virus-popup-macintosh  
- field-desk-stripe-live-sep-2026  
- field-glass-oct-2-2026  
- field-glass-oct-7-2026  
- field-glass-sep-19-2026  
- field-glass-sep-2026  
- field-glass-sep-22-2026  
- field-glass-sep-25-2026  
- field-glass-sep-30-2026  
- field-report-2026-09-06  
- gatekeeper-opened-unknown-app-mac  
- genius-bar-vs-battle-scout-mac  
- innsegall-ios-companion-i0  
- innsegall-vs-antivirus-macintosh  
- innsegall-vs-etrecheck-macintosh  
- innsegall-vs-mac-cleaners  
- join-the-innsegall-clan  
- knockknock-vs-post-scare-triage  
- mac-calendar-spam-invites-scam  
- mac-configuration-profile-scam  
- mac-dns-changed-after-scare  
- mac-performance-panic-vs-security-panic  
- mac-slow-after-suspicious-download  
- macintosh-hygiene-without-antivirus  
- macintosh-xprotect-after-scare  
- malwarebytes-vs-innsegall-after-scare  
- network-monitor-vs-post-scare-triage  
- onyx-vs-read-only-mac-scout  
- paste-battle-scout-for-ai-assistant  
- pasted-terminal-command-mac-scare  
- safari-allowed-notifications-by-mistake-mac  
- safari-fake-virus-notifications-mac  
- safari-search-engine-hijacked-mac  
- safari-shift-key-scam-popup-mac  
- someone-remoted-into-my-mac  
- stale-launch-items-macintosh  
- virustotal-vs-local-mac-scout  
- voyage-health-tracker-1st-15th  
- what-is-a-battle-scout  

Per-route meta lengths and flags: `docs/SITE_FULL_AUDIT_LATEST.md`.

---

## Link crawl (75 URLs · all 200)

Seeds: sitemap (75 locs). BFS follows internal `href` (skips `/api`, static assets, `/.well-known/*` in crawl rules, `/og/*`, `/stripe/*`).

Includes discovery paths: `/.well-known/*` (when linked), `/samples/*`, `/og/innsegall-card.png`, `/llms.txt`, `/ai.txt`, `/innsegall-ai-bus.json`.

**Not in BFS:** `/success`, `/watch-feed.xml` · verified in `smoke-live`.

---

## Regenerate

```bash
npm run audit:site
node scripts/audit-links.mjs
node scripts/smoke-live.mjs --base=https://innsegall.com
node scripts/smoke-links-live.mjs --base=https://innsegall.com
npm run gate:launch
```
