#!/usr/bin/env node
/**
 * Stripe integration repo audit · code + catalog alignment (not live API).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STRIPE_CATALOG } from "../web/lib/stripe-catalog.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const checkout = readFileSync(join(web, "api/stripe/checkout.js"), "utf8");
const webhook = readFileSync(join(web, "api/stripe/webhook.js"), "utf8");
const license = readFileSync(join(web, "api/license.js"), "utf8");
const envExample = readFileSync(join(web, ".env.example"), "utf8");
const priceDoc = readFileSync(join(root, "docs/STRIPE_PRICE_IDS.md"), "utf8");

check("checkout uses stripe-catalog", checkout.includes("stripe-catalog.mjs"));
check("checkout SITE_URL helper", checkout.includes("siteOrigin"));
check("checkout metadata innsegall_sku", checkout.includes("innsegall_sku"));
check("checkout extra amount 420", checkout.includes("420") || checkout.includes("STRIPE_PRICE_EXTRA"));
check("checkout clan amount 667", checkout.includes("667") || checkout.includes("STRIPE_PRICE_CLAN"));
check("checkout subscription mode", checkout.includes('"subscription"'));
check("webhook raw body parser off", webhook.includes("bodyParser: false"));
check("webhook checkout.session.completed", webhook.includes("checkout.session.completed"));
check("webhook subscription events", webhook.includes("customer.subscription.updated"));
check("webhook invoice.paid renewal", webhook.includes("subscription_cycle"));
check("license stripe_session", license.includes("stripe_session"));
check("license buildLicensePayload", license.includes("buildLicensePayload"));
check("license imports web/lib", license.includes('../lib/license.mjs'));

for (const [key, item] of Object.entries(STRIPE_CATALOG)) {
  check(`catalog ${key} test_price_id in docs`, priceDoc.includes(item.test_price_id));
  check(`catalog ${key} amount`, item.unit_amount === (key === "extra" ? 420 : 667));
}

const gospel = readFileSync(join(web, ".well-known/innsegall-gospel.json"), "utf8");
const bus = readFileSync(join(web, "innsegall-ai-bus.json"), "utf8");
check("gospel extra 4.2", gospel.includes('"usd":4.2') || gospel.includes('"usd": 4.2'));
check("gospel clan 6.67", gospel.includes("6.67"));
check("ai-bus pricing extra", bus.includes('"usd":4.2') || bus.includes('"extra_run"'));
check("env example STRIPE_SECRET_KEY", envExample.includes("STRIPE_SECRET_KEY"));
check("env example STRIPE_PRICE_EXTRA", envExample.includes("STRIPE_PRICE_EXTRA"));
check("env example INNSEGALL_LICENSE_SECRET", envExample.includes("INNSEGALL_LICENSE_SECRET"));

const index = readFileSync(join(web, "index.html"), "utf8");
check("index checkout buttons", index.includes('data-sku="extra"') && index.includes('data-sku="clan"'));
check("index checkout fetch", index.includes("/api/stripe/checkout"));

if (failed) {
  console.error(`\n${failed} Stripe audit failure(s)`);
  process.exit(1);
}
console.log("\nStripe repo audit passed · wire Vercel env + webhook for live checkout");
