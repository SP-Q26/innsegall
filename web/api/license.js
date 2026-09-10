import Stripe from "stripe";
import { buildLicensePayload } from "../lib/license.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "stripe_not_configured" });
  }

  const sessionId = req.query?.session_id;
  if (!sessionId || !String(sessionId).startsWith("cs_")) {
    return res.status(400).json({ error: "missing_session_id" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return res.status(402).json({ error: "payment_incomplete", status: session.payment_status });
    }

    const sku = session.metadata?.innsegall_sku || "extra";
    const isMsp = sku === "msp";
    const isClan = sku === "clan" || (session.mode === "subscription" && !isMsp);
    const isSub = isClan || isMsp;
    let validUntil = null;
    if (isSub && session.subscription) {
      const sub =
        typeof session.subscription === "string"
          ? await stripe.subscriptions.retrieve(session.subscription)
          : session.subscription;
      validUntil = new Date(sub.current_period_end * 1000).toISOString();
    }

    const seats = isMsp
      ? Math.min(100, Math.max(10, parseInt(session.metadata?.innsegall_seats, 10) || 10))
      : isClan
        ? 5
        : 1;

    const license = buildLicensePayload({
      plan: isMsp ? "msp" : isClan ? "clan" : "extra",
      extra_credits: isSub ? 0 : 1,
      seats,
      valid_until: validUntil,
      stripe_session: session.id,
      stripe_subscription:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id || null,
    });

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", 'attachment; filename="innsegall-license.json"');
    return res.status(200).json(license);
  } catch (e) {
    console.error("license", e);
    return res.status(500).json({ error: "license_failed", message: e.message });
  }
}
