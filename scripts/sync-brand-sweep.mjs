#!/usr/bin/env node
/**
 * OAR brand sweep · adoption voice apply + social/OG touch + blog boosts related (optional light).
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

console.log("innsegall sync-brand-sweep\n");
execSync("node scripts/apply-adoption-voice.mjs", { cwd: root, stdio: "inherit" });
try {
  execSync("node scripts/export-og-png.mjs", { cwd: root, stdio: "inherit" });
} catch {
  console.warn("warn: export-og-png skipped (optional)");
}
console.log("\nsync-brand-sweep OK");
