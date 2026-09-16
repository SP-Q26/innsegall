#!/usr/bin/env node
/** iOS · tablet · companion · on-brand mobile lattice. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let failed = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    failed++;
  } else console.log(`ok: ${name}`);
}

const ios = readFileSync(join(web, "ios.html"), "utf8");
const tablet = readFileSync(join(web, "tablet.html"), "utf8");
const companion = readFileSync(join(web, "companion.html"), "utf8");
const supplies = readFileSync(join(web, "supplies.html"), "utf8");

for (const [label, html] of [
  ["ios", ios],
  ["tablet", tablet],
  ["companion", companion],
]) {
  check(`${label} brand mark`, html.includes('class="brand-mark"'));
  check(`${label} data-brand`, html.includes('data-brand="innsegall"'));
  check(`${label} companion link`, html.includes("/companion"));
  check(`${label} Copy for LLM or LLM paste`, /Copy for LLM|innsegall-battle-scout-ai/.test(html));
}

check("ios platform lane", ios.includes("platform-lane"));
check("tablet split layout", tablet.includes("tablet-split"));
check("tablet Copy for LLM", tablet.includes("Copy for LLM"));
check("companion voyage panel", companion.includes("companion-panel--voyage"));
check("companion PWA manifest", companion.includes("/companion.webmanifest"));
check("supplies mobile viewport", supplies.includes("viewport-fit=cover"));
check("ios supplies path", ios.includes("/supplies") || supplies.includes("/ios"));

const css = readFileSync(join(web, "innsegall.css"), "utf8");
check("css companion styles", css.includes(".companion-page"));
check("css platform lane", css.includes(".platform-lane"));

console.log(failed ? `\n${failed} brand-mobile failure(s)` : "\nBrand mobile audit passed");
process.exit(failed ? 1 : 0);
