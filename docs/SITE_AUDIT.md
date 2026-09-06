# Site audit · Innsegall split · Sep 6, 2026

**Scope:** `innsegall/web/` · full sweep after SPQ decouple  
**Score:** 8/10 (was 6.5 on SPQ-nested site)

---

## Split complete

| Item | Status |
|------|--------|
| Site root `innsegall/web/` | ✅ |
| Own `vercel.json` | ✅ |
| Install script → Innsegall repo | ✅ |
| SPQ `vercel.json` innsegall rules removed | ✅ |
| Engine `package.json` standalone scripts | ✅ |

---

## Typography

| Check | Before | After |
|-------|--------|-------|
| Display | Cormorant (ok) | `--font-display` token |
| UI | DM Sans (ok) | `--font-ui` token · `optimizeLegibility` |
| Pronounce line | "for Mac" | **built for Macintosh** |
| Hero H1 | 3.75rem max | 3.85rem · tighter line-height |
| Section H2 | generic | display scale + letter-spacing |

**Note:** Brand bible allows "for Mac" in subtitle; we use **Macintosh** for positioning (not Apple "Mac" recall marketing).

---

## Spacing & sizing

| Check | Fix |
|-------|-----|
| Page max | 72rem → **68rem** (tighter read) |
| Spacing scale | Added `--space-1` … `--space-8` |
| Section rhythm | Consistent padding via tokens |
| Hero actions gap | Clear vertical stack |
| Pricing cards | Per-tier CTA row |

---

## Color

| Token | Use | Status |
|-------|-----|--------|
| fjord-deep | bg | ✅ |
| beam-gold | CTA | ✅ enhanced depth shadow |
| laser-edge | links | ✅ |
| aurora-green | labels | ✅ |
| gremlin-smoke | body secondary | ✅ |

---

## CTAs (pressable)

| Element | Grade | Notes |
|---------|-------|-------|
| `.btn-horn` | **A** | min-height 52px ·物理 press · focus ring |
| `.header-cta` | **A** | matches horn system |
| `.btn-secondary` | **A** | outline · pricing extra run |
| `.btn-link` | **B+** | ghost → hover surface |
| Pricing per-tier buttons | **A** | was missing |
| Copy button (alpha) | B | unchanged |

---

## Copy / lane

| Removed / fixed | Reason |
|-----------------|--------|
| "Quick, secure, built to earn trust" | Generic SaaS · not brand |
| SPQ clone steps | Wrong product |
| "Engine v0.4" in trust strip | Too technical for hero |
| `/docs/house-call/...` footer link | SPQ path |
| "Mac Security Triage" title | → **Macintosh Triage** |
| "Creators & builders" | → **Creators on Macintosh** |

**Kept:** manifesto · Battle Scout · Sound the Horn · clan · anti-AV lane · between popups and Genius Bar

---

## SEO

| Item | Status |
|------|--------|
| Title / description | ✅ Macintosh + lane keywords |
| Canonical | ✅ innsegall.com |
| OG / Twitter | ✅ |
| Schema.org | ✅ Organization + SoftwareApplication |
| FAQ | ✅ trimmed to 4 (visible) |
| sitemap.xml | ✅ |
| robots.txt | ✅ |
| cleanUrls in vercel | ✅ /alpha /privacy /tos |
| llms.txt / gospel sync | ✅ $4.20 extra scout · runes install step |

**Open:** `og:image` asset (illustrator pass)

---

## Pages audited

| Page | Status |
|------|--------|
| index.html | ✅ rewritten |
| alpha.html | ✅ rewritten |
| blog/index.html | ✅ |
| privacy.html | ⚠️ paths fixed · copy pass later |
| tos.html | ⚠️ paths fixed · copy pass later |

---

## Deploy checklist

1. Push `innsegall/` to `github.com/innsegall/innsegall`
2. Vercel project · root `web`
3. DNS on Namecheap
4. Verify `/tos` shows Innsegall legal (not SPQ)
5. `curl install script` smoke

---

*Light, not war · the site should feel like the beam, not the gremlins.*
