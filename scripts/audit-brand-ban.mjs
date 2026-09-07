#!/usr/bin/env node
/**
 * Brand ban list · P0 on retired terms in customer-facing copy.
 * Canon: docs/BRAND_BIBLE.md · docs/BRAND_AUDIT.md
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set(["node_modules", ".git", ".smoke"]);
const SCAN_DIRS = ["web", "src", "bin"];
const EXT = /\.(html|mjs|js|txt|json|sh)$/i;

/** Retired terms · customer copy only (docs/ excluded). */
export const BRAND_BAN = [
  { id: "help_email", pattern: /help@innsegall\.com/i, note: "use hello@innsegall.com" },
  { id: "xx_codename", pattern: /\bXX\s+(for\s+Mac|app)\b/i, note: "internal codename leak" },
  { id: "incident_card", pattern: /\bIncident Card\b/, note: "retired · Battle Scout" },
  { id: "run_the_check", pattern: /Run the check/i, note: "retired CTA · Send the scout" },
  { id: "free_scouts_mo", pattern: /2 free scouts\/mo/i, note: "use 2 Voyages · 1st & 15th" },
  { id: "house_call", pattern: /\bHouse Call\b/, note: "retired product name" },
];

/** Files/lines allowed to mention banned terms (deprecation comments, audit itself). */
const FILE_ALLOW = new Set([
  "scripts/audit-brand-ban.mjs",
  "scripts/self-test.mjs",
  "src/constants.mjs",
]);

const LINE_ALLOW = [
  /ARTIFACT_LEGACY/,
  /retired/i,
  /deprecated/i,
  /@deprecated/,
  /Avoid.*Incident Card/,
  /not.*Run the check/i,
  /help@innsegall/,
  /XX for Mac/,
  /2 free scouts/,
  /House Call/,
  /BRAND_BAN/,
  /pattern:/,
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walk(path, out);
    else if (EXT.test(name)) out.push(path);
  }
  return out;
}

let hits = 0;

for (const sub of SCAN_DIRS) {
  const base = join(root, sub);
  for (const file of walk(base)) {
    const rel = relative(root, file);
    if (FILE_ALLOW.has(rel)) continue;
    if (rel.startsWith("web/blog/") && rel.endsWith(".md")) continue;

    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (LINE_ALLOW.some((re) => re.test(line))) return;
      for (const ban of BRAND_BAN) {
        if (!ban.pattern.test(line)) continue;
        console.error(`brand ban [${ban.id}]: ${rel}:${i + 1}: ${line.trim().slice(0, 100)}`);
        hits++;
      }
    });
  }
}

const pkgPath = join(root, "package.json");
const pkg = readFileSync(pkgPath, "utf8");
for (const ban of BRAND_BAN) {
  if (ban.pattern.test(pkg)) {
    console.error(`brand ban [${ban.id}]: package.json description`);
    hits++;
  }
}

if (hits) {
  console.error(`\n${hits} brand ban hit(s) · fix customer copy`);
  process.exit(1);
}
console.log("ok: brand ban list (customer copy)");
