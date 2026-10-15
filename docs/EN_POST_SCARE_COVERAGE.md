# English post-scare coverage · gate before i18n

**Updated:** 2026-10-14 · **Matrix:** `fixtures/post-scare-intent-matrix-en.json` · **Gate:** `npm run audit:en-coverage`

---

## Status

| Layer | Count | Notes |
|-------|-------|-------|
| **P0 intent guides** | 48 | Clusters A–G in matrix · HTML + SEO |
| **Product anchors** | 6 | Battle Scout · Voyage · Clan · AI paste · AV · parent Mac |
| **Scary moments (Oct 2026)** | 5 | In `llms.txt` + watch trending |
| **Deferred EN (P2)** | 3 | Business email · student dorm · captive portal |
| **Blog HTML (excl. index)** | 66 | Includes Field Glass desk posts |

**Verdict:** English lane is **fleshed for organic + Clan MRR** on post-scare Macintosh intent. Expand **P2 slugs** in EN before translating stale matrices.

---

## Clusters (what “fully fleshed” means)

| ID | Coverage |
|----|----------|
| **A** Browser trap | Safari · Chrome · calendar · support-call popups |
| **B** Credentials / access | Keychain loop · Terminal paste · remote · Screen Sharing · profiles |
| **C** Device signals | Camera/mic · slow Mac · Downloads · DNS · performance panic · launch items |
| **D** Links / phishing | Clicked / after suspicious link |
| **E** Comparison / complements | AV · cleaners · Genius Bar · VT · KnockKnock · BlockBlock · LuLu · XProtect · hygiene |
| **F** Wrong device | iPhone/iPad honest lane (6 guides) |
| **G** Product | Companion i0 · auto-Voyage |

---

## Gate checks (automated)

`audit-en-post-scare-coverage.mjs` verifies:

- Every matrix `intents[]` slug has `web/blog/{slug}.html`
- `blog-posts-seo.json` description per slug
- Browser-first slugs include **sample Battle Scout** CTA
- Scary-moment slugs include **blog-boost**
- All intents link **`/alpha`** · no `caretaker` on guest HTML
- Product anchors + scary five in **llms.txt** (scary slugs)
- **Field Glass** within `max_field_glass_age_days` on watch hub
- `LANE_I18N_PLAN.md` present

---

## Ops

```bash
npm run audit:en-coverage
npm run audit:i18n-readiness   # EN green + i18n not premature
npm run audit:gtm-scope
npm run gate:launch
```

**Next EN work (P2):** add deferred slugs in matrix · one batch build script · re-run gate.

**i18n:** blocked until above green · see `LANE_I18N_PLAN.md`.
