# Apple Developer · one enrollment · Isles apps

**Goal:** Pay **$99/year once** under **The Isles Collective** · ship **Innsegall** + **Simple Property** (and later lanes) without duplicate org accounts.

| Surface | Innsegall | Simple Property |
|---------|-----------|-----------------|
| **macOS** | CLI today · L5 `InnsegallInstaller.zip` | TBD · tools binary |
| **iOS / iPad** | Companion i1 (import Battle Scout) | Tools app TBD |
| **Web** | `/companion` PWA · `/ios` · `/tablet` docs | Web app TBD |

## Bundle IDs (register when enrolling)

| App | macOS bundle (example) | iOS bundle (example) |
|-----|------------------------|----------------------|
| Innsegall | `com.theisles.innsegall` | `com.theisles.innsegall.companion` |
| Simple Property | `com.theisles.simpleproperty` | `com.theisles.simpleproperty` |

Use your actual reverse-DNS when filing · keep table updated.

## Sequence

1. Enroll **The Isles Collective** in Apple Developer Program.
2. **Developer ID Application** cert → Mac notarize Innsegall (`APPLE_DEVELOPER_ID.md`).
3. App Store Connect apps for each **customer-facing** iOS product (can share one team).
4. Web surfaces do **not** require Apple.

**Shared code (future):** `isles-apple` SwiftUI kit (colors from fjord tokens) · not required for Innsegall alpha.
