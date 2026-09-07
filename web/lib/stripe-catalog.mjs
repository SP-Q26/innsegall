/**
 * Canonical Innsegall Stripe catalog · keep in sync with Dashboard products.
 * Test-mode IDs · rotate docs when live products are created.
 */
export const STRIPE_CATALOG = {
  extra: {
    sku: "extra",
    name: "Innsegall Extra Scout",
    description:
      "One extra panic Battle Scout run beyond free Voyage quota. Local-first · license delivered on success page.",
    unit_amount: 420,
    currency: "usd",
    mode: "payment",
    test_product_id: "prod_VDK62giZUcpP6x",
    test_price_id: "price_1UCtSDF5SRiYwzwFcmVYwqvf",
    lookup_key: "innsegall_extra",
    metadata: { innsegall_sku: "extra", innsegall_plan: "extra" },
  },
  clan: {
    sku: "clan",
    name: "Innsegall Clan · 5 seats",
    description:
      "Monthly Clan subscription · 5 seats · Battle Scout for your household. Cancel anytime in Customer Portal.",
    unit_amount: 667,
    currency: "usd",
    mode: "subscription",
    recurring: { interval: "month" },
    seats: 5,
    test_product_id: "prod_VDKPAidRCPD8vW",
    test_price_id: "price_1UCtknF5SRiYwzwFMhZXP1q2",
    lookup_key: "innsegall_clan",
    metadata: { innsegall_sku: "clan", innsegall_plan: "clan", innsegall_seats: "5" },
  },
};

export function catalogForSku(sku) {
  return STRIPE_CATALOG[sku === "clan" ? "clan" : "extra"];
}

export function siteOrigin() {
  const raw = process.env.INNSEGALL_SITE_URL || process.env.VERCEL_URL || "https://innsegall.com";
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  return `https://${raw.replace(/\/$/, "")}`;
}
