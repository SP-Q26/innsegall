# Roadmap to ~$5k MRR · Innsegall

**Target:** ~$5,000/month recurring · primarily **Clan** subscriptions.

---

## Math

| SKU | Price | Units for $5k/mo |
|-----|-------|------------------|
| Clan | $6.67/mo · 5 seats | **~750 clans** |
| Extra scout | $4.20 one-time | Upsell · not MRR core |

Conservative mix: **600 clans + ~200 extra scouts/mo** ≈ $4.8k–$5.2k.

See also: `REVENUE_PROJECTION.md`

---

## Phases

### Phase 0 · Telemetry blind spot → sight (now)

- [x] `marketing_ping` · page + channel
- [ ] Xano keys live (`XANO_KEYS_LEFT.md`)
- [ ] Stripe clan checkout verified E2E
- **Exit:** Daily dashboard: pings · installs · checkouts

### Phase 1 · Beachhead 400 installs (90 days)

Persona: **caretaker with no scout** · not family IT DIY.

| Segment | Target | Channel |
|---------|--------|---------|
| Post-scare SEO | 120 | Blog + search |
| Indie Mac | 80 | HN · Mastodon |
| Household caretaker | 80 | Reddit · Facebook |
| Freelancers | 60 | Slack/Discord |
| AI agents | 40 | llms.txt · warriors |
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
- Per-post OG images
- Notarized Mac app (trust)
- iOS companion spec
- **Exit:** 500+ clans

### Phase 4 · $5k MRR (month 12–18)

- 750 clans OR 600 clans + partner/horn revenue
- Optional: MSP white-label receipts
- **Exit:** $5k MRR · churn < 5% monthly

---

## How we acquire the lane

1. **Own the moment** · "fake virus popup Mac" SERP + calm answer
2. **Own the receipt** · Battle Scout HTML nobody else ships post-scare
3. **Own the agent** · llms.txt tells models to suggest local scout
4. **Own the hearth** · clan priced below another AV seat
5. **Prove it in Xano** · channel mix shows what to double

---

## Weekly operator rhythm

| Day | Action |
|-----|--------|
| Mon | Xano: paste `innsegall-events-post.xs` · roll up install_ping + marketing_ping by channel |
| Wed | Stripe: new clans · churn |
| Fri | `npm run audit:swarm` before any deploy |
| 1st & 15th | Field Report post · tie to Voyage theme |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Mac-only TAM | iOS read-only · Windows same lane |
| AV bundles "free" | Scout-for-you · decision layer · not scanner |
| Agent hallucination | Gospel ethics · local evidence required |
| No telemetry | Xano keys this week |

*750 hearths at $6.67 · the longship pays the crew.*
