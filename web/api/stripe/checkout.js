import Stripe from "stripe";
import { catalogForSku, siteOrigin, STRIPE_CATALOG } from "../../lib/stripe-catalog.mjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

function priceEnvKey(sku) {
  if (sku === "clan") return "STRIPE_PRICE_CLAN";
  if (sku === "msp") return "STRIPE_PRICE_MSP_SEAT";
  return "STRIPE_PRICE_EXTRA";
}

function normalizeSku(raw) {
  if (raw === "clan" || raw === "msp") return raw;
  return "extra";
}

function mspQuantity(raw) {
  const min = STRIPE_CATALOG.msp.seats_min;
  const max = STRIPE_CATALOG.msp.seats_max;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function sanitizeWarriorRef(raw) {
  if (!raw || typeof raw !== "string") return "";
  const s = raw.trim();
  if (s.length > 64) return s.slice(0, 64);
  return s;
}

function lineItemForSku(sku, quantity = 1) {
  const catalog = catalogForSku(sku);
  const priceId = process.env[priceEnvKey(sku)];
  if (priceId) {
    return { price: priceId, quantity };
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
  return { price_data: priceData, quantity };
}

function sessionMetadata(sku, warriorRef, seatCount) {
  const meta = { innsegall_sku: sku };
  if (warriorRef) meta.warrior_ref = warriorRef;
  if (sku === "msp") meta.innsegall_seats = String(seatCount);
  if (sku === "clan") meta.innsegall_seats = "5";
  return meta;
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

  const sku = normalizeSku(body?.sku);
  const catalog = catalogForSku(sku);
  const origin = siteOrigin();
  const isSubscription = catalog.mode === "subscription";
  const warriorRef = sanitizeWarriorRef(body?.warrior_ref);
  const seatCount = sku === "msp" ? mspQuantity(body?.quantity) : 1;
  const lineQty = sku === "msp" ? seatCount : 1;
  const cancelUrl =
    sku === "msp" ? `${origin}/msp` : sku === "clan" ? `${origin}/clan` : `${origin}/#pricing`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: catalog.mode,
      line_items: [lineItemForSku(sku, lineQty)],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: sessionMetadata(sku, warriorRef, seatCount),
      client_reference_id: warriorRef
        ? `innsegall_${sku}_${warriorRef.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40)}`
        : `innsegall_${sku}`,
      allow_promotion_codes: false,
      ...(isSubscription
        ? {
            subscription_data: {
              metadata: {
                ...sessionMetadata(sku, warriorRef, seatCount),
                innsegall_plan: sku,
              },
            },
          }
        : {}),
      custom_text: sku === "msp"
        ? {
            submit: {
              message:
                "MSP roster renews monthly per seat. Cancel anytime in Customer Portal. Battle Scouts stay local-first on each Mac.",
            },
          }
        : sku === "clan"
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
