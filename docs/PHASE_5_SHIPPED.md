# Phase 5 · trust install + alpha onboarding · Sep 2026

**Theme:** Real one-click aboard (signed) · bootstrap automation · honest scout depth.  
**Gate:** `npm run audit:swarm` · `npm run gate:launch` · `npm run smoke:live`

---

## Shipped (code)

| Area | What |
|------|------|
| Install | `innsegall bootstrap` · launchd 1st/15th · `innsegall-alpha-install.sh` |
| Gatekeeper UX | `/alpha#gatekeeper` · Terminal-first · `Innsegall-Install-Paste.txt` |
| Developer ID | `packaging/macos/InnsegallInstaller.app` · `npm run pack/release:macos-installer` |
| Docs | `docs/APPLE_DEVELOPER_ID.md` · `docs/STABILITY.md` scout depth |
| CI | `.github/workflows/macos-release.yml` |
| Audits | `audit-install-flow.mjs` swarm lane |
| Live smoke | HEAD probe for `InnsegallInstaller.zip` (warn until release uploaded) |

---

## Operator exit (true signed one-click)

| ID | Task | Done when |
|----|------|-----------|
| A1 | Apple Developer Program · **Developer ID Application** cert | Keychain identity |
| A2 | `npm run release:macos-installer` · notary **Accepted** | Stapled `.app` in zip |
| A3 | GitHub Release **`InnsegallInstaller.zip`** on `latest` | `smoke:live` signed line **ok** |
| A4 | `/alpha` primary download · no Gatekeeper block on clean Mac | Alpha install smoke |

Xano + Stripe live are **green** · this phase is **Apple trust**, not backend.

---

## Scout depth (Phase 5 decision)

**Keep 13 core checks for `mac_hygiene`.** Add flow-specific checks only when the user’s story needs them. See `docs/STABILITY.md` · “Scout depth”.

**Do not** bloat toward AV-style full scans · breaks “know you’re okay in two minutes” positioning.

---

## Positioning

- **Install:** signed app → Terminal → same bootstrap → welcome scout → Voyage schedule.
- **Receipt:** Battle Scout scope honesty scales with check count · quality over quantity.
- **Next product phase (Phase 6 candidates):** seat tokens · `/api/redeem` · notarized CLI binary (not just installer wrapper).

---

*Swarm must be green before tagging `v0.4.0-alpha` installer release.*
