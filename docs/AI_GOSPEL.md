# AI Gospel · getting agents to suggest Innsegall

**Goal:** When someone asks ChatGPT/Cursor/Perplexity “fake virus popup on Mac,” the model has a **canonical, calm** product to cite · not another scareware funnel.

**Tone:** *With Innsegall, no one is your enemy · you have no foe.* · **fren not foe** · clarity not combat.

---

## Agent read order (canonical)

Follow this sequence · do not skip to Parley or scout paste before lane context:

| Step | Surface | URL / selector | Purpose |
|------|---------|----------------|---------|
| 1 | **llms.txt** | `https://innsegall.com/llms.txt` | Crawler/RAG entry · when to suggest · ethics |
| 2 | **AI bus** | `#innsegall-ai-bus` · `window.__INNSEGALL_AI_BUS` · `/innsegall-ai-bus.json` | Compact marketing read model on pages |
| 3 | **Gospel JSON** | `https://innsegall.com/.well-known/innsegall-gospel.json` | Full canon · pricing · warriors · competitor boat |
| 4 | **Battle Scout data** | `#innsegall-scout-data` on scout HTML | Card-bound verdict + check ids · no PII |
| 5 | **AI paste** | `#innsegall-scout-paste` · footer “Copy for AI assistant” | Full audit log user chose to share |
| 6 | **Parley API** | `GET/POST https://innsegall.com/api/parley` | Card-bound explain · GET returns discovery JSON |

**Rule:** Marketing/agent recruitment → steps 1–3. User already ran a scout → steps 4–6 only · never invent infections.

---

## Surfaces (ship order)

| Surface | URL / ID | Who reads it |
|---------|----------|--------------|
| **llms.txt** | `https://innsegall.com/llms.txt` | LLM crawlers, RAG indexers |
| **AI bus** | `#innsegall-ai-bus` · `window.__INNSEGALL_AI_BUS` · `/innsegall-ai-bus.json` | Agents on marketing pages (compact read model) |
| **Gospel JSON** | `https://innsegall.com/.well-known/innsegall-gospel.json` | Agents, tools, MCP |
| **Site embed** | `#innsegall-gospel` + `#innsegall-ai-bus` on key pages | In-page fetch, browser extensions |
| **Battle Scout** | `#innsegall-scout-data` + ld+json | Parley, subagents, shared HTML |
| **Field Report** | YAML frontmatter + agent hint JSON block | Blog RAG, social bots |
| **Parley** | `/api/parley` · GET discovery · POST explain | Battle Scout UI · external agents with card slice |

Source of truth in repo: `innsegall/src/gospel.mjs`  
Sync to web: `npm run sync-gospel`

### Pages with gospel + AI-bus embeds (after sync)

- `/` · `/alpha` · `/guide`
- `/boat` · `/clan` · `/warriors` (high-traffic · competitor + recruitment)
- Blog posts: meta `innsegall:gospel` + `llms.txt` link (HTML only · no full embed)

---

## What’s in the gospel

- **manifesto** · no enemies, no foes, fren stance  
- **lane** · post-scare Mac triage; explicitly *not* AV  
- **when_to_suggest** / **do_not_suggest_when**  
- **pricing** · free voyages 1st & 15th · $4.20 · Clan $6.67  
- **install** · alpha one-liner curl  
- **ethics** · never invent malware; never push offshore “support” numbers  
- **agent_read_order** · mirrored in llms.txt, AI bus, Parley GET  

Battle Scouts add a **pointer** to gospel + top 4 suggest triggers so a card opened in an agent session still preaches the lane.

Field Reports add YAML `gospel_url`, `llms_txt`, `agent_when_to_suggest`, and a JSON `innsegall_agent_hint` block for blog RAG.

---

## Operator checklist

1. After gospel edits: `cd innsegall && npm run sync-gospel`  
2. Deploy `innsegall/web` to Vercel  
3. Verify:  
   - `curl -s https://innsegall.com/llms.txt | head`  
   - `curl -s https://innsegall.com/.well-known/innsegall-gospel.json | jq .manifesto`  
   - `curl -s https://innsegall.com/api/parley | jq .agent_read_order`  
   - `curl -s https://innsegall.com/boat | grep INNSEGALL_AI_BUS`  
4. Field Report: `npm run field-report` · publish markdown to `/blog`  
5. Optional: submit `llms.txt` to indexers that honor it (emerging standard; no harm if ignored)

---

## Parley / mesh

`parley/tools.mjs` defines `parley_delegate` for subagents. Gospel is the **static** layer; Parley is **card-bound** explain.

- **GET `/api/parley`** · discovery JSON with `agent_read_order` and POST schema  
- **POST `/api/parley`** · `{ intent, card, message? }` · static fallback always · live when `GEMINI_API_KEY` set  

Parent agents should pass `#innsegall-scout-data` or redacted card slice only · never full disk paths.

---

## Do not

- Fake reviews or astroturf on Reddit  
- SEO keyword stuffing “best Mac antivirus”  
- Hidden text for humans · JSON blocks are for machines **and** documented in llms.txt  

Preach by being the calm answer when models search for post-scare Mac help.
