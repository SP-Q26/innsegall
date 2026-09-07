import Stripe from "stripe";
import { catalogForSku, siteOrigin } from "../../lib/stripe-catalog.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

function priceEnvKey(sku) {
  return sku === "clan" ? "STRIPE_PRICE_CLAN" : "STRIPE_PRICE_EXTRA";
}

function lineItemForSku(sku) {
  const catalog = catalogForSku(sku);
  const priceId = process.env[priceEnvKey(sku)];
  if (priceId) {
    return { price: priceId, quantity: 1 };
  }
  const priceData = {
    currency: catalog.currency,
    product_data: {
      name: catalog.name,
      description: catalog.description,
      metadata: catalog.metadata,
    },
    unit_amount: catalog.unit_amount,
  };
  if (catalog.recurring) {
    priceData.recurring = catalog.recurring;
  }
  return { price_data: priceData, quantity: 1 };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "stripe_not_configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "invalid_json" });
    }
  }
  const sku = body?.sku === "clan" ? "clan" : "extra";
  const catalog = catalogForSku(sku);
  const origin = siteOrigin();
  const isClan = catalog.mode === "subscription";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: catalog.mode,
      line_items: [lineItemForSku(sku)],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      metadata: { innsegall_sku: sku },
      client_reference_id: `innsegall_${sku}`,
      allow_promotion_codes: false,
      ...(isClan
        ? {
            subscription_data: {
              metadata: { innsegall_sku: "clan", innsegall_plan: "clan" },
            },
          }
        : {}),
      custom_text: isClan
        ? {
            submit: {
              message:
                "Clan renews monthly. Cancel anytime in Stripe Customer Portal. No prorated refunds for partial months unless required by law.",
            },
          }
        : {
            submit: {
              message:
                "Extra scout fee is final and non-refundable once your license.json is delivered. Worth the calm · no manual loop.",
            },
          },
    });
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (e) {
    console.error("checkout", e);
    return res.status(500).json({ error: "checkout_failed" });
  }
}
