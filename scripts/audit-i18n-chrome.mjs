#!/usr/bin/env node
/** Locale blog chrome · prefixed blog links · localized nav labels. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, LIVE_LOCALE_CODES } from "./lib/blog-i18n-config.mjs";
import { GLOSSARY } from "./lib/blog-i18n-glossary.mjs";
import { listBlogSlugs } from "./lib/blog-i18n-extract.mjs";
import { PILOT_BLOG_SLUGS } from "./lib/blog-i18n-pilot.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 i18n-chrome: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else console.log(`ok: ${name}`);
}

const slugs = listBlogSlugs(join(web, "blog"), readdirSync);
const sampleSlugs = [...new Set([...PILOT_BLOG_SLUGS.slice(0, 5), ...slugs.slice(0, 3)])];

for (const localeKey of LIVE_LOCALE_CODES) {
  const cfg = LOCALES[localeKey];
  const g = GLOSSARY[localeKey];
  const prefix = cfg.prefix;
  const indexPath = join(web, prefix.slice(1), "blog", "index.html");
  if (!existsSync(indexPath)) continue;
  const indexHtml = readFileSync(indexPath, "utf8");
  check(`${localeKey} blog index nav help`, indexHtml.includes(g.navHelp || g.help));
  check(`${localeKey} blog index nav trending`, indexHtml.includes(g.trending));

  for (const slug of sampleSlugs) {
    const p = join(web, prefix.slice(1), "blog", `${slug}.html`);
    if (!existsSync(p)) continue;
    const html = readFileSync(p, "utf8");
    const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [])[1] || "";
    const enPathLinks = (main.match(/href="\/blog\//g) || []).length;
    check(`${localeKey} ${slug} no raw /blog/ in main`, enPathLinks === 0, `found=${enPathLinks}`);
    check(
      `${localeKey} ${slug} locale blog links`,
      main.includes(`href="${prefix}/blog/`) || main.includes(`href="${prefix}/blog"`),
    );
  }
}

if (failed) {
  console.error(`\n${failed} i18n-chrome failure(s)`);
  process.exit(1);
}
console.log("\ni18n chrome audit passed");
