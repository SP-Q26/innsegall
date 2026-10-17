#!/usr/bin/env node
/** Pilot top-20 · fixtures + shipped HTML notice + localized chrome on sample posts. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, LIVE_LOCALE_CODES } from "./lib/blog-i18n-config.mjs";
import { GLOSSARY } from "./lib/blog-i18n-glossary.mjs";
import { PILOT_BLOG_SLUGS } from "./lib/blog-i18n-pilot.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const fixtureDir = join(root, "fixtures", "blog-i18n");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 i18n-pilot: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else console.log(`ok: ${name}`);
}

check("pilot slug list", PILOT_BLOG_SLUGS.length === 20);
check("pilot fixture file", existsSync(join(root, "fixtures", "blog-i18n-pilot-top20.json")));

for (const localeKey of LIVE_LOCALE_CODES) {
  const cfg = LOCALES[localeKey];
  const g = GLOSSARY[localeKey];
  const bundlePath = join(fixtureDir, `${localeKey}.bundle.json`);
  check(`${localeKey} bundle`, existsSync(bundlePath));
  if (!existsSync(bundlePath)) continue;
  const bundle = JSON.parse(readFileSync(bundlePath, "utf8"));

  for (const slug of PILOT_BLOG_SLUGS) {
    const post = bundle.posts?.[slug];
    check(`${localeKey} pilot ${slug} fixture`, Boolean(post?.title && post?.mainHtml));
    const htmlPath = join(web, cfg.prefix.slice(1), "blog", `${slug}.html`);
    if (!existsSync(htmlPath)) {
      check(`${localeKey} pilot ${slug} html`, false);
      continue;
    }
    const html = readFileSync(htmlPath, "utf8");
    check(`${localeKey} pilot ${slug} notice`, html.includes(g.localeNoticePilot));
    check(`${localeKey} pilot ${slug} prefixed links`, html.includes(`${cfg.prefix}/blog/`));
  }
}

if (failed) {
  console.error(`\n${failed} i18n-pilot failure(s) · npm run sync:blog-i18n`);
  process.exit(1);
}
console.log("\ni18n pilot audit passed · top 20 chrome + notice");
