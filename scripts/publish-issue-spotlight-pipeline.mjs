#!/usr/bin/env node
/**
 * Telemetry → Field Report issue spotlight · operator / cron entry.
 *
 *   npm run publish:issue-spotlights:telemetry
 *   node scripts/publish-issue-spotlight-pipeline.mjs --dry-run
 *   node scripts/publish-issue-spotlight-pipeline.mjs --from-fixtures
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmpEvents = join(root, ".tmp", "issue-spotlight-events.json");

const dryRun = process.argv.includes("--dry-run");
const fromFixtures = process.argv.includes("--from-fixtures");

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

if (fromFixtures) {
  run(`node scripts/publish-issue-spotlights.mjs --from-fixtures${dryRun ? " --dry-run" : ""}`);
} else if (process.env.XANO_ISSUE_SPOTLIGHT_URL && process.env.XANO_API_KEY) {
  mkdirSync(join(root, ".tmp"), { recursive: true });
  run(`node scripts/fetch-issue-spotlight-events.mjs --out ${tmpEvents}`);
  run(
    `node scripts/publish-issue-spotlights.mjs --from-events ${tmpEvents}${dryRun ? " --dry-run" : ""}`
  );
} else {
  console.log("No Xano env · falling back to fixtures (set XANO_* for live telemetry).");
  run(`node scripts/publish-issue-spotlights.mjs --from-fixtures${dryRun ? " --dry-run" : ""}`);
}

if (!dryRun) {
  console.log("\nNext: node scripts/sync-site-chrome.mjs && npm run audit:swarm · commit · deploy");
}
