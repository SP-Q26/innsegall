#!/usr/bin/env node
/** Locale home pages at /es · /pt · /fr · /ar. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES, HOME_LOCALE_CODES, SITE } from "./lib/blog-i18n-config.mjs";
import { GLOSSARY } from "./lib/blog-i18n-glossary.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 home-i18n: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else console.log(`ok: ${name}`);
}

const en = readFileSync(join(web, "index.html"), "utf8");
check("EN home hreflang es", en.includes('hreflang="es"'));
check("EN home hreflang fr", en.includes('hreflang="fr"'));
check("EN home hreflang ar", en.includes('hreflang="ar"'));

for (const localeKey of HOME_LOCALE_CODES) {
  const cfg = LOCALES[localeKey];
  const g = GLOSSARY[localeKey];
  const p = join(web, cfg.prefix.slice(1), "index.html");
  check(`${localeKey} home file`, existsSync(p));
  if (!existsSync(p)) continue;
  const html = readFileSync(p, "utf8");
  check(`${localeKey} home lang`, html.includes(`lang="${cfg.htmlLang}"`));
  if (cfg.htmlDir) check(`${localeKey} home dir`, html.includes(`dir="${cfg.htmlDir}"`));
  check(`${localeKey} home canonical`, html.includes(`${SITE}${cfg.prefix}/`));
  check(`${localeKey} home hero`, html.includes(g.home.heroH1));
  check(`${localeKey} home notice`, html.includes("home-i18n-notice"));
}

const vercel = JSON.parse(readFileSync(join(web, "vercel.json"), "utf8"));
for (const localeKey of HOME_LOCALE_CODES) {
  const prefix = LOCALES[localeKey].prefix;
  const has = vercel.rewrites.some(
    (r) => r.source === prefix && r.destination === `${prefix}/index.html`
  );
  check(`${localeKey} vercel rewrite`, has);
}

if (failed) {
  console.error(`\n${failed} home-i18n failure(s) · npm run sync:home-i18n`);
  process.exit(1);
}
console.log("\nhome-i18n audit passed");
