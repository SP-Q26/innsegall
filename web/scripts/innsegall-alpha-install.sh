#!/usr/bin/env bash
# Innsegall for Macintosh · alpha installer · Engine v0.4.0-alpha
set -euo pipefail

REPO_URL="${INNSEGALL_REPO_URL:-https://github.com/innsegall/innsegall.git}"
INSTALL_DIR="${INNSEGALL_INSTALL_DIR:-$HOME/innsegall}"

echo "Innsegall alpha installer"
echo "========================="
echo ""

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Error: Innsegall requires macOS." >&2
  exit 1
fi

mac_ver="$(sw_vers -productVersion)"
mac_major="${mac_ver%%.*}"
if [[ "${mac_major}" -lt 12 ]]; then
  echo "Error: macOS 12 Monterey or later required (found ${mac_ver})." >&2
  exit 1
fi
echo "Macintosh · macOS ${mac_ver} · OK"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js 20+ required. Install from https://nodejs.org/ or use nvm." >&2
  exit 1
fi

node_major="$(node -p "process.versions.node.split('.')[0]")"
if [[ "${node_major}" -lt 20 ]]; then
  echo "Error: Node.js 20+ required (found $(node -v))." >&2
  exit 1
fi
echo "Node $(node -v) · OK"
echo ""

if [[ -d "${INSTALL_DIR}/.git" ]]; then
  echo "Existing clone at ${INSTALL_DIR} · pulling latest..."
  git -C "${INSTALL_DIR}" pull --ff-only
else
  echo "Cloning Innsegall to ${INSTALL_DIR}..."
  git clone "${REPO_URL}" "${INSTALL_DIR}"
fi

cd "${INSTALL_DIR}"
echo ""
echo "Reading the runes..."
npm run runes

echo ""
echo "Plan / quota:"
npm run plan

echo ""
echo "========================="
echo "Install complete."
echo ""
echo "Next steps:"
echo "  cd \"${INSTALL_DIR}\""
echo "  npm run run"
echo "  npm run plan"
echo ""
echo "Terms: https://innsegall.com/tos · Privacy: https://innsegall.com/privacy"
