#!/usr/bin/env node
/**
 * Blog intro leads · fixture version must match injected marker on each lead slug.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pack = JSON.parse(readFileSync(join(root, "fixtures", "blog-intro-leads.json"), "utf8"));
const version = pack.version;
const skip = new Set(pack.skip_slugs || []);
let failed = 0;

for (const slug of Object.keys(pack.leads)) {
  const path = join(root, "web", "blog", `${slug}.html`);
  const html = readFileSync(path, "utf8");
  const ok = html.includes(`<!-- innsegall:intro-lead=${version} -->`);
  if (!ok) {
    console.error(`FAIL intro-lead: ${slug} missing version ${version}`);
    failed++;
  }
}

for (const name of readdirSync(join(root, "web", "blog"))) {
  if (!name.endsWith(".html") || name === "index.html") continue;
  const slug = name.replace(/\.html$/, "");
  if (skip.has(slug) || !pack.leads[slug]) continue;
}

console.log(failed ? `\n${failed} intro-lead failure(s)` : "\nBlog intro-lead audit passed");
process.exit(failed ? 1 : 0);
