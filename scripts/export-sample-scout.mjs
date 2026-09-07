#!/usr/bin/env node
/**
 * Export public demo Battle Scout HTML for /samples/battle-scout-demo
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDemoCard } from "../src/demo-card.mjs";
import { renderHtml } from "../src/render.mjs";
import { validateCard } from "../src/validate.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "web", "samples");
const outPath = join(outDir, "battle-scout-demo.html");

const card = buildDemoCard();
const errors = validateCard(card);
if (errors.length) {
  console.error("demo card validation failed:", errors.join("; "));
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, renderHtml(card), "utf8");
console.log(`Wrote ${outPath}`);
