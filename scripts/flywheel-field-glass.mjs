#!/usr/bin/env node
/**
 * Field Glass cadence flywheel · sync watch hub + field desk · gate freshness.
 *
 *   npm run flywheel:field-glass
 *
 * After a new desk: edit fixtures/watch-hub.json + web/blog/field-glass-*.md,
 * add slug to blog-i18n-wave5-growth.json (or next wave), then re-run.
 */
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

console.log("flywheel-field-glass · sync + cadence audit\n");
run("node scripts/sync-watch-hub.mjs");
run("node scripts/sync-blog-field-desk.mjs");
run("node scripts/sync-issue-spotlight-seo.mjs");
run("node scripts/sync-blog-seo.mjs");
run("node scripts/audit-field-glass-cadence.mjs");

console.log("\nNext (new EN desk slug):");
console.log("  1. fixtures/blog-i18n-wave5-growth.json · npm run build:blog-i18n-wave5");
console.log("  2. npm run sync:blog-i18n && npm run sync:site-chrome");
console.log("  3. npm run audit:swarm · commit · push main");
