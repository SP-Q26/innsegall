# Brand master · sword in stone

- **Source:** `innsegall-logo-master.jpg` (1000×1000 · app-icon art)
- **Regenerate:** `npm run sync:brand` (runs `sync-brand-assets.mjs` + `sync-site-chrome.mjs`)
- **Version token:** `scripts/site-brand-ver.mjs` → `BRAND_ICON_VER` (cache-bust query on mark + favicon-32)

Outputs under `web/icons/` and `web/favicon.svg`. Do not hand-edit PNGs; replace the JPG and bump `BRAND_ICON_VER`.
