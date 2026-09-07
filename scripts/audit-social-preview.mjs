#!/usr/bin/env node
/**
 * Social preview audit · every indexable page must render sleek Twitter/OG cards.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const OG_URL = "https://innsegall.com/og/innsegall-card.png";
let failed = 0;

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

function checkPage(rel, html) {
  const label = rel.replace(/\\/g, "/");
  if (/noindex/i.test(html)) {
    console.log(`skip: ${label} (noindex)`);
    return;
  }

  const required = [
    ["og:type", /property="og:type"/],
    ["og:site_name", /property="og:site_name"/],
    ["og:title", /property="og:title"/],
    ["og:description", /property="og:description"/],
    ["og:url", /property="og:url"/],
    ["og:image hosted", () => html.includes(OG_URL)],
    ["og:image:width", /property="og:image:width"/],
    ["og:image:height", /property="og:image:height"/],
    ["og:image:type", /property="og:image:type"/],
    ["og:image:alt", /property="og:image:alt"/],
    ["og:locale", /property="og:locale"/],
    ["twitter:card large", /twitter:card" content="summary_large_image"/],
    ["twitter:title", /name="twitter:title"/],
    ["twitter:description", /name="twitter:description"/],
    ["twitter:image", /name="twitter:image"/],
    ["twitter:image:alt", /name="twitter:image:alt"/],
    ["canonical", /rel="canonical"/],
    ["meta description", /name="description"/],
  ];

  for (const [name, test] of required) {
    const ok = typeof test === "function" ? test() : test.test(html);
    if (!ok) {
      console.error(`P0 social: ${label} · missing ${name}`);
      failed++;
    }
  }

  const ogUrl = html.match(/property="og:url" content="([^"]*)"/)?.[1];
  const canonical = html.match(/rel="canonical" href="([^"]*)"/)?.[1];
  if (ogUrl && canonical && ogUrl !== canonical) {
    console.error(`P0 social: ${label} · og:url ≠ canonical`);
    failed++;
  }

  if (!/og:image" content="data:image/.test(html)) {
    console.log(`ok: ${label}`);
  } else {
    console.error(`P0 social: ${label} · data-uri og:image`);
    failed++;
  }
}

for (const file of walkHtml(web)) {
  const rel = relative(web, file);
  checkPage(rel, readFileSync(file, "utf8"));
}

if (failed) {
  console.error(`\n${failed} social preview failure(s)`);
  process.exit(1);
}
console.log("\nSocial preview audit passed · all indexable pages");
