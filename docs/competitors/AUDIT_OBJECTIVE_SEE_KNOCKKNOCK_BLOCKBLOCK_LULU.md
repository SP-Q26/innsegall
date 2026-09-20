# Full audit · KnockKnock · BlockBlock · LuLu

**Status:** Internal operator intel · Sep 2026  
**Innsegall lane:** Post-scare Macintosh triage · read-only Battle Scout · LIKELY_OK / FIX_LIST / ESCALATE · not antivirus · not always-on blocking.

**Official product pages (source of truth for versions/features):**

| Tool | Page | Version (page) | macOS |
|------|------|----------------|-------|
| KnockKnock | https://objective-see.org/products/knockknock.html | 4.1.0 | 10.15+ |
| BlockBlock | https://objective-see.org/products/blockblock.html | 2.5.2 | 10.15+ |
| LuLu | https://objective-see.org/products/lulu.html | 4.5.1 | 10.15+ |

Vendor: [Objective-See](https://objective-see.org/) (Patrick Wardle). EtreCheck overlap is covered in the shipped post [innsegall-vs-etrecheck-macintosh](https://innsegall.com/blog/innsegall-vs-etrecheck-macintosh).

---

## Executive matrix

| Tool | Tagline (vendor) | Runtime | Innsegall job it does **not** replace |
|------|------------------|---------|--------------------------------------|
| **KnockKnock** | "Who's there?" · list persistent software | On-demand scan (optional login + scan, CLI) | Calm verdict + family receipt after scare |
| **BlockBlock** | Alert when new persistence is added | Always-on · Endpoint Security | One-time read-only snapshot · no allow/block rules |
| **LuLu** | Block unknown **outgoing** connections | Always-on · Network Extension | Browser/DNS/proxy **state** on scout card · no live firewall |

---

## KnockKnock

**Canon URL:** https://objective-see.org/products/knockknock.html

### What Objective-See says it does

- Enumerates **persistently installed** software so generic malware persistence can be revealed.
- **Portable:** no installer; delete the app to uninstall.
- **Full Disk Access** recommended for full-machine scan.
- **Start Scan** walks categories (Launch Items, Login Items, Browser Extensions, Background Managed Tasks, cron, shell configs, system extensions, and many more per their docs).
- **By design:** lists persistence; **does not** classify benign vs malware except VirusTotal integration (known malware highlighted in red).
- Default filter hides signed-Apple items; **legitimate third-party persistence still appears** (vendor FAQ: many apps shown ≠ infection).
- Optional **VirusTotal API key**; hash lookups; submit unknowns batch at end of scan.
- **Export JSON**, **compare scans** (+ / − / ~), optional **Start at Login** auto-scan.
- **CLI:** `KnockKnock.app/Contents/MacOS/KnockKnock -whosthere` (JSON to stdout; `sudo` for broader cron coverage).

### Strengths (for the right user)

- Deep, category-organized persistence map · trusted author · free.
- Good after cleanup or for IT/research when user can read code signing + VT ratio.
- Complements Apple Background Task Management narrative in their docs.

### Weaknesses (post-scare triage lane)

- No **LIKELY_OK** · novices misread long tables as "dozens of viruses."
- No unified story for **browser hijacks, downloads window, hosts, DNS** (Innsegall scout bundle).
- No **shareable Battle Scout** or Voyage rhythm.
- FDA + VT network use can spook privacy-sensitive users without context.

### Innsegall check overlap

| Innsegall `CHECK_CATALOG` id | vs KnockKnock |
|------------------------------|---------------|
| `launch_ghosts` | KK broader; Innsegall focuses **broken/missing** launch targets (scareware leftovers) |
| `login_items` | KK + many other persistence types; Innsegall login list + plain copy |
| `config_profiles` | KK adjacent; Innsegall MDM/profile hygiene |
| `safari_profile` / `chrome_profile` / `firefox_profile` | KK has browser **extensions** category; Innsegall hijack-oriented profile read |

### Client-safe messaging

- "KnockKnock is a respected free tool that **lists** what is set to start with your Mac. Innsegall answers **are you okay right now** with a short Battle Scout, not a full persistence encyclopedia."
- Do not disparage Objective-See.

### Operator / agent

- **First** after fake popup: Innsegall scout, not KnockKnock.
- **After ESCALATE** for technical user or IT: mention KK or EtreCheck depth, not as substitute for receipt.

### SEO (internal queue only)

- Intents: `knockknock mac`, `persistence scanner after virus popup`, `knockknock vs antivirus`.
- No public HTML until gospel `mac_lane_absorption` row is `shipped`.

---

## BlockBlock

**Canon URL:** https://objective-see.org/products/blockblock.html

### What Objective-See says it does

- Monitors **common persistence locations**; alerts when a **new** persistent component is added.
- Installed via **BlockBlock Installer** → `/Library/Objective-See/BlockBlock/BlockBlock.app`.
- Uses Apple's **Endpoint Security Framework** · requires **Full Disk Access** (documented install path).
- Runs at login; **Allow** or **Block** on alert; **Block** can **remove** persistence from disk.
- Alerts show: responsible process (path, args, ancestry), persisted item, optional **VirusTotal** links for process + persisted item.
- **Rules** window · responses logged to `/Library/Objective-See/BlockBlock/BlockBlock.log`.
- Optional protections (settings / install): **Notarization** (block non-notarized execution, especially downloads), **Block (Downloaded) Scripts**, **Paste Protection** (Terminal paste / ClickFix; may need Accessibility for helper).
- Vendor FAQ: **alert ≠ infected** · many benign persist events (including BlockBlock itself).

### Strengths

- Proactive guardrail for users who want **stop new persistence**.
- Rich alert context for informed allow/deny.
- Pairs conceptually with KnockKnock (enumerate once · monitor ongoing).

### Weaknesses (post-scare lane)

- Wrong **first** tool after panic (configuration, ongoing alerts, blocking side effects).
- Not a **holistic** scare triage (browsers, DNS, downloads narrative).
- Innsegall is **read-only** by design · no filesystem removal on block.

### vs Innsegall

| BlockBlock | Innsegall |
|------------|-----------|
| Continuous monitor | Point-in-time scout |
| User blocks/removes | Evidence + verdict only |
| ESF + FDA always on | No background agent |

### Client-safe messaging

- "BlockBlock watches for **new** persistence over time. Innsegall is a **read-only check** when you are worried **today**, with a receipt it does not block or run in the background."

### Operator / agent

- Do not recommend BlockBlock **instead of** scout when user asks "am I infected after that popup?"
- Power-user stack: scout first · then discuss BB if they want ongoing persistence guard (disclose legit update alerts).

---

## LuLu

**Canon URL:** https://objective-see.org/products/lulu.html

### What Objective-See says it does

- **Free, open-source firewall** blocking **unknown outgoing** connections (malware C2 / exfil narrative).
- Installs **System Extension** + **Network Filter** (multi-step System Settings approval).
- Default install options: allow **Apple-signed** and **already installed** apps without nagging.
- Alerts on **new** unauthorized outbound connections · Allow/Block with **rule scope** (process vs remote endpoint) and **duration**.
- **Rules** profiles (v4.0+): separate rule sets per profile.
- **Modes:** Passive (silent, apply rules), **Block all** (with allow-list exceptions), no icon mode.
- **Allow/Block lists** (local file or remote URL); block list wins over allow; hostname blocking limits for some browsers (Chrome) documented on product page.
- **Network Monitor** menu opens packaged **Netiquette** (standalone network monitor also available).
- FAQ: macOS **built-in firewall is incoming only** · LuLu is **outgoing**.
- VirusTotal: only when user clicks button in alert (hash in URL); can disable VT button in settings.

### Strengths

- Strong **ongoing outbound** visibility for privacy-focused users.
- Mature rule UX · profiles · integrates with Objective-See ecosystem.

### Weaknesses (post-scare triage)

- Does not answer "was the popup real" or produce **Battle Scout** receipt.
- Extension approval friction for stressed users.
- Live connection alerts ≠ **DNS/proxy misconfiguration** story Innsegall tells on card (`dns_resolvers`, `system_proxy`, `hosts_file`).

### Public Innsegall alignment

- Shipped absorption: `network-monitor-vs-post-scare-triage` · gospel `network_tools` row.
- `GLOBAL_DOES_NOT_CHECK` explicitly excludes live network/keystroke monitoring · LuLu is complementary, not competing depth.

### Client-safe messaging

- Same as blog: monitors are for **ongoing network visibility**; Innsegall is **post-scare local triage** + optional Voyage rhythm.
- "If you already run LuLu, keep it. Innsegall still helps after a scare with local checks and a Battle Scout."

### Operator / agent

- "Install LuLu after popup?" → **scout first** · LuLu is optional firewall, not triage.
- LuLu alert storm → do not diagnose malware from chat · suggest scout for holistic read-only card.

---

## Combined playbook

| Scenario | Lead with | Optional add-on |
|----------|-----------|-----------------|
| Fake virus popup · non-technical | Innsegall Battle Scout | None first |
| IT wants persistence map | Scout card + | KnockKnock CLI/ GUI |
| User fears re-infection after fix | Explain tradeoffs | BlockBlock |
| User fears "phone home" | Scout DNS/proxy | LuLu (or Little Snitch) |
| Already runs all Objective-See tools | Innsegall still adds **verdict + receipt + clan share** | · |

---

## Policy

- **Do not** republish full weakness war tables on `/boat` or public gospel strips.
- **Do** cite official product URLs when updating this doc after vendor version bumps.
- **Verify:** `node scripts/audit-competitor-objective-see.mjs`
