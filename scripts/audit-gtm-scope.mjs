#!/usr/bin/env node
/**
 * Operator GTM scope · doc exists · gospel/llms welded · cross-links · no fear hooks in canon doc.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "docs");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 gtm-scope: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const gtmPath = join(docs, "OPERATOR_GTM_SCOPE.md");
check("OPERATOR_GTM_SCOPE.md", existsSync(gtmPath));
const gtm = existsSync(gtmPath) ? readFileSync(gtmPath, "utf8") : "";

check("gtm gate:launch runbook", gtm.includes("npm run gate:launch"));
check("gtm funnel chain", gtm.includes("marketing_ping") && gtm.includes("packet_bar"));
check("gtm EVENTS_TRACKING ref", gtm.includes("EVENTS_TRACKING.md"));
check("gtm six profiles", gtm.includes("P1") && gtm.includes("P6"));
check("gtm anti-personas", gtm.includes("Anti-personas"));
check("gtm no caretaker word", !/\bcaretaker\b/i.test(gtm));

const gospelSrc = readFileSync(join(root, "src/gospel.mjs"), "utf8");
check("gospel operator_gtm", gospelSrc.includes("operator_gtm:"));
check("gospel gtm_scope_doc", gospelSrc.includes("OPERATOR_GTM_SCOPE.md"));

const llms = readFileSync(join(root, "web/llms.txt"), "utf8");
check("llms Operator GTM section", llms.includes("## Operator GTM"));

const gospelJson = readFileSync(join(root, "web/.well-known/innsegall-gospel.json"), "utf8");
let gospel;
try {
  gospel = JSON.parse(gospelJson);
} catch {
  gospel = {};
}
check("well-known operator_gtm", Boolean(gospel.operator_gtm?.profiles?.length));

const aiBus = JSON.parse(readFileSync(join(root, "web/innsegall-ai-bus.json"), "utf8"));
check("ai-bus operator_gtm_doc", aiBus.llm_adoption?.operator_gtm_doc?.includes("OPERATOR_GTM"));

for (const rel of [
  "LANE_OWNERSHIP.md",
  "DISTRIBUTION_PLAYBOOK.md",
  "TARGET_DEMO_400.md",
  "ROADMAP_5K_MRR.md",
]) {
  const body = readFileSync(join(docs, rel), "utf8");
  check(`${rel} links GTM scope`, body.includes("OPERATOR_GTM_SCOPE.md"));
}

const islesGtm = readFileSync(join(docs, "isles/GTM_MAC_FIRST.md"), "utf8");
check("GTM_MAC_FIRST links scope", islesGtm.includes("OPERATOR_GTM_SCOPE.md"));

if (failed) {
  console.error(`\n${failed} GTM scope audit failure(s) · run npm run sync-gospel if llms/gospel drift`);
  process.exit(1);
}
console.log("\nGTM scope audit passed · operator doc welded");
