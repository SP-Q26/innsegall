/**
 * Non-Innsegall SKUs on The Isles Collective Stripe · tank / pre-launch.
 * Provision with: npm run provision:stripe-catalog -- --portfolio
 * Products default inactive until the lane has a domain + checkout surface.
 */
import { islesProductMetadata } from "./isles-stripe-metadata.mjs";

export const ISLES_PORTFOLIO_PRODUCTS = {
  simple_property_mac: {
    brand: "simple_property",
    sku: "mac_essentials",
    name: "Simple Property · Mac essentials",
    description:
      "Tank reserve · homeowner Mac tools lane (not sold yet). Full Isles metadata for revenue tagging when launch opens.",
    unit_amount: 2900,
    currency: "usd",
    mode: "payment",
    lookup_key: "simple_property_mac_essentials",
    stripe_active: false,
    checkout_enabled: false,
    live_product_id: null,
    live_price_id: null,
    test_product_id: null,
    test_price_id: null,
    metadata: islesProductMetadata("simple_property", "simple_property_mac_essentials", {
      simple_property_sku: "mac_essentials",
      simple_property_plan: "mac_essentials",
    }),
  },
  simple_property_plus: {
    brand: "simple_property",
    sku: "plus",
    name: "Simple Property · Plus",
    description:
      "Tank reserve · monthly Simple Property lane (not sold yet). Activate product in Stripe when simpleproperty domain ships.",
    unit_amount: 499,
    currency: "usd",
    mode: "subscription",
    recurring: { interval: "month" },
    lookup_key: "simple_property_plus",
    stripe_active: false,
    checkout_enabled: false,
    live_product_id: null,
    live_price_id: null,
    test_product_id: null,
    test_price_id: null,
    metadata: islesProductMetadata("simple_property", "simple_property_plus", {
      simple_property_sku: "plus",
      simple_property_plan: "plus",
    }),
  },
};
