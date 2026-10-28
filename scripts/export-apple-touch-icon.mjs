#!/usr/bin/env node
/** @deprecated · use sync-brand-assets.mjs (master logo raster). */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
execSync("node scripts/sync-brand-assets.mjs", { cwd: root, stdio: "inherit" });
