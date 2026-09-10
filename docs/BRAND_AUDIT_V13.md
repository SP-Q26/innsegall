# Innsegall · Brand audit v13 · Sep 7, 2026

**Scope:** Every customer HTML surface · links · corners · rune balance  
**Automated gates:** `audit-brand-ban` ✅ · `audit-claymore` ✅ · `audit-shell` ✅ (after Phase 4)  
**Overall score:** **8.2 / 10** → **8.8 / 10** after Phase 4 fixes land

---

## Rune verdict (explicit)

**Right amount · do not add more body runes.**

| Layer | Treatment | Verdict |
|-------|-----------|---------|
| Header brand-mark | ᚠ + ᚦ in SVG (2 glyphs) | **Keep** · signature, not noise |
| Blog articles | `ᚠ · ᚢ · ᚦ` divider under H1 | **Keep** · one line per post |
| Blog index | Divider under H1 (Phase 4) | **Add** · hub parity |
| Guide / alpha CLI | “read the runes” · `innsegall runes` | **Keep** · product vocabulary |
| Pricing · legal · footers | No rune strings | **Do not add** · would tip to costume |

Innsegall is **ancient calm**, not a rune font. Runes belong on the **shield** (mark + Field Report dividers), not in every headline.

---

## Scorecard

| Dimension | Before | After Phase 4 | Notes |
|-----------|--------|---------------|-------|
| Lexicon / bans | 9/10 | 9/10 | Scripts green |
| Rune balance | 8/10 | 8.5/10 | success mark restored · blog index divider |
| Shell (nav/footer) | 6/10 | 9/10 | Rich footer sync · success header |
| Macintosh naming | 7/10 | 8.5/10 | Index + success + gospel source |
| CTA semantics | 8/10 | 9.5/10 | map.html horn leak fixed |
| OG / social | 8.5/10 | 8.5/10 | PNG live · success noindex OK |
| Wordmark | 9/10 | 9/10 | Title Case `brand-word` · no INNSEGALL shout |

---

## What Phase 4 shipped (code)

- `sync-site-chrome.mjs` · rich footer everywhere · success gets canonical header + rune mark
- `audit-shell.mjs` · nav + footer + map CTA gate
- `check-git-identity.mjs` · noreply committer check
- `.github/workflows/launch-gate.yml` · CI swarm on push
- Index / success **Macintosh** copy · gospel source strings
- Alpha **Battle Scout preview** iframe
- map.html **Send the scout** (not Sound the Horn → `/alpha`)

---

## Still open (you or Xano)

| ID | Item | Owner |
|----|------|-------|
| O1 | Live $4.20 E2E on Mac | Operator · `docs/E2E_LIVE_CHECKLIST.md` |
| O2 | `XANO_EVENTS_URL` + `XANO_API_KEY` in Vercel | You · `docs/pastes/innsegall-events-post.xs` · `XANO_KEYS_LEFT.md` |
| O3 | Legal pages batch “your Mac” → Macintosh | ✅ privacy + tos · `audit-shell` gate |
| O4 | Per-post OG for top blog URLs | P2 · growth |
| O5 | Repo-local git noreply | Operator one-liner |

---

## Link map (canonical)

**Header:** Field manual · Field Report · Clan  
**Footer:** Guide · Map · The boat · Join the clan · War-band · Field manual · Field Report · Terms · Privacy · hello@

**CTA law**

| Phrase | Use |
|--------|-----|
| Send the scout | Primary · `/alpha` |
| Sound the Horn | Escalation · email / Parley only |

---

*Brand VP canon · complements `BRAND_AUDIT_VISUAL_V11.md` · `PHASE_3_SHIPPED.md`.*
