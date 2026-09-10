# Apple Developer ID · signed Macintosh installer

**Goal:** Caretakers double-click **Innsegall Installer** without Firefox Gatekeeper (“unidentified developer”).

**Artifact:** `dist/InnsegallInstaller.zip` → `InnsegallInstaller.app` (Developer ID signed + notarized).

---

## 1 · Enroll (The Isles LLC)

1. [Apple Developer Program](https://developer.apple.com/programs/) · **$99/year** · org **The Isles LLC** (match Stripe entity).
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
export SIGNING_IDENTITY="Developer ID Application: The Isles LLC (TEAMID)"

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

Site `/alpha` points here when `install.signed_app_url` is set in gospel.

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
