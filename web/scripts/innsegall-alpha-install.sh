#!/usr/bin/env bash
# Innsegall for Macintosh · alpha installer · Engine v0.4.0-alpha
# Installs CLI wrapper at ~/.local/bin/innsegall · runs bootstrap (welcome + Voyage schedule)
set -euo pipefail

export PATH="/usr/local/bin:/opt/homebrew/bin:${PATH:-/usr/bin:/bin}"

REPO_URL="${INNSEGALL_REPO_URL:-https://github.com/SP-Q26/innsegall.git}"
INSTALL_DIR="${INNSEGALL_INSTALL_DIR:-$HOME/innsegall}"
BIN_DIR="${HOME}/.local/bin"
CLI="${INSTALL_DIR}/bin/innsegall.mjs"
INNSEGALL_BIN="${BIN_DIR}/innsegall"

echo "Innsegall · bringing the scout aboard"
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

ensure_git() {
  if command -v git >/dev/null 2>&1; then
    return 0
  fi
  echo "Error: Git is required to clone Innsegall." >&2
  echo "Install Xcode Command Line Tools: xcode-select --install" >&2
  exit 1
}

ensure_node() {
  if command -v node >/dev/null 2>&1; then
    local node_major
    node_major="$(node -p "process.versions.node.split('.')[0]")"
    if [[ "${node_major}" -lt 20 ]]; then
      echo "Error: Node.js 20+ required (found $(node -v))." >&2
      exit 1
    fi
    echo "Node $(node -v) · OK"
    return 0
  fi

  echo "Node.js not found · trying Homebrew…"
  if command -v brew >/dev/null 2>&1; then
    if brew install node; then
      hash -r 2>/dev/null || true
      export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH}"
    fi
  fi

  if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js 20+ required. Install from https://nodejs.org/ or: brew install node" >&2
    exit 1
  fi

  node_major="$(node -p "process.versions.node.split('.')[0]")"
  if [[ "${node_major}" -lt 20 ]]; then
    echo "Error: Node.js 20+ required (found $(node -v))." >&2
    exit 1
  fi
  echo "Node $(node -v) · OK (via Homebrew)"
}

ensure_git
ensure_node
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
echo "Sound the Horn · linking CLI..."
NODE_BIN="$(command -v node)"
mkdir -p "${BIN_DIR}"
cat > "${INNSEGALL_BIN}" <<EOF
#!/usr/bin/env bash
exec "${NODE_BIN}" "${CLI}" "\$@"
EOF
chmod +x "${INNSEGALL_BIN}"

if [[ ":${PATH}:" != *":${BIN_DIR}:"* ]]; then
  echo ""
  echo "Add to your shell profile (~/.zshrc):"
  echo "  export PATH=\"${BIN_DIR}:\$PATH\""
  export PATH="${BIN_DIR}:${PATH}"
fi

echo ""
echo "Reading the runes..."
"${INNSEGALL_BIN}" runes || npm run runes

echo ""
echo "Plan / quota:"
"${INNSEGALL_BIN}" plan || npm run plan

echo ""
echo "Bootstrap · welcome scout + Voyage on the 1st & 15th…"
if "${INNSEGALL_BIN}" bootstrap; then
  echo ""
  echo "========================="
  echo "Scout aboard · schedule set."
  echo "Next Voyage · see: innsegall plan"
else
  echo ""
  echo "Bootstrap had a hiccup · try: ${INNSEGALL_BIN} bootstrap"
  echo "Or manually: innsegall run · innsegall voyage --install-schedule"
  exit 1
fi

echo ""
echo "Terms: https://innsegall.com/tos · Guide: https://innsegall.com/guide"
