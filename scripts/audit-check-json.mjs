#!/usr/bin/env node
/**
 * B1 · innsegall check --json agent pipe · guide + llms + handoff.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 check-json: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const guide = readFileSync(join(root, "web", "guide.html"), "utf8");
const llms = readFileSync(join(root, "web", "llms.txt"), "utf8");
const cli = readFileSync(join(root, "bin", "innsegall.mjs"), "utf8");

check("guide agent-pipe section", guide.includes('id="agent-pipe"'));
check("guide documents check --json", guide.includes("check --json"));
check("guide does not equate bare check with json", !guide.includes("Same as <code>--json</code>"));
check("llms check --json", llms.includes("check --json"));
check("CLI --json flag", cli.includes('--json') && cli.includes("flags.json"));
check("fixture sample", existsSync(join(root, "fixtures", "battle-scout-ai-v1.sample.json")));

if (failed) {
  console.error(`\n${failed} check-json audit failure(s)`);
  process.exit(1);
}
console.log("\nCheck-json audit passed · B1 agent pipe documented");
