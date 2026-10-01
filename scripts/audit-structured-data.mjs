#!/usr/bin/env node
/**
 * Phase 7 W1b · JSON-LD on home + blog Article posts.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let failed = 0;

function check(name, ok) {
  if (ok) console.log(`ok: ${name}`);
  else {
    console.error(`FAIL: ${name}`);
    failed++;
  }
}

function parseLdJsonBlocks(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch {
      blocks.push(null);
    }
  }
  return blocks;
}

const index = readFileSync(join(web, "index.html"), "utf8");
const indexLd = parseLdJsonBlocks(index);
check("index has ld+json", indexLd.length >= 1);
const indexGraph = indexLd.find((b) => b && Array.isArray(b["@graph"]));
check("index @graph", Boolean(indexGraph));
const types = indexGraph
  ? indexGraph["@graph"].map((n) => n["@type"]).filter(Boolean)
  : [];
check("index Organization", types.includes("Organization"));
check("index FAQ or SoftwareApplication", types.includes("FAQPage") || types.includes("SoftwareApplication"));

const blogDir = join(web, "blog");
for (const file of readdirSync(blogDir)) {
  if (!file.endsWith(".html") || file === "index.html") continue;
  const slug = file.replace(/\.html$/, "");
  const html = readFileSync(join(blogDir, file), "utf8");
  const blocks = parseLdJsonBlocks(html).filter(Boolean);
  check(`blog/${slug} ld+json parses`, blocks.length >= 1 && blocks.every(Boolean));
  const article = blocks.find((b) => b["@type"] === "BlogPosting" || b["@type"] === "Article");
  check(`blog/${slug} BlogPosting`, Boolean(article));
  if (article) {
    check(`blog/${slug} headline`, typeof article.headline === "string" && article.headline.length > 5);
    check(`blog/${slug} url`, String(article.url || "").includes(slug));
    check(`blog/${slug} image`, Boolean(article.image));
    check(`blog/${slug} dateModified`, Boolean(article.dateModified));
  }
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const marketingPack = JSON.parse(
  readFileSync(join(root, "fixtures", "pages-marketing-seo.json"), "utf8")
);

for (const [file, cfg] of Object.entries(marketingPack.pages)) {
  const html = readFileSync(join(web, file), "utf8");
  const label = file.replace(".html", "");
  check(`${label} page ld+json`, html.includes("INNSEGALL_PAGE_LD_START"));
  const blocks = parseLdJsonBlocks(html).filter(Boolean);
  const graph = blocks.find((b) => b && Array.isArray(b["@graph"]));
  check(`${label} @graph`, Boolean(graph));
  const types = graph ? graph["@graph"].map((n) => n["@type"]).filter(Boolean) : [];
  check(`${label} BreadcrumbList`, types.includes("BreadcrumbList"));
  check(`${label} WebPage`, types.includes("WebPage") || types.includes(cfg.webPageType || "WebPage"));
  if (cfg.webApplication) {
    check(`${label} WebApplication`, types.includes("WebApplication"));
  }
}

const blogIndex = readFileSync(join(web, "blog", "index.html"), "utf8");
check("blog index Blog schema", blogIndex.includes('"@type": "Blog"'));

const success = readFileSync(join(web, "success.html"), "utf8");
check("success noindex", success.includes('content="noindex"'));
check("success canonical", success.includes('href="https://innsegall.com/success"'));

console.log(failed ? `\n${failed} structured-data failure(s)` : "\nStructured data audit passed");
process.exit(failed ? 1 : 0);
