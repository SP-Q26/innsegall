#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const rail = JSON.parse(readFileSync(join(root, "fixtures", "blog-related-rail.json"), "utf8"));

function buildNav(slug) {
  const links = rail.bySlug[slug] || rail.defaultRelated;
  const items = links
    .map((l) => `<a href="${l.href}">${l.label}</a>`)
    .join(" · ");
  return `<nav class="blog-related-rail" aria-label="Related on the road" data-related-version="${rail.version}">
        <p class="section-label">Related on the road</p>
        <p class="blog-related-links">${items}</p>
      </nav>`;
}

let changed = 0;

for (const name of readdirSync(blogDir)) {
  if (!name.endsWith(".html") || name === "index.html") continue;
  const slug = name.replace(/\.html$/, "");
  const path = join(blogDir, name);
  let html = readFileSync(path, "utf8");
  const nav = buildNav(slug);
  html = html.replace(/<nav class="blog-related-rail"[\s\S]*?<\/nav>\s*/g, "");
  const marker = "</main>";
  const insert = `\n    ${nav}\n    `;
  const before = html;
  html = html.replace(marker, `${insert}${marker}`);
  if (html !== before) {
    writeFileSync(path, html, "utf8");
    changed++;
    console.log(`blog-related · ${name}`);
  }
}

console.log(`sync-blog-related-rail done · ${changed} files`);
