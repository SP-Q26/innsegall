/**
 * Supplies for the road · brand voice for paid passages (Stripe Checkout).
 */
import { PRICING } from "./constants.mjs";

export const SUPPLY_SKUS = {
  extra: {
    sku: "extra",
    title: "Panic scout",
    line: "One horn credit when the moon is wrong · runs locally after import",
    priceLabel: `$${PRICING.extra_run.usd.toFixed(2)}`,
    aliases: ["panic", "scout"],
  },
  clan: {
    sku: "clan",
    title: "Clan passage",
    line: "Unlimited scouts · household seats · Mon & Thu voyage on Mac",
    priceLabel: `$${PRICING.clan.usd_monthly.toFixed(2)}/mo`,
    aliases: [],
  },
  msp: {
    sku: "msp",
    title: "MSP roster",
    line: "Seat packs for your war-band · voyage rhythm on roster Macs",
    priceLabel: "from $3/seat",
    aliases: [],
  },
};

/** @param {string} raw */
export function resolveSupplySku(raw) {
  const key = String(raw || "extra").toLowerCase();
  for (const [sku, meta] of Object.entries(SUPPLY_SKUS)) {
    if (sku === key || meta.aliases.includes(key)) return sku;
  }
  return "extra";
}

export function supplyTitle(sku) {
  return SUPPLY_SKUS[resolveSupplySku(sku)]?.title || "Supplies";
}

export function suppliesTerminalHelp() {
  return [
    "Supplies for the road · Stripe Checkout (hosted by Stripe):",
    "  innsegall scout            · panic scout (opens checkout when quota blocks)",
    "  innsegall supplies extra   · panic scout",
    "  innsegall supplies clan     · clan passage",
    "  innsegall supplies msp      · MSP seats (set quantity in browser)",
    "  innsegall open supplies     · same toll gate on innsegall.com",
    "After pay · innsegall import · then innsegall run",
  ].join("\n");
}
