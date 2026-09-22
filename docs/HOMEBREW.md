# Homebrew distribution

**Target:** `brew install innsegall` (formula) for developer-adjacent Mac users.

---

## Status

- Formula: `packaging/homebrew/innsegall.rb`
- Tap layout (publish to GitHub): `packaging/homebrew-tap/` · refresh with `npm run sync:homebrew-tap`
- **Not** in `homebrew-core` · personal tap until tagged releases are routine.

---

## Personal tap (fastest path)

**Maintainer · publish tap repo `SP-Q26/homebrew-innsegall`:**

```bash
cd innsegall
npm run sync:homebrew-tap
# Copy packaging/homebrew-tap/* into SP-Q26/homebrew-innsegall (Formula/ + README) · push main
```

**Users:**

```bash
brew tap SP-Q26/innsegall
brew install innsegall
innsegall runes
```

Local smoke before push:

```bash
brew install ./packaging/homebrew-tap/Formula/innsegall.rb
```

---

## Upstream homebrew-core (later)

1. Tag release: `git tag v0.4.0-alpha && git push origin v0.4.0-alpha`
2. Update formula `url` + `sha256` from GitHub archive tarball.
3. PR to https://github.com/Homebrew/homebrew-core · category `desc` · test `brew test innsegall` if tests exist.

---

## Requirements

- macOS 12+
- Node.js 20+ (`depends_on "node@20"` in formula)

Formula installs repo to `$(brew --prefix)/opt/innsegall` and links `innsegall` into `bin`.

---

## Alpha install (no Homebrew)

```bash
curl -fsSL https://innsegall.com/scripts/innsegall-alpha-install.sh | bash
```

Same engine · Homebrew is discovery convenience only.
