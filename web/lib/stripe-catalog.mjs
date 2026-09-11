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
    live_product_id: "prod_VEoWuOFwUVENSz",
    live_price_id: "price_1UEKtpFDJKTJlxOcJn43NZI2",
    lookup_key: "innsegall_extra",
    checkout_image: "/stripe/extra.png",
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
    live_product_id: "prod_VEoXxxCbhp5UBE",
    live_price_id: "price_1UEKu4FDJKTJlxOcooxy8Zv5",
    lookup_key: "innsegall_clan",
    checkout_image: "/stripe/clan.png",
    metadata: { innsegall_sku: "clan", innsegall_plan: "clan", innsegall_seats: "5" },
  },
  msp: {
    sku: "msp",
    name: "Innsegall MSP · per seat",
    description:
      "Monthly MSP roster · unlimited Battle Scouts per billed seat · post-scare Mac triage for client Macs · 10 seat minimum.",
    unit_amount: 300,
    currency: "usd",
    mode: "subscription",
    recurring: { interval: "month" },
    seats_min: 10,
    seats_max: 100,
    test_product_id: "prod_VEoW9HK9Jun9It",
    test_price_id: "price_1UEKt7F5SRiYwzwFEgfNLWJw",
    live_product_id: "prod_VEoX9hJDYQTlck",
    live_price_id: "price_1UEKu6FDJKTJlxOcMJmWUzim",
    lookup_key: "innsegall_msp_seat",
    checkout_image: "/stripe/msp.png",
    metadata: { innsegall_sku: "msp", innsegall_plan: "msp" },
  },
};

export function catalogForSku(sku) {
  if (sku === "clan") return STRIPE_CATALOG.clan;
  if (sku === "msp") return STRIPE_CATALOG.msp;
  return STRIPE_CATALOG.extra;
}

/** Public site origin for Stripe success/cancel URLs and product images. */
export const CANONICAL_SITE_ORIGIN = "https://innsegall.com";

export function siteOrigin() {
  const explicit = (process.env.INNSEGALL_SITE_URL || "").trim();
  if (explicit) {
    const raw = explicit.startsWith("http") ? explicit : `https://${explicit}`;
    return raw.replace(/\/$/, "");
  }
  // Production must not use VERCEL_URL (deployment hash · SSO previews break /success).
  if (process.env.VERCEL_ENV === "production") {
    return CANONICAL_SITE_ORIGIN;
  }
  const vercel = (process.env.VERCEL_URL || "").trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }
  return CANONICAL_SITE_ORIGIN;
}

/** Public HTTPS URL for Stripe Product.images[] (same URL for test + live products). */
export function stripeProductImageUrl(sku) {
  const item = catalogForSku(sku);
  const path = item?.checkout_image;
  if (!path) return "";
  return `${siteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}
