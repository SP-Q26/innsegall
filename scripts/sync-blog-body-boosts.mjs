#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const boosts = JSON.parse(readFileSync(join(root, "fixtures", "blog-body-boosts.json"), "utf8"));
const version = boosts.version;

let changed = 0;

for (const name of readdirSync(blogDir)) {
  if (!name.endsWith(".html") || name === "index.html") continue;
  const slug = name.replace(/\.html$/, "");
  const block = boosts.boosts[slug];
  if (!block) continue;

  const path = join(blogDir, name);
  let html = readFileSync(path, "utf8");
  html = html.replace(/<section class="blog-boost"[\s\S]*?<\/section>\s*/g, "");

  if (html.includes(`data-boost-version="${version}"`)) continue;

  const anchor = '<p class="legal-nav" style="margin-top:2rem;">';
  if (!html.includes(anchor)) continue;

  const before = html;
  html = html.replace(anchor, `${block}\n\n      ${anchor}`);
  if (html !== before) {
    writeFileSync(path, html, "utf8");
    changed++;
    console.log(`blog-boost · ${name}`);
  }
}

console.log(`sync-blog-body-boosts done · ${changed} files`);
