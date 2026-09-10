#!/usr/bin/env node
/** Competitor / lane gate · boat cargo + positioning surfaces. */
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
const nav = readFileSync(join(web, "innsegall-nav.js"), "utf8");

const boatPlayers = [
  "Bitdefender",
  "Google / Reddit",
  "Geek Squad",
  "Offshore scareware",
  "EtreCheck",
  "VirusTotal",
  "XProtect",
  "Little Snitch",
];
for (const p of boatPlayers) {
  check(`boat lists ${p}`, boat.includes(p));
}

check("boat cargo section", boat.includes("What we carry in the boat"));
check("boat scout-for-you", boat.includes("no scout"));
check("boat platform order", boat.includes("Platform order"));
check("boat endgame", boat.includes("Endgame"));

check("index field echoes", index.includes("read-only triage"));
check("index decision layer", index.includes("decision layer"));

check("llms scout-for-you", llms.includes("Scout-for-you"));
check("llms platform order", llms.includes("Platform order"));
check("llms cargo", llms.includes("What we carry"));

check("nav marketing_ping", nav.includes("marketing_ping"));
check("llms mac lane absorption", llms.includes("Mac lane absorption"));

console.log(failed ? `\n${failed} lane audit failure(s)` : "\nLane audit passed");
process.exit(failed ? 1 : 0);
