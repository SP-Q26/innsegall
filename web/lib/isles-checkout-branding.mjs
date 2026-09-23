/**
 * The Isles Collective · shared Checkout + statement branding.
 * Card/bank: Dashboard prefix ISLES CO · per-SKU suffix on PaymentIntent / Invoice.
 * Visual Checkout chrome: Dashboard Branding (account default) · session override later.
 * Canon: docs/isles/SHARED_STRIPE_CHECKOUT_BRANDING.md
 */
export const ISLES_COLLECTIVE = {
  legal_name: "The Isles Collective",
  statement_prefix: "ISLES CO",
  support_url: "https://innsegall.com/tos",
  support_email: "hello@innsegall.com",
};

/**
 * Future: session branding_settings (Stripe API 2025-09-30+).
 * Use background_color / button_color per Stripe docs · not primary_color.
 * Gated until checkout.js apiVersion bump · see SHARED_STRIPE_CHECKOUT_BRANDING.md Phase 2.
 */
export function checkoutBrandingSettingsInnsegall() {
  return {
    background_color: "#122A42",
    button_color: "#F4C95D",
  };
}

/** Bank statement suffix (combined with account prefix · max 22 chars). */
export function statementDescriptorSuffix(sku) {
  if (sku === "clan") return "INNSEGALL CLAN";
  if (sku === "msp") return "INNSEGALL MSP";
  return "INNSEGALL";
}

/** Product-level descriptor on Dashboard products (optional). */
export function productStatementDescriptor(sku) {
  return statementDescriptorSuffix(sku);
}

/** Isles portfolio keys copied onto every Checkout session + subscription. */
export function islesMetadataFromCatalog(catalog) {
  const meta = catalog?.metadata || {};
  return {
    isles_portfolio: meta.isles_portfolio || "the_isles",
    isles_brand: meta.isles_brand || "innsegall",
    isles_lane: meta.isles_lane || `innsegall_${catalog?.sku || "extra"}`,
    isles_tank_phase: meta.isles_tank_phase || "juvenile",
  };
}
