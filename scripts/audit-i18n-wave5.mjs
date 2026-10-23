#!/usr/bin/env node
/** Growth wave · new EN posts mirrored to es/pt with pilot notice. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, LIVE_LOCALE_CODES } from "./lib/blog-i18n-config.mjs";
import { GLOSSARY } from "./lib/blog-i18n-glossary.mjs";
import { WAVE5_GROWTH_SLUGS } from "./lib/blog-i18n-pilot.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const fixtureDir = join(root, "fixtures", "blog-i18n");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 i18n-wave5: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else console.log(`ok: ${name}`);
}

check("wave5 growth fixture", existsSync(join(root, "fixtures", "blog-i18n-wave5-growth.json")));
check("wave5 slug list", WAVE5_GROWTH_SLUGS.length >= 1);

for (const localeKey of LIVE_LOCALE_CODES) {
  const cfg = LOCALES[localeKey];
  const g = GLOSSARY[localeKey];
  const bundlePath = join(fixtureDir, `${localeKey}.bundle.json`);
  check(`${localeKey} bundle`, existsSync(bundlePath));
  if (!existsSync(bundlePath)) continue;
  const bundle = JSON.parse(readFileSync(bundlePath, "utf8"));

  for (const slug of WAVE5_GROWTH_SLUGS) {
    const post = bundle.posts?.[slug];
    check(`${localeKey} wave5 ${slug} fixture`, Boolean(post?.title && post?.mainHtml));
    const htmlPath = join(web, cfg.prefix.slice(1), "blog", `${slug}.html`);
    check(`${localeKey} wave5 ${slug} html`, existsSync(htmlPath));
    if (!existsSync(htmlPath)) continue;
    const html = readFileSync(htmlPath, "utf8");
    check(`${localeKey} wave5 ${slug} pilot notice`, html.includes(g.localeNoticePilot));
    check(`${localeKey} wave5 ${slug} prefixed links`, html.includes(`${cfg.prefix}/blog/`));
  }
}

if (failed) {
  console.error(`\n${failed} i18n-wave5 failure(s) · npm run build:blog-i18n-wave5 && npm run sync:blog-i18n`);
  process.exit(1);
}
console.log("\ni18n wave5 growth audit passed");
