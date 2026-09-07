#!/usr/bin/env bash
# Innsegall launch preflight · forked from SPQ run-alpha-preflight.sh (no WeWeb).
# Usage: ./scripts/run-launch-preflight.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FAIL=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Innsegall launch preflight · 0.4.0-alpha                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

run_step() {
  local name="$1"
  shift
  echo "── ${name} ──"
  if "$@"; then
    echo ""
    return 0
  fi
  echo "!! ${name} failed"
  echo ""
  FAIL=1
  return 0
}

run_step "sync-gospel" node scripts/sync-gospel-web.mjs
run_step "sync-site-chrome" node scripts/sync-site-chrome.mjs
run_step "dry-test-license" node scripts/dry-test-license.mjs
run_step "audit-launch" node scripts/audit-launch.mjs
run_step "smoke" node scripts/smoke.mjs
run_step "self-test" node scripts/self-test.mjs

echo "══════════════════════════════════════════════════════════════"
if [[ "${FAIL}" -eq 0 ]]; then
  echo "PREFLIGHT OK · push repo · Vercel deploy · npm run smoke:live"
  echo "  Ops: docs/BATTLE_BLAST.md · docs/INFRA_FORK_AUDIT.md"
  exit 0
fi
echo "PREFLIGHT FAIL · fix gates above before push"
exit 1
