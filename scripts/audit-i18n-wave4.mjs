#!/usr/bin/env node
/** Wave 4 slugs · fixtures + shipped HTML notice + prefixed links. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, LIVE_LOCALE_CODES } from "./lib/blog-i18n-config.mjs";
import { GLOSSARY } from "./lib/blog-i18n-glossary.mjs";
import { WAVE4_BLOG_SLUGS, BODY_REVIEWED_SLUGS } from "./lib/blog-i18n-pilot.mjs";
import { listBlogSlugs } from "./lib/blog-i18n-extract.mjs";
import { readdirSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const fixtureDir = join(root, "fixtures", "blog-i18n");
const blogDir = join(web, "blog");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 i18n-wave4: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else console.log(`ok: ${name}`);
}

const allSlugs = listBlogSlugs(blogDir, readdirSync);
check("wave4 slug list", WAVE4_BLOG_SLUGS.length === 7);
check("wave4 fixture file", existsSync(join(root, "fixtures", "blog-i18n-wave4.json")));
check(
  "body reviewed covers all blog slugs",
  BODY_REVIEWED_SLUGS.length === allSlugs.length &&
    allSlugs.every((s) => BODY_REVIEWED_SLUGS.includes(s)),
  `reviewed=${BODY_REVIEWED_SLUGS.length} total=${allSlugs.length}`
);

for (const localeKey of LIVE_LOCALE_CODES) {
  const cfg = LOCALES[localeKey];
  const g = GLOSSARY[localeKey];
  const bundlePath = join(fixtureDir, `${localeKey}.bundle.json`);
  check(`${localeKey} bundle`, existsSync(bundlePath));
  if (!existsSync(bundlePath)) continue;
  const bundle = JSON.parse(readFileSync(bundlePath, "utf8"));

  for (const slug of WAVE4_BLOG_SLUGS) {
    const post = bundle.posts?.[slug];
    check(`${localeKey} wave4 ${slug} fixture`, Boolean(post?.title && post?.mainHtml));
    check(`${localeKey} wave4 ${slug} bodyReviewed flag`, post?.bodyReviewed === true);
    const htmlPath = join(web, cfg.prefix.slice(1), "blog", `${slug}.html`);
    if (!existsSync(htmlPath)) {
      check(`${localeKey} wave4 ${slug} html`, false);
      continue;
    }
    const html = readFileSync(htmlPath, "utf8");
    check(`${localeKey} wave4 ${slug} pilot notice`, html.includes(g.localeNoticePilot));
    check(`${localeKey} wave4 ${slug} prefixed links`, html.includes(`${cfg.prefix}/blog/`));
  }
}

if (failed) {
  console.error(`\n${failed} i18n-wave4 failure(s) · npm run sync:blog-i18n`);
  process.exit(1);
}
console.log("\ni18n wave4 audit passed");
