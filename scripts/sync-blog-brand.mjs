#!/usr/bin/env node
/**
 * Field Report blog polish · rune divider + blog-prose class on posts.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");
const RUNE = '<p class="blog-rune-divider" aria-hidden="true">ᚠ · ᚢ · ᚦ</p>';
let changed = 0;

for (const name of readdirSync(blogDir)) {
  if (!name.endsWith(".html") || name === "index.html") continue;
  const path = join(blogDir, name);
  let html = readFileSync(path, "utf8");
  const before = html;

  if (!html.includes('class="blog-prose"')) {
    html = html.replace(
      /<main id="main" class="section legal-doc([^"]*)"/,
      '<main id="main" class="section legal-doc blog-prose$1"'
    );
  }

  if (!html.includes("blog-rune-divider")) {
    html = html.replace(/(<h1>[^<]+<\/h1>\s*)/, `$1${RUNE}\n      `);
  }

  if (html !== before) {
    writeFileSync(path, html);
    changed++;
    console.log(`blog-brand · ${name}`);
  }
}

console.log(`sync-blog-brand done · ${changed} files`);
