#!/usr/bin/env node
/**
 * Stripe live catalog audit · git canon vs Stripe Dashboard API.
 * Requires: STRIPE_SECRET_KEY=sk_live_…
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STRIPE_CATALOG, stripeProductImageUrl, CANONICAL_SITE_ORIGIN } from "../web/lib/stripe-catalog.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sk = process.env.STRIPE_SECRET_KEY || "";
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 live-stripe: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

if (!sk.startsWith("sk_live_")) {
  console.error("FAIL: set STRIPE_SECRET_KEY=sk_live_… (Dashboard · not Vercel integration pull)");
  process.exit(1);
}

console.log("innsegall audit-stripe-live\n");

const catalogState = readFileSync(join(root, "docs/STRIPE_CATALOG_STATE.md"), "utf8");

for (const [key, item] of Object.entries(STRIPE_CATALOG)) {
  if (!item.live_price_id || !item.live_product_id) {
    check(`catalog ${key} live ids in git`, false, "missing live_product_id or live_price_id");
    continue;
  }
  check(`docs STRIPE_CATALOG_STATE live ${key}`, catalogState.includes(item.live_price_id));

  try {
    const priceRes = await fetch(`https://api.stripe.com/v1/prices/${item.live_price_id}`, {
      headers: { Authorization: `Bearer ${sk}` },
    });
    const price = await priceRes.json();
    check(`Stripe live price ${key} active`, priceRes.ok && price.active === true, price.error?.message || "");
    check(`Stripe live price ${key} amount`, price.unit_amount === item.unit_amount, `got ${price.unit_amount}`);

    const prodRes = await fetch(`https://api.stripe.com/v1/products/${item.live_product_id}`, {
      headers: { Authorization: `Bearer ${sk}` },
    });
    const product = await prodRes.json();
    check(`Stripe live product ${key} active`, prodRes.ok && product.active !== false, product.error?.message || "");
    check(`Stripe live product ${key} name`, product.name === item.name, `got ${product.name}`);
    const brand = product.metadata?.isles_brand;
    check(`Stripe live product ${key} isles_brand`, brand === "innsegall", `metadata ${JSON.stringify(product.metadata || {})}`);

    const imgUrl = stripeProductImageUrl(key);
    if (imgUrl.startsWith("http")) {
      const head = await fetch(imgUrl, { method: "HEAD", redirect: "follow" });
      check(`hosted checkout image ${key}`, head.ok, `${head.status} ${imgUrl}`);
    } else {
      const png = join(root, "web/stripe", `${key}.png`);
      check(`stripe png ${key} on disk`, existsSync(png));
    }
  } catch (e) {
    check(`Stripe live API ${key}`, false, e.message);
  }
}

if (failed) {
  console.error(`\n${failed} live Stripe audit failure(s)`);
  process.exit(1);
}
console.log("\nStripe live catalog audit PASS");
