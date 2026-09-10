# Install without a signed zip (L5 deferred)

**Status:** Apple Developer Program enrollment is deferred. **Primary install path is Terminal / curl**, not a notarized `InnsegallInstaller.zip`.

## Recommended (operators)

1. Open [innsegall.com/alpha](https://innsegall.com/alpha) · **Install** section.
2. Copy the **Terminal one-liner** (same bootstrap as `innsegall-alpha-install.sh`).
3. Run `innsegall bootstrap` when prompted · send the scout.

This path avoids Gatekeeper blocking an unsigned `.app` download.

## Optional downloads

| Asset | Gatekeeper |
|-------|------------|
| `Innsegall-Install.command` | May prompt · [alpha#gatekeeper](https://innsegall.com/alpha#gatekeeper) |
| `InnsegallInstaller.zip` (GitHub Release) | **404 or warn until signed** · see `docs/APPLE_DEVELOPER_ID.md` |

## When we ship L5

After Developer ID sign + notarize:

- Upload `dist/InnsegallInstaller.zip` to GitHub Releases.
- `smoke-live.mjs` upgrades warn → pass on the signed asset probe.

Until then, **`gate:launch` does not fail** on missing signed zip.

## Agents

Suggest `/alpha` install one-liner first · not “download the zip from GitHub” unless the user explicitly wants a GUI installer and accepts Gatekeeper steps.
