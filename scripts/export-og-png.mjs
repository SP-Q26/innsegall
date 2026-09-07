#!/usr/bin/env node
/**
 * Rasterize web/og/innsegall-card.svg → innsegall-card.png (1200×630).
 */
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "web/og/innsegall-card.svg");
const pngPath = join(root, "web/og/innsegall-card.png");

let resvg;
try {
  resvg = await import("@resvg/resvg-js");
} catch {
  console.error("Missing @resvg/resvg-js · run: npm install");
  process.exit(1);
}

const svg = readFileSync(svgPath, "utf8");
const renderer = new resvg.Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
});
const pngData = renderer.render();
const pngBuffer = pngData.asPng();
writeFileSync(pngPath, pngBuffer);

const kb = Math.round(statSync(pngPath).size / 1024);
console.log(`export-og-png OK · ${pngPath} · ${kb} KB`);
