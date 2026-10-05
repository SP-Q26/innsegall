#!/usr/bin/env node
/**
 * Sync blog intro leads · problem → calm steps → scout (fixture-driven).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const pack = JSON.parse(readFileSync(join(root, "fixtures", "blog-intro-leads.json"), "utf8"));
const version = pack.version;
const skip = new Set(pack.skip_slugs || []);

const LEAD_RE =
  /<!-- innsegall:intro-lead=[^>]+ -->[\s\S]*?<!-- \/innsegall:intro-lead -->\s*/g;

function leadBlock(paragraphs) {
  const ps = paragraphs.map((t) => `      <p>${t}</p>`).join("\n");
  return `\n      <!-- innsegall:intro-lead=${version} -->\n${ps}\n      <!-- /innsegall:intro-lead -->\n`;
}

let changed = 0;

for (const name of readdirSync(blogDir)) {
  if (!name.endsWith(".html") || name === "index.html") continue;
  const slug = name.replace(/\.html$/, "");
  if (skip.has(slug)) continue;
  const paragraphs = pack.leads[slug];
  if (!paragraphs?.length) continue;

  const path = join(blogDir, name);
  let html = readFileSync(path, "utf8");
  html = html.replace(LEAD_RE, "");

  const bqEnd = html.indexOf("</blockquote>");
  if (bqEnd === -1) continue;
  const afterBq = html.slice(bqEnd + "</blockquote>".length);
  const nextH2 = afterBq.search(/\n\s*<h2[\s>]/);
  const nextSection = afterBq.search(/\n\s*<section[\s>]/);
  let cut =
    nextH2 >= 0 && nextSection >= 0
      ? Math.min(nextH2, nextSection)
      : Math.max(nextH2, nextSection);
  if (cut < 0) continue;

  const insertAt = bqEnd + "</blockquote>".length;
  const before = html.slice(0, insertAt);
  const rest = html.slice(insertAt);
  const restTrim = rest.slice(cut);
  const next = before + leadBlock(paragraphs) + restTrim;

  if (next !== html) {
    writeFileSync(path, next, "utf8");
    changed++;
    console.log(`intro-lead · ${name}`);
  }
}

console.log(`sync-blog-intro-leads done · ${changed} files · version ${version}`);
