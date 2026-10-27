#!/usr/bin/env node
/**
 * Daily desk flywheel · EN Field Glass from watch-hub + i18n + voice + gates.
 *
 *   npm run flywheel:daily
 *   npm run flywheel:daily -- --skip-i18n
 *
 * Before first run each day: edit fixtures/watch-hub.json (latest_field_glass + field_glass_desk),
 * bump fixtures/blog-i18n-wave5-growth.json slugs, then flywheel.
 */
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skipI18n = process.argv.includes("--skip-i18n");

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

console.log("flywheel-daily-desk · calm news desk + es/pt mirrors\n");

run("node scripts/sync-watch-hub.mjs");
run("node scripts/sync-blog-field-desk.mjs");
run("node scripts/sync-issue-spotlight-seo.mjs");
run("node scripts/sync-blog-seo.mjs");

if (!skipI18n) {
  console.log("\n── i18n wave 5 (latest slugs in fixtures/blog-i18n-wave5-growth.json) ──");
  run("node scripts/build-blog-i18n-fixtures.mjs --wave5-only --force");
  run("npm run sync:blog-i18n");
} else {
  console.warn("\nwarn: --skip-i18n · cadence may P0 until wave5 es/pt exist\n");
}

run("npm run apply:adoption-voice");
run("node scripts/sync-blog-related-rail.mjs");
run("node scripts/sync-site-chrome.mjs");
run("node scripts/strip-body-mailto.mjs");
run("node scripts/sync-gospel-web.mjs");

console.log("\n── gates ──");
run("node scripts/audit-field-glass-cadence.mjs");
run("npm run audit:seo");
run("node scripts/audit-funnel-conversion.mjs");
run("node scripts/audit-adoption-voice.mjs");

console.log("\nflywheel-daily-desk OK");
console.log("Ship: npm run audit:swarm · commit · push main · npm run smoke:live");
