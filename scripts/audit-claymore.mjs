#!/usr/bin/env node
/**
 * Claymore punctuation gate · no em dash (—) in customer-facing copy.
 * Canon: constants.mjs CLAYMORE = " · "
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const EM_DASH = "\u2014";

const SCAN_DIRS = ["src", "web", "bin", "docs"];
const EXT = /\.(mjs|js|html|md|txt|sh)$/i;
const SKIP_DIRS = new Set(["node_modules", ".git", ".smoke"]);

/** Ops table placeholders · not prose */
const LINE_ALLOW = [
  /^\|[^|]*\| · \|/, // markdown empty table cell
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
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (!line.includes(EM_DASH)) return;
      if (LINE_ALLOW.some((re) => re.test(line.trim()))) return;
      console.error(`em dash: ${rel}:${i + 1}: ${line.trim().slice(0, 100)}`);
      hits++;
    });
  }
}

if (hits) {
  console.error(`\n${hits} em dash(es) · replace with claymore · ( · )`);
  process.exit(1);
}
console.log("ok: claymore audit (no em dash in customer copy)");
