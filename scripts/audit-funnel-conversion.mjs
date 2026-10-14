#!/usr/bin/env node
/**
 * Visit → install funnel · sample-before-install · telemetry wiring.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { INSTALL_ASSETS } from "../web/lib/telemetry-browser.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok) {
  if (ok) console.log(`ok: ${name}`);
  else {
    console.error(`FAIL: ${name}`);
    failed++;
  }
}

const alphaFull = readFileSync(join(web, "alpha.html"), "utf8");
const alpha = alphaFull.includes("<main id=\"main\">")
  ? alphaFull.split("<main id=\"main\">")[1] || alphaFull
  : alphaFull;
const indexFull = readFileSync(join(web, "index.html"), "utf8");
const index = indexFull.includes("<main id=\"main\">")
  ? indexFull.split("<main id=\"main\">")[1] || indexFull
  : indexFull;
const nav = readFileSync(join(web, "innsegall-nav.js"), "utf8");
const variants = JSON.parse(
  readFileSync(join(root, "fixtures", "blog-cta-variants.json"), "utf8")
);

check("alpha sample before gatekeeper", alpha.indexOf("battle-scout-sample") < alpha.indexOf("gatekeeper"));
check("alpha hero sample CTA", /#battle-scout-sample|battle-scout-demo/.test(alpha.slice(0, alpha.indexOf("gatekeeper"))));
check("alpha lay of the land headline", /lay of the land/i.test(alpha));
check(
  "index sample link in hero",
  /samples\/battle-scout-demo/.test(index.slice(0, index.indexOf("problem-title")))
);
check("nav wireInstallIntent", nav.includes("wireInstallIntentLinks"));
check("nav copy_terminal intent", nav.includes('"copy_terminal"') || nav.includes("'copy_terminal'"));
check("nav sample_report intent", nav.includes("sample_report"));

for (const asset of INSTALL_ASSETS) {
  check(`telemetry install asset ${asset}`, readFileSync(join(web, "api/telemetry.js"), "utf8").includes(`"${asset}"`));
}

const popupSlug = "chrome-fake-virus-popup-mac";
const popupHtml = readFileSync(join(web, "blog", `${popupSlug}.html`), "utf8");
check(
  "browser-first blog CTA has sample",
  variants.browser_first_slugs.includes(popupSlug) && popupHtml.includes("samples/battle-scout-demo")
);

console.log(failed ? `\n${failed} funnel conversion failure(s)` : "\nFunnel conversion audit passed");
process.exit(failed ? 1 : 0);
