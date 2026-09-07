#!/usr/bin/env node
/**
 * Full swarm audit · all lanes · exit 1 on any gate failure.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");

const lanes = [
  { name: "Launch / automation", script: "audit-launch.mjs", score: "9.5" },
  { name: "SEO / discoverability", script: "audit-seo.mjs", score: "9.2" },
  { name: "Social previews", script: "audit-social-preview.mjs", score: "10" },
  { name: "AI-bus / gospel", script: "audit-ai-bus.mjs", score: "9.0" },
  { name: "Brand lexicon", script: "audit-brand-ban.mjs", score: "9.0" },
  { name: "Abuse / credits", script: "audit-abuse.mjs", score: "9.5" },
  { name: "Privacy / local-first", script: "audit-privacy.mjs", score: "9.5" },
  { name: "Stripe / checkout", script: "audit-stripe.mjs", score: "9.5" },
  { name: "Claymore / voice", script: "audit-claymore.mjs", score: "9.0" },
];

let failed = 0;
console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  Innsegall full swarm audit                                  ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

for (const lane of lanes) {
  console.log(`── ${lane.name} (target ${lane.score}) ──`);
  try {
    execSync(`node scripts/${lane.script}`, { cwd: root, stdio: "inherit" });
    console.log(`lane OK · ${lane.name}\n`);
  } catch {
    failed++;
    console.error(`lane FAIL · ${lane.name}\n`);
  }
}

console.log("── Engine smoke ──");
try {
  execSync("node scripts/smoke.mjs", { cwd: root, stdio: "inherit" });
  console.log("lane OK · Battle Scout smoke\n");
} catch {
  failed++;
  console.error("lane FAIL · Battle Scout smoke\n");
}

console.log("── Self-test ──");
try {
  execSync("node scripts/self-test.mjs", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      INNSEGALL_SUPPORT_DIR: process.env.INNSEGALL_SUPPORT_DIR || join(root, ".smoke", "self-test-support"),
    },
  });
  console.log("lane OK · CLI self-test\n");
} catch {
  failed++;
  console.error("lane FAIL · CLI self-test\n");
}

const index = readFileSync(join(web, "index.html"), "utf8");
const visualChecks = [
  ["CSS v10 sitewide", index.includes("innsegall.css?v=10")],
  ["Hosted OG", index.includes("/og/innsegall-card.png")],
  ["Skip link", index.includes('class="skip-link"')],
  ["Beam background", index.includes('class="beam-bg"')],
  ["Brand mark SVG", index.includes('class="brand-mark"')],
  ["Footer nav", index.includes('class="footer-links"')],
];
console.log("── License dry-test ──");
try {
  execSync("node scripts/dry-test-license.mjs", { cwd: root, stdio: "inherit" });
  console.log("lane OK · license / credits dry-test\n");
} catch {
  failed++;
  console.error("lane FAIL · license / credits dry-test\n");
}

console.log("── Visual polish (manual lane · target 10) ──");
for (const [label, ok] of visualChecks) {
  console.log(ok ? `ok: ${label}` : `P0 visual: ${label}`);
  if (!ok) failed++;
}

console.log("\n══════════════════════════════════════════════════════════════");
if (failed) {
  console.error(`SWARM AUDIT FAIL · ${failed} lane(s)`);
  process.exit(1);
}
console.log("SWARM AUDIT PASS · repo lanes green");
console.log("  Next: npm run smoke:live · then STRIPE LIVE flip (docs/STRIPE_LIVE_FLIP.md)");
