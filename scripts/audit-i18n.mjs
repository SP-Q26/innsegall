#!/usr/bin/env node
/** i18n ship gate · es + pt-BR blog parity · hreflang · locale picker live. */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, LIVE_LOCALE_CODES, SITE } from "./lib/blog-i18n-config.mjs";
import { listBlogSlugs } from "./lib/blog-i18n-extract.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 i18n: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else console.log(`ok: ${name}`);
}

const slugs = listBlogSlugs(blogDir, readdirSync);
check("EN blog slugs", slugs.length >= 55, `count=${slugs.length}`);

for (const localeKey of LIVE_LOCALE_CODES) {
  const cfg = LOCALES[localeKey];
  const dir = join(root, "web", cfg.prefix.slice(1), "blog");
  check(`${localeKey} blog dir`, existsSync(dir));
  check(`${localeKey} blog index`, existsSync(join(dir, "index.html")));
  const missing = slugs.filter((slug) => !existsSync(join(dir, `${slug}.html`)));
  check(`${localeKey} html parity`, missing.length === 0, missing.slice(0, 5).join(", "));
  const samplePath = join(dir, `${slugs[0]}.html`);
  if (existsSync(samplePath)) {
    const html = readFileSync(samplePath, "utf8");
    check(`${localeKey} sample lang`, html.includes(`lang="${cfg.htmlLang}"`));
    check(`${localeKey} sample canonical`, html.includes(`${SITE}${cfg.prefix}/blog/${slugs[0]}`));
  }
}

const sample = readFileSync(join(blogDir, `${slugs[0]}.html`), "utf8");
check("EN hreflang es", sample.includes('hreflang="es"'));
check("EN hreflang pt", sample.includes('hreflang="pt"'));

const localeJs = readFileSync(join(root, "web", "innsegall-locale.js"), "utf8");
check("locale es live", /code: "es"[^}]*live: true/.test(localeJs.replace(/\s+/g, " ")));
check("locale pt live", /pt-BR"[^}]*live: true/.test(localeJs.replace(/\s+/g, " ")));

const chrome = readFileSync(join(root, "scripts", "sync-site-chrome.mjs"), "utf8");
check("picker es not soon", chrome.includes('data-locale-code="es">Español</button>'));
check("picker pt not soon", chrome.includes('data-locale-code="pt-BR">Português</button>'));

for (const localeKey of LIVE_LOCALE_CODES) {
  const bundle = join(root, "fixtures", "blog-i18n", `${localeKey}.bundle.json`);
  check(`${localeKey} bundle`, existsSync(bundle));
  if (existsSync(bundle)) {
    const data = JSON.parse(readFileSync(bundle, "utf8"));
    const missing = slugs.filter((s) => !data.posts?.[s]);
    check(`${localeKey} bundle complete`, missing.length === 0, missing.slice(0, 3).join(", "));
  }
}

for (const preview of ["ar", "fr"]) {
  const dir = join(root, "web", preview, "blog");
  check(`${preview} blog not shipped in repo`, !existsSync(dir));
}

if (failed) {
  console.error(`\n${failed} i18n failure(s)`);
  process.exit(1);
}
console.log("\ni18n audit PASS · es + pt-BR blog shipped");
