#!/usr/bin/env bash
# Repo-local git identity · noreply only (run from innsegall root).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
git config user.name "S.P."
git config user.email "293159210+SP-Q26@users.noreply.github.com"
echo "ok: $(git config user.name) <$(git config user.email)>"
