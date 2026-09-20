#!/usr/bin/env node
/**
 * Batch SEO · meta descriptions + BlogPosting JSON-LD enrichment from fixtures.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const pack = JSON.parse(readFileSync(join(root, "fixtures", "blog-posts-seo.json"), "utf8"));
const defaults = pack.defaults || {};

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function upsertJsonLd(html, slug, description) {
  const canonical = `https://innsegall.com/blog/${slug}`;
  const published =
    pack.posts[slug]?.datePublished ||
    html.match(/"datePublished":\s*"([^"]+)"/)?.[1] ||
    defaults.dateModified;
  const modified = pack.posts[slug]?.dateModified || defaults.dateModified;
  const image = defaults.image;
  const headline =
    html.match(/"headline":\s*"([^"]+)"/)?.[1] ||
    html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(/ · Innsegall$/, "") ||
    slug;

  const block = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    datePublished: published,
    dateModified: modified,
    author: { "@id": "https://innsegall.com/#organization" },
    publisher: { "@id": "https://innsegall.com/#organization" },
    url: canonical,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    description,
    image,
    inLanguage: "en-US",
  };

  const json = JSON.stringify(block, null, 2);
  if (html.includes('type="application/ld+json"')) {
    return html.replace(
      /<script type="application\/ld\+json">\s*[\s\S]*?\s*<\/script>/,
      `<script type="application/ld+json">\n  ${json}\n  </script>`
    );
  }
  return html;
}

let changed = 0;

for (const name of readdirSync(blogDir)) {
  if (!name.endsWith(".html") || name === "index.html") continue;
  const slug = name.replace(/\.html$/, "");
  const seo = pack.posts[slug];
  if (!seo?.description) continue;

  const path = join(blogDir, name);
  let html = readFileSync(path, "utf8");
  const before = html;
  const desc = seo.description.trim();

  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${escapeAttr(desc)}">`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${escapeAttr(desc)}">`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${escapeAttr(desc)}">`
  );
  html = upsertJsonLd(html, slug, desc);

  if (html !== before) {
    writeFileSync(path, html, "utf8");
    changed++;
    console.log(`blog-seo · ${name}`);
  }
}

console.log(`sync-blog-seo done · ${changed} files`);
