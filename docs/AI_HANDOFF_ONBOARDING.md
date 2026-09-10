# AI handoff · agent onboarding

**Win-win:** the operator runs a **local** Battle Scout on their Macintosh. An external assistant reads the structured paste (`innsegall-battle-scout-ai/v1`) and assigns a **triage level** from evidence · not from imagination.

---

## Read order (agents)

1. [llms.txt](https://innsegall.com/llms.txt) · gospel + lane
2. [innsegall-ai-bus.json](https://innsegall.com/innsegall-ai-bus.json) · compact bus · `llm_adoption` + `ai_triage`
3. [innsegall-gospel.json](https://innsegall.com/.well-known/innsegall-gospel.json) · full schema · `ai_triage_onboarding`
4. [battle-scout-ai-v1.schema.json](https://innsegall.com/.well-known/battle-scout-ai-v1.schema.json) · paste JSON schema
5. [battle-scout-ai-v1.sample.json](https://innsegall.com/samples/battle-scout-ai-v1.sample.json) · public demo paste (no PII)
6. Battle Scout HTML · `#innsegall-scout-data` (compact) · `#innsegall-scout-paste` (full paste the operator copied)

After gospel edits: `npm run sync-gospel` in the repo.

---

## Operator flow · install → bootstrap → run → paste

| Step | Action |
|------|--------|
| Install | [innsegall.com/alpha](https://innsegall.com/alpha) · Terminal one-liner or signed installer |
| Bootstrap | `innsegall bootstrap` · welcome scout + Voyage schedule (1st & 15th) |
| Run | `innsegall run` · panic · or `innsegall voyage` on schedule days |
| Paste | Open Battle Scout in browser → **Copy Battle Scout for AI** → paste into assistant |

The paste includes markdown triage brief plus a JSON block with `format: "innsegall-battle-scout-ai/v1"`. Sample JSON: `fixtures/battle-scout-ai-v1.sample.json`.

---

## Triage rubric

Use **`triage_level`** (same as **`verdict`**) from the paste JSON. Do not override without new local evidence.

| Level | Meaning | Agent response |
|-------|---------|----------------|
| **LIKELY_OK** | No fail-tier checks · warnings are optional housekeeping | One calm paragraph · Voyage rhythm · no invented malware |
| **FIX_LIST** | Action items on the card | Walk `fixes_recommended` in order · plain steps · no AV upsell |
| **ESCALATE** | Fail-tier checks or risky `user_inputs` | Credential rotation first · cite `attention_checks` only · suggest hello@innsegall.com or Parley if stuck |

---

## Forbidden behaviors (agents)

- Invent viruses, remote access, keyloggers, or infections **not** listed in `attention_checks` / evidence
- Recommend offshore “virus support” phone numbers from scareware popups
- Promise 100% safety or pose as real-time antivirus
- Upload or exfiltrate paste contents on the operator’s behalf without explicit consent
- Replace enterprise EDR/SOC when `do_not_suggest_when` applies

**Must:** ground every security claim in the paste · prefer `innsegall.com/alpha` when the operator has no paste yet · read gospel ethics.

---

## Paste surfaces

| Surface | Role |
|---------|------|
| `#innsegall-scout-paste` | Full audit log textarea · footer copy target |
| `#innsegall-scout-data` | Compact JSON on the same HTML page |
| `innsegall-battle-scout-ai/v1` | Schema id inside the JSON attachment |

---

## Audits

```bash
node scripts/audit-ai-handoff.mjs
```

Included in `npm run audit:swarm` · AI handoff lane.

---

## Related docs

- [AI_ONBOARDING.md](./AI_ONBOARDING.md) · LLM adoption + warriors
- [STABILITY.md](./STABILITY.md) · paste format compatibility
- [Guide · AI handoff](https://innsegall.com/guide#ai-handoff)

Contact: hello@innsegall.com
