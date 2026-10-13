#!/usr/bin/env node
/**
 * Blog sweep · regenerate all posts from fixtures + run blog gates.
 * Same blog chain as prep-deploy (minus gospel/swarm). Writes audit doc header via audit:site.
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: "inherit" });
}

console.log("innsegall sweep-blog\n");

run("node scripts/sync-blog-brand.mjs");
run("node scripts/build-seo-batch-20.mjs");
run("node scripts/build-competitor-absorption-posts.mjs");
run("node scripts/build-ios-seo-batch.mjs");
run("node scripts/build-chrome-mac-seo-batch.mjs");
run("node scripts/sync-blog-field-desk.mjs");
run("node scripts/sync-blog-intro-leads.mjs");
run("node scripts/sync-blog-spam-scam-seo.mjs");
run("node scripts/sync-blog-seo.mjs");
run("node scripts/sync-blog-body-boosts.mjs");
run("node scripts/sync-blog-related-rail.mjs");
run("node scripts/sync-blog-cta.mjs");
run("node scripts/sync-site-chrome.mjs");

run("node scripts/audit-blog-funnel.mjs");
run("node scripts/audit-blog-quality.mjs");
run("node scripts/audit-blog-intro-leads.mjs");
run("node scripts/audit-field-glass-cadence.mjs");
run("node scripts/audit-vercel-routes.mjs");
run("node scripts/audit-site-inventory.mjs");

console.log("\nsweep-blog OK · see docs/BLOG_SWEEP_AUDIT_LATEST.md");
