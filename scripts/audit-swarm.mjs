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
  { name: "AI handoff / triage paste", script: "audit-ai-handoff.mjs", score: "9.0" },
  { name: "Landing unity · SEO + LLM", script: "audit-landing-unity.mjs", score: "9.5" },
  { name: "Brand lexicon", script: "audit-brand-ban.mjs", score: "9.0" },
  { name: "Abuse / credits", script: "audit-abuse.mjs", score: "9.5" },
  { name: "Privacy / local-first", script: "audit-privacy.mjs", score: "9.5" },
  { name: "Stripe / checkout", script: "audit-stripe.mjs", score: "9.5" },
  { name: "Claymore / voice", script: "audit-claymore.mjs", score: "9.0" },
  { name: "Shell / nav / footer", script: "audit-shell.mjs", score: "9.5" },
  { name: "Competitor / lane", script: "audit-lane.mjs", score: "9.0" },
  { name: "Mac lane absorption", script: "audit-competitor-absorption.mjs", score: "9.5" },
  { name: "Operator voice (P8)", script: "audit-operator-voice.mjs", score: "9.5" },
  { name: "Voyage onboarding (P8)", script: "audit-voyage-onboarding.mjs", score: "9.0" },
  { name: "Internal links", script: "audit-links.mjs", score: "9.5" },
  { name: "Issue spotlight loop", script: "audit-issue-spotlight.mjs", score: "9.0" },
  { name: "Discovery / trust", script: "audit-discovery.mjs", score: "9.0" },
  { name: "Install / bootstrap flow", script: "audit-install-flow.mjs", score: "9.5" },
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
  ["CSS v16 sitewide", index.includes("innsegall.css?v=16")],
  ["Index Battle Scout preview", index.includes("battle-scout-sample")],
  ["Guide Battle Scout sample", readFileSync(join(web, "guide.html"), "utf8").includes("battle-scout-sample")],
  ["Sample scout HTML", existsSync(join(web, "samples/battle-scout-demo.html"))],
  ["OG SVG master", existsSync(join(web, "og/innsegall-card.svg"))],
  ["OG PNG raster", existsSync(join(web, "og/innsegall-card.png"))],
  ["Hosted OG", index.includes("/og/innsegall-card.png")],
  ["Blog rune divider", readFileSync(join(web, "blog/what-is-a-battle-scout.html"), "utf8").includes("blog-rune-divider")],
  ["Skip link", index.includes('class="skip-link"')],
  ["Beam background", index.includes('class="beam-bg"')],
  ["Brand mark SVG", index.includes('class="brand-mark"')],
  ["Footer nav", index.includes('class="footer-links"')],
  [
    "Field echoes scout-for-you",
    index.includes("Send the scout") && index.includes("read-only triage"),
  ],
  ["Marketing ping in nav", readFileSync(join(web, "innsegall-nav.js"), "utf8").includes("marketing_ping")],
  ["Telemetry marketing_ping", readFileSync(join(web, "api/telemetry.js"), "utf8").includes("marketing_ping")],
  ["Stability page", existsSync(join(web, "stability.html"))],
  ["Distribution playbook", existsSync(join(root, "docs/DISTRIBUTION_PLAYBOOK.md"))],
  ["CHANGELOG", existsSync(join(root, "CHANGELOG.md"))],
  ["APPLE_DEVELOPER_ID doc", existsSync(join(root, "docs", "APPLE_DEVELOPER_ID.md"))],
  ["PHASE_5 shipped doc", existsSync(join(root, "docs", "PHASE_5_SHIPPED.md"))],
  ["macos installer packaging", existsSync(join(root, "packaging/macos/app-template/Contents/MacOS/install"))],
  ["Gospel signed_app_url", readFileSync(join(web, ".well-known", "innsegall-gospel.json"), "utf8").includes("signed_app_url")],
  ["IOS product plan", existsSync(join(root, "docs", "IOS_PRODUCT.md"))],
  ["Free lane sprint doc", existsSync(join(root, "docs", "FREE_LANE_SPRINT.md"))],
  [
    "IOS doc · battle-scout-ai v1",
    readFileSync(join(root, "docs", "IOS_PRODUCT.md"), "utf8").includes("innsegall-battle-scout-ai/v1"),
  ],
  [
    "Free lane · L4 cross-ref",
    readFileSync(join(root, "docs", "FREE_LANE_SPRINT.md"), "utf8").includes("IOS_PRODUCT.md"),
  ],
  [
    "PHASE_5 · trust install theme",
    readFileSync(join(root, "docs", "PHASE_5_SHIPPED.md"), "utf8").includes("alpha onboarding") &&
      !/caretaker/i.test(readFileSync(join(root, "docs", "PHASE_5_SHIPPED.md"), "utf8")),
  ],
  ["AI handoff onboarding doc", existsSync(join(root, "docs", "AI_HANDOFF_ONBOARDING.md"))],
  ["PHASE_6 free lane doc", existsSync(join(root, "docs", "PHASE_6_FREE_LANE.md"))],
  ["battle-scout-ai schema", existsSync(join(web, ".well-known", "battle-scout-ai-v1.schema.json"))],
  ["battle-scout sample on web", existsSync(join(web, "samples", "battle-scout-ai-v1.sample.json"))],
  ["dry-run-lanes script", existsSync(join(root, "scripts", "dry-run-lanes.mjs"))],
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
