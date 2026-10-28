#!/usr/bin/env node
/** @deprecated · use sync-og-card.mjs (sword mark social card). */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
execSync("node scripts/sync-og-card.mjs", { cwd: root, stdio: "inherit" });
