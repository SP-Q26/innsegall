# Homebrew distribution

**Target:** `brew install innsegall` (formula) for developer-adjacent Mac users.

---

## Status

- Formula template: `packaging/homebrew/innsegall.rb`
- **Not yet** in `homebrew-core` · use a personal tap until tagged releases are routine.

---

## Personal tap (fastest path)

```bash
# On your machine (maintainer)
brew tap-new SP-Q26/innsegall
cp packaging/homebrew/innsegall.rb "$(brew --repository SP-Q26/innsegall)/Formula/innsegall.rb"
brew install SP-Q26/innsegall/innsegall
```

Publish tap repo on GitHub · users run:

```bash
brew tap SP-Q26/innsegall
brew install innsegall
```

---

## Upstream homebrew-core (later)

1. Tag release: `git tag v0.4.0-alpha && git push origin v0.4.0-alpha`
2. Update formula `url` + `sha256` from GitHub archive tarball.
3. PR to https://github.com/Homebrew/homebrew-core · category `desc` · test `brew test innsegall` if tests exist.

---

## Requirements

- macOS 12+
- Node.js 20+ (`depends_on "node"`)

Formula installs repo to `$(brew --prefix)/opt/innsegall` and links `innsegall` into `bin`.

---

## Alpha install (no Homebrew)

```bash
curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash
```

Same engine · Homebrew is discovery convenience only.
