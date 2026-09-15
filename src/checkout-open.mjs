/**
 * Open Stripe Checkout from the CLI · one hop to checkout.stripe.com.
 * Used when quota blocks a scout or user runs `innsegall buy`.
 */
import { execSync } from "node:child_process";
import { PRICING } from "./constants.mjs";
import { paint, ansi } from "./terminal.mjs";

const SKU_ALIASES = {
  extra: "extra",
  panic: "extra",
  scout: "extra",
  clan: "clan",
  msp: "msp",
};

export function normalizeCheckoutSku(raw) {
  const key = String(raw || "extra").toLowerCase();
  return SKU_ALIASES[key] || "extra";
}

export function checkoutSkuLabel(sku) {
  if (sku === "clan") return `Clan · $${PRICING.clan.usd_monthly.toFixed(2)}/mo`;
  if (sku === "msp") return "MSP seats";
  return `Panic scout · $${PRICING.extra_run.usd.toFixed(2)}`;
}

/**
 * @param {string} sku
 * @param {{ warrior_ref?: string; quantity?: number }} opts
 */
export async function fetchCheckoutUrl(sku, opts = {}) {
  const normalized = normalizeCheckoutSku(sku);
  const base = PRICING.site_url.replace(/\/$/, "");
  const body = { sku: normalized, warrior_ref: opts.warrior_ref || "" };
  if (normalized === "msp" && opts.quantity) body.quantity = opts.quantity;

  const res = await fetch(`${base}/api/stripe/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("checkout_response_invalid");
  }
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || "checkout_failed");
  }
  return data.url;
}

function shouldSkipBrowserOpen(opts = {}) {
  if (opts.noCheckout) return true;
  if (process.env.INNSEGALL_NO_CHECKOUT_OPEN === "1") return true;
  return false;
}

/**
 * @param {string} sku
 * @param {{ quiet?: boolean; noCheckout?: boolean; warrior_ref?: string; quantity?: number }} opts
 */
export async function openStripeCheckout(sku, opts = {}) {
  const normalized = normalizeCheckoutSku(sku);
  const label = checkoutSkuLabel(normalized);

  if (!opts.quiet) {
    console.error(
      paint(
        ansi.mist,
        `\nNext step · Stripe Checkout (${label}) · hosted by Stripe, not a mystery download.`
      )
    );
    console.error(
      paint(
        ansi.dim,
        "innsegall.com only creates the payment link · your scout still runs locally after you import the license."
      )
    );
  }

  const url = await fetchCheckoutUrl(normalized, opts);

  if (shouldSkipBrowserOpen(opts)) {
    if (!opts.quiet) console.error(paint(ansi.beam, url));
    return url;
  }

  if (process.platform === "darwin") {
    execSync(`open "${url}"`, { stdio: "ignore" });
    if (!opts.quiet) {
      console.error(
        paint(
          ansi.aurora,
          "Browser opened · complete payment · then:\n  innsegall import\n  innsegall run"
        )
      );
    }
  } else if (!opts.quiet) {
    console.error(paint(ansi.beam, url));
  }

  return url;
}
