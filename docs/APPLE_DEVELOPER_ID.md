# Apple Developer ID · signed Macintosh installer

**L5 deferred:** Without an active Apple Developer Program membership (~$99/year), macOS will block or warn on unsigned downloads. **Canonical install today:** Terminal one-liner on `/alpha` · see `docs/INSTALL_WITHOUT_SIGNED_ZIP.md`. Swarm treats missing signed zip as **warn-only**.

**When enrolled:** follow **`docs/L5_OPERATOR_RUNBOOK.md`** · GitHub Actions `macos-release` · tag `v*` push.

**Goal (when enrolled):** Operators double-click **Innsegall Installer** without Firefox Gatekeeper (“unidentified developer”).

**Artifact:** `dist/InnsegallInstaller.zip` → `InnsegallInstaller.app` (Developer ID signed + notarized).

### Three surfaces · one Apple account (The Isles Collective)

**Bundle map:** [`docs/isles/APPLE_BUNDLE_MAP.md`](./isles/APPLE_BUNDLE_MAP.md) · Innsegall + Simple Property on one enrollment.

Brand is aligned sitewide (**Macintosh clan · family · iPad & iOS**). What $99/yr unlocks vs what still needs build work:

| Surface | Works today (no Apple) | Unlocks with Developer Program | Still required after enroll |
|---------|------------------------|--------------------------------|-----------------------------|
| **macOS** | Terminal / curl install · full scout CLI | **Signed + notarized** `InnsegallInstaller.zip` on GitHub Releases · Gatekeeper-clean | `npm run release:macos-installer` + Release upload · [`L5_OPERATOR_RUNBOOK.md`](./L5_OPERATOR_RUNBOOK.md) |
| **iPad & iPhone (web)** | [`/tablet`](https://innsegall.com/tablet) · [`/ios`](https://innsegall.com/ios) · companion copy · Battle Scout paste schema | Same site · optional **Smart App Banner** / universal links when native app exists | No binary required for web companion |
| **iOS app (native)** | Spec + schema i0 · paste/import contract in [`IOS_PRODUCT.md`](./IOS_PRODUCT.md) | App Store Connect · distribution certs · **TestFlight** | **i1 Xcode scaffold** (inbox + import) · not automatic with Mac notary alone |

**Honest sequence:** enroll → ship **Mac L5** first (revenue + trust) → **i1** companion binary on same team → TestFlight → App Store optional. Tablet in product language = **iPad** (native app is one binary for iPhone + iPad) plus **web** `/tablet` for household triage in Safari.

**Not blocked on Apple:** Stripe checkout + license bind (`innsegall import`) · Xano telemetry is separate ops.

---

## 1 · Enroll (The Isles Collective)

1. [Apple Developer Program](https://developer.apple.com/programs/) · **$99/year** · org **The Isles Collective** (match Stripe legal entity).
2. Accept agreements in [App Store Connect](https://appstoreconnect.apple.com/) and Developer portal.
3. Note **Team ID** (10 chars) · **Developer → Membership**.

---

## 2 · Certificates (one-time on maintainer Mac)

1. **Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority** → save `Innsegall.certSigningRequest`.
2. [Certificates, IDs & Profiles](https://developer.apple.com/account/resources/certificates/list) → **+** → **Developer ID Application** → upload CSR → download `.cer` → double-click to install.
3. Confirm identity:

```bash
security find-identity -v -p codesigning | grep "Developer ID Application"
```

Export **.p12** for CI (optional): Keychain → cert + private key → Export → password → store as GitHub secrets (see §5).

---

## 3 · Notary credentials

**Option A · App Store Connect API key (recommended for CI)**

1. App Store Connect → Users and Access → **Integrations** → **App Store Connect API** → generate key · **Developer** role.
2. Save `AuthKey_<KEYID>.p8` · note **Issuer ID** and **Key ID**.

```bash
# Store key outside repo
mkdir -p ~/.innsegall-notary
mv ~/Downloads/AuthKey_*.p8 ~/.innsegall-notary/
```

**Option B · Keychain profile (local only)**

```bash
xcrun notarytool store-credentials "innsegall-notary" \
  --apple-id "YOUR_APPLE_ID" \
  --team-id "YOUR_TEAM_ID" \
  --password "APP-SPECIFIC-PASSWORD"
```

App-specific password: [appleid.apple.com](https://appleid.apple.com) → Sign-In and Security → App-Specific Passwords.

---

## 4 · Build · sign · notarize (maintainer Mac)

```bash
cd innsegall
npm run pack:macos-installer

# If multiple identities:
export SIGNING_IDENTITY="Developer ID Application: The Isles Collective (TEAMID)"

# API key path (CI uses same env names)
export NOTARY_API_KEY_ID="..."
export NOTARY_API_ISSUER_ID="..."
export NOTARY_API_KEY_PATH="$HOME/.innsegall-notary/AuthKey_XXXX.p8"

npm run release:macos-installer
```

Output: **`dist/InnsegallInstaller.zip`**

Smoke on a **clean** Mac (or another user account):

1. Download zip · unzip · double-click **Innsegall Installer**.
2. Terminal opens · install script runs · welcome scout + Voyage schedule.

---

## 5 · GitHub Actions (optional)

Workflow: `.github/workflows/macos-release.yml` · trigger **`workflow_dispatch`** or push tag `v*`.

| Secret | Value |
|--------|--------|
| `APPLE_CERTIFICATE_BASE64` | base64 of exported .p12 |
| `APPLE_CERTIFICATE_PASSWORD` | p12 export password |
| `APPLE_TEAM_ID` | Team ID |
| `NOTARY_API_KEY_ID` | ASC API key id |
| `NOTARY_API_ISSUER_ID` | ASC issuer uuid |
| `NOTARY_API_KEY_P8` | full contents of .p8 file |

After green run: attach **`InnsegallInstaller.zip`** to [GitHub Releases](https://github.com/SP-Q26/innsegall/releases) as **latest**.

Public URL (once uploaded):

`https://github.com/SP-Q26/innsegall/releases/latest/download/InnsegallInstaller.zip`

After upload: set `MAC_SIGNED_INSTALLER_SHIPPED = true` in `src/gospel.mjs` · run `node scripts/sync-gospel-web.mjs` · `/alpha` may link the release again.

---

## 6 · Ship checklist

- [ ] Developer ID Application cert in keychain
- [ ] `npm run release:macos-installer` · **Accepted** notarization
- [ ] GitHub Release asset uploaded · `latest` tag
- [ ] `npm run smoke:live` · alpha links resolve
- [ ] Update alpha copy: remove “unsigned alpha” where signed build is live

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `errSecInternalComponent` | Unlock keychain · `security unlock-keychain` |
| Notarization **Invalid** | `xcrun notarytool log <submission-id>` · add entitlements or fix hardened runtime |
| App opens but curl fails | Network · user firewall · retry install URL |
| Still quarantined after download | `xattr -d com.apple.quarantine` only if stapler missing · re-download stapled zip |

**Contact:** hello@innsegall.com · no personal Apple IDs in git.
