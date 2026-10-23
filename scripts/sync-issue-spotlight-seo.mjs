#!/usr/bin/env node
/** Ensure blog-posts-seo.json has entries for issue_spotlight catalog slugs. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ISSUE_CATALOG } from "../src/issue-spotlight.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seoPath = join(root, "fixtures", "blog-posts-seo.json");
const pack = JSON.parse(readFileSync(seoPath, "utf8"));
const today = new Date().toISOString().slice(0, 10);
let added = 0;

for (const meta of Object.values(ISSUE_CATALOG)) {
  const slug = meta.slug;
  const desc = String(meta.dek || "").trim().slice(0, 160);
  if (!slug || !desc) continue;
  if (!pack.posts[slug]) {
    pack.posts[slug] = {
      description: desc,
      datePublished: today,
      dateModified: today,
      keywords: "issue spotlight, Macintosh triage, Innsegall Battle Scout",
    };
    added++;
  }
}

if (added) {
  writeFileSync(seoPath, JSON.stringify(pack, null, 2) + "\n", "utf8");
  console.log(`sync-issue-spotlight-seo · added ${added} slug(s) to blog-posts-seo.json`);
} else {
  console.log("sync-issue-spotlight-seo · catalog slugs already present");
}
