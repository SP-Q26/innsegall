#!/usr/bin/env node
/** Shell consistency · header nav + rich footer */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let failed = 0;

function walkHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...walkHtml(p));
    else if (name.name.endsWith(".html") && !p.includes("/samples/")) out.push(p);
  }
  return out;
}

const map = readFileSync(join(web, "map.html"), "utf8");
if (/href="\/alpha"[^>]*>Sound the Horn</.test(map)) {
  console.error("FAIL: map.html uses Sound the Horn for /alpha");
  failed++;
} else {
  console.log("ok: map CTA Send the scout");
}

for (const file of walkHtml(web)) {
  const rel = file.replace(web + "/", "");
  const html = readFileSync(file, "utf8");
  if (!html.includes('class="site-header"')) continue;

  const navOk =
    html.includes('href="/alpha">Field manual</a>') &&
    html.includes('href="/blog">Field Report</a>') &&
    html.includes('href="/clan">Clan</a>');
  if (!navOk) {
    console.error(`FAIL: header nav · ${rel}`);
    failed++;
  }

  if (html.includes('class="site-footer"')) {
    const footerOk =
      html.includes("footer-note") &&
      html.includes('href="/warriors"') &&
      html.includes('href="/guide"');
    if (!footerOk) {
      console.error(`FAIL: footer shell · ${rel}`);
      failed++;
    }
  }
}

console.log(failed ? `\n${failed} shell audit failure(s)` : "\nShell audit passed");
process.exit(failed ? 1 : 0);
