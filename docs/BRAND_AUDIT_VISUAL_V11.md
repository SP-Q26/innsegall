# Innsegall · Visual brand audit · v11 · Sep 7, 2026

**Scope:** Site typography/spacing · Battle Scout share UX · rune/spirit/wealth lane  
**Canon:** `docs/BRAND_AUDIT.md` · `docs/BRAND_BIBLE.md` (house-call)  
**Overall score:** **8.8 / 10** · sleek protective ancient · share path sharpened

---

## Design pillars (v11)

| Pillar | Expression |
|--------|------------|
| **Sleek** | Cormorant display + DM Sans UI · relaxed line-height (1.62–1.68) · `text-wrap: balance` on heroes |
| **Secure** | Shield gold top-border on cards · inset glow · fjord depth background |
| **Protective** | Calm verdict bands · manifesto footer · no scare typography |
| **Ancient** | Younger Futhark rune ornaments (ᚠᚢᚦ) · section labels · hero bookend |
| **Spirit** | Gaelic echo styling on manifesto · laser mist + beam gold atmosphere |
| **Wealth** | Gold share dock on Battle Scout · horn CTA gradient · spirit-silver wordmark |

---

## Scorecard

| Dimension | Before (v10) | After (v11) | Notes |
|-----------|--------------|-------------|-------|
| **Typography rhythm** | 7/10 | 9/10 | Body 1.62 · section leads 1.68 · display letter-spacing tuned |
| **Rune / spirit cues** | 5/10 | 8/10 | Hero runes · trust strip · section label prefix |
| **Wealth / premium** | 7/10 | 8.5/10 | Card gold rail · share dock · brand silver |
| **Battle Scout share** | 7/10 | 9/10 | Share dock · gold CTA · print-safe receipt |
| **Site ↔ card parity** | 6/10 | 9/10 | Battle Scout loads same Google font stack as site |
| **Words (customer)** | 8.5/10 | 8.5/10 | Index AI section reframed as "clean receipt" |

---

## Shipped in v11

### Site (`innsegall.css?v=11`)

- Tokens: `--spirit-silver`, `--wealth-gold`, `--shield-glow`, `--rune-fade`, `--leading-relaxed`
- Hero: rune bookend · wider manifesto measure · Gaelic line accent
- Sections: rune prefix on labels · more vertical padding · prettier leads
- Cards: gold top rail + inner shield glow
- Trust strip: rune bullets instead of green dots

### Battle Scout (`src/render.mjs`)

- Cormorant + DM Sans (matches marketing site)
- **Share dock:** headline · plain-language hint · gold copy button
- Verdict headline: wider measure · balance wrap
- Mission brief: relaxed summary typography · uppercase meta row
- Print: share dock survives · hint readable · button hidden

### Copy

- Index hero eyebrow: *ancient calm · modern shield*
- AI share section: *Share a clean Battle Scout receipt*

---

## P1 · Next polish

| ID | Item |
|----|------|
| V1 | Hosted sample Battle Scout on `/guide` (static screenshot or iframe) |
| V2 | Rune SVG in `favicon.svg` / brand mark (subtle) |
| V3 | Field Report blog prose pass · match section-label rune style |
| V4 | OG card refresh · gold beam + rune border for social wealth cue |
| V5 | `success.html` post-checkout · match v11 share language |

---

## Voice check (unchanged law)

| Use | Avoid |
|-----|-------|
| Battle Scout receipt | report dump |
| Share · copy · paste | auto-upload |
| Know you're okay | 100% secure |
| ᚠ ornament | emoji shields |

---

*v11 deploy: bump CSS + nav cache · push · smoke live.*
