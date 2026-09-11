#!/usr/bin/env node
/**
 * Stripe sandbox catalog audit · repo + doc alignment (no API keys required).
 * Optional: set STRIPE_SECRET_KEY=sk_test_… to verify price IDs exist in Stripe.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STRIPE_CATALOG, stripeProductImageUrl } from "../web/lib/stripe-catalog.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const catalogState = readFileSync(join(root, "docs/STRIPE_CATALOG_STATE.md"), "utf8");
const priceDoc = readFileSync(join(root, "docs/STRIPE_PRICE_IDS.md"), "utf8");

for (const [key, item] of Object.entries(STRIPE_CATALOG)) {
  check(`catalog ${key} test_price_id set`, Boolean(item.test_price_id));
  check(`catalog ${key} lookup_key set`, Boolean(item.lookup_key));
  if (item.test_price_id) {
    check(`docs STRIPE_PRICE_IDS ${key}`, priceDoc.includes(item.test_price_id));
    check(`docs STRIPE_CATALOG_STATE test ${key}`, catalogState.includes(item.test_price_id));
  }
  if (item.live_price_id) {
    check(`docs STRIPE_CATALOG_STATE live ${key}`, catalogState.includes(item.live_price_id));
  }
}

check("test webhook id in catalog state", catalogState.includes("we_1UCuYlF5SRiYwzwF20nJM9fT"));
check("msp test price in env example", readFileSync(join(root, "web/.env.example"), "utf8").includes("price_1UEKt7F5SRiYwzwFEgfNLWJw"));

for (const [key, item] of Object.entries(STRIPE_CATALOG)) {
  const png = join(root, "web/stripe", `${key}.png`);
  check(`stripe png ${key}`, existsSync(png));
  if (item.checkout_image) {
    check(`catalog ${key} checkout_image url`, stripeProductImageUrl(key).includes(item.checkout_image));
  }
}

const sk = process.env.STRIPE_SECRET_KEY || "";
if (sk.startsWith("sk_test_")) {
  console.log("\n── Stripe API verify (test) ──");
  for (const [key, item] of Object.entries(STRIPE_CATALOG)) {
    if (!item.test_price_id) continue;
    try {
      const res = await fetch(`https://api.stripe.com/v1/prices/${item.test_price_id}`, {
        headers: { Authorization: `Bearer ${sk}` },
      });
      const data = await res.json();
      const active = res.ok && data.active === true;
      const amountOk = data.unit_amount === item.unit_amount;
      check(`Stripe price ${key} active`, active, data.error?.message || "");
      check(`Stripe price ${key} amount`, amountOk, `expected ${item.unit_amount} got ${data.unit_amount}`);
      if (item.lookup_key && data.lookup_key) {
        check(`Stripe price ${key} lookup_key`, data.lookup_key === item.lookup_key);
      }
    } catch (e) {
      check(`Stripe price ${key} fetch`, false, e.message);
    }
  }
} else {
  console.log("skip: STRIPE_SECRET_KEY sk_test_… not set · repo-only audit");
}

if (failed) {
  console.error(`\n${failed} sandbox Stripe audit failure(s)`);
  process.exit(1);
}
console.log("\nStripe sandbox catalog audit PASS");
