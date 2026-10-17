#!/usr/bin/env node
/**
 * Full send · Innsegall production gate (Deposit Desk parity).
 * Requires STRIPE_SECRET_KEY=sk_live_…
 */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sk = process.env.STRIPE_SECRET_KEY || "";

if (!sk.startsWith("sk_live_")) {
  console.error("full-send blocked: export STRIPE_SECRET_KEY='sk_live_…' from Stripe Dashboard");
  console.error("  Vercel integration secrets are not pullable · see docs/FULL_SEND.md");
  process.exit(1);
}

function run(label, cmd) {
  console.log(`\n── ${label} ──`);
  execSync(cmd, { cwd: root, stdio: "inherit", env: { ...process.env, STRIPE_SECRET_KEY: sk } });
}

console.log("innsegall full-send · live Stripe required\n");

run("git identity", "npm run check:git-identity");
run("git audit", "npm run audit:git");
run("preflight", "npm run preflight");
run("audit-stripe (repo)", "node scripts/audit-stripe.mjs");
run("audit-stripe-product-images", "node scripts/audit-stripe-product-images.mjs");
run("audit-stripe-live", "node scripts/audit-stripe-live.mjs");
run("audit:copy", "npm run audit:copy");
run("audit:seo", "npm run audit:seo");
run("audit:blog-quality", "npm run audit:blog-quality");
run("audit:blog-funnel", "npm run audit:blog-funnel");
run("audit:en-coverage", "npm run audit:en-coverage");
run("audit:i18n-readiness", "npm run audit:i18n-readiness");
run("audit:i18n", "npm run audit:i18n");
run("audit:i18n-pilot", "npm run audit:i18n-pilot");
run("audit:gtm-scope", "npm run audit:gtm-scope");
run("audit:oar", "npm run audit:oar");
run("audit:vercel-functions", "npm run audit:vercel-functions");
run("audit:discovery", "npm run audit:discovery");
run("audit:client-facing", "npm run audit:client-facing");
run("audit:site", "npm run audit:site");
run("gate:launch", "npm run gate:launch");

console.log("\nfull-send OK · operator may push main when ready");
