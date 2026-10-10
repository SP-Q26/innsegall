#!/usr/bin/env node
/**
 * Event catalog audit · telemetry + Stripe webhook + Xano paste whitelist stay aligned.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MARKETING_PAGES,
  PAGE_MAP,
  CHECKOUT_SKUS,
  INSTALL_ASSETS,
} from "../web/lib/telemetry-browser.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 events: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const CANON_EVENTS = [
  "install_ping",
  "scout_aggregate",
  "marketing_ping",
  "issue_spotlight",
  "checkout_intent",
  "install_intent",
  "checkout_complete",
  "checkout_abandoned",
  "clan_subscription",
  "clan_renewal",
  "payment_failed",
];

const telemetry = readFileSync(join(web, "api/telemetry.js"), "utf8");
const webhook = readFileSync(join(web, "api/stripe/webhook.js"), "utf8");
const nav = readFileSync(join(web, "innsegall-nav.js"), "utf8");
const checkout = readFileSync(join(web, "innsegall-checkout.js"), "utf8");
const paste = readFileSync(join(root, "docs/pastes/innsegall-events-post.xs"), "utf8");
const cli = readFileSync(join(root, "src/telemetry-client.mjs"), "utf8");

for (const ev of CANON_EVENTS) {
  check(`xano paste allows ${ev}`, paste.includes(`"${ev}"`));
}

for (const ev of [
  "install_ping",
  "scout_aggregate",
  "marketing_ping",
  "issue_spotlight",
  "checkout_intent",
  "install_intent",
]) {
  check(`telemetry client allows ${ev}`, telemetry.includes(`"${ev}"`) && telemetry.includes("CLIENT_EVENTS"));
}

check("telemetry blocks checkout_complete client", telemetry.includes('error: "server_only"'));

for (const page of MARKETING_PAGES) {
  if (page === "blog_post" || page === "sample" || page === "other") continue;
  const pathEntry = Object.entries(PAGE_MAP).find(([, v]) => v === page);
  check(`PAGE_MAP covers marketing page ${page}`, Boolean(pathEntry));
}

for (const path of Object.keys(PAGE_MAP)) {
  check(`nav PAGE_MAP ${path}`, nav.includes(`"${path}":`));
}

check("nav marketing_ping", nav.includes("marketing_ping"));
check("nav install_intent", nav.includes("install_intent"));
check("checkout checkout_intent", checkout.includes("checkout_intent"));
check("webhook checkout_complete", webhook.includes('"checkout_complete"'));
check("webhook payment_failed", webhook.includes('"payment_failed"'));
check("webhook checkout_abandoned", webhook.includes('"checkout_abandoned"'));
check("webhook subscription.created", webhook.includes("customer.subscription.created"));

check("cli install_ping", cli.includes('postTelemetry("install_ping"'));
check("cli scout_aggregate", cli.includes('postTelemetry("scout_aggregate"'));
check("cli issue_spotlight", cli.includes('postTelemetry("issue_spotlight"'));

for (const sku of CHECKOUT_SKUS) {
  check(`checkout sku ${sku}`, checkout.includes(`"${sku}"`) || telemetry.includes(`"${sku}"`));
}
for (const asset of INSTALL_ASSETS) {
  check(`install asset ${asset}`, nav.includes(`"${asset}"`) || telemetry.includes(`"${asset}"`));
}

if (failed) {
  console.error(`\n${failed} event audit failure(s)`);
  process.exit(1);
}
console.log("\nEvent catalog audit passed ·", CANON_EVENTS.length, "events");
