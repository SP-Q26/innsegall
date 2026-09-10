#!/usr/bin/env node
/**
 * Operator funnel cheat sheet · Stripe + Xano (no secrets printed).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

console.log("Innsegall funnel report · run weekly\n");
console.log("── Stripe (revenue truth) ──");
console.log("Dashboard → Payments · filter last 7d");
console.log("Dashboard → Subscriptions · active Clan + MSP seat subs");
console.log("Metadata to watch: innsegall_sku · warrior_ref · innsegall_seats\n");

console.log("── Xano (top of funnel) ──");
const xanoDoc = join(root, "docs/PLATFORM_TRACKING.md");
if (existsSync(xanoDoc)) {
  console.log("See docs/PLATFORM_TRACKING.md · example rollups:\n");
  console.log(`  SELECT payload->>'page' AS page, COUNT(*) AS n
  FROM innsegall_events
  WHERE event = 'marketing_ping' AND day >= CURRENT_DATE - 7
  GROUP BY 1 ORDER BY n DESC;\n`);
  console.log(`  SELECT payload->>'ref_channel' AS channel, COUNT(*) AS n
  FROM innsegall_events
  WHERE event = 'marketing_ping' AND day >= CURRENT_DATE - 7
  GROUP BY 1;\n`);
  console.log(`  SELECT payload->>'sku' AS sku, SUM((payload->>'amount_cents')::int) AS cents
  FROM innsegall_events
  WHERE event = 'checkout_complete' AND day >= CURRENT_DATE - 7
  GROUP BY 1;\n`);
} else {
  console.log("(PLATFORM_TRACKING.md missing)\n");
}

console.log("── Issue spotlight publish ──");
console.log("  npm run publish:issue-spotlights:telemetry:dry");
console.log("  Live: set XANO_ISSUE_SPOTLIGHT_URL + XANO_API_KEY · GH workflow_dispatch\n");

console.log("── Local env hints ──");
const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY);
const hasXano = Boolean(process.env.XANO_EVENTS_URL && process.env.XANO_API_KEY);
console.log(`  STRIPE_SECRET_KEY: ${hasStripe ? "set" : "unset"}`);
console.log(`  XANO_EVENTS_URL + XANO_API_KEY: ${hasXano ? "set" : "unset"}`);
console.log("\nTargets (90-day alpha): docs/REVENUE_PROJECTION.md · 5–15 clans · $50–150 MRR\n");
