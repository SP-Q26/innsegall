#!/usr/bin/env node
/**
 * Pre-deploy gate · gospel sync + launch audit.
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

console.log("innsegall prep-deploy");
execSync("node scripts/sync-gospel-web.mjs", { cwd: root, stdio: "inherit" });
execSync("node scripts/export-sample-scout.mjs", { cwd: root, stdio: "inherit" });
execSync("node scripts/export-og-png.mjs", { cwd: root, stdio: "inherit" });
execSync("node scripts/sync-blog-brand.mjs", { cwd: root, stdio: "inherit" });
execSync("node scripts/sync-site-chrome.mjs", { cwd: root, stdio: "inherit" });
execSync("node scripts/audit-swarm.mjs", { cwd: root, stdio: "inherit" });
console.log("prep-deploy OK");
