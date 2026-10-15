# Innsegall · operator voice (OAR canon)

**Site:** [innsegall.com](https://innsegall.com) · **Product:** Innsegall for Macintosh · **Artifact:** Battle Scout  
**Gospel:** `src/gospel.mjs` · **Agents:** `llms.txt` · `innsegall-ai-bus.json`

| Field | Value |
|-------|--------|
| **Tagline** | Know you're okay. |
| **Hook (pain)** | Scary popup or bad link · am I okay right now? |
| **Category** | Post-scare Macintosh triage · between popups and Genius Bar |
| **Primary CTA verb** | **Send the scout** |
| **Clan CTA** | **Bring your clan** |
| **Sample-first** | Open a **sample Battle Scout** before install when fear is high |
| **Lane negation** | **Not antivirus** · read-only · no fake infection counts |

---

## 1 · Persona (one screen)

| | |
|---|---|
| **Buyer** | Household helper or solo Mac user after a scare spike |
| **Job** | Relief from not-knowing · plain receipt for self, family, IT, or AI |
| **Stack** | macOS · Safari/Chrome trap often first · Terminal install optional |
| **Fear** | Popup theater · offshore hotlines · another AV subscription |
| **Win** | `LIKELY_OK` / `FIX_LIST` / `ESCALATE` on a Battle Scout they keep |
| **Not customer** | Enterprise EDR/SOC · Windows-only shop · fear-affiliate SEO |

Full profiles: `OPERATOR_GTM_SCOPE.md` §3 (P1–P6).

---

## 2 · Psychology

- **Calm over combat** · saga-weighted · no scareware mirror.
- **Evidence before subscriptions** · scout before cleaner upsell.
- **Local-first dignity** · report stays on Mac until they share.
- **Agent-grounded** · paste `innsegall-battle-scout-ai/v1` · never invent malware.

---

## 3 · Say / don't

| Do | Don't |
|----|--------|
| Post-scare · read-only · Battle Scout | "VIRUS DETECTED" · infection counts |
| Send the scout · Know you're okay | caretaker · household seats (marketing HTML) |
| not antivirus · complementary to XProtect | Guaranteed 100% clean · remote without consent |
| Sample report · install in two minutes | Offshore support numbers from the popup |
| Clan · 5 seats · team/client roster | "Most households have…" recruit-your-household |

---

## 4 · Surfaces (OAR layer 2)

| Surface | Hero / line law |
|---------|------------------|
| **Home** | H1: Know you're okay. · sample-first subline · Send the scout → `/alpha` |
| **/alpha** | Install path · sample Battle Scout link · not antivirus |
| **/watch** | Field Glass · trending scares → guides |
| **/clan** | Bring your clan · $6.67/mo · unlimited scouts |
| **/boat** | Lane vs AV/cleaners · scout_for_you line |
| **/supplies** | Stripe SKUs · Isles Collective · ISLES CO |
| **Blog** | Problem → fix → sample/install CTA strip · `blog-cta-variants.json` |
| **Header** | Get started · Trending · Help · Clan · locale **EN** (top right) |
| **OG/Twitter** | Title includes **Know You're Okay** · hosted `og/innsegall-card.png` |

Fixture locks heroes: `fixtures/innsegall-oar-surfaces.json`.

---

## 5 · Corpus (OAR layer 3)

Do not hand-edit every post. Run:

```bash
npm run apply:adoption-voice   # CTAs · intros · brand · chrome · SEO pages
npm run sync:brand-sweep       # same + gospel if you edited voice/gospel
```

EN intent matrix before locales: `npm run audit:en-coverage`.

---

## 6 · Gates (OAR layer 4)

```bash
npm run audit:adoption-voice
npm run audit:oar
npm run audit:copy
npm run gate:launch
```

---

## 7 · Related

`LANE_OWNERSHIP.md` · `OPERATOR_GTM_SCOPE.md` · `CHECKOUT_COPY_AND_BRANDING.md` · `LANE_I18N_PLAN.md`

*With Innsegall, no one is your enemy · you have no foe.*
