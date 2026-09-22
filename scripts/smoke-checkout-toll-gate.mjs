#!/usr/bin/env node
/**
 * Toll-gate smoke · create Checkout sessions · verify cancel URLs · stop before pay.
 * Does not open Stripe Hosted Checkout in a browser · does not submit card data.
 *
 *   npm run smoke:checkout-toll-gate
 *   npm run smoke:checkout-toll-gate -- --base=https://innsegall.com
 *
 * Optional: STRIPE_SECRET_KEY set locally → retrieve session and assert cancel_url.
 */
const base = (process.argv.find((a) => a.startsWith("--base=")) || "--base=https://innsegall.com").slice(
  "--base=".length
);

const CASES = [
  { label: "extra", body: { sku: "extra" }, cancelIncludes: "/#pricing" },
  { label: "clan", body: { sku: "clan" }, cancelIncludes: "/clan" },
  { label: "msp×10", body: { sku: "msp", quantity: 10 }, cancelIncludes: "/msp" },
];

let fail = 0;
function pass(msg) {
  console.log(`ok  ${msg}`);
}
function failMsg(msg) {
  console.error(`FAIL ${msg}`);
  fail++;
}

console.log(`innsegall smoke-checkout-toll-gate · ${base}\n`);

let stripe;
const sk = process.env.STRIPE_SECRET_KEY || "";
if (sk.startsWith("sk_test_") || sk.startsWith("sk_live_")) {
  const Stripe = (await import("stripe")).default;
  stripe = new Stripe(sk, { apiVersion: "2024-11-20.acacia" });
} else {
  console.log("note: set STRIPE_SECRET_KEY to verify cancel_url on session object\n");
}

for (const { label, body, cancelIncludes } of CASES) {
  let data;
  try {
    const res = await fetch(`${base}/api/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    data = await res.json().catch(() => ({}));
    if (res.status === 503 && data.error === "stripe_not_configured") {
      failMsg(`${label} stripe_not_configured on host`);
      continue;
    }
    if (res.status !== 200 || !data.url?.includes("checkout.stripe.com")) {
      failMsg(`${label} checkout ${res.status} ${JSON.stringify(data).slice(0, 100)}`);
      continue;
    }
    const mode = data.url.includes("/test/") || data.url.includes("cs_test_") ? "test" : "live";
    pass(`${label} → checkout.stripe.com (${mode}) · session ${data.id || "?"}`);
  } catch (e) {
    failMsg(`${label} ${e.message}`);
    continue;
  }

  if (stripe && data.id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(data.id);
      const cancel = session.cancel_url || "";
      if (!cancel.includes("innsegall.com") || !cancel.includes(cancelIncludes.replace("/#", "#").split("#")[0])) {
        failMsg(`${label} cancel_url unexpected: ${cancel}`);
      } else {
        pass(`${label} cancel_url → ${cancel}`);
      }
      const meta = session.metadata || {};
      if (!meta.innsegall_sku) {
        failMsg(`${label} missing innsegall_sku metadata on session`);
      } else {
        pass(`${label} metadata innsegall_sku=${meta.innsegall_sku}`);
      }
    } catch (e) {
      failMsg(`${label} session retrieve ${e.message}`);
    }
  }
}

console.log("\n── Manual abort (no card) ──");
console.log("1. Open url from POST /api/stripe/checkout (pricing button or curl)");
console.log("2. Confirm product name · amount · Innsegall copy on submit footer");
console.log("3. Use browser Back or Stripe ← return link · land on cancel_url · no payment");

console.log(`\n${fail ? fail + " failure(s)" : "toll-gate API green"}`);
process.exit(fail ? 1 : 0);
