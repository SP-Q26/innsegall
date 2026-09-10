#!/usr/bin/env node
/** Phase 7 · redeem design doc present · no premature API route. */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`P0 redeem-design: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const doc = join(root, "docs", "REDEEM_SEATS.md");
check("REDEEM_SEATS.md", existsSync(doc));
if (existsSync(doc)) {
  const text = readFileSync(doc, "utf8");
  check("doc marks design-only", /design only|no live/i.test(text));
  check("doc mentions seat_token", text.includes("seat_token"));
}

check("no web/api/redeem.js", !existsSync(join(root, "web", "api", "redeem.js")));

console.log(failed ? `\n${failed} redeem-design failure(s)` : "\nRedeem design audit passed");
process.exit(failed ? 1 : 0);
