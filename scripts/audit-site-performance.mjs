#!/usr/bin/env node
/**
 * Static site performance · fonts · defer scripts · cache headers · forms · no duplicate assets.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_VER, CSS_HREF } from "./site-css-ver.mjs";
import { FONT_STYLESHEET_HREF } from "./site-fonts.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL perf: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const vercel = JSON.parse(readFileSync(join(web, "vercel.json"), "utf8"));
const headers = vercel.headers || [];
const cacheCss = headers.some(
  (h) => h.source === "/innsegall.css" && h.headers?.some((x) => x.key === "Cache-Control")
);
check("vercel cache innsegall.css", cacheCss);
check(
  "vercel cache innsegall-nav.js",
  headers.some((h) => h.source === "/innsegall-nav.js")
);

const pages = walkHtml(web).filter((p) => !p.includes("/samples/"));
let fontOk = 0;
let cssOk = 0;
let deferNav = 0;
let duplicateFont = 0;

for (const file of pages) {
  const rel = file.replace(web + "/", "");
  const html = readFileSync(file, "utf8");
  if (html.includes('content="noindex"')) continue;

  const fontSheets = html.match(/<link[^>]*fonts\.googleapis\.com\/css2[^>]*>/g) || [];
  if (html.includes("innsegall.css")) {
    check(`${rel} css v${CSS_VER}`, html.includes(CSS_HREF));
    cssOk++;
    if (fontSheets.length === 1 && html.includes(FONT_STYLESHEET_HREF)) fontOk++;
    if (fontSheets.length > 1) duplicateFont++;
    if (fontSheets.length === 1) {
      check(`${rel} fonts after site css`, html.indexOf(CSS_HREF) < html.indexOf(FONT_STYLESHEET_HREF));
    }
  }

  const navScripts = html.match(/innsegall-nav\.js/g) || [];
  if (navScripts.length > 1) check(`${rel} single nav script`, false);
  if (html.includes("innsegall-nav.js")) {
    check(`${rel} nav defer`, /innsegall-nav\.js[^>]*defer/.test(html));
    deferNav++;
  }

  if (html.includes("innsegall-checkout.js")) {
    check(`${rel} checkout defer`, /innsegall-checkout\.js[^>]*defer/.test(html));
  }
}

check("pages with site css", cssOk >= 20, `${cssOk}`);
check("canonical font stylesheet", fontOk >= cssOk - 3, `${fontOk}/${cssOk}`);
check("no duplicate font links sitewide", duplicateFont === 0, String(duplicateFont));

const navJs = readFileSync(join(web, "innsegall-nav.js"), "utf8");
check("nav beam idle defer", navJs.includes("requestIdleCallback"));

const chrome = readFileSync(join(root, "scripts", "sync-site-chrome.mjs"), "utf8");
check("vercel web analytics script", chrome.includes("/_vercel/insights/script.js"));
check("vercel speed insights script", chrome.includes("/_vercel/speed-insights/script.js"));
const indexHtml = readFileSync(join(web, "index.html"), "utf8");
check("index web analytics", indexHtml.includes("/_vercel/insights/script.js"));
check("index speed insights", indexHtml.includes("/_vercel/speed-insights/script.js"));

const msp = readFileSync(join(web, "msp.html"), "utf8");
check("msp seat field-input class", msp.includes('class="field-input"'));
check("msp seat label", msp.includes('for="msp-seat-count"'));

const companion = readFileSync(join(web, "companion.html"), "utf8");
check("companion paste label", companion.includes('for="companion-paste"'));
check("companion status live", companion.includes('aria-live="polite"'));

const css = readFileSync(join(web, "innsegall.css"), "utf8");
check("css field-input", css.includes(".field-input"));
check("css card content-visibility", css.includes("content-visibility"));

if (failed) {
  console.error(`\n${failed} site-performance failure(s)`);
  process.exit(1);
}
console.log("\nSite performance audit passed");
