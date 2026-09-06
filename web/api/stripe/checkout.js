import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

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
  const origin = "https://innsegall.com";

  const isClan = sku === "clan";
  const lineItems = isClan
    ? [
        process.env.STRIPE_PRICE_CLAN
          ? { price: process.env.STRIPE_PRICE_CLAN, quantity: 1 }
          : {
              price_data: {
                currency: "usd",
                product_data: { name: "Innsegall Clan · 5 seats" },
                unit_amount: 667,
                recurring: { interval: "month" },
              },
              quantity: 1,
            },
      ]
    : [
        process.env.STRIPE_PRICE_EXTRA
          ? { price: process.env.STRIPE_PRICE_EXTRA, quantity: 1 }
          : {
              price_data: {
                currency: "usd",
                product_data: { name: "Innsegall Extra Scout" },
                unit_amount: 420,
              },
              quantity: 1,
            },
      ];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isClan ? "subscription" : "payment",
      line_items: lineItems,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      metadata: { innsegall_sku: sku },
      allow_promotion_codes: false,
    });
    return res.status(200).json({ url: session.url, id: session.id });
  } catch (e) {
    console.error("checkout", e);
    return res.status(500).json({ error: "checkout_failed" });
  }
}
