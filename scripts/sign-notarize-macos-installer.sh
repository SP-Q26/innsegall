#!/usr/bin/env bash
# Sign + notarize InnsegallInstaller.app · Developer ID + notarytool.
# Prereq: docs/APPLE_DEVELOPER_ID.md
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${ROOT}/dist"
APP_PATH="${OUT_DIR}/InnsegallInstaller.app"
ZIP_PATH="${OUT_DIR}/InnsegallInstaller.zip"
ENTITLEMENTS="${ROOT}/packaging/macos/entitlements/installer.plist"

SIGNING_IDENTITY="${SIGNING_IDENTITY:-}"
NOTARY_PROFILE="${NOTARY_KEYCHAIN_PROFILE:-innsegall-notary}"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "sign-notarize-macos-installer.sh requires macOS." >&2
  exit 1
fi

if [[ ! -d "${APP_PATH}" ]]; then
  echo "Missing ${APP_PATH} · run: npm run pack:macos-installer" >&2
  exit 1
fi

if [[ -z "${SIGNING_IDENTITY}" ]]; then
  SIGNING_IDENTITY="$(security find-identity -v -p codesigning | awk -F'"' '/Developer ID Application/ {print $2; exit}')"
fi

if [[ -z "${SIGNING_IDENTITY}" ]]; then
  echo "No Developer ID Application identity in keychain." >&2
  echo "Set SIGNING_IDENTITY=\"Developer ID Application: Your Org (TEAMID)\"" >&2
  exit 1
fi

echo "Signing with: ${SIGNING_IDENTITY}"

codesign --force --deep --options runtime --timestamp \
  --entitlements "${ENTITLEMENTS}" \
  --sign "${SIGNING_IDENTITY}" \
  "${APP_PATH}"

codesign --verify --deep --strict --verbose=2 "${APP_PATH}"

rm -f "${ZIP_PATH}"
ditto -c -k --keepParent "${APP_PATH}" "${ZIP_PATH}"

echo "Submitting ${ZIP_PATH} for notarization…"
if [[ -n "${NOTARY_API_KEY_ID:-}" && -n "${NOTARY_API_ISSUER_ID:-}" && -n "${NOTARY_API_KEY_PATH:-}" ]]; then
  xcrun notarytool submit "${ZIP_PATH}" \
    --key "${NOTARY_API_KEY_PATH}" \
    --key-id "${NOTARY_API_KEY_ID}" \
    --issuer "${NOTARY_API_ISSUER_ID}" \
    --wait
else
  xcrun notarytool submit "${ZIP_PATH}" \
    --keychain-profile "${NOTARY_PROFILE}" \
    --wait
fi

xcrun stapler staple "${APP_PATH}"
xcrun stapler validate "${APP_PATH}"

rm -f "${ZIP_PATH}"
ditto -c -k --keepParent "${APP_PATH}" "${ZIP_PATH}"

echo ""
echo "Shippable artifact: ${ZIP_PATH}"
echo "Upload to GitHub Release (latest) or innsegall.com CDN."
echo "Users: unzip · double-click InnsegallInstaller.app"
