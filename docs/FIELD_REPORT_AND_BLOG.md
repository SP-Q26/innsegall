# Field Report & blog · three pipelines

**Purpose:** One place for how Innsegall blog posts get created · what is automatic vs operator · what ships to production.

**Float cadence:** Field Glass or comparison post every **1–2 weeks** · `FLOAT_MODE_RUNBOOK.md`

---

## Pipeline overview

| Pipeline | `report_type` / kind | Source | Uploads telemetry? | Typical slug |
|----------|----------------------|--------|--------------------|--------------|
| **1 · Local digest** | `field_report` | `npm run field-report` · local Battle Scout cards | **No** | `field-report-YYYY-MM-DD` |
| **2 · Issue spotlight** | `issue_spotlight` (blog front matter) | CLI → Xano → `publish-issue-spotlights*` | **Yes** (anonymized) | `after-suspicious-link-macintosh`, etc. |
| **3 · Editorial / Field Glass** | `field_glass` or editorial | Hand-written `web/blog/*.md` | No | `field-glass-sep-*`, guides |

All public posts end as **`web/blog/<slug>.html`** (from `.md` + fixtures) · rewrites in `web/vercel.json` · listed in `web/sitemap.xml` and `web/blog/index.html`.

---

## 1 · Local Field Report (`field_report`)

**Command:**

```bash
npm run field-report              # writes web/blog/field-report-YYYY-MM-DD.md
npm run field-report -- --dry-run # preview markdown only
```

**Code:** `src/field-report.mjs` · `scripts/field-report.mjs`

**Input:** Anonymized aggregates from **local** scout cards on the operator machine (category counts · no paths · no PII).

**Output:** Markdown with front matter `report_type: field_report` · HTML via normal blog build / `predeploy` sync.

**Important:** Nothing is sent to Xano or the public site until you **commit and push** (or run deploy). Script prints: *No user data leaves this machine unless you git-push the markdown yourself.*

**When to use:** Weekly or biweekly digest when you have enough local scout volume to make counts meaningful · complements editorial Field Glass posts.

---

## 2 · Issue spotlight (`issue_spotlight`)

**Loop doc:** `ISSUE_SPOTLIGHT_LOOP.md`

**Runtime (automatic):** After `innsegall run` / `check` / `voyage`, CLI may emit `issue_spotlight` to `POST /api/telemetry` → Xano `innsegall_events` (deduped per install per day).

**Publish (operator):**

```bash
npm run publish:issue-spotlights              # from fixtures (dev)
npm run publish:issue-spotlights:telemetry    # pull aggregates · write blog md/html paths
```

**Output:** SEO posts for trending issue categories · sitemap / blog index updated by publish scripts when configured.

**Warrior attribution:** `WARRIORS_FIELD_REPORT.md` · use `?ref=warrior_<code>` only when rules allow.

---

## 3 · Editorial & Field Glass

**Paths:** `web/blog/*.md` · SEO fixtures:

- `fixtures/blog-posts-seo.json`
- `fixtures/blog-related-rail.json`
- `fixtures/blog-field-desk.json`
- `fixtures/blog-body-boosts.json`

**Sync on deploy prep:**

```bash
npm run predeploy   # prep-deploy.mjs · sync gospel + blog chrome/SEO
```

**Hand steps for a new post:**

1. Add `web/blog/my-slug.md` (front matter · canon voice · no em dash if claymore enforces)
2. Add slug to `fixtures/blog-posts-seo.json` (and related fixtures if needed)
3. Add rewrite in `web/vercel.json` if clean URL required
4. Add card row in `web/blog/index.html` (or rely on sync script if applicable)
5. Add URL to `web/sitemap.xml`
6. `npm run predeploy` · `npm run audit:site` · `npm run smoke:live`

`smoke:live` globs `web/blog/*.html` · new HTML files are probed automatically after deploy.

---

## Publish checklist (any pipeline)

| Step | Command / file |
|------|----------------|
| Sync chrome & SEO | `npm run predeploy` |
| Inventory | `npm run audit:site` |
| Blog quality | `npm run audit:blog-quality` · `audit:blog-funnel` |
| Push | `git push origin main` → Vercel production |
| Proof | `npm run smoke:live` · **0 fail** on pages |

---

## Related

| Doc | Topic |
|-----|--------|
| `ISSUE_SPOTLIGHT_LOOP.md` | Telemetry shape · Xano |
| `XANO_DATA.md` | Event buckets · anonymization |
| `ROI_AUTOMATION.md` | `field-report` in automation story |
| `DISTRIBUTION_PLAYBOOK.md` | DEV.to · communities after float |
| `SITE_FULL_AUDIT_LATEST.md` | All blog routes |
