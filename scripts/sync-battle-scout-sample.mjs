#!/usr/bin/env node
/** Copy public AI paste fixture to web/samples for live URL + iOS import tests. */
import { copyFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "fixtures", "battle-scout-ai-v1.sample.json");
const outDir = join(root, "web", "samples");
const dest = join(outDir, "battle-scout-ai-v1.sample.json");

mkdirSync(outDir, { recursive: true });
copyFileSync(src, dest);
console.log(`synced ${dest}`);
