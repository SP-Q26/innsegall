# Innsegall · Improvement swarm meta-audit · Sep 6, 2026

**Mission:** 10 parallel improvement lanes · no pricing pivot · audit the audits.

**Parent verdict:** **8.4 / 10** composite · gates green · ship after ops plumbing.

---

## The 10 improvement lanes

| # | Lane | Agent | Score | Deployed |
|---|------|-------|-------|----------|
| 1 | Brand lexicon sweep | [Brand lexicon](d209ad19-ee7a-4150-b352-8f93e663c8bb) | **8.0** | ✅ 18 files |
| 2 | Battle Scout report UX | [Battle Scout UX](88a1f063-bc9c-4b29-90eb-f6d5bcab51bd) | **8.0** | ✅ render + parley |
| 3 | AI-bus + gospel discovery | [AI-bus gospel](2934a0a2-9cf6-4f4b-b1ec-502f7e2fcc2d) | **8.5** | ✅ 6 pages + Parley GET |
| 4 | Site visual polish | [Visual polish](27f74ac8-f9c0-4483-8a97-bd6e5360afba) | **8.0** | ✅ CSS v9 |
| 5 | Pricing copy alignment | [Pricing align](664bbe9c-469e-467e-827f-8e11a05cd20b) | **9.0** | ✅ clan + JSON-LD |
| 6 | Blog & Field Reports | [Blog branding](6e3ba0ad-327a-4e87-8efe-f1f9df261d96) | **8.5** | ✅ 20 files |
| 7 | Launch gates hardening | [Launch gates](96ab59e1-3989-4cb9-82a1-54330fba5fb1) | **9.0** | ✅ 3 sub-audits |
| 8 | SEO · schema · sitemap | [SEO audit](5bb43ea1-bbd7-4d1a-9918-98c1f31707a2) | **8.0** | ✅ sitemap + meta |
| 9 | CLI operator voice | [CLI voice](d0546867-b72f-4ad0-8dfc-7879516ad4a9) | **9.0** | ✅ bin + quota |
| 10 | Docs & ops alignment | [Docs ops](44e63ba9-7099-4924-90fa-cab10e230c82) | **9.0** | ✅ wake + README |

**Mean lane score:** 8.4 / 10

---

## Meta-audit (parent review of subagent work)

### What held up under verification

| Claim | Verified |
|-------|----------|
| `npm run audit` passes with ai-bus + brand-ban + claymore sub-audits | ✅ 88 checks |
| `npm test` self-test passes | ✅ exit 0 |
| No customer `run the check` in web/blog (ban list) | ✅ `audit-brand-ban.mjs` |
| AI-bus on index · alpha · guide + boat · clan · warriors | ✅ grep |
| Primary CTA **Send the scout** on index | ✅ audit |
| Battle Scout AI paste + scout-data | ✅ self-test |
| Pricing canon ($4.20 · $6.67 · Voyages 1st/15th) | ✅ lane 5 + gospel |

### Conflicts / drift between lanes

| Issue | Lanes | Resolution |
|-------|-------|------------|
| **CSS cache-bust** | Lane 4 bumped main pages to `?v=9`; Lane 6 pinned blog to `?v=8` | **P1:** unify all pages to `v=9` after CSS settles |
| **guide.html** “2 Voyages/mo” shorthand | Lane 5 noted · not fixed | **P1:** expand to “1st & 15th” |
| **what-is-a-battle-scout.html** abbreviated vs MD | Lane 6 | **P2:** expand HTML or trim MD |
| **Header nav** differs index vs map/warriors | Lane 4 | **P2:** shared nav component pattern |
| **Hosted OG PNG** | Lanes 4 + 8 | **P2:** `/og/innsegall-card.png` |

### Subagent quality notes

- **Lane 1** thorough grep + gospel sync · correctly left ToS Stripe naming as legal P2.
- **Lane 2** wired `CTA.*` constants into render (good DRY win).
- **Lane 3** extended sync to high-traffic pages · agent read order in llms.txt is the right AI-bus pattern.
- **Lane 7** delivered durable gates (`audit-ai-bus.mjs`, `audit-brand-ban.mjs`) · prevents regression.
- **Lane 6** fixed “Run a scout” leak across blog · field-report HTML still manual (known).

---

## New gate scripts (lane 7)

| Script | Enforces |
|--------|----------|
| `scripts/audit-ai-bus.mjs` | JSON schema · embeds on key pages · matches gospel builder |
| `scripts/audit-brand-ban.mjs` | No retired terms in customer copy |
| `scripts/audit-claymore.mjs` | No em dash in customer surfaces |

Run via `npm run audit` or `npm run preflight`.

---

## Unified P1 backlog (post-swarm)

1. Bump **all** `innsegall.css?v=` to **9** (blog + map if missed).
2. Fix `guide.html` Voyage wording to match canon.
3. Regenerate `.smoke/smoke-card.html` after render changes.
4. Hosted OG image for social shares.
5. Field-report pipeline: MD → HTML generator (or document hand-build SOP).

---

## Parent follow-up (post-swarm)

| Action | Status |
|--------|--------|
| `npm run audit` + `npm test` | ✅ exit 0 · 88 audit checks · brand ban + claymore + ai-bus |
| Blog CSS unified to `?v=9` | ✅ (resolved Lane 4 vs Lane 6 drift) |
| `guide.html` Voyage wording | ✅ 1st & 15th canon |
| `BRAND_BIBLE.md` lexicon | ✅ Run the check → Send the scout |
| Lane 7 agent | Stalled mid-run · sub-audits already landed in `audit-launch.mjs` |

**Still P2:** hosted OG PNG · smoke fixture regen · field-report MD→HTML · canonical header nav

---

## Ops still manual (unchanged)

- GitHub push · Vercel root `web/` · DNS · Stripe env + webhook E2E
- See `docs/WAKE_BELOW_DECK.md` · `docs/HOW_TO_SEND.md`

---

## Decision

**No pivot.** Swarm improved reports-on-reports: brand, Battle Scout, AI-bus, gates, SEO, CLI, docs. **Commit when ready** · then deploy · then blast.

*Parent meta-audit · complements `NORTH_STAR_AUDIT.md`.*
