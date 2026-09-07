import Stripe from "stripe";
import { forwardToXano } from "../../lib/xano-forward.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

async function recordXano(event, payload) {
  if (!process.env.XANO_EVENTS_URL) {
    return { forwarded: false, skipped: true };
  }
  return forwardToXano(event, payload, "stripe_webhook");
}

function checkoutPayload(session) {
  const sku = session.metadata?.innsegall_sku || "extra";
  return {
    day: new Date().toISOString().slice(0, 10),
    sku,
    amount_cents: session.amount_total ?? null,
    currency: session.currency ?? "usd",
    stripe_session_id: session.id,
    mode: session.mode,
  };
}

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
    return res.status(400).send("Webhook Error");
  }

  let xano = { forwarded: false };

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("innsegall checkout completed", session.id, session.metadata?.innsegall_sku);
      xano = await recordXano("checkout_complete", checkoutPayload(session));
    } else if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object;
      xano = await recordXano("clan_subscription", {
        day: new Date().toISOString().slice(0, 10),
        stripe_event: event.type,
        subscription_id: sub.id,
        status: sub.status,
        cancel_at_period_end: Boolean(sub.cancel_at_period_end),
      });
    } else if (event.type === "invoice.paid") {
      const inv = event.data.object;
      if (inv.billing_reason === "subscription_cycle") {
        xano = await recordXano("clan_renewal", {
          day: new Date().toISOString().slice(0, 10),
          amount_cents: inv.amount_paid ?? null,
          currency: inv.currency ?? "usd",
          invoice_id: inv.id,
        });
      }
    }
  } catch (e) {
    console.error("webhook xano", e.message);
    if (process.env.XANO_EVENTS_URL) {
      return res.status(502).json({ error: "xano_forward_failed", message: e.message });
    }
  }

  return res.status(200).json({ received: true, xano });
}

export const config = {
  api: { bodyParser: false },
};
