# L5 operator runbook · signed Macintosh installer

**When:** Apple Developer Program enrolled (~$99/yr) · org **The Isles LLC**.  
**Until then:** [innsegall.com/install](https://innsegall.com/install) + Terminal one-liner are canonical · `smoke-live` signed zip **warn** is expected.

**Deep dive:** `docs/APPLE_DEVELOPER_ID.md` · unsigned path: `docs/INSTALL_WITHOUT_SIGNED_ZIP.md`

---

## Outcome

- `dist/InnsegallInstaller.zip` → **Developer ID signed** + **notarized** `InnsegallInstaller.app`  
- GitHub Release asset → `smoke-live` probe **ok**  
- Firefox/Safari download path without “unidentified developer” theater  

---

## One-time (maintainer Mac)

1. Enroll · note **Team ID** · install **Developer ID Application** cert (see APPLE_DEVELOPER_ID §2).  
2. App Store Connect API key for **notarytool** (§3).  
3. Local smoke: `npm run pack:macos-installer` → unsigned app builds.  
4. Local sign: `npm run release:macos-installer` (needs keychain identity).  

---

## GitHub Actions secrets (`macos-release` workflow)

| Secret | Purpose |
|--------|---------|
| `APPLE_CERTIFICATE_BASE64` | `.p12` export of Developer ID Application |
| `APPLE_CERTIFICATE_PASSWORD` | p12 password |
| `APPLE_SIGNING_IDENTITY` | e.g. `Developer ID Application: The Isles LLC (TEAMID)` |
| `NOTARY_API_KEY_P8` | Contents of `AuthKey_*.p8` |
| `NOTARY_API_KEY_ID` | Key ID |
| `NOTARY_API_ISSUER_ID` | Issuer ID |

**Trigger**

- Tag push `v*` → build · sign · attach to Release  
- **workflow_dispatch** → manual release (default tag name in workflow: `v0.4.0-alpha` · bump when shipping)  

```bash
git tag v0.4.1-alpha
git push origin v0.4.1-alpha
```

Or: GitHub → Actions → **macos-release** → Run workflow.

---

## Post-release checklist

1. `npm run smoke:live` · signed installer line **ok** (not warn).  
2. Update gospel `signed_app_url` if release URL changes (usually `latest/download/InnsegallInstaller.zip`).  
3. `/alpha` + `/install` · mention signed zip as **preferred** again (invert copy from pre-L5).  
4. `npm run gate:launch` · 0 fail.  

---

## If sign job fails in CI

- Missing secret → workflow exits at import step (intentional).  
- Notary rejection → read `notarytool log` from `scripts/sign-notarize-macos-installer.sh` output.  
- **Do not** disable Gatekeeper instructions on site until a green signed asset is on the Release.  

---

## Marketing flip (after L5 green)

| Surface | Pre-L5 | Post-L5 |
|---------|--------|---------|
| `/install` | Terminal first | Signed zip first · Terminal fallback |
| `/alpha#gatekeeper` | Zip may 404 | Zip primary |
| `llms.txt` install block | `install_help_url` | add `signed_app_url` preference |

Run `npm run sync-gospel` after gospel install copy edits.
