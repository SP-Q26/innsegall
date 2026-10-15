#!/usr/bin/env node
/**
 * OAR layer 3 · apply voice-aligned CTAs, blog corpus, chrome, page SEO (no hand-edits).
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const steps = [
  ["sync:blog-cta", "npm run sync:blog-cta"],
  ["sync:blog-intro-leads", "npm run sync:blog-intro-leads"],
  ["sync:blog-brand", "npm run sync:blog-brand"],
  ["sync:pages-seo", "npm run sync:pages-seo"],
  ["sync-site-chrome", "node scripts/sync-site-chrome.mjs"],
  ["sync-gospel", "npm run sync-gospel"],
];

console.log("innsegall apply-adoption-voice (OAR layer 3)\n");
for (const [label, cmd] of steps) {
  console.log(`── ${label} ──`);
  execSync(cmd, { cwd: root, stdio: "inherit" });
}
console.log("\napply-adoption-voice OK");
