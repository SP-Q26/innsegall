#!/usr/bin/env node
/**
 * Blog quality gate · SEO meta band · JSON-LD richness · structure · field desk.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web", "blog");
const seoPack = JSON.parse(readFileSync(join(root, "fixtures", "blog-posts-seo.json"), "utf8"));
const desk = JSON.parse(readFileSync(join(root, "fixtures", "blog-field-desk.json"), "utf8"));
const railVer = JSON.parse(readFileSync(join(root, "fixtures", "blog-related-rail.json"), "utf8")).version;

let failed = 0;
let scoreSum = 0;
let count = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`FAIL quality: ${name}`);
    failed++;
    return 0;
  }
  return 1;
}

function mainH2Count(html) {
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] || html;
  return (main.match(/<h2/g) || []).length;
}

function mainHasList(html) {
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] || html;
  return /<ul|<ol|<table/i.test(main);
}

for (const file of readdirSync(web)) {
  if (!file.endsWith(".html") || file === "index.html") continue;
  const slug = file.replace(/\.html$/, "");
  const html = readFileSync(join(web, file), "utf8");
  let pts = 0;
  const max = 10;

  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "";
  const len = desc.length;
  pts += check(`${slug} meta 120-160`, len >= 120 && len <= 160) ? 2 : len >= 115 && len <= 165 ? 1 : 0;

  const ld = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)<\/script>/)?.[1];
  let article = null;
  try {
    article = ld ? JSON.parse(ld) : null;
  } catch {
    article = null;
  }
  pts += check(`${slug} BlogPosting`, article?.["@type"] === "BlogPosting") ? 1 : 0;
  pts += check(`${slug} ld image`, Boolean(article?.image)) ? 1 : 0;
  pts += check(`${slug} ld dateModified`, Boolean(article?.dateModified)) ? 1 : 0;
  pts += check(`${slug} ld mainEntityOfPage`, Boolean(article?.mainEntityOfPage)) ? 1 : 0;

  const h2 = mainH2Count(html);
  pts += check(`${slug} body h2>=3`, h2 >= 3) ? 2 : h2 >= 2 ? 1 : 0;
  pts += check(`${slug} body list or table`, mainHasList(html)) ? 1 : 0;

  if (!desk.skip_slugs?.includes(slug)) {
    pts += check(`${slug} field desk`, html.includes(`data-field-desk-version="${desk.version}"`)) ? 1 : 0;
  } else {
    pts += 1;
  }

  pts += check(`${slug} related rail`, html.includes(`data-related-version="${railVer}"`)) ? 1 : 0;

  const pct = Math.round((pts / max) * 100);
  scoreSum += pct;
  count++;
  console.log(`score ${slug}: ${pct}/100`);
}

const avg = count ? Math.round(scoreSum / count) : 0;
console.log(`\nBlog quality average: ${avg}/100 (target 95+)`);
if (avg < 95) {
  console.error("Blog quality below 95 average");
  failed++;
}

if (failed) {
  console.error(`\n${failed} blog-quality failure(s)`);
  process.exit(1);
}
console.log("\nBlog quality audit passed");
