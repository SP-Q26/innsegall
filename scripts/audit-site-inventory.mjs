#!/usr/bin/env node
/**
 * Full site inventory · every indexable page · sitemap · rewrites · blog funnel.
 * Writes docs/SITE_FULL_AUDIT_LATEST.md (dated header inside).
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_ICON_VER, BRAND_MARK_HREF, FAVICON_32_HREF } from "./site-brand-ver.mjs";
import { OG_CACHE_VER } from "./site-og-ver.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const today = new Date().toISOString().slice(0, 10);

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const vercel = JSON.parse(readFileSync(join(web, "vercel.json"), "utf8"));
const rewriteDest = new Set(
  (vercel.rewrites || [])
    .filter((r) => r.destination?.startsWith("/blog/"))
    .map((r) => r.source.replace(/^\//, ""))
);
const sitemap = readFileSync(join(web, "sitemap.xml"), "utf8");
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const blogIndex = readFileSync(join(web, "blog/index.html"), "utf8");
const noindex = (html) => /content="noindex/i.test(html);

const pages = walkHtml(web)
  .map((abs) => {
    const rel = relative(web, abs).replace(/\\/g, "/");
    const html = readFileSync(abs, "utf8");
    let route =
      rel === "index.html"
        ? "/"
        : rel.endsWith("/index.html")
          ? `/${rel.replace(/\/index\.html$/, "")}`
          : `/${rel.replace(/\.html$/, "")}`;
    if (rel === "install-ios.html") route = "/install/ios";
    if (rel === "install-tablet.html") route = "/install/tablet";
    const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || "";
    const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "";
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1] || "";
    const isBlog = rel.startsWith("blog/") && rel !== "blog/index.html";
    const slug = isBlog ? rel.replace(/^blog\//, "").replace(/\.html$/, "") : "";
    const inSitemap = sitemapLocs.some(
      (u) =>
        u === `https://innsegall.com${route}` ||
        u === `https://innsegall.com${route}/` ||
        u.endsWith(route)
    );
    const inBlogIndex = isBlog ? blogIndex.includes(`/blog/${slug}`) : null;
    const inRewrite = isBlog ? rewriteDest.has(`blog/${slug}`) : null;
    const indexable = !noindex(html);
    const issues = [];
    if (indexable && !inSitemap && !rel.includes("samples/") && rel !== "success.html") {
      issues.push("missing sitemap");
    }
    if (isBlog && indexable && !inBlogIndex) issues.push("missing blog index link");
    if (isBlog && indexable && !inRewrite) issues.push("missing vercel rewrite");
    if (indexable && desc.length && (desc.length < 115 || desc.length > 165)) {
      issues.push(`meta desc ${desc.length}ch`);
    }
    if (indexable && canonical && !canonical.includes("innsegall.com")) issues.push("bad canonical");
    return {
      rel,
      route,
      title: title.slice(0, 72),
      descLen: desc.length,
      indexable,
      inSitemap,
      inBlogIndex,
      inRewrite,
      issues,
    };
  })
  .sort((a, b) => a.route.localeCompare(b.route));

const p0 = pages.filter((p) => p.issues.length && p.indexable);
const blogPosts = pages.filter((p) => p.route.startsWith("/blog/") && p.route !== "/blog");

function brandAuditBlock() {
  const master = join(root, "fixtures/brand/innsegall-logo-master.jpg");
  const mark = join(web, "icons/innsegall-mark.png");
  const apple = join(web, "icons/apple-touch-icon.png");
  const fav32 = join(web, "icons/favicon-32.png");
  const favSvg = join(web, "favicon.svg");
  const ogPng = join(web, "og/innsegall-card.png");

  const rows = [];
  const row = (label, ok, detail = "") => {
    rows.push({ label, ok, detail });
  };

  row("Master art `fixtures/brand/innsegall-logo-master.jpg`", existsSync(master));
  row("Header mark `web/icons/innsegall-mark.png`", existsSync(mark));
  row("Favicon 32 `web/icons/favicon-32.png`", existsSync(fav32));
  row("Apple touch `web/icons/apple-touch-icon.png`", existsSync(apple));
  row("`favicon.svg` embeds mark PNG (not legacy horn SVG)", existsSync(favSvg) && readFileSync(favSvg, "utf8").includes("innsegall-mark.png"));
  row("OG card PNG `web/og/innsegall-card.png`", existsSync(ogPng));
  row("OG cache ver matches site head", readFileSync(join(web, "index.html"), "utf8").includes(`innsegall-card.png?v=${OG_CACHE_VER}`));

  const index = readFileSync(join(web, "index.html"), "utf8");
  row("Home header uses `class=\"brand-mark\"` + versioned mark URL", index.includes(BRAND_MARK_HREF));
  row("Home favicon 32 uses versioned URL", index.includes(FAVICON_32_HREF));
  row("Home apple-touch-icon PNG (not favicon.svg)", index.includes('/icons/apple-touch-icon.png'));
  row("No legacy `brand-beam` horn in home header", !index.includes("brand-beam"));

  let legacyAppleSvg = 0;
  let pagesWithMark = 0;
  let pagesWithHeader = 0;
  for (const abs of walkHtml(web)) {
    const rel = relative(web, abs).replace(/\\/g, "/");
    if (rel.startsWith("samples/")) continue;
    const h = readFileSync(abs, "utf8");
    if (h.includes("class=\"brand-mark\"") || h.includes("innsegall-mark.png")) pagesWithMark++;
    if (h.includes("<header")) pagesWithHeader++;
    if (/rel="apple-touch-icon"[^>]*favicon\.svg/.test(h)) legacyAppleSvg++;
  }
  row("Sitewide apple-touch uses PNG not favicon.svg", legacyAppleSvg === 0, legacyAppleSvg ? `${legacyAppleSvg} page(s)` : "");
  row("Pages with sword mark or brand-mark img", pagesWithMark >= pagesWithHeader - 2, `${pagesWithMark}/${pagesWithHeader} headers`);

  const manifest = readFileSync(join(web, "site.webmanifest"), "utf8");
  row("`site.webmanifest` references mark + apple-touch", manifest.includes("innsegall-mark.png") && manifest.includes("apple-touch-icon.png"));

  const failed = rows.filter((r) => !r.ok);
  let block = `
---

## Brand · logo + favicon (sword-in-stone)

**Canon:** \`fixtures/brand/innsegall-logo-master.jpg\` → \`npm run sync:brand\` → \`icons/innsegall-mark.png\`, favicons, OG, Stripe tiles, header \`<img class="brand-mark">\`.  
**Version pins:** mark/favicon \`?v=${BRAND_ICON_VER}\` · OG \`?v=${OG_CACHE_VER}\` · gate \`node scripts/audit-brand-mark.mjs\` (swarm lane).

| Check | Status | Notes |
|-------|:------:|-------|
`;
  for (const r of rows) {
    block += `| ${r.label} | ${r.ok ? "✓" : "✗"} | ${r.detail || (r.ok ? "ok" : "fix")} |\n`;
  }
  block += `
**Regenerate assets after master change:** \`npm run sync:brand\` · then \`npm run sync:site-chrome\` · bump \`site-brand-ver.mjs\` / \`site-og-ver.mjs\` if needed.

`;
  return { block, failed };
}

const brand = brandAuditBlock();

let md = `# Innsegall.com · full site audit

**Generated:** ${today} · \`node scripts/audit-site-inventory.mjs\`  
**Project:** Vercel \`innsegall_fe\` · root \`web/\`  
**Commands:** \`npm run audit:site\` · \`npm run gate:launch\` · \`npm run smoke:live\`

---

## Summary

| Metric | Count |
|--------|------:|
| HTML surfaces | ${pages.length} |
| Indexable marketing + blog | ${pages.filter((p) => p.indexable).length} |
| Blog posts | ${blogPosts.length} |
| P0 inventory issues | ${p0.length} |
| Sitemap URLs | ${sitemapLocs.length} |
| Brand logo/favicon gate | ${brand.failed.length ? "✗ " + brand.failed.length + " issue(s)" : "✓ sword-in-stone · " + BRAND_ICON_VER} |

**Operator:** Stripe LIVE flip in progress · push \`main\` after \`npm run predeploy\` · blog is primary float-mode SEO lever.

${brand.block}
## Page inventory

| Route | Index | Sitemap | Blog idx | Rewrite | Meta | Issues |
|-------|:-----:|:-------:|:--------:|:-------:|-----:|--------|
`;

for (const p of pages) {
  if (p.route.startsWith("/samples/") && p.rel.includes("demo")) continue;
  const bi = p.inBlogIndex === null ? "·" : p.inBlogIndex ? "✓" : "✗";
  const rw = p.inRewrite === null ? "·" : p.inRewrite ? "✓" : "✗";
  md += `| \`${p.route}\` | ${p.indexable ? "✓" : "no"} | ${p.inSitemap ? "✓" : "✗"} | ${bi} | ${rw} | ${p.descLen || "·"} | ${p.issues.join("; ") || "ok"} |\n`;
}

md += `
---

## Blog SEO (float mode)

- **Cadence:** Field Glass or comparison post every 1-2 weeks.
- **Publish checklist:** \`fixtures/blog-posts-seo.json\` → sync scripts → \`vercel.json\` rewrite → \`sitemap.xml\` → \`blog/index.html\` card → \`smoke-live\` path.
- **Quality gate:** \`npm run audit:blog-quality\` (target avg 95+).
- **Funnel gate:** \`npm run audit:blog-funnel\`.

---

## Live probes (run after deploy)

\`\`\`bash
npm run smoke:live
npm run gate:launch   # swarm + live smoke
\`\`\`

Expected pre-L5: signed \`InnsegallInstaller.zip\` **warn** only.

---

## Related docs

- \`docs/FLOAT_MODE_RUNBOOK.md\` · snuff / improve / ROI / scale
- \`docs/STRIPE_LIVE_FLIP.md\` · payments (operator)
- \`docs/DISTRIBUTION_PLAYBOOK.md\` · directories (low priority in float)
- \`docs/OPERATOR_GUIDE.md\` · stack truth
`;

const outPath = join(root, "docs", "SITE_FULL_AUDIT_LATEST.md");
writeFileSync(outPath, md, "utf8");

console.log(`Wrote ${relative(root, outPath)}`);
console.log(`Pages: ${pages.length} · P0 issues: ${p0.length} · brand: ${brand.failed.length ? "FAIL" : "ok"}`);
if (brand.failed.length) {
  for (const r of brand.failed) console.error(`P0 brand: ${r.label}${r.detail ? ` · ${r.detail}` : ""}`);
}
if (p0.length) {
  for (const p of p0) console.error(`P0 ${p.route}: ${p.issues.join(", ")}`);
}
if (p0.length || brand.failed.length) process.exit(1);
console.log("Site inventory audit passed");
