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
  }
}

const companion = readFileSync(join(web, "companion.html"), "utf8");
check("companion canonical", companion.includes('href="https://innsegall.com/companion"'));

console.log(failed ? `\n${failed} structured-data failure(s)` : "\nStructured data audit passed");
process.exit(failed ? 1 : 0);
