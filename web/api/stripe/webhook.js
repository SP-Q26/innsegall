import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("method_not_allowed");
  }
  const sig = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(503).send("webhook_not_configured");
  }

  let event;
  try {
    const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    console.error("webhook verify", e.message);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  // Alpha: license issued on success page fetch · webhook logs for ops
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("innsegall checkout completed", session.id, session.metadata?.innsegall_sku);
  }

  return res.status(200).json({ received: true });
}

export const config = {
  api: { bodyParser: false },
};
