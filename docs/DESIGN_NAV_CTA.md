# Editorial nav & estate CTA (Innsegall)

Quiet-luxury **pattern** · **Innsegall tokens** (not WW pine/linen).

| Token | Use |
|-------|-----|
| `--font-ui` (DM Sans) | Nav + buttons |
| `--font-display` (Cormorant) | Headlines only |
| `--beam-gold` | Hover + hairline focus |
| `--gold-hairline` | `1px` button border |
| `--radius-arch` | `2px` · never pill CTAs |
| `--spirit-silver` / `--text-primary` | Resting label color |

## Classes

- **`.nav-link`** · header/footer editorial links (uppercase, `0.1em` tracking, 44px touch).
- **`.nav-link--footer`** · `12px` · `0.12em` tracking.
- **`.btn-link`** · same as nav · inline secondary actions in hero.
- **`.btn-horn`** · hairline gold border · transparent fill · micro-radius.
- **`.btn-horn--fill`** · primary hero/pricing · solid `--beam-gold` fill.
- **`.btn-horn--compact`** · pricing cards · full width.
- **`.btn-secondary`** · checkout rows · same estate frame as `.btn-horn`.

## Rules

- No `border-radius: 999px` on CTAs.
- No heavy drop shadows on buttons.
- Prose links in articles keep underline (`body a`) · nav/button classes set `text-decoration: none`.

CSS lives in `web/innsegall.css` · cache bump via `npm run sync:site-chrome`.
