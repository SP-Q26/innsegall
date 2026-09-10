#!/usr/bin/env node
/**
 * Meta brand lane · orchestrates lexicon, Claymore, operator voice, lane absorption, landing unity.
 */
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const childAudits = [
  "audit-brand-ban.mjs",
  "audit-claymore.mjs",
  "audit-operator-voice.mjs",
  "audit-lane.mjs",
  "audit-competitor-absorption.mjs",
  "audit-landing-unity.mjs",
];

let failed = 0;
console.log("── Brand stack (orchestrated) ──\n");

for (const script of childAudits) {
  console.log(`▸ ${script}`);
  try {
    execSync(`node scripts/${script}`, { cwd: root, stdio: "inherit" });
  } catch {
    failed++;
    console.error(`FAIL · ${script}\n`);
  }
}

console.log(failed ? `\n${failed} brand-stack failure(s)` : "\nBrand stack audit passed");
process.exit(failed ? 1 : 0);
