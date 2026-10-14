#!/usr/bin/env node
/**
 * Normalize blog CTA strip · browser-first vs standard · sample before install.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const variants = JSON.parse(
  readFileSync(join(root, "fixtures", "blog-cta-variants.json"), "utf8")
);
const browserFirst = new Set(variants.browser_first_slugs || []);

const IOS_LEAD = `Mac runs the scout · iPhone/iPad hold the receipt. <a href="/samples/battle-scout-demo">Sample report</a> · <a href="/alpha">Send the scout</a> on your Mac · <a href="/companion">Open companion inbox</a> · <a href="/ios">iOS guide</a> · not antivirus.`;

function leadForSlug(slug) {
  if (browserFirst.has(slug)) return variants.browser_first_lead;
  return variants.standard_lead;
}

function ctaSection(lead) {
  return `<section class="blog-cta-strip section" aria-label="Next step">
        <p class="section-label">We send the scout</p>
        <p class="section-lead">${lead}</p>
      </section>`;
}

let changed = 0;

for (const name of readdirSync(blogDir)) {
  if (!name.endsWith(".html") || name === "index.html") continue;
  const slug = name.replace(/\.html$/, "");
  let html = readFileSync(join(blogDir, name), "utf8");
  const before = html;
  const lead = leadForSlug(slug);

  if (name.includes("ios-companion")) {
    html = html.replace(
      /<p class="section-lead">[\s\S]*?<\/p>(\s*<\/section>\s*<footer)/,
      `<p class="section-lead">${IOS_LEAD}</p>$1`
    );
  } else if (html.includes("blog-cta-strip")) {
    html = html.replace(
      /<section class="blog-cta-strip[^"]*"[^>]*>[\s\S]*?<\/section>/,
      ctaSection(lead)
    );
  }

  if (html !== before) {
    writeFileSync(join(blogDir, name), html, "utf8");
    changed++;
    console.log(`blog-cta · ${name}`);
  }
}

console.log(`sync-blog-cta done · ${changed} files · variant ${variants.version}`);
