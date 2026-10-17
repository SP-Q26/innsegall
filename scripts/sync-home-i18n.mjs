#!/usr/bin/env node
/**
 * Locale home pages · /es · /pt · /fr · /ar from web/index.html
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, HOME_LOCALE_CODES, SITE } from "./lib/blog-i18n-config.mjs";
import { localizeHomeHtml, patchEnHomeHreflang } from "./lib/home-i18n-transform.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const enPath = join(web, "index.html");

function ensureVercelHomeRewrites() {
  const vercelPath = join(web, "vercel.json");
  const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
  const sources = new Set(vercel.rewrites.map((r) => r.source));

  for (const localeKey of HOME_LOCALE_CODES) {
    const prefix = LOCALES[localeKey].prefix;
    for (const source of [prefix, `${prefix}/`]) {
      if (!sources.has(source)) {
        vercel.rewrites.unshift({
          source,
          destination: `${prefix}/index.html`,
        });
        sources.add(source);
      }
    }
  }
  writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n", "utf8");
}

function ensureSitemapHomes() {
  const sitemapPath = join(web, "sitemap.xml");
  if (!existsSync(sitemapPath)) return;
  let sitemap = readFileSync(sitemapPath, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  for (const localeKey of HOME_LOCALE_CODES) {
    const loc = `${SITE}${LOCALES[localeKey].prefix}`;
    if (sitemap.includes(`<loc>${loc}</loc>`)) continue;
    const block = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
    sitemap = sitemap.replace("</urlset>", `${block}</urlset>`);
  }
  writeFileSync(sitemapPath, sitemap, "utf8");
}

const enHtml = readFileSync(enPath, "utf8");
const patchedEn = patchEnHomeHreflang(enHtml);
if (patchedEn !== enHtml) writeFileSync(enPath, patchedEn, "utf8");

let written = 0;
for (const localeKey of HOME_LOCALE_CODES) {
  const cfg = LOCALES[localeKey];
  const outDir = join(web, cfg.prefix.slice(1));
  mkdirSync(outDir, { recursive: true });
  const locHtml = localizeHomeHtml(patchedEn, localeKey);
  writeFileSync(join(outDir, "index.html"), locHtml, "utf8");
  written++;
}

ensureVercelHomeRewrites();
ensureSitemapHomes();
console.log(`sync-home-i18n · ${written} locale homes · EN hreflang · rewrites + sitemap OK`);
