#!/usr/bin/env node
/** Internal doc gate · KnockKnock · BlockBlock · LuLu (Objective-See). */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { INNSEGALL_GOSPEL } from "../src/gospel.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const auditPath = join(root, "docs/competitors/AUDIT_OBJECTIVE_SEE_KNOCKKNOCK_BLOCKBLOCK_LULU.md");
const readmePath = join(root, "docs/competitors/README.md");

const OFFICIAL = [
  "https://objective-see.org/products/knockknock.html",
  "https://objective-see.org/products/blockblock.html",
  "https://objective-see.org/products/lulu.html",
];

let failed = 0;
function check(name, ok) {
  if (!ok) {
    console.error(`FAIL objective-see audit: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

check("audit doc exists", existsSync(auditPath));
check("competitors readme exists", existsSync(readmePath));

const text = existsSync(auditPath) ? readFileSync(auditPath, "utf8") : "";

for (const url of OFFICIAL) {
  check(`links ${url}`, text.includes(url));
}

for (const tool of ["KnockKnock", "BlockBlock", "LuLu"]) {
  check(`section ## ${tool}`, text.includes(`## ${tool}`));
}

const required = [
  "Post-scare Macintosh triage",
  "launch_ghosts",
  "login_items",
  "network-monitor-vs-post-scare-triage",
  "Client-safe messaging",
  "Do not",
];
for (const p of required) {
  check(`mentions ${p}`, text.includes(p));
}

const tools = INNSEGALL_GOSPEL.ai_triage_onboarding?.complementary_tools || [];
check("gospel complementary_tools", tools.length === 3);
check("gospel knockknock url", tools.some((t) => t.id === "knockknock" && t.url.includes("knockknock.html")));

const llms = readFileSync(join(root, "web", "llms.txt"), "utf8");
check("llms complementary section", llms.includes("## Complementary tools"));

console.log(failed ? `\n${failed} objective-see audit doc failure(s)` : "\nObjective-See competitor audit doc passed");
process.exit(failed ? 1 : 0);
