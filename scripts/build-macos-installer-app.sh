#!/usr/bin/env bash
# Build InnsegallInstaller.app (unsigned) · macOS only.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="${ROOT}/packaging/macos/app-template"
OUT_DIR="${ROOT}/dist"
APP_NAME="InnsegallInstaller.app"
APP_PATH="${OUT_DIR}/${APP_NAME}"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "build-macos-installer-app.sh requires macOS." >&2
  exit 1
fi

VERSION="$(node -e "import('${ROOT}/src/constants.mjs').then(m=>process.stdout.write(m.ENGINE_VERSION))")"
BUILD="$(date -u +%Y%m%d%H%M)"

rm -rf "${APP_PATH}"
mkdir -p "${APP_PATH}/Contents/MacOS"

cp "${TEMPLATE}/Contents/Info.plist" "${APP_PATH}/Contents/Info.plist"
sed -i '' "s/__VERSION__/${VERSION}/g" "${APP_PATH}/Contents/Info.plist"
sed -i '' "s/__BUILD__/${BUILD}/g" "${APP_PATH}/Contents/Info.plist"

cp "${TEMPLATE}/Contents/MacOS/install" "${APP_PATH}/Contents/MacOS/install"
chmod 755 "${APP_PATH}/Contents/MacOS/install"

mkdir -p "${OUT_DIR}"
cat > "${OUT_DIR}/macos-installer-manifest.json" <<EOF
{
  "product": "InnsegallInstaller",
  "version": "${VERSION}",
  "build": "${BUILD}",
  "bundle_id": "com.innsegall.installer",
  "app_path": "${APP_NAME}",
  "zip": "InnsegallInstaller.zip"
}
EOF

echo "Built ${APP_PATH} (${VERSION} · build ${BUILD})"
