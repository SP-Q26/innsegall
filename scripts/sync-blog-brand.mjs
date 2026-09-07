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

function polishBlogHtml(html, name) {
  const before = html;
  if (!html.includes('class="blog-prose"') && html.includes('class="legal-doc"')) {
    html = html.replace(
      /<main id="main" class="section legal-doc([^"]*)"/,
      '<main id="main" class="section legal-doc blog-prose$1"'
    );
  }
  if (!html.includes("blog-rune-divider") && html.includes("<h1>")) {
    html = html.replace(/(<h1>[^<]+<\/h1>\s*)/, `$1${RUNE}\n      `);
  }
  return html !== before ? html : before;
}

for (const name of readdirSync(blogDir)) {
  if (!name.endsWith(".html")) continue;
  const path = join(blogDir, name);
  let html = readFileSync(path, "utf8");
  const polished = polishBlogHtml(html, name);
  if (polished !== html) {
    writeFileSync(path, polished);
    changed++;
    console.log(`blog-brand · ${name}`);
  }
}

console.log(`sync-blog-brand done · ${changed} files`);
