#!/usr/bin/env node
/** @deprecated · use sync-stripe-tiles.mjs. */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
execSync("node scripts/sync-stripe-tiles.mjs", { cwd: root, stdio: "inherit" });
