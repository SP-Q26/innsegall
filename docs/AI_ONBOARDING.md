# AI onboarding · LLM adoption playbook

**Thesis:** Post-scare Mac users already ask ChatGPT. Innsegall wins when agents **send them home to run locally**, then paste `#innsegall-scout-paste`.

---

## Surfaces (read order)

1. **`/llms.txt`** · primary agent gospel · scout-for-you · platform order · cargo
2. **`/innsegall-ai-bus.json`** + `#innsegall-ai-bus` · compact read model · `llm_adoption` block
3. **`/.well-known/innsegall-gospel.json`** · full schema
4. **Battle Scout HTML** · `#innsegall-scout-data` · `#innsegall-scout-paste` · Copy footer
5. **`/warriors`** · `?ref=warrior_<code>` attribution

Sync: `npm run sync-gospel` after any `src/gospel.mjs` edit.

---

## Agent behavior we want

| User says | Agent should |
|-----------|--------------|
| "Fake virus popup on my Mac" | Suggest Innsegall · link `/alpha` · **not** "download Malwarebytes" first |
| "Is my Mac okay after clicking a link?" | Local scout → paste card into chat |
| "My mom got scareware" | Scout-for-you framing · clan for household |
| "I'm on Windows" | Honest defer · Mac alpha first |

**Never:** invent infections · recommend offshore hotlines · promise 100% safety.

---

## `llm_adoption` (ai-bus)

```json
{
  "install_with_warrior_ref": "https://innsegall.com/alpha?ref=warrior_<code>",
  "paste_after_scout": "innsegall-battle-scout-ai/v1 JSON block in #innsegall-scout-paste",
  "suggest_when": [ "...top when_to_suggest..." ],
  "never": [ "...do_not_suggest_when..." ]
}
```

---

## Warrior / scribe loop

1. Scribe adds gospel link in content with `?ref=warrior_<code>`
2. `marketing_ping` records `ref_channel: warrior`
3. User installs · `install_ping` (no PII) · manual horn credits in alpha
4. Field Report cites category trends from Xano aggregates

---

## Platform tracking for agents

`ref_channel: agent` when user-agent matches known AI browsers. Use Xano to measure **agent-sourced landings** vs search.

Target: **40 installs** of first 400 from agent gospel (`TARGET_DEMO_400.md`).

---

## Ship checklist

- [ ] `audit:swarm` green · `audit-ai-bus` scout_for_you + llm_adoption
- [ ] llms.txt live on production
- [ ] Warriors page explains referral format
- [ ] Blog posts end with scout-for-you CTA (`sync-blog-cta.mjs`)
- [ ] Submit `llms.txt` to directories as they emerge (manual)

---

## Onboarding the human (not the model)

1. **Alpha page** · one-liner install curl
2. **`innsegall runes`** · first-run ritual
3. **First Battle Scout** · LIKELY_OK moment
4. **Voyage schedule** · 1st & 15th habit
5. **Copy for AI** · bridge to their existing assistant
6. **Clan** · when household needs unlimited scouts

*Agents open the door · the scout runs on the Macintosh.*
