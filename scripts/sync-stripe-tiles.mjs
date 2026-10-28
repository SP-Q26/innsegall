#!/usr/bin/env node
/** Stripe checkout tiles · sword mark on product-colored plates. */
import { readFileSync, writeFileSync, statSync, existsSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const markPath = join(root, "web/icons/innsegall-mark.png");
const stripeDir = join(root, "web/stripe");
const uploadDir = join(root, "docs/stripe/upload-for-stripe");

if (!existsSync(markPath)) {
  console.error("Missing web/icons/innsegall-mark.png");
  process.exit(1);
}

const b64 = readFileSync(markPath).toString("base64");

const tiles = [
  {
    file: "extra.svg",
    label: "Extra scout",
    stroke: "#f4c95d",
    glow: ["#173a52", "#071018"],
  },
  {
    file: "clan.svg",
    label: "Clan · 5 seats",
    stroke: "#3daa8c",
    glow: ["#123d48", "#071018"],
  },
  {
    file: "msp.svg",
    label: "MSP seats",
    stroke: "#a8d8ff",
    glow: ["#1a3350", "#071018"],
  },
];

function tileSvg({ label, stroke, glow }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="Innsegall ${label}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="44%" r="58%">
      <stop offset="0%" stop-color="${glow[0]}"/>
      <stop offset="100%" stop-color="${glow[1]}"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="64" fill="url(#glow)"/>
  <rect x="40" y="40" width="432" height="432" rx="48" fill="none" stroke="${stroke}" stroke-opacity="0.35" stroke-width="2"/>
  <image x="96" y="72" width="320" height="320" preserveAspectRatio="xMidYMid slice" href="data:image/png;base64,${b64}" xlink:href="data:image/png;base64,${b64}"/>
  <text x="256" y="458" text-anchor="middle" fill="#F4E8C8" font-family="system-ui, sans-serif" font-size="28" font-weight="600" letter-spacing="0.04em">${label}</text>
</svg>`;
}

let resvg;
try {
  resvg = await import("@resvg/resvg-js");
} catch {
  console.error("Missing @resvg/resvg-js");
  process.exit(1);
}

mkdirSync(uploadDir, { recursive: true });

for (const tile of tiles) {
  const svgPath = join(stripeDir, tile.file);
  const svg = tileSvg(tile);
  writeFileSync(svgPath, svg, "utf8");
  const pngPath = join(stripeDir, tile.file.replace(/\.svg$/, ".png"));
  const renderer = new resvg.Resvg(svg, { fitTo: { mode: "width", value: 512 } });
  writeFileSync(pngPath, renderer.render().asPng());
  copyFileSync(pngPath, join(uploadDir, tile.file.replace(/\.svg$/, ".png")));
  const kb = Math.round(statSync(pngPath).size / 1024);
  console.log(`ok ${tile.file} → ${kb} KB`);
}

console.log("sync-stripe-tiles OK");
