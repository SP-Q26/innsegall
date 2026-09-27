#!/usr/bin/env node
/**
 * Signed webhook probe · requires STRIPE_WEBHOOK_SECRET (live whsec for innsegall.com endpoint).
 *   STRIPE_WEBHOOK_SECRET=whsec_… npm run smoke:webhook-signed
 */
import Stripe from "stripe";

const base = process.argv.find((a) => a.startsWith("--base="))?.split("=")[1] || "https://innsegall.com";
const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

if (!secret.startsWith("whsec_")) {
  console.error("skip: set STRIPE_WEBHOOK_SECRET (innsegall live endpoint signing secret)");
  process.exit(0);
}

const payload = JSON.stringify({
  id: "evt_smoke_innsegall",
  object: "event",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_smoke_innsegall",
      object: "checkout.session",
      amount_total: 420,
      currency: "usd",
      mode: "payment",
      metadata: { innsegall_sku: "extra", isles_brand: "innsegall" },
    },
  },
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-11-20.acacia",
});

const sig = stripe.webhooks.generateTestHeaderString({ payload, secret });

const res = await fetch(`${base}/api/stripe/webhook`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Stripe-Signature": sig,
  },
  body: payload,
});

const text = await res.text();
if (res.status === 200) {
  console.log(`ok  signed webhook POST → ${res.status} ${text.slice(0, 120)}`);
  process.exit(0);
}

console.error(`FAIL signed webhook ${res.status} ${text.slice(0, 200)}`);
process.exit(1);
