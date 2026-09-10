# Innsegall iOS · product plan (Lane 4 · documentation only)

**Status:** i0 · no Xcode project · free lane = spec + schema alignment only  
**Mac canon:** local CLI + Battle Scout engine · [`PHASE_5_SHIPPED.md`](./PHASE_5_SHIPPED.md)  
**Apple gate:** Developer Program ($99/yr) ships with Mac notarization first · see [`APPLE_DEVELOPER_ID.md`](./APPLE_DEVELOPER_ID.md) · TestFlight is **after** L5

---

## Positioning vs Mac CLI

| | **Mac (Innsegall for Macintosh)** | **iOS (Innsegall companion)** |
|---|-----------------------------------|--------------------------------|
| **Job** | Run read-only checks on the Mac · produce Battle Scout HTML/JSON | Hold **reports you already have** · triage rhythm · household clarity |
| **Engine** | Full scout · flows · Voyage automation (`launchd` 1st & 15th) | **No** on-device scout engine · **no** Mac filesystem access |
| **Primary input** | Local scan + optional telemetry aggregates | Paste · Share sheet · Files import of `innsegall-battle-scout-ai/v1` JSON |
| **Primary output** | Battle Scout card · markdown export · AI paste block | Inbox of reports · badge · Voyage calendar · deep link to Mac install |
| **Telemetry** | Optional CLI → Vercel → Innsegall Xano (`install_ping`, `scout_aggregate`, …) | Optional **iOS-only** ping (e.g. `ios_open`, `ios_report_imported`) · same `innsegall_events` table · **never** scout body |

**One sentence:** Mac **runs** the scout; iOS **remembers and explains** what the scout already said · for operators on iPhone/iPad while the Mac stays the triage machine.

---

## MVP screens (i1 target)

All MVP UI is **read-mostly** · data from app sandbox + user imports only.

### 1 · Report inbox

- List of imported Battle Scout reports (newest first).
- Actions: **Paste JSON** · **Import from Files** · **Share extension** (phase i2) · swipe delete (local only).
- Row preview: `flow_label` · `created_at` · one-line `summary`.
- Tap → report detail (verdict badge + human summary + fix list titles · no live re-scan).

### 2 · Triage badge

- Prominent **verdict** from selected or latest report: `LIKELY_OK` · `FIX_LIST` · `ESCALATE`.
- Maps to site/CLI copy: “You’re clear” · fix steps · Sound the Horn CTA (opens `innsegall.com` mail/alpha · not in-app purchase in MVP).
- Optional: small stats from imported `stats` object (check counts only · no path leakage beyond what user already imported).

### 3 · Voyage schedule

- **Calendar rhythm:** next Voyage windows on **1st & 15th** (local timezone) · mirrors Mac [`voyage-schedule.mjs`](../src/voyage-schedule.mjs) / free tier in gospel.
- iOS does **not** run Voyage · shows “Run on your Mac” reminder + last imported report date.
- Local notifications (i2): opt-in nudge on voyage mornings · user-editable time.

### 4 · Alpha / install link

