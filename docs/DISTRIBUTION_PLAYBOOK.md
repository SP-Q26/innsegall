# Distribution playbook · discovery + trust

**Goal:** First 400 installs without paid ads · measure via `install_ping` / `marketing_ping` in Xano.  
**Beachhead:** `TARGET_DEMO_400.md` · **Channels:** directories · Homebrew · niche communities · SEO (already shipping).

---

## Operator order (do this week)

| # | Task | Time | Track |
|---|------|------|-------|
| 1 | Fix Xano wire · `docs/XANO_KEYS_LEFT.md` · prod telemetry **202** | 15 min | `ref_channel` truth |
| 2 | Submit **10 directories** (table below) | 2 h | `marketing_ping` + backlinks |
| 3 | Post **r/macapps** (template below) | 30 min | `ref_channel: social` |
| 4 | Cross-post top blog to **DEV.to** (canonical → innsegall.com) | 45 min | search |
| 5 | Open **Homebrew** PR or personal tap · `packaging/homebrew/innsegall.rb` | 1 h | dev installs |
| 6 | Indie Hackers journey post | 1 h | transparency |

---

## Directory batch (submit same blurb)

**One-liner:** Post-scare Macintosh triage · local Battle Scout · not antivirus.  
**One-click (caretakers):** https://innsegall.com/scripts/Innsegall-Install.command · double-click · auto bootstrap.  
**Install (Terminal):** `curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash`  
**After install:** welcome scout opens · Voyages on **1st & 15th at 10:00** via launchd (no extra steps).  
**Demo:** https://innsegall.com/samples/battle-scout-demo  
**Agent gospel:** https://innsegall.com/llms.txt  
**GitHub:** https://github.com/SP-Q26/innsegall  

| Directory | URL | Notes |
|-----------|-----|-------|
| MacMenuBar | https://macmenubar.com/submit | Curated Mac apps |
| Menu Bar App Directory | https://menubarapps.net/submit | If/when menu bar UI ships · else skip |
| AlternativeTo | https://alternativeto.net | Tag: Mac hygiene · triage |
| SaaSHub | https://www.saashub.com | Indie SaaS |
| Product Hunt | https://www.producthunt.com/posts/new | After telemetry green |
| BetaList | https://betalist.com/submit | Alpha framing |
| Indie Hackers product | https://www.indiehackers.com/products | Link blog + metrics story |
| Slant | https://www.slant.co | Mac security / hygiene |
| StackShare | https://stackshare.io | Dev-adjacent |
| Awesome Selfhosted (if fits) | GitHub awesome lists | Local-first angle |
| OpenAlternative | https://openalternative.co | MIT engine |
| AI tools directories | Manual | Submit `llms.txt` URL |

**llms.txt directories:** Revisit quarterly · list in `AI_ONBOARDING.md` when submitted.

---

## Niche communities (10x vs broad social)

| Community | Self-promo? | Lead with |
|-----------|-------------|-----------|
| r/macapps | Yes | Demo scout + local-first · not AV |
| r/IndieAppNews | Yes | Alpha · MIT engine · caretaker lane |
| r/mac / r/applehelp | Soft | Answer post-scare threads · link blog |
| HN Show HN | Yes | After Homebrew or clean install story |
| Indie Hackers | Yes | Journey · Xano aggregates · no PII |
| Mastodon #macOS | Yes | Short thread + demo link |

**Templates:** `docs/pastes/community-r-macapps.md` · `docs/pastes/community-indie-hackers.md`

**Rules:** Never fear-marketing · never promise 100% safety · disclose MIT + alpha.

---

## Homebrew

See **`docs/HOMEBREW.md`**. Target command:

```bash
brew install innsegall
```

Requires tagged release or tap pointing at this repo. Formula: `packaging/homebrew/innsegall.rb`.

---

## Search surface (ongoing)

Already shipping:

- Blog intents: fake popup · suspicious link · hygiene without AV
- `llms.txt` + ai-bus + issue spotlight loop
- Sitemap + FAQ schema on home

**Next:** DEV.to canonical reposts of:

1. `/blog/fake-virus-popup-macintosh`
2. `/blog/after-suspicious-link-macintosh`
3. `/blog/macintosh-hygiene-without-antivirus`

---

## Trust surfaces (link everywhere)

| Surface | URL / path |
|---------|------------|
| Stability contract | `/stability` · `docs/STABILITY.md` |
| Changelog | `CHANGELOG.md` · GitHub releases |
| Open engine | GitHub · MIT |
| Per-check scope | Battle Scout footer |
| Privacy | `/privacy` |
| Code of conduct | `CODE_OF_CONDUCT.md` |

---

## Metrics (Xano)

| Event | Use |
|-------|-----|
| `marketing_ping` | Page + `ref_channel` (search, social, agent, warrior) |
| `install_ping` | Installs by day · warrior_ref |
| `issue_spotlight` | Blog/triage loop |

**Gate:** `npm run smoke:xano` · `npm run gate:launch` · telemetry **202** not **502**.

---

*Swarm audit: `npm run audit:discovery` · full: `npm run audit:swarm`.*
