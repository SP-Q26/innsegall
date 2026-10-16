#!/usr/bin/env node
/**
 * Build fixtures/blog-i18n/{es,pt-BR}.bundle.json from EN blog HTML · uses gtx translate.
 * Run once (or --force) before sync:blog-i18n.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, LIVE_LOCALE_CODES } from "./lib/blog-i18n-config.mjs";
import {
  extractMainArticleHtml,
  readTitle,
  readMetaContent,
  readH1,
  listBlogSlugs,
} from "./lib/blog-i18n-extract.mjs";
import { translateText } from "./lib/translate-google-gtx.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const outDir = join(root, "fixtures", "blog-i18n");
const force = process.argv.includes("--force");
const metaOnly = process.argv.includes("--meta-only");
const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

mkdirSync(outDir, { recursive: true });

async function translateMainHtml(html, localeKey) {
  const target = LOCALES[localeKey].translateTarget;
  const chunks = html.split(/(?<=<\/(?:p|h2|h3|li|td|th)>)/i).filter((c) => c.trim());
  const out = [];
  for (const chunk of chunks) {
    out.push(await translateText(chunk, target));
    await sleep(120);
  }
  return out.join("");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function buildLocale(localeKey) {
  const bundlePath = join(outDir, `${localeKey}.bundle.json`);
  let bundle = { version: "2026-10-15", locale: localeKey, posts: {} };
  if (existsSync(bundlePath) && !force) {
    bundle = JSON.parse(readFileSync(bundlePath, "utf8"));
  }

  const slugs = slugArg ? [slugArg] : listBlogSlugs(blogDir, readdirSync);
  let n = 0;
  for (const slug of slugs) {
    if (bundle.posts[slug] && !force) continue;
    const enPath = join(blogDir, `${slug}.html`);
    if (!existsSync(enPath)) continue;
    const html = readFileSync(enPath, "utf8");
    const titleBase = readH1(html) || readTitle(html);
    const description = readMetaContent(html, "description");
    const mainEn = extractMainArticleHtml(html);

    console.log(`translate ${localeKey} · ${slug}`);
    const title = await translateText(titleBase, LOCALES[localeKey].translateTarget);
    await sleep(300);
    const desc = await translateText(description, LOCALES[localeKey].translateTarget);
    await sleep(300);
    const mainHtml = metaOnly ? mainEn : await translateMainHtml(mainEn, localeKey);

    bundle.posts[slug] = { title, description: desc, mainHtml };
    n++;
    if (n % 5 === 0) {
      writeFileSync(bundlePath, JSON.stringify(bundle, null, 2) + "\n", "utf8");
    }
  }
  writeFileSync(bundlePath, JSON.stringify(bundle, null, 2) + "\n", "utf8");
  console.log(`wrote ${bundlePath} · ${Object.keys(bundle.posts).length} posts`);
}

for (const code of LIVE_LOCALE_CODES) {
  await buildLocale(code);
}
console.log("build-blog-i18n-fixtures OK");
