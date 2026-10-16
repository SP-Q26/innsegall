#!/usr/bin/env node
/**
 * Live i18n smoke · shipped es + pt-BR blog · preview fr/ar stay 404 until live.
 * Usage: node scripts/smoke-i18n-live.mjs --base=https://innsegall.com
 */
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, LIVE_LOCALE_CODES, SITE } from "./lib/blog-i18n-config.mjs";
import { listBlogSlugs } from "./lib/blog-i18n-extract.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const sampleSlug = listBlogSlugs(join(repoRoot, "web", "blog"), readdirSync)[0];

/** Matches innsegall-locale.js · not shipped until live: true. */
const PREVIEW_LOCALE_PREFIXES = ["/fr", "/ar"];

function getArg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
}

const base = (getArg("base", "https://innsegall.com") || "").replace(/\/$/, "");
let fail = 0;
let ok = 0;

function pass(msg) {
  console.log(`ok  ${msg}`);
  ok++;
}

function failMsg(msg) {
  console.error(`FAIL ${msg}`);
  fail++;
}

function readHtmlLang(html) {
  const m = html.match(/<html[^>]*\slang=["']([^"']+)["']/i);
  return m ? m[1] : "";
}

async function fetchPath(path) {
  const url = `${base}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { res, text, url };
}

console.log(`innsegall smoke-i18n-live · ${base}\n`);

for (const localeKey of LIVE_LOCALE_CODES) {
  const cfg = LOCALES[localeKey];
  const paths = [`${cfg.prefix}/blog`, `${cfg.prefix}/blog/${sampleSlug}`];
  for (const path of paths) {
    try {
      const { res, text } = await fetchPath(path);
      if (res.status < 200 || res.status >= 400) {
        failMsg(`${res.status} ${path}`);
        continue;
      }
      const lang = readHtmlLang(text);
      if (lang !== cfg.htmlLang) {
        failMsg(`${path} lang=${lang || "?"} expected ${cfg.htmlLang}`);
        continue;
      }
      const canonicalNeedle = `${SITE}${cfg.prefix}/blog`;
      if (path.endsWith("/blog")) {
        if (!text.includes(canonicalNeedle)) {
          failMsg(`${path} missing canonical ${canonicalNeedle}`);
          continue;
        }
      } else if (!text.includes(`${SITE}${path}`)) {
        failMsg(`${path} missing post canonical`);
        continue;
      }
      if (path.includes("/blog/") && !text.includes('hreflang="en"')) {
        failMsg(`${path} missing hreflang=en`);
        continue;
      }
      pass(`${res.status} ${path} · lang=${lang}`);
    } catch (e) {
      failMsg(`${path} ${e.message}`);
    }
  }
}

console.log("── preview locales (not shipped) ──");
for (const prefix of PREVIEW_LOCALE_PREFIXES) {
  for (const path of [prefix, `${prefix}/blog`]) {
    try {
      const { res } = await fetchPath(path);
      if (res.status === 404) {
        pass(`${res.status} ${path} (expected until live)`);
      } else {
        failMsg(`${path} expected 404 got ${res.status} · flip live in innsegall-locale.js + ship blog`);
      }
    } catch (e) {
      failMsg(`${path} ${e.message}`);
    }
  }
}

console.log("── locale picker on home ──");
try {
  const { res, text } = await fetchPath("/");
  if (res.status >= 400) {
    failMsg(`/ ${res.status}`);
  } else if (!text.includes('data-locale-code="es"') || !text.includes('data-locale-code="pt-BR"')) {
    failMsg("/ missing live locale picker buttons");
  } else if (!text.includes("innsegall-locale.js")) {
    failMsg("/ missing innsegall-locale.js");
  } else {
    pass("home locale picker es + pt-BR");
  }
} catch (e) {
  failMsg(`/ picker ${e.message}`);
}

console.log(`\n${ok} ok · ${fail} fail`);
process.exit(fail ? 1 : 0);
