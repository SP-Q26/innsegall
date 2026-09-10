# Changelog

All notable changes to the **Innsegall engine** (`src/`, `bin/`) and **public site** (`web/`).  
Versioning follows [Semantic Versioning](https://semver.org/) during alpha (`0.x.y-alpha`).

**Stability policy:** see [docs/STABILITY.md](docs/STABILITY.md).

---

## [0.4.0-alpha] · 2026-09-10

### Added (AI triage · Phase 6 wave 1)
- `docs/AI_HANDOFF_ONBOARDING.md` · `docs/IOS_PRODUCT.md` · `docs/FREE_LANE_SPRINT.md` · `docs/PHASE_6_FREE_LANE.md`.
- Public `/.well-known/battle-scout-ai-v1.schema.json` · `/samples/battle-scout-ai-v1.sample.json`.
- `npm run dry-run:lanes` · `npm run sync:battle-scout-sample` · gospel `triage_level` on AI paste payload.
- Swarm lane `audit-ai-handoff.mjs` · live smoke probes for schema + sample.

### Added (Developer ID)
- `packaging/macos/InnsegallInstaller.app` template · `npm run pack:macos-installer` · `npm run release:macos-installer`.
- `docs/APPLE_DEVELOPER_ID.md` · GitHub Actions `macos-release.yml` for sign + notarize on tag.

### Added (install automation)
- `innsegall bootstrap` / `onboard` · welcome scout + launchd Voyage schedule (1st & 15th 10:00).
- `Innsegall-Install.command` one-click installer · alpha page primary CTA.
- `scripts/audit-install-flow.mjs` · swarm lane for bootstrap wiring.
- Install script: Homebrew `node` fallback · absolute-path CLI wrapper · `install_ping` on bootstrap.

### Added
- Per-check scope copy on Battle Scout: looked at · does not cover · why it matters (`src/check-catalog.mjs`).
- Global “What this scout does not check” section on Battle Scout footer.
- Share dock: Copy for AI + Download report (`.md`).
- `marketing_ping` and `issue_spotlight` telemetry events · Xano paste stack.
- Issue spotlight blog loop · competitor boat lane · warriors attribution.
- Distribution and trust docs: `DISTRIBUTION_PLAYBOOK.md`, `STABILITY.md`, Homebrew formula template.

### Changed
- Field echoes and site CSS v16 readability pass.
- Xano auth precondition uses `sk_live_innsegall_ops_` / `sk_test_innsegall_ops_` env names.

### Fixed
- Claymore voice: em dashes replaced with middle dots in user-facing scout copy.

---

## [0.3.x-alpha] · 2026-09 (prior)

- Battle Scout HTML receipt · AI paste (`innsegall-battle-scout-ai/v1`).
- Voyage health tracker (1st & 15th) · quota ledger · Stripe checkout (test).
- Agent gospel: `llms.txt`, ai-bus, `#innsegall-scout-paste`.
- Local-first privacy gospel · anonymous telemetry opt-out.

---

*Older alpha history lives in git. Tag releases at `v0.4.0-alpha` onward for Homebrew and directory listings.*
