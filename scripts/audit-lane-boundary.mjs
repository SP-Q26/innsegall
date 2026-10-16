#!/usr/bin/env node
/**
 * Lane boundary · no SPQ parent imports · internal docs stay out of web/.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL lane-boundary: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(mjs|js|html|json|txt)$/.test(name)) out.push(p);
  }
  return out;
}

const INTERNAL_MARKERS = [
  { id: "ISLES_PORTFOLIO path", re: /ISLES_PORTFOLIO\.md/ },
  { id: "competitor_boat key", re: /"competitor_boat"/ },
  { id: "mac_lane_absorption", re: /mac_lane_absorption/ },
  { id: "platform_order key", re: /"platform_order"/ },
];

for (const file of walk(web)) {
  const rel = file.replace(web + "/", "");
  const text = readFileSync(file, "utf8");
  if (/\.\.\/\.\.\/\.\.\/\.\./.test(text)) {
    check(`no parent-repo import · ${rel}`, false);
  }
  for (const m of INTERNAL_MARKERS) {
    if (m.re.test(text)) {
      check(`web clean · ${rel} · no ${m.id}`, false);
    }
  }
}

const internalOnly = [
  "docs/ISLES_PORTFOLIO.md",
  "docs/NORTH_STAR_AUDIT.md",
  "docs/WAKE_BELOW_DECK.md",
];
for (const doc of internalOnly) {
  const abs = join(root, doc);
  check(`internal doc exists · ${doc}`, existsSync(abs));
  const base = doc.split("/").pop();
  for (const file of walk(web)) {
    if (file.endsWith(`/${base}`)) {
      check(`internal doc not deployed · ${base}`, false, file.replace(web + "/", ""));
    }
  }
}

check(
  "package homepage",
  readFileSync(join(root, "package.json"), "utf8").includes("https://innsegall.com")
);

if (failed) {
  console.error(`\n${failed} lane-boundary failure(s)`);
  process.exit(1);
}
console.log("\nLane boundary audit passed");
