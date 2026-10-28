#!/usr/bin/env node
/**
 * Social preview card · sword mark + copy · SVG + 1200×630 PNG.
 */
import { readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BRAND_ICON_VER } from "./site-brand-ver.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const markPath = join(root, "web/icons/innsegall-mark.png");
const svgPath = join(root, "web/og/innsegall-card.svg");
const pngPath = join(root, "web/og/innsegall-card.png");

if (!existsSync(markPath)) {
  console.error("Missing web/icons/innsegall-mark.png · run sync-brand-assets first");
  process.exit(1);
}

const b64 = readFileSync(markPath).toString("base64");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="Innsegall post-scare Mac triage">
  <defs>
    <linearGradient id="fjord" x1="600" y1="0" x2="600" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0B1D2E"/>
      <stop offset="0.55" stop-color="#071018"/>
      <stop offset="1" stop-color="#081521"/>
    </linearGradient>
    <linearGradient id="gold-pill" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#F8D574"/>
      <stop offset="1" stop-color="#D4A84A"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#fjord)"/>
  <rect x="48" y="48" width="1104" height="534" rx="26" fill="none" stroke="#F4C95D" stroke-opacity="0.18" stroke-width="2"/>
  <image x="460" y="36" width="280" height="280" preserveAspectRatio="xMidYMid slice" href="data:image/png;base64,${b64}" xlink:href="data:image/png;base64,${b64}"/>
  <line x1="420" y1="328" x2="520" y2="328" stroke="#F4C95D" stroke-opacity="0.2" stroke-width="1"/>
  <line x1="680" y1="328" x2="780" y2="328" stroke="#F4C95D" stroke-opacity="0.2" stroke-width="1"/>
  <text x="600" y="378" text-anchor="middle" fill="#F4E8C8" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="600" letter-spacing="0.06em">Innsegall</text>
  <text x="600" y="432" text-anchor="middle" fill="#A8D8FF" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="32" letter-spacing="0.02em">Know you&apos;re okay</text>
  <text x="600" y="472" text-anchor="middle" fill="#9EB4CC" font-family="sans-serif" font-size="24">Post-scare Mac triage</text>
  <text x="600" y="508" text-anchor="middle" fill="#7A8FA8" font-family="sans-serif" font-size="20">Battle Scout receipts · local scout · not antivirus</text>
  <rect x="390" y="548" width="420" height="50" rx="25" fill="url(#gold-pill)"/>
  <text x="600" y="580" text-anchor="middle" fill="#0B1D2E" font-family="sans-serif" font-size="24" font-weight="600" letter-spacing="0.06em">innsegall.com</text>
</svg>
`;

writeFileSync(svgPath, svg, "utf8");

let resvg;
try {
  resvg = await import("@resvg/resvg-js");
} catch {
  console.error("Missing @resvg/resvg-js");
  process.exit(1);
}

const renderer = new resvg.Resvg(svg, {
  fitTo: { mode: "width", value: 1200 },
  font: { loadSystemFonts: true, defaultFontFamily: "Arial" },
});
writeFileSync(pngPath, renderer.render().asPng());
const kb = Math.round(statSync(pngPath).size / 1024);
console.log(`sync-og-card OK · ${BRAND_ICON_VER} · PNG ${kb} KB`);
