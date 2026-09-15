#!/bin/bash
# Innsegall · one-click license bind after Stripe checkout
# Double-click after saving innsegall-license.json to Downloads.
set -euo pipefail

export PATH="/usr/local/bin:/opt/homebrew/bin:${PATH:-/usr/bin:/bin}"

echo ""
echo "Innsegall · bind your writ"
echo "=========================="
echo ""

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This helper is for macOS only."
  read -r -p "Press Enter to close…"
  exit 1
fi

if ! command -v innsegall >/dev/null 2>&1; then
  echo "innsegall is not installed yet."
  echo "Install first: https://innsegall.com/install"
  echo "  curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash"
  read -r -p "Press Enter to close…"
  exit 1
fi

innsegall import || {
  echo ""
  echo "Bind failed · save innsegall-license.json to Downloads from innsegall.com/success"
  read -r -p "Press Enter to close…"
  exit 1
}

echo ""
echo "Writ bound · send the scout: innsegall run"
read -r -p "Press Enter to close…"
