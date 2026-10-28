#!/usr/bin/env node
/**
 * Master logo (fixtures/brand) → PNG marks, apple-touch, favicon.svg.
 * Requires macOS sips or run on CI with pre-generated PNGs committed.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_ICON_VER } from "./site-brand-ver.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const master = join(root, "fixtures/brand/innsegall-logo-master.jpg");
const iconsDir = join(root, "web/icons");
const mark512 = join(iconsDir, "innsegall-mark.png");
const apple = join(iconsDir, "apple-touch-icon.png");
const fav32 = join(iconsDir, "favicon-32.png");
const favSvg = join(root, "web/favicon.svg");

if (!existsSync(master)) {
  console.error("Missing fixtures/brand/innsegall-logo-master.jpg");
  process.exit(1);
}

mkdirSync(iconsDir, { recursive: true });

function sips(args) {
  execSync(`sips ${args}`, { stdio: "inherit" });
}

sips(`-s format png -z 384 384 "${master}" --out "${mark512}"`);
sips(`-z 180 180 "${mark512}" --out "${apple}"`);
sips(`-z 32 32 "${mark512}" --out "${fav32}"`);

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 384 384" role="img" aria-label="Innsegall">
  <title>Innsegall</title>
  <image width="384" height="384" preserveAspectRatio="xMidYMid slice" href="/icons/innsegall-mark.png?v=${BRAND_ICON_VER}" xlink:href="/icons/innsegall-mark.png?v=${BRAND_ICON_VER}"/>
</svg>
`;
writeFileSync(favSvg, faviconSvg, "utf8");

const stamp = readFileSync(master).length;
console.log(
  `sync-brand-assets OK · ver ${BRAND_ICON_VER} · master ${Math.round(stamp / 1024)} KB · mark/apple/favicon-32/favicon.svg`
);
