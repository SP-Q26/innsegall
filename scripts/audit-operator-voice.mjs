#!/usr/bin/env node
/** Phase 8 · operator voice on marketing HTML (not legal boilerplate). */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let failed = 0;

const MARKETING = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".html")) MARKETING.push(p);
  }
}
walk(web);
MARKETING.push(join(web, "samples/battle-scout-demo.html"));

const FORBIDDEN = [
  { id: "most_households", pattern: /Most households have/i },
  { id: "recruit_household", pattern: /[Rr]ecruit your household/i },
  { id: "household_seats_meta", pattern: /5 household seats/i },
  { id: "shield_household", pattern: /Macintosh household from scareware/i },
  { id: "whole_household", pattern: /whole household/i },
  { id: "household_scouts", pattern: /unlimited household scouts/i },
  { id: "household_needs", pattern: /when the household needs/i },
  { id: "household_it", pattern: /family IT without fear/i },
  { id: "caretaker", pattern: /\bcaretaker\b/i },
];

function visibleHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 operator-voice: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

for (const file of MARKETING) {
  const rel = file.replace(web + "/", "");
  if (rel === "tos.html" || rel === "privacy.html") continue;
  if (rel.startsWith("samples/")) continue;

  const visible = visibleHtml(readFileSync(file, "utf8"));
  for (const ban of FORBIDDEN) {
    if (ban.pattern.test(visible)) {
      check(`${rel} no ${ban.id}`, false);
    }
  }
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
check(
  "docs PARTNER_ESCALATION",
  readFileSync(join(root, "docs/PARTNER_ESCALATION.md"), "utf8").includes("Sound the Horn")
);
check(
  "docs WARRIORS_FIELD_REPORT",
  readFileSync(join(root, "docs/WARRIORS_FIELD_REPORT.md"), "utf8").includes("warrior_")
);

console.log(failed ? `\n${failed} operator-voice failure(s)` : "\nOperator voice audit passed");
process.exit(failed ? 1 : 0);
