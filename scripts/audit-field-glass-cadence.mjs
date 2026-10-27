#!/usr/bin/env node
/** Field Glass freshness · desk fixture · llms discovery. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 cadence: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const hub = JSON.parse(readFileSync(join(root, "fixtures", "watch-hub.json"), "utf8"));
const desk = JSON.parse(readFileSync(join(root, "fixtures", "blog-field-desk.json"), "utf8"));
const latest = hub.latest_field_glass;
const maxDays = hub.max_field_glass_age_days || 14;

const latestMs = Date.parse(latest.date);
const ageDays = (Date.now() - latestMs) / (1000 * 60 * 60 * 24);
check(`latest Field Glass within ${maxDays}d`, ageDays <= maxDays + 1, `${Math.round(ageDays)}d old`);
if (ageDays > 1.25) {
  console.warn(`warn: Field Glass is ${Math.round(ageDays * 10) / 10}d old · target daily desk (npm run flywheel:daily)`);
}

check("field-desk points at latest slug", desk.html.includes(`/blog/${latest.slug}`));
check("field-desk version bumped", desk.version === latest.date || desk.version >= latest.date);

const llms = readFileSync(join(web, "llms.txt"), "utf8");
check("llms watch hub url", llms.includes("innsegall.com/watch"));
check("llms latest field glass or watch", llms.includes(latest.slug) || llms.includes("/watch"));

const seo = JSON.parse(readFileSync(join(root, "fixtures", "blog-posts-seo.json"), "utf8"));
check("blog-posts-seo latest slug", Boolean(seo.posts?.[latest.slug]?.description));

const slug = latest.slug;
const enHtml = join(web, "blog", `${slug}.html`);
check("latest EN html", existsSync(enHtml));

const watchHtml = readFileSync(join(web, "watch.html"), "utf8");
check("watch.html latest slug", watchHtml.includes(slug));

const vercel = readFileSync(join(web, "vercel.json"), "utf8");
check("vercel rewrite latest slug", vercel.includes(`"/blog/${slug}"`));

const sitemap = readFileSync(join(web, "sitemap.xml"), "utf8");
check("sitemap latest slug", sitemap.includes(`/blog/${slug}`));

const blogIndex = readFileSync(join(web, "blog", "index.html"), "utf8");
check("blog index latest slug", blogIndex.includes(`/blog/${slug}`));

const wave5Path = join(root, "fixtures", "blog-i18n-wave5-growth.json");
if (existsSync(wave5Path)) {
  const wave5 = JSON.parse(readFileSync(wave5Path, "utf8"));
  const slugs = wave5.slugs || [];
  if (slugs.includes(slug)) {
    check("es wave5 html", existsSync(join(web, "es", "blog", `${slug}.html`)));
    check("pt wave5 html", existsSync(join(web, "pt", "blog", `${slug}.html`)));
  }
}

check("watch-hub version", hub.version >= latest.date, `hub ${hub.version}`);

if (failed) process.exit(1);
console.log("audit-field-glass-cadence PASS");
