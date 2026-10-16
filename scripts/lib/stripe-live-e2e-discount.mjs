/**
 * Operator-only live Checkout discount (no public promo UI).
 * Copy stays in sync with web/lib/stripe-live-e2e-discount.mjs
 *
 * Vercel env (Production, optional):
 *   STRIPE_LIVE_E2E_TOKEN   — long random secret; never commit
 *   STRIPE_LIVE_E2E_COUPON_ID — Stripe coupon id (100% off, low max redemptions)
 *
 * POST checkout JSON: { ..., "e2e_token": "<same as env>" }
 */
export function applyLiveE2eDiscount(sessionParams, body) {
  const token = process.env.STRIPE_LIVE_E2E_TOKEN?.trim();
  const coupon = process.env.STRIPE_LIVE_E2E_COUPON_ID?.trim();
  if (!token || !coupon) return sessionParams;

  const got = String(body?.e2e_token ?? "").trim();
  if (!got || got !== token) return sessionParams;

  const metadata = {
    ...(sessionParams.metadata || {}),
    isles_live_e2e: "1",
  };

  return {
    ...sessionParams,
    metadata,
    discounts: [{ coupon }],
  };
}
