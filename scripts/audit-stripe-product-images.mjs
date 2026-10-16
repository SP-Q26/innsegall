#!/usr/bin/env node
/**
 * Stripe product tiles · lib ↔ SVG ↔ PNG ↔ hosted URL (Ships.one v3 intensity).
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STRIPE_CATALOG, stripeProductImageUrl } from "../web/lib/stripe-catalog.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stripeDir = join(root, "web/stripe");
const uploadDir = join(root, "docs/stripe/upload-for-stripe");
let failed = 0;

const ok = (msg) => console.log(`ok: ${msg}`);
const bad = (msg) => {
  console.error(`FAIL stripe-png: ${msg}`);
  failed++;
};

const seenImages = new Map();
const expectedPngs = new Set();

for (const [sku, item] of Object.entries(STRIPE_CATALOG)) {
  const img = item.checkout_image;
  if (!img?.startsWith("/stripe/") || !img.endsWith(".png")) {
    bad(`${sku} checkout_image path`);
    continue;
  }
  if (seenImages.has(img)) bad(`duplicate checkout_image ${img} (${seenImages.get(img)} vs ${sku})`);
  else seenImages.set(img, sku);

  const base = img.replace("/stripe/", "");
  expectedPngs.add(base);
  const svgPath = join(stripeDir, base.replace(".png", ".svg"));
  const pngPath = join(stripeDir, base);
  const uploadPath = join(uploadDir, base);

  if (!existsSync(svgPath)) bad(`missing SVG ${svgPath}`);
  else {
    const svg = readFileSync(svgPath, "utf8");
    if (!/viewBox="0 0 512 512"/.test(svg)) bad(`${base} SVG must be 512 viewBox`);
    if (!/radialGradient/i.test(svg)) bad(`${base} SVG missing radial glow (v3 frame)`);
    if (!/stroke-opacity="0\.22"/.test(svg) && !/stroke-opacity=.0\.22/.test(svg)) {
      bad(`${base} SVG missing inner gold frame`);
    }
  }

  if (!existsSync(pngPath)) bad(`missing ${pngPath} — npm run export:stripe-images`);
  else {
    const kb = statSync(pngPath).size / 1024;
    if (kb < 8) bad(`${base} PNG too small (${kb.toFixed(1)} KB)`);
    else ok(`${sku} tile ${kb.toFixed(0)} KB`);
  }

  if (!existsSync(uploadPath)) bad(`missing upload copy ${uploadPath}`);
  else ok(`${sku} upload-for-stripe copy`);

  const url = stripeProductImageUrl(sku);
  if (!url?.startsWith("https://innsegall.com/stripe/")) bad(`${sku} stripeProductImageUrl ${url}`);
  else ok(`${sku} canonical URL`);
}

const pngs = readdirSync(stripeDir).filter((f) => f.endsWith(".png") && !f.startsWith("_"));
if (pngs.length !== expectedPngs.size) bad(`stripe dir PNG count ${pngs.length} vs catalog ${expectedPngs.size}`);
for (const f of pngs) {
  if (!expectedPngs.has(f)) bad(`stray PNG ${f}`);
}

const exportScript = readFileSync(join(root, "scripts/export-stripe-product-images.mjs"), "utf8");
if (!exportScript.includes("512")) bad("export script must rasterize to 512px");

const vercel = readFileSync(join(root, "web/vercel.json"), "utf8");
if (!vercel.includes("/:path*.png")) bad("vercel.json missing PNG cache headers");

console.log(failed ? `\n${failed} stripe product image failure(s)` : "\nStripe product image audit passed");
process.exit(failed ? 1 : 0);
