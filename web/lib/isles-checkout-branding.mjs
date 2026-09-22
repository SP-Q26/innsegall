/**
 * The Isles Collective · shared Checkout + statement branding.
 * Card/bank: Dashboard prefix ISLES CO · per-SKU suffix on PaymentIntent / Invoice.
 */
export const ISLES_COLLECTIVE = {
  legal_name: "The Isles Collective",
  statement_prefix: "ISLES CO",
  support_url: "https://innsegall.com/tos",
  support_email: "hello@innsegall.com",
};

/** Hosted Checkout accent colors (Innsegall beam palette). */
export function checkoutBrandingSettings() {
  return {
    primary_color: "#122A42",
    secondary_color: "#F4C95D",
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
