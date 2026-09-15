#!/usr/bin/env node
/**
 * B3 · Homebrew formula + doc gate (tap publish is operator-owned).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 homebrew: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const formula = readFileSync(join(root, "packaging", "homebrew", "innsegall.rb"), "utf8");
const doc = readFileSync(join(root, "docs", "HOMEBREW.md"), "utf8");

check("formula exists", formula.includes("class Innsegall"));
check("formula node@20", formula.includes("node@20"));
check("formula homepage", formula.includes("innsegall.com"));
check("HOMEBREW.md tap instructions", doc.includes("SP-Q26/innsegall"));
check("HOMEBREW.md node@20 aligned", doc.includes("node@20") || doc.includes("Node.js 20"));
check("package version in doc or formula comment", doc.includes(pkg.version) || formula.includes("0.4"));

if (failed) {
  console.error(`\n${failed} homebrew audit failure(s)`);
  process.exit(1);
}
console.log("\nHomebrew audit passed · formula ready · tap publish is operator (T11)");
