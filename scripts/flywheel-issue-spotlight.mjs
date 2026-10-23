#!/usr/bin/env node
/**
 * Issue spotlight flywheel · Xano export → blog posts → SEO + chrome sync.
 *
 *   npm run flywheel:issue-spotlight
 *   npm run flywheel:issue-spotlight -- --dry-run
 */
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { hasIssueSpotlightXanoEnv, resolveIssueSpotlightExportUrl } from "./lib/xano-issue-spotlight-url.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

console.log("flywheel-issue-spotlight · telemetry → blog → sync\n");
if (hasIssueSpotlightXanoEnv()) {
  console.log(`Xano export: ${resolveIssueSpotlightExportUrl()}\n`);
} else {
  console.log("Xano export env not set · pipeline uses fixtures (see docs/pastes/innsegall-issue-spotlight-get.xs)\n");
}

const pipelineFlags = dryRun ? "--dry-run" : "";
run(`node scripts/publish-issue-spotlight-pipeline.mjs ${pipelineFlags}`.trim());

if (!dryRun) {
  run("node scripts/sync-issue-spotlight-seo.mjs");
  run("node scripts/sync-blog-seo.mjs");
  run("node scripts/sync-blog-field-desk.mjs");
  run("node scripts/sync-site-chrome.mjs");
  run("node scripts/sync-gospel-web.mjs");
  run("node scripts/audit-issue-spotlight.mjs");
  console.log("\nReview web/blog diffs · npm run audit:swarm · commit · push main");
}
