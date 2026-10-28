#!/usr/bin/env node
/** Sword-in-stone mark · master JPG → PNG + header img + favicons. */
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_ICON_VER, BRAND_MARK_HREF, FAVICON_32_HREF } from "./site-brand-ver.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL brand: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const master = join(root, "fixtures/brand/innsegall-logo-master.jpg");
const mark = join(web, "icons/innsegall-mark.png");
const apple = join(web, "icons/apple-touch-icon.png");
const fav32 = join(web, "icons/favicon-32.png");
const favSvg = join(web, "favicon.svg");

check("master logo", existsSync(master));
check("mark png", existsSync(mark));
check("apple-touch png", existsSync(apple));
check("favicon-32 png", existsSync(fav32));
check("favicon svg", existsSync(favSvg));

if (existsSync(mark)) {
  const kb = Math.round(statSync(mark).size / 1024);
  check("mark size ≤ 400 KB", kb <= 400, `${kb} KB`);
}
if (existsSync(apple)) {
  check("apple-touch ≥ 10 KB", statSync(apple).size >= 10_000);
}

const index = readFileSync(join(web, "index.html"), "utf8");
check("index brand img", index.includes(BRAND_MARK_HREF));
check("index favicon 32", index.includes(FAVICON_32_HREF));
check("index no legacy beam svg", !index.includes('id="brand-beam"'));

const fav = readFileSync(favSvg, "utf8");
check("favicon svg references mark", fav.includes("innsegall-mark.png"));

const manifest = readFileSync(join(web, "site.webmanifest"), "utf8");
check("webmanifest apple icon", manifest.includes("apple-touch-icon.png"));
check("webmanifest mark", manifest.includes("innsegall-mark.png"));

const ogSvg = readFileSync(join(web, "og/innsegall-card.svg"), "utf8");
check("og card sword art", ogSvg.includes("data:image/png;base64,"));
check("og card no legacy horn", !ogSvg.includes("horn-beam") && !ogSvg.includes("brand-beam"));

const ogPng = join(web, "og/innsegall-card.png");
check("og card png", existsSync(ogPng));
if (existsSync(ogPng)) {
  check("og png size", statSync(ogPng).size > 20_000, `${Math.round(statSync(ogPng).size / 1024)} KB`);
}

check("brand-mark.svg synced", readFileSync(join(web, "brand-mark.svg"), "utf8").includes("innsegall-mark.png"));
check("vercel logo synced", readFileSync(join(web, "innsegall-vercel-logo.svg"), "utf8").includes("innsegall-mark.png"));

const extraStripe = readFileSync(join(web, "stripe/extra.svg"), "utf8");
check("stripe extra sword", extraStripe.includes("data:image/png;base64,"));

let legacySvg = 0;
for (const f of ["index.html", "companion.html", "es/index.html", "pt/index.html"]) {
  const h = readFileSync(join(web, f), "utf8");
  if (h.includes("brand-beam")) legacySvg++;
}
check("no legacy horn in key headers", legacySvg === 0, `${legacySvg} pages`);

const companion = readFileSync(join(web, "companion.webmanifest"), "utf8");
check("companion manifest mark", companion.includes("apple-touch-icon.png"));

console.log(failed ? `\n${failed} brand mark failure(s)` : `\nBrand mark audit passed · ${BRAND_ICON_VER}`);
process.exit(failed ? 1 : 0);
