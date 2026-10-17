#!/usr/bin/env node
/**
 * Emit web/es/blog and web/pt/blog from EN + fixtures/blog-i18n/*.bundle.json
 * · vercel rewrites · EN hreflang · locale picker live.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, LIVE_LOCALE_CODES, SITE } from "./lib/blog-i18n-config.mjs";
import { listBlogSlugs } from "./lib/blog-i18n-extract.mjs";
import { localizeBlogPostHtml, addEnHreflang, applyLocaleChrome } from "./lib/blog-i18n-transform.mjs";
import { GLOSSARY } from "./lib/blog-i18n-glossary.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const blogDir = join(web, "blog");
const fixtureDir = join(root, "fixtures", "blog-i18n");

function loadBundle(localeKey) {
  const p = join(fixtureDir, `${localeKey}.bundle.json`);
  if (!existsSync(p)) {
    console.error(`missing ${p} · run: node scripts/build-blog-i18n-fixtures.mjs`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(p, "utf8"));
}

function ensureSitemapEntries(slugs) {
  const sitemapPath = join(web, "sitemap.xml");
  let sitemap = readFileSync(sitemapPath, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  const locs = [];
  for (const localeKey of LIVE_LOCALE_CODES) {
    const prefix = LOCALES[localeKey].prefix;
    locs.push(`${SITE}${prefix}/blog`);
    for (const slug of slugs) {
      locs.push(`${SITE}${prefix}/blog/${slug}`);
    }
  }
  for (const loc of locs) {
    if (sitemap.includes(loc)) continue;
    const block = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
    sitemap = sitemap.replace("</urlset>", `${block}</urlset>`);
  }
  writeFileSync(sitemapPath, sitemap, "utf8");
}

function ensureVercelRewrites(slugs) {
  const vercelPath = join(web, "vercel.json");
  const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
  const sources = new Set(vercel.rewrites.map((r) => r.source));

  for (const localeKey of LIVE_LOCALE_CODES) {
    const prefix = LOCALES[localeKey].prefix;
    const blogIndex = `${prefix}/blog`;
    if (!sources.has(blogIndex)) {
      vercel.rewrites.push({ source: blogIndex, destination: `${prefix}/blog/index.html` });
      sources.add(blogIndex);
    }
    for (const slug of slugs) {
      const source = `${prefix}/blog/${slug}`;
      if (!sources.has(source)) {
        vercel.rewrites.push({
          source,
          destination: `${prefix}/blog/${slug}.html`,
        });
        sources.add(source);
      }
    }
  }
  writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n", "utf8");
}

function buildLocaleBlogIndex(localeKey, slugs, bundles) {
  const cfg = LOCALES[localeKey];
  const g = GLOSSARY[localeKey];
  const enIndex = readFileSync(join(blogDir, "index.html"), "utf8");
  let html = enIndex;
  html = html.replace(/<html lang="en">/i, `<html lang="${cfg.htmlLang}">`);
  html = html.replaceAll(`${SITE}/blog`, `${SITE}${cfg.prefix}/blog`);
  html = html.replace(/href="\/blog\//g, `href="${cfg.prefix}/blog/`);
  html = html.replace(/href="\/blog"/g, `href="${cfg.prefix}/blog"`);
  html = html.replace(/Field Report/g, g.fieldReport);
  html = applyLocaleChrome(html, localeKey);
  html = html.replace(/property="og:locale" content="en_US"/gi, `property="og:locale" content="${cfg.ogLocale}"`);
  html = html.replace(/"inLanguage": "en-US"/g, `"inLanguage": "${cfg.htmlLang}"`);

  const canon = `${SITE}${cfg.prefix}/blog`;
  html = html.replace(/rel="canonical" href="[^"]*"/, `rel="canonical" href="${canon}"`);
  if (!html.includes('hreflang="en"')) {
    const block = [
      `  <link rel="alternate" hreflang="en" href="${SITE}/blog">`,
      `  <link rel="alternate" hreflang="es" href="${SITE}/es/blog">`,
      `  <link rel="alternate" hreflang="pt" href="${SITE}/pt/blog">`,
      `  <link rel="alternate" hreflang="x-default" href="${SITE}/blog">`,
    ].join("\n");
    html = html.replace(/(<link rel="canonical"[^>]*>)/i, `$1\n${block}`);
  }

  for (const slug of slugs) {
    const post = bundles.posts[slug];
    if (!post?.title) continue;
    const cardRe = new RegExp(
      `(href="${cfg.prefix}/blog/${slug}"[^>]*>)[^<]*(</a>)`,
      "i"
    );
    if (cardRe.test(html)) {
      html = html.replace(cardRe, `$1${post.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$2`);
    }
  }

  const outDir = join(web, cfg.prefix.slice(1), "blog");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html, "utf8");
}

const slugs = listBlogSlugs(blogDir, readdirSync);
let written = 0;

for (const localeKey of LIVE_LOCALE_CODES) {
  const bundle = loadBundle(localeKey);
  const cfg = LOCALES[localeKey];
  const outDir = join(web, cfg.prefix.slice(1), "blog");
  mkdirSync(outDir, { recursive: true });

  for (const slug of slugs) {
    const enPath = join(blogDir, `${slug}.html`);
    const enHtml = readFileSync(enPath, "utf8");
    const fixture = bundle.posts[slug];
    if (!fixture) {
      console.error(`P0 i18n: missing fixture for ${slug} in ${localeKey}`);
      process.exit(1);
    }
    const locHtml = localizeBlogPostHtml(enHtml, localeKey, fixture);
    writeFileSync(join(outDir, `${slug}.html`), locHtml, "utf8");
    written++;
  }
  buildLocaleBlogIndex(localeKey, slugs, bundle);
}

let enPatched = 0;
for (const slug of slugs) {
  const p = join(blogDir, `${slug}.html`);
  const before = readFileSync(p, "utf8");
  const after = addEnHreflang(before, slug);
  if (after !== before) {
    writeFileSync(p, after, "utf8");
    enPatched++;
  }
}

ensureVercelRewrites(slugs);
ensureSitemapEntries(slugs);
console.log(`sync-blog-i18n · ${written} locale pages · EN hreflang ${enPatched} · rewrites + sitemap OK`);
