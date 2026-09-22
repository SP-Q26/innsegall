#!/usr/bin/env node
/**
 * Mobile + tablet spacing canon · CSS breakpoints · home section funnel order.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const css = readFileSync(join(web, "innsegall.css"), "utf8");
check("css v14 breakpoint tokens", /--bp-tablet:\s*48rem/.test(css));
check("css narrow mobile block", /@media \(max-width: 32\.5rem\)/.test(css));
check("css tablet hero-actions row", /@media \(min-width: 48rem\)[\s\S]*\.hero-actions/.test(css));
check("css tablet pricing 3-col", /@media \(min-width: 48rem\)[\s\S]*\.pricing-grid/.test(css));
check("css guides grid class", /\.card-grid--guides/.test(css));
check("css safe-area footer padding", /safe-area-inset-bottom/.test(css));

const index = readFileSync(join(web, "index.html"), "utf8");
const pricingPos = index.indexOf('id="pricing"');
const clanPos = index.indexOf('id="clan"');
check("index pricing before clan", pricingPos > 0 && clanPos > pricingPos);
check("index no orphan lane section", !index.includes('id="lane-title"'));
check("index field guides grid class", index.includes("card-grid--guides"));
check("index css cache v22", index.includes("innsegall.css?v=22"));

const HOME_FLOW = [
  'class="hero"',
  'id="lay-of-the-land"',
  'id="how-it-works"',
  'id="ai-share"',
  'id="field-report-routes"',
  'id="pricing"',
  'id="clan"',
  'id="faq-title"',
];
let last = -1;
for (const token of HOME_FLOW) {
  const pos = index.indexOf(token);
  check(`index flow ${token}`, pos > last);
  last = pos;
}

const KEY_HTML = [
  "index.html",
  "alpha.html",
  "guide.html",
  "clan.html",
  "companion.html",
  "ios.html",
  "tablet.html",
  "blog/index.html",
];

for (const rel of KEY_HTML) {
  const html = readFileSync(join(web, rel), "utf8");
  const label = rel.replace(".html", "");
  check(`${label} viewport-fit=cover`, /viewport-fit=cover/.test(html));
  check(`${label} innsegall.css v22`, /innsegall\.css\?v=22/.test(html));
}

function walkHtml(dir, base = "") {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      out.push(...walkHtml(p, `${base}${name}/`));
    } else if (name.endsWith(".html")) {
      out.push(`${base}${name}`);
    }
  }
  return out;
}

const pages = walkHtml(web).filter((p) => !p.includes("samples/"));
let staleCss = 0;
for (const rel of pages) {
  const html = readFileSync(join(web, rel), "utf8");
  if (html.includes("innsegall.css") && !html.includes("innsegall.css?v=22")) {
    staleCss++;
  }
}
if (staleCss) {
  check(`all pages css v22 (${staleCss} stale)`, false);
} else {
  check("all pages css v22", true);
}

console.log(failed ? `\n${failed} responsive-spacing failure(s)` : "\nResponsive spacing audit passed");
process.exit(failed ? 1 : 0);
