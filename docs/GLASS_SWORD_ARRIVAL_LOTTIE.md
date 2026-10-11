# Glass + sword arrival (Innsegall)

**Brand fit:** fjord night · laser-edge eyeglass · beam-gold sword shimmer.

**Motion model:** Whispering Woods Luxe arrival (WWL gold standard) · through-motion on load: glass fades while the plate **scales toward the viewer** and **fades out**, revealing the landing page.

## Timing (WWL canon)

| Beat | ms | Behavior |
|------|-----|----------|
| Hold | 420 | Plate stable before through-ramp |
| Floor | 780 | Minimum perceived arrival |
| Wall | 1600 | Hard cap; overlay removed |

## Session

Once per browser session (`inn_glass_arrival_seen`). Tests: `data-inn-glass-arrival="off"` on `<html>`.

## Assets

| File | Role |
|------|------|
| `web/lottie/inn-glass-arrival-lottie.json` | `node scripts/generate-inn-glass-arrival-lottie.mjs` |
| `web/lottie/inn-glass-arrival-fallback.svg` | Reduced motion |

## Sister brand (Simple Property)

Greystone **door** entrance lives on **simple-property.com** only · `docs/DOOR_ARRIVAL_LOTTIE.md` in the Simple Property repo.

## Audit

`node scripts/audit-glass-arrival-lottie.mjs` (wired in `audit-launch.mjs` and `audit-swarm.mjs`).
