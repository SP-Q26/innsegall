/**
 * Isles portfolio Stripe metadata · every SKU on The Isles Collective Stripe account.
 */
export const ISLES_PORTFOLIO = "the_isles";

/**
 * @param {string} appId · registry app_id (innsegall, simple_property, …)
 * @param {string} lane · e.g. innsegall_extra
 * @param {Record<string, string>} [extra]
 */
export function islesProductMetadata(appId, lane, extra = {}) {
  return {
    isles_portfolio: ISLES_PORTFOLIO,
    isles_brand: appId,
    isles_lane: lane,
    isles_tank_phase: "juvenile",
    ...extra,
  };
}

/** Merge Isles keys into Innsegall catalog metadata. */
export function innsegallStripeMetadata(sku, base = {}) {
  const lane = `innsegall_${sku}`;
  return islesProductMetadata("innsegall", lane, base);
}

/** Per-brand SKU keys for portfolio lanes (simple_property_sku, …). */
export function brandSkuMetadata(brandKey, sku, plan, extra = {}) {
  const lane = `${brandKey}_${sku}`;
  const brandMeta = { [`${brandKey}_sku`]: sku, [`${brandKey}_plan`]: plan };
  return islesProductMetadata(brandKey, lane, { ...brandMeta, ...extra });
}
