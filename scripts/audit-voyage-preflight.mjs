#!/usr/bin/env node
/** Voyage · git preflight before scheduled scout + browser open contract. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    failed++;
  } else console.log(`ok: ${name}`);
}

const bin = readFileSync(join(root, "bin/innsegall.mjs"), "utf8");
const selfUpdate = readFileSync(join(root, "src/self-update.mjs"), "utf8");
const plist = readFileSync(join(root, "src/voyage-schedule.mjs"), "utf8");
const render = readFileSync(join(root, "src/render.mjs"), "utf8");

check("preflightScoutUpdate exported", selfUpdate.includes("export function preflightScoutUpdate"));
check("cmdVoyage calls preflight", bin.includes("preflightScoutUpdate") && bin.includes("voyage: true"));
check("scheduled voyage opens browser", bin.includes('execSync(`open "${html}"`'));
check("voyage plist --scheduled", plist.includes("--scheduled"));
check("voyage body data attr", render.includes('data-innsegall-voyage="1"'));
check("voyage banner companion link", render.includes("companion inbox"));

console.log(failed ? `\n${failed} voyage-preflight failure(s)` : "\nVoyage preflight audit passed");
process.exit(failed ? 1 : 0);
