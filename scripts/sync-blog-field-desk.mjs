#!/usr/bin/env node
/**
 * Inject canonical Field Desk news block into every Field Report post (HTML + MD).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const desk = JSON.parse(readFileSync(join(root, "fixtures", "blog-field-desk.json"), "utf8"));
const skip = new Set(desk.skip_slugs || []);

const MD_HEADER = "## From the Field Desk ·";
const MD_FENCE = "\n\n---\n\n" + desk.md + "\n";

function stripFieldDeskHtml(html) {
  return html.replace(/<aside class="blog-field-desk"[\s\S]*?<\/aside>\s*/g, "");
}

function insertFieldDeskHtml(html) {
  const stripped = stripFieldDeskHtml(html);
  const block = desk.html + "\n\n      ";
  if (stripped.includes('class="legal-meta"')) {
    return stripped.replace(/(<p class="legal-meta">[\s\S]*?<\/p>\s*)/, `$1${block}`);
  }
  if (stripped.includes("blog-rune-divider")) {
    return stripped.replace(
      /(<p class="blog-rune-divider"[^>]*>[\s\S]*?<\/p>\s*)/,
      `$1${block}`
    );
  }
  return stripped.replace(/(<h1>[^<]+<\/h1>\s*)/, `$1${block}`);
}

function stripFieldDeskMd(md) {
  const idx = md.indexOf(MD_HEADER);
  if (idx === -1) return md;
  const before = md.slice(0, idx).replace(/\n---\s*$/, "").trimEnd();
  return before + "\n";
}

let changed = 0;

for (const name of readdirSync(blogDir)) {
  if (name === "index.html") continue;

  if (name.endsWith(".html")) {
    const slug = name.replace(/\.html$/, "");
    if (skip.has(slug)) continue;
    const path = join(blogDir, name);
    const before = readFileSync(path, "utf8");
    const after = insertFieldDeskHtml(before);
    if (after !== before) {
      writeFileSync(path, after, "utf8");
      changed++;
      console.log(`field-desk · ${name}`);
    }
    continue;
  }

  if (name.endsWith(".md")) {
    const slug = name.replace(/\.md$/, "");
    if (skip.has(slug)) continue;
    const path = join(blogDir, name);
    let md = readFileSync(path, "utf8");
    const before = md;
    md = stripFieldDeskMd(md);
    if (!md.includes(MD_HEADER)) {
      md = md.trimEnd() + MD_FENCE;
    } else {
      md = stripFieldDeskMd(md) + MD_FENCE;
    }
    if (md !== before) {
      writeFileSync(path, md, "utf8");
      changed++;
      console.log(`field-desk · ${name}`);
    }
  }
}

console.log(`sync-blog-field-desk done · ${changed} files · version ${desk.version}`);
