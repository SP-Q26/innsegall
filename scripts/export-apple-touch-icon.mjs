#!/usr/bin/env node
/** Rasterize favicon.svg → 180×180 PNG for apple-touch-icon and PWA. */
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "web/favicon.svg");
const outDir = join(root, "web/icons");
const pngPath = join(outDir, "apple-touch-icon.png");

let resvg;
try {
  resvg = await import("@resvg/resvg-js");
} catch {
  console.error("Missing @resvg/resvg-js · run: npm install");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const svg = readFileSync(svgPath, "utf8");
const renderer = new resvg.Resvg(svg, {
  fitTo: { mode: "width", value: 180 },
});
const pngBuffer = renderer.render().asPng();
writeFileSync(pngPath, pngBuffer);
const kb = Math.round(statSync(pngPath).size / 1024);
console.log(`export-apple-touch-icon OK · ${pngPath} · ${kb} KB`);
