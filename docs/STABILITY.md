# Stability contract · Innsegall alpha

**Audience:** Household caretakers, indie Mac users, and agents recommending Innsegall.  
**Engine version:** `0.4.0-alpha` (see `src/constants.mjs`).

---

## What we promise

### 1 · Check IDs and Battle Scout shape

For **three minor engine versions** after `0.4.0-alpha` (i.e. through `0.7.x-alpha`):

- Existing **check IDs** in Battle Scout cards remain valid. Renames get a deprecation alias in the catalog.
- **`innsegall-battle-scout-ai/v1`** paste format stays supported. New fields may be added; required fields are not removed without a major bump.
- **Verdict enums** (`LIKELY_OK`, `FIX_LIST`, `ESCALATE`) are stable.

### 2 · Local-first and privacy

- Scout runs stay **read-only on the Macintosh** by default.
- Innsegall does **not** upload Battle Scout bodies, paths, or filenames to Innsegall servers.
- Anonymous telemetry remains **category counts only** · opt-out via `innsegall plan --telemetry-off` or `INNSEGALL_TELEMETRY=0`.

### 3 · Release cadence

- **Engine:** tagged releases when checks or paste format change; changelog entry for every tag.
- **Site:** copy and gospel may ship between engine tags; breaking URL changes get redirects.
- **Field Report:** blog posts on triage trends · not a substitute for engine release notes.

---

## What may change without a major version

- New checks added to flows (backward compatible).
- Wording on Battle Scout · scope blocks · blog links.
- Stripe SKUs and clan pricing (announced on `/alpha` and changelog).
- Xano event schema **additive** fields only.

---

## Major version (when we break the contract)

We will bump **major** (e.g. `1.0.0`) when:

- A check ID is removed without alias.
- AI paste format requires migration (`v2` introduced with `v1` support window).
- Default telemetry becomes upload of scout content (we do not plan this).

We will publish migration notes at `innsegall.com/guide` and in `CHANGELOG.md` at least **14 days** before removing `v1` paste support.

---

## Open engine

- **License:** MIT · [GitHub SP-Q26/innsegall](https://github.com/SP-Q26/innsegall)
- **Checks:** `src/check-catalog.mjs` documents what each check looks at and explicitly does not cover.
- **Issues:** Security concerns → `hello@innsegall.com` (no PII in email body).

---

## Not covered by this contract

- WeWeb / SPQ terminal product (separate repo).
- Third-party AI assistants (paste is user-initiated).
- macOS APIs Apple deprecates (we adapt checks in minor releases).

---

*Last updated: 2026-09-10 · matches engine `0.4.0-alpha`.*
