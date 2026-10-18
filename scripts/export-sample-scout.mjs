#!/usr/bin/env node
/**
 * Export public demo Battle Scout HTML for /samples/battle-scout-demo.
 * Always uses neutral demo home paths (never the operator laptop homedir).
 * prep-deploy runs this before every deploy.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDemoCard } from "../src/demo-card.mjs";
import { renderHtml } from "../src/render.mjs";
import { validateCard } from "../src/validate.mjs";
import { fileHrefLooksLikePii } from "./lib/audit-link-routes.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "web", "samples");
const outPath = join(outDir, "battle-scout-demo.html");

process.env.INNSEGALL_DEMO_HOME = "/Users/You";
process.env.INNSEGALL_SPQ_ROOT = "/Users/You/Projects/innsegall";

const card = buildDemoCard();
const errors = validateCard(card);
if (errors.length) {
  console.error("demo card validation failed:", errors.join("; "));
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, renderHtml(card, { demoSample: true, embedNavTelemetry: true }), "utf8");

const html = readFileSync(outPath, "utf8");
const badFileHrefs = [];
for (const m of html.matchAll(/href="(file:[^"]+)"/g)) {
  if (fileHrefLooksLikePii(m[1])) badFileHrefs.push(m[1]);
}
if (badFileHrefs.length) {
  console.error("demo export contains non-neutral file:// home paths:");
  for (const h of badFileHrefs) console.error(`  ${h}`);
  console.error("Set INNSEGALL_DEMO_HOME=/Users/You (see export-sample-scout.mjs).");
  process.exit(1);
}

console.log(`Wrote ${outPath} · demo home ${process.env.INNSEGALL_DEMO_HOME}`);
