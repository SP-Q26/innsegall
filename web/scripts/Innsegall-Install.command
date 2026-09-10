#!/bin/bash
# Innsegall · double-click installer for Macintosh
# Opens Terminal, runs the hosted install script, keeps the window open on error.
set -euo pipefail

export PATH="/usr/local/bin:/opt/homebrew/bin:${PATH:-/usr/bin:/bin}"

echo ""
echo "Innsegall · sending the scout aboard"
echo "===================================="
echo ""
echo "If macOS blocked this file before it opened, use Terminal instead (no Gatekeeper):"
echo "  curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash"
echo "Or right-click Innsegall-Install.command in Downloads → Open → Open again."
echo "Help: https://innsegall.com/alpha#gatekeeper"
echo ""

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This installer is for macOS only."
  read -r -p "Press Enter to close…"
  exit 1
fi

INSTALL_URL="${INNSEGALL_INSTALL_URL:-https://innsegall.com/scripts/innsegall-alpha-install.sh}"

if ! curl -fsSL "${INSTALL_URL}" | bash; then
  echo ""
  echo "Install did not finish. See https://innsegall.com/alpha for the manual steps."
  read -r -p "Press Enter to close…"
  exit 1
fi

echo ""
echo "Done. Your Battle Scout should have opened in the browser."
echo "Free Voyages run automatically on the 1st and 15th at 10:00 local."
echo "Check rhythm: innsegall plan"
read -r -p "Press Enter to close…"
