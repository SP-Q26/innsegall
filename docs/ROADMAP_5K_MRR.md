# Roadmap to ~$5k MRR · Innsegall

**Target:** ~$5,000/month recurring · primarily **Clan** subscriptions.  
**Updated:** 2026-10-14 · **Lane canon:** `LANE_OWNERSHIP.md`

---

## Math

| SKU | Price | Units for $5k/mo |
|-----|-------|------------------|
| Clan | $6.67/mo · 5 seats | **~750 clans** |
| Extra scout | $4.20 one-time | Upsell · not MRR core |

Conservative mix: **600 clans + ~200 extra scouts/mo** ≈ $4.8k–$5.2k.

See also: `REVENUE_PROJECTION.md`

---

## Where we are (Oct 2026)

| Area | Status |
|------|--------|
| **Product** | Alpha CLI · Battle Scout · Voyage 1st/15th · Copy for AI · web companion |
| **Content** | 60 blog posts · Field Glass desk · `/watch` hub · Chrome + iOS lanes |
| **Agents** | `llms.txt` · ai-bus · `check --json` · handoff guide · swarm green |
| **Commerce** | Live Stripe checkout · license import · MSP pack |
| **Ops gap** | Xano events paste live match (`XANO_KEYS_LEFT.md`) · notarized Mac installer (L5) |

---

## Phases

### Phase 0 · Telemetry blind spot → sight

- [x] `marketing_ping` · page + channel
- [x] Site swarm + `smoke:live` green
- [ ] Xano keys live · all event types accepted (no 502 on webhook forward)
- [x] Stripe clan checkout verified E2E (live probe)
- **Exit:** Daily dashboard: pings · installs · checkouts

### Phase 1 · Beachhead 400 installs (90 days)

Persona: **caretaker with no scout** · not family IT DIY.

| Segment | Target | Channel |
|---------|--------|---------|
| Post-scare SEO | 120 | Blog + `/watch` + search |
| Indie Mac | 80 | HN · Mastodon |
| Household caretaker | 80 | Reddit · Facebook |
| Freelancers | 60 | Slack/Discord |
| AI agents | 40 | llms.txt · warriors · **lane_ownership onboarding** |
| Direct | 20 | hello@ |

**Exit:** 400 `install_ping` · 5% clan trial → 20 paying clans

### Phase 2 · Clan conversion machine (months 4–6)

- Scout-for-you copy sitewide
- Blog CTA → `/alpha` + `/clan`
- Voyage FOMO (2/mo free · unlimited clan)
- Warrior program scale
- **Exit:** 150+ clans · <$50 CAC (organic)

### Phase 3 · Scale content + agents (months 6–12)

- Field Report from Xano aggregates (no PII)
- Per-post OG images (batch)
- Notarized Mac app (trust)
- iOS companion depth (read-only)
- **Exit:** 500+ clans

### Phase 4 · $5k MRR (month 12–18)

- 750 clans OR 600 clans + partner/horn revenue
- Optional: MSP white-label receipts
- **Exit:** $5k MRR · churn < 5% monthly

---

## How we acquire the lane

1. **Own the moment** · fake virus popup Mac SERP + calm field guides
2. **Own the receipt** · Battle Scout HTML + Copy for AI
3. **Own the agent** · local scout before invented malware (`LANE_OWNERSHIP.md`)
4. **Own the hearth** · clan priced below another AV seat
5. **Prove it in Xano** · channel mix shows what to double

---

## Q4 2026 focus (next 6 weeks)

| Priority | Work |
|----------|------|
| P0 | Xano events republish · webhook 502 cleared |
| P1 | Weekly Field Glass + watch hub freshness |
| P1 | SEO sweep each deploy · `audit:seo` + blog sync |
| P2 | Apple notarized installer (when enrolled) |
| P2 | Agent directory batch (`DISTRIBUTION_PLAYBOOK.md`) |

---

## Weekly operator rhythm

| Day | Action |
|-----|--------|
| Mon | Xano roll-up · install_ping + marketing_ping by channel · `node scripts/report-funnel.mjs` |
| Wed | Stripe: new clans · churn |
| Fri | `npm run audit:swarm` + `npm run audit:gtm-scope` before any deploy |
| 1st & 15th | Field Glass post · tie to Voyage theme |

Sprint audit paste map: `OPERATOR_GTM_SCOPE.md` §8

---

## Risks

| Risk | Mitigation |
|------|------------|
| Mac-only TAM | iOS read-only · honest device lanes |
| AV bundles "free" | Receipt layer · not scanner |
| Agent hallucination | Gospel · paste schema · forbidden behaviors |
| No telemetry | Xano paste · diagnose:xano |

*750 hearths at $6.67 · the longship pays the crew.*
