# Competitor absorption · Mac lanes

**Canon source:** `INNSEGALL_GOSPEL.competitor_boat.mac_lane_absorption` in `src/gospel.mjs`  
**Swarm:** `node scripts/audit-competitor-absorption.mjs`

## Rules

1. **Shipped** rows must have a live `web/blog/{slug}.html` and appear in `llms.txt` absorption list.  
2. **Queued** rows must **not** have HTML until gospel `status` flips to `shipped`.  
3. Every new row needs a **boat** table line or explicit `absorb_via: boat` in gospel.  
4. Customer copy: **complementary** for Apple built-in and installed AV · **not replacement**.

## Queue (Phase 7)

| Slug | Player lane | Priority |
|------|-------------|----------|
| `innsegall-vs-mac-cleaners` | CleanMyMac / MacKeeper / Intego | P0 |
| `innsegall-vs-etrecheck-macintosh` | EtreCheck / Objective-See | P1 |
| `macintosh-xprotect-after-scare` | Apple built-in | P1 |
| `virustotal-vs-local-mac-scout` | VirusTotal / URL scan | P1 |
| `network-monitor-vs-post-scare-triage` | Little Snitch / LuLu | P2 |

## Post template (each)

- Lead: post-scare · not antivirus  
- Table: their game · weakness · our boat (one row)  
- CTA: Send the scout · link `/alpha`  
- Ending: scout-for-you · link `/boat`  
- No em dash (Claymore)
