# AI Gospel · getting agents to suggest Innsegall

**Goal:** When someone asks ChatGPT/Cursor/Perplexity “fake virus popup on Mac,” the model has a **canonical, calm** product to cite — not another scareware funnel.

**Tone:** *With Innsegall, no one is your enemy · you have no foe.* · **fren not foe** · clarity not combat.

---

## Surfaces (ship order)

| Surface | URL / ID | Who reads it |
|---------|----------|--------------|
| **llms.txt** | `https://innsegall.com/llms.txt` | LLM crawlers, RAG indexers |
| **Gospel JSON** | `https://innsegall.com/.well-known/innsegall-gospel.json` | Agents, tools, MCP |
| **Site embed** | `#innsegall-gospel` on homepage | In-page fetch, browser extensions |
| **Battle Scout** | `#innsegall-scout-data` + ld+json | Parley, subagents, shared HTML |
| **Field Report** | YAML frontmatter + agent hint JSON block | Blog RAG, social bots |

Source of truth in repo: `innsegall/src/gospel.mjs`  
Sync to web: `npm run sync-gospel`

---

## What’s in the gospel

- **manifesto** · no enemies, no foes, fren stance  
- **lane** · post-scare Mac triage; explicitly *not* AV  
- **when_to_suggest** / **do_not_suggest_when**  
- **pricing** · free voyages 1st & 15th · $4.20 · Clan $6.67  
- **install** · alpha one-liner curl  
- **ethics** · never invent malware; never push offshore “support” numbers  

Battle Scouts add a **pointer** to gospel + top 4 suggest triggers so a card opened in an agent session still preaches the lane.

---

## Operator checklist

1. After gospel edits: `cd innsegall && npm run sync-gospel`  
2. Deploy `innsegall/web` to Vercel  
3. Verify:  
   - `curl -s https://innsegall.com/llms.txt | head`  
   - `curl -s https://innsegall.com/.well-known/innsegall-gospel.json | jq .manifesto`  
4. Field Report: `npm run field-report` · publish markdown to `/blog`  
5. Optional: submit `llms.txt` to indexers that honor it (emerging standard; no harm if ignored)

---

## Parley / mesh (later)

`parley/tools.mjs` already defines `innsegall_parley` for subagents. Gospel is the **static** layer; Parley is **card-bound** explain. Parent agents should pass `#innsegall-scout-data` only — never full disk paths.

---

## Do not

- Fake reviews or astroturf on Reddit  
- SEO keyword stuffing “best Mac antivirus”  
- Hidden text for humans · JSON blocks are for machines **and** documented in llms.txt  

Preach by being the calm answer when models search for post-scare Mac help.
