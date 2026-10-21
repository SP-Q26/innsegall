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
  PILOT_BLOG_SLUGS,
  WAVE2_BLOG_SLUGS,
  WAVE3_BLOG_SLUGS,
  WAVE4_BLOG_SLUGS,
  isBodyReviewedSlug,
} from "./lib/blog-i18n-pilot.mjs";
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
const pilotOnly = process.argv.includes("--pilot-only");
const wave2Only = process.argv.includes("--wave2-only");
const wave3Only = process.argv.includes("--wave3-only");
const wave4Only = process.argv.includes("--wave4-only");
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
  const waveOnly = pilotOnly || wave2Only || wave3Only || wave4Only;
  if (existsSync(bundlePath) && (!force || waveOnly)) {
    bundle = JSON.parse(readFileSync(bundlePath, "utf8"));
  }

  const slugs = slugArg
    ? [slugArg]
    : pilotOnly
      ? PILOT_BLOG_SLUGS
      : wave2Only
        ? WAVE2_BLOG_SLUGS
        : wave3Only
          ? WAVE3_BLOG_SLUGS
          : wave4Only
            ? WAVE4_BLOG_SLUGS
            : listBlogSlugs(blogDir, readdirSync);
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

    bundle.posts[slug] = {
      title,
      description: desc,
      mainHtml,
      bodyReviewed:
        pilotOnly || wave2Only || wave3Only || wave4Only || isBodyReviewedSlug(slug),
    };
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
