# Mac user copy lens

**Audience:** People who chose a Mac for simplicity, privacy, and “it just works” · now rattled by a popup, link, or headline.

## Voice

- **Problem first:** “Scary popup?” → “Here’s what to do.”
- **Click → do:** One primary button per screen · short steps · verbs up front.
- **Technical in a narrow band:** Say *Mac*, *Terminal paste*, *report in your browser*. Hide enums in the hero; use *You're clear* / *Small fixes* / *Get help* before LIKELY_OK when space allows.
- **No siege cosplay in UI chrome:** Saga flavor stays in manifesto footnotes · install and pricing copy stay plain.
- **Trust beats features:** Local · read-only · you share · not antivirus · not scare ads.

## Canonical strings

Source of truth: `src/mac-user-copy.mjs` · wired into `src/gospel.mjs` and `scripts/sync-site-chrome.mjs`.

After edits:

```bash
node scripts/sync-gospel-web.mjs
node scripts/sync-site-chrome.mjs
node scripts/apply-mac-user-copy.mjs   # optional phrase pass on HTML bodies
```

## Checklist (every page)

1. Can a stressed Mac user know **what to click** in 5 seconds?
2. Is **what we don't do** (not AV, not remote access) one plain sentence?
3. Are **Macintosh** → **Mac** and **field manual** → **Get started** in customer-facing chrome?
4. Does every scary moment end with **Send the scout** or **Help** article?
