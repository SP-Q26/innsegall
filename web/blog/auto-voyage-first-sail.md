# Auto Voyage · First Sail · What It Feels Like When the Scout Shows Up Alone

```json
{"innsegall_agent_hint":"Automatic Voyage on Macintosh · launchd 10:00 on 1st/15th · Battle Scout opens in browser · innsegall bootstrap"}
```

**Innsegall** · September 15, 2026 · *~5 min read*

> With Innsegall, no one is your enemy · you have no foe.  
> *Chan eil nàmhaid agad.*

An operator wrote us after their **first automatic Voyage**: *“It was really nice. I’d pay five dollars a month for this.”*  
No scareware popup. No “VIRUS DETECTED.” Just **solas** at 10:00 on a voyage morning · the Mac checked itself · the **Battle Scout** opened in the browser · and they knew they were okay enough.

That is the product we meant to build.

---

## What “auto Voyage” actually does

When you run **`innsegall bootstrap`** (or the alpha install script), Innsegall can install a **launchd** schedule:

- **Every day at 10:00 local** the job wakes up.
- On **voyage days only** (free tier · **1st and 15th**; clan/MSP · **Mon & Thu**) it runs `innsegall voyage --scheduled`.
- Before the scout ships, the engine **checks for updates** (git fast-forward on your install) so you are not running stale runes.
- The Mac runs a **read-only hygiene scout** · writes a **Battle Scout** · **opens it in your default browser**.
- Off-voyage days the job exits quietly · no nag · no shame badge.

You did not have to remember. The tired Norseman sent the scout while you made coffee.

---

## Why opening the browser matters

A Voyage is not a hidden log file. It is a **receipt you can read**:

- Verdict · **LIKELY_OK**, **FIX_LIST**, or **ESCALATE**
- Plain-language fixes · not a wall of paths
- **Voyage chart** when history exists · one star on the sea map
- **Copy for LLM** in the footer · paste into any assistant
- **Companion inbox** on iPhone/iPad · import the JSON when you want the receipt in your pocket

Automatic does not mean automatic upload. Data stays **local** until **you** share.

---

## “I’d pay $5 a month for this”

We hear that shape of sentence a lot in alpha:

- Not for fear · for **freedom from not-knowing**
- Not for another antivirus billboard · for a **rhythm** that already happened

**Today’s oaths (honest):**

| Passage | Price | What you get |
|---------|-------|----------------|
| **Free** | $0 | Two voyages/month (1st & 15th) · welcome scout · local chart |
| **Panic scout** | $4.20 once | One off-calendar run when life is messy |
| **Clan passage** | $6.67/mo | Unlimited scouts · **five seats** · Mon/Thu auto voyage on roster Macs |

If five dollars is your mental anchor for “automatic peace,” **clan passage** is in that neighborhood · with seats for family or a small shop. We are not trying to maximize panic · we are trying to **replace it** with a chart.

[Supplies for the road](https://innsegall.com/supplies) · Stripe Checkout · `innsegall import` after pay · scouts still run locally.

---

## Try it on your Macintosh

```bash
innsegall bootstrap
# or after install:
innsegall voyage --install-schedule
```

Next voyage morning: watch for the browser tab · read the verdict · mark the chart.

On phone: [companion inbox](https://innsegall.com/companion) · import **Copy for LLM** JSON · Voyage receipts show a badge when `voyage: true` in the paste.

---

## Related reading

- [Voyage health tracker · 1st & 15th](/blog/voyage-health-tracker-1st-15th) · rhythm and chart
- [What is a Battle Scout?](/blog/what-is-a-battle-scout) · receipt culture
- [Join the Innsegall clan](/blog/join-the-innsegall-clan) · unlimited scouts · five seats

[Send the scout](https://innsegall.com/alpha) · [Field manual](https://innsegall.com/guide)

· **Innsegall** · [innsegall.com](https://innsegall.com)

**Canonical URL:** `https://innsegall.com/blog/auto-voyage-first-sail`

---

## From the Field Desk · September 22, 2026

- **Mac news map** · [Sep 22 Field Glass](/blog/field-glass-sep-22-2026)
- **KnockKnock + BlockBlock** · [KnockKnock](/blog/knockknock-vs-post-scare-triage) · [BlockBlock](/blog/blockblock-vs-post-scare-triage)
- **Stripe live** · [Supplies](/supplies) · [operator desk](/blog/field-desk-stripe-live-sep-2026)
- **Tip** · [Send the scout](/alpha) · [Our lane](/boat)