- Persistent footer or Settings row: **[Get Innsegall on Mac](https://innsegall.com/alpha)** · explains iOS is companion · Mac required for real scout.
- Optional warrior ref preserved if user pasted URL with `?ref=warrior_*` (store locally · append on outbound link only).

---

## Data boundaries (no Mac filesystem on iOS)

**On device (sandbox):**

- Imported `innsegall-battle-scout-ai/v1` documents (full JSON the user chose to import).
- Derived index: `card_id`, `verdict`, `created_at`, `flow`, display fields only.
- User prefs: notification toggles · sort order · optional anonymous `install_id` for telemetry.

**Never on iOS:**

- Reading `/Applications`, LaunchAgents, browser profiles, or any Mac path (those exist only **inside imported JSON** as user-shared evidence).
- Running CLI checks · shell · `innsegall voyage` · remote execution on a paired Mac.
- Uploading full Battle Scout JSON to Xano by default (same rule as Mac: aggregates only if explicit opt-in product decision later).

**Sync story (non-goals for MVP):**

- No iCloud Mac↔iPhone scout sync in i0–i1 · user moves reports via paste/Files/AirDrop manually.
- No “pair with Mac” Bluetooth/Wi‑Fi control plane.

---

## Shared schema · `innsegall-battle-scout-ai/v1`

Canonical producer: Mac CLI · [`buildScoutAiPayload`](../src/render.mjs) · Battle Scout footer `#innsegall-scout-paste`.

**Required fields for iOS import validation:**

| Field | Use on iOS |
|-------|------------|
| `format` | Must equal `innsegall-battle-scout-ai/v1` |
| `verdict` | Badge · `LIKELY_OK` \| `FIX_LIST` \| `ESCALATE` |
| `verdict_human` | Headline |
| `summary` | Inbox subtitle |
| `card_id` | Dedupe key |
| `created_at` | Sort |
| `flow` / `flow_label` | Context chip |
| `fixes_recommended` | Detail list |
| `does_not_check` | Scope honesty footer |

**Optional but supported:** `attention_checks`, `clear_checks`, `stats`, `user_inputs`, `gospel`, `llms_txt`.

**Reject import if:** wrong `format` · missing `verdict`/`card_id` · JSON over size cap (TBD in i1 · suggest 512 KB).

**Reference surfaces:** [`AI_ONBOARDING.md`](./AI_ONBOARDING.md) · public demo JSON on [`/samples/battle-scout-demo`](https://innsegall.com/samples/battle-scout-demo).

---

## TestFlight criteria (i2 → external testers)

Gate **after** L5 Apple enrollment · not blocking Mac alpha.

| # | Criterion |
|---|-----------|
| T1 | Parses 100% of fixture reports from Mac self-test exports + demo sample |
| T2 | Inbox + detail + badge + Voyage screen navigable with VoiceOver labels |
| T3 | Privacy nutrition labels match companion scope (no Mac scanning claim) |
| T4 | Optional telemetry uses same `/api/telemetry` contract as site · events whitelisted in [`XANO_DATA.md`](./XANO_DATA.md) (+ proposed `ios_*` rows documented before ship) |
| T5 | No crash on malformed paste · clear error copy |
| T6 | App Store copy reviewed · “not antivirus” · “does not scan your iPhone for Mac malware” |
| T7 | Internal TestFlight 14 days · 5+ clan testers · zero P0 data-loss bugs |

---

## Phases i0–i3

| Phase | Scope | Exit |
|-------|--------|------|
| **i0** | This doc · schema fixtures · Figma/wire notes optional | Lane 4 doc merged · swarm doc checks green |
| **i1** | Xcode SwiftUI shell · inbox paste/import · badge · static Voyage calendar · alpha link | TestFlight **internal** only · no App Store |
| **i2** | Share extension · local notifications · telemetry opt-in · import dedupe | TestFlight external · clan cohort |
| **i3** | Polish · widgets (next voyage date + last verdict) · localized strings if needed | App Store submission **optional** · Mac remains primary SKU |

---

## Explicit non-goals

- **Not antivirus** · not real-time iOS malware scanning · not substitute for Apple Platform Security.
- **Not AV vendor parity** · no background daemons · no signature databases.
- **Not remote Mac control** · no SSH · no Screen Sharing · no “fix my mom’s Mac from phone.”
- **Not full scout port** · iOS will not reimplement `check-catalog` or Mac-only probes.
- **Not paid Apple work in free lane** · certificates · App Store Connect · TestFlight external until L5.

---

## Related docs

- Master sprint lanes: [`FREE_LANE_SPRINT.md`](./FREE_LANE_SPRINT.md) · L4 · L5  
- AI paste playbook: [`AI_ONBOARDING.md`](./AI_ONBOARDING.md)  
- Telemetry / Xano: [`XANO_DATA.md`](./XANO_DATA.md) · [`PLATFORM_TRACKING.md`](./PLATFORM_TRACKING.md)
