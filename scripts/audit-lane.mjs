#!/usr/bin/env node
/** Client-facing lane gate · /boat + public gospel surfaces. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let failed = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`FAIL lane: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const boat = readFileSync(join(web, "boat.html"), "utf8");
const index = readFileSync(join(web, "index.html"), "utf8");
const llms = readFileSync(join(web, "llms.txt"), "utf8");
const gospel = readFileSync(join(web, ".well-known", "innsegall-gospel.json"), "utf8");
const nav = readFileSync(join(web, "innsegall-nav.js"), "utf8");

check("boat client title", boat.includes("Is Innsegall for you?"));
check("boat is / is not", boat.includes("Innsegall is not") && boat.includes("Innsegall is</h2>"));
check("boat no war table", !boat.includes("Their weakness") && !boat.includes("Competitor map"));
check("boat no endgame", !/Endgame/i.test(boat));

check("public gospel lane_guide", gospel.includes('"lane_guide"'));
check("public gospel no competitor_boat", !gospel.includes("competitor_boat"));

check("llms client lane section", llms.includes("Our lane (client-facing)"));
check("llms no platform order section", !llms.includes("## Platform order"));
check("llms no mac lane absorption", !llms.includes("Mac lane absorption"));

check("index read-only triage", index.includes("read-only"));
check("index lane CTA", index.includes('href="/boat"') && !index.includes("Competitor map"));

check("nav marketing_ping", nav.includes("marketing_ping"));

console.log(failed ? `\n${failed} lane audit failure(s)` : "\nLane audit passed");
process.exit(failed ? 1 : 0);
