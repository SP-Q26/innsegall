#!/usr/bin/env node
/**
 * Telemetry → Field Report issue spotlight · operator / cron entry.
 *
 *   npm run publish:issue-spotlights:telemetry
 *   node scripts/publish-issue-spotlight-pipeline.mjs --dry-run
 *   node scripts/publish-issue-spotlight-pipeline.mjs --from-fixtures
 */
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { hasIssueSpotlightXanoEnv } from "./lib/xano-issue-spotlight-url.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tmpEvents = join(root, ".tmp", "issue-spotlight-events.json");

const dryRun = process.argv.includes("--dry-run");
const fromFixtures = process.argv.includes("--from-fixtures");

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

if (fromFixtures) {
  run(`node scripts/publish-issue-spotlights.mjs --from-fixtures${dryRun ? " --dry-run" : ""}`);
} else if (hasIssueSpotlightXanoEnv()) {
  mkdirSync(join(root, ".tmp"), { recursive: true });
  run(`node scripts/fetch-issue-spotlight-events.mjs --out ${tmpEvents}`);
  run(
    `node scripts/publish-issue-spotlights.mjs --from-events ${tmpEvents}${dryRun ? " --dry-run" : ""}`
  );
} else {
  console.log("No Xano export env · falling back to fixtures (paste GET · docs/pastes/innsegall-issue-spotlight-get.xs).");
  run(`node scripts/publish-issue-spotlights.mjs --from-fixtures${dryRun ? " --dry-run" : ""}`);
}

if (!dryRun) {
  console.log("\nNext: npm run flywheel:issue-spotlight (includes sync) · or npm run audit:swarm · commit · deploy");
}
