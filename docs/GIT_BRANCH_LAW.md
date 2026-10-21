# Innsegall · git branch law

**Repo:** [github.com/SP-Q26/innsegall](https://github.com/SP-Q26/innsegall) · **not** the SPQ WeWeb monorepo.

| Branch | Use |
|--------|-----|
| **`main`** | Production · [innsegall.com](https://innsegall.com) · Vercel `innsegall_fe` |
| **`ship/*`** | Short-lived feature branches · merge to `main` via PR |
| **`weweb-export`** | **Forbidden on this repo** · that name is **SP-Q26/SPQ** only (WeWeb → Vercel preview) |

## Agent mistake (fix)

If i18n or `web/` work landed on `weweb-export` here:

```bash
cd ~/innsegall   # or your clone path · not SPQ parent
git checkout main
git pull origin main
git merge weweb-export    # or cherry-pick commits
npm run gate:launch         # optional before push
git push origin main
git push origin --delete weweb-export
git branch -d weweb-export
```

## Checks

- `npm run audit:git` · fails on `weweb-export` branch
- `docs/LANE_ISOLATION.md` · lane map · no SPQ parent edits for Innsegall deploys

**Cursor:** Open the **innsegall** folder as workspace root (or `cd` into the clone). SPQ's `weweb-export` branch does not deploy Innsegall.
