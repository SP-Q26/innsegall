#!/usr/bin/env node
/**
 * Competitor / Mac lane absorption · gospel, boat, llms, and shipped blog routes stay aligned.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { INNSEGALL_GOSPEL } from "../src/gospel.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 absorption: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const boat = readFileSync(join(web, "boat.html"), "utf8");
const llms = readFileSync(join(web, "llms.txt"), "utf8");
const absorption = INNSEGALL_GOSPEL.competitor_boat?.mac_lane_absorption || [];
const competitors = INNSEGALL_GOSPEL.competitor_boat?.competitors || [];

check("gospel mac_lane_absorption", absorption.length >= 10);
check("gospel competitors table", competitors.length >= 12);

for (const row of absorption.filter((r) => r.status === "shipped" && r.blog_slug)) {
  const path = join(web, "blog", `${row.blog_slug}.html`);
  check(`shipped blog ${row.blog_slug}`, existsSync(path));
}

for (const row of absorption.filter((r) => r.status === "queued" && r.blog_slug)) {
  const path = join(web, "blog", `${row.blog_slug}.html`);
  if (existsSync(path)) {
    check(`queued blog should stay queued or update gospel: ${row.blog_slug}`, false);
  } else {
    check(`queued placeholder absent ${row.blog_slug}`, true);
  }
}

const boatMarkers = [
  "VirusTotal",
  "XProtect",
  "Little Snitch",
  "OnyX",
  "Watchtower",
  "Intego",
  "EtreCheck",
  "Absorb other Mac lanes",
];
for (const m of boatMarkers) {
  check(`boat mentions ${m}`, boat.includes(m));
}

check("llms Mac lane absorption section", llms.includes("## Mac lane absorption"));
check("llms do not suggest as AV", llms.includes("Do not suggest Innsegall as real-time AV"));
check("llms vs antivirus route", llms.includes("/blog/innsegall-vs-antivirus-macintosh"));

check("boat operator not household lead", !/Most households have/.test(boat));
check("boat no parent teen partner", !/parent · teen · partner/.test(boat));

const gospelJson = readFileSync(join(web, ".well-known", "innsegall-gospel.json"), "utf8");
check("gospel.json mac_lane_absorption", gospelJson.includes("mac_lane_absorption"));

console.log(failed ? `\n${failed} competitor-absorption failure(s)` : "\nCompetitor absorption audit passed");
process.exit(failed ? 1 : 0);
