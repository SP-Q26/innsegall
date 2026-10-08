#!/usr/bin/env node
/**
 * Customer-facing copy gate · no internal roadmaps, operator jargon, or repo doc links in visible HTML.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

const ALLOW_GITHUB_ROOT = new Set(["stability.html"]);

const RULES = [
  { id: "github internal doc link", re: /github\.com\/SP-Q26\/innsegall\/blob\/main\/docs\//i },
  { id: "github HOMEBREW doc", re: /HOMEBREW\.md/i },
  { id: "github APPLE_DEVELOPER doc", re: /APPLE_DEVELOPER_ID/i },
  { id: "github MSP outreach doc", re: /MSP_OUTREACH_BRIEF/i },
  { id: "operator desk phrase", re: /operator desk/i },
  { id: "float mode", re: /\bfloat mode\b/i },
  { id: "PRE_L5", re: /\bPRE_L5\b/ },
  { id: "Phase 7 roadmap", re: /\bPhase 7\b/ },
  { id: "operator flip", re: /operator flip/i },
  { id: "src/check-catalog path", re: /src\/check-catalog\.mjs/ },
  { id: "packaging/homebrew path", re: /packaging\/homebrew/ },
  { id: "TestFlight shell", re: /TestFlight shell/i },
];

function visibleHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function check(rel, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL customer-copy: ${rel}${detail ? ` · ${detail}` : ""}`);
    failed++;
  }
}

function walkHtml(dir, base = web) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, base);
    else if (name.endsWith(".html")) {
      const rel = relative(web, p).replace(/\\/g, "/");
      if (rel.startsWith("samples/")) continue;
      const body = visibleHtml(readFileSync(p, "utf8"));
      for (const rule of RULES) {
        if (rule.id.startsWith("github") && ALLOW_GITHUB_ROOT.has(rel)) continue;
        if (rule.re.test(body)) check(rel, false, rule.id);
      }
    }
  }
}

for (const name of ["llms.txt", "innsegall-ai-bus.json"]) {
  const text = readFileSync(join(web, name), "utf8");
  for (const rule of RULES) {
    if (rule.re.test(text)) check(name, false, rule.id);
  }
}

walkHtml(web);

console.log(failed ? `\n${failed} customer-copy failure(s)` : "\nCustomer copy audit passed");
process.exit(failed ? 1 : 0);
