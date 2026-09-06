/** Server copy · keep in sync with innsegall/src/license.mjs */
import { createHmac } from "node:crypto";

const VERIFY_SECRET =
  process.env.INNSEGALL_LICENSE_VERIFY_SECRET ||
  "innsegall-alpha-license-v1-do-not-forge";

function canonicalBody(payload) {
  return JSON.stringify({
    product: payload.product,
    plan: payload.plan,
    extra_credits: payload.extra_credits,
    seats: payload.seats,
    issued_at: payload.issued_at,
    valid_until: payload.valid_until,
    stripe_session: payload.stripe_session,
    stripe_subscription: payload.stripe_subscription,
  });
}

export function buildLicensePayload(opts) {
  const secret = process.env.INNSEGALL_LICENSE_SECRET || VERIFY_SECRET;
  const payload = {
    product: "Innsegall",
    plan: opts.plan,
    extra_credits: opts.extra_credits ?? 0,
    seats: opts.seats ?? (opts.plan === "clan" ? 5 : 1),
    issued_at: opts.issued_at || new Date().toISOString(),
    valid_until: opts.valid_until ?? null,
    stripe_session: opts.stripe_session || null,
    stripe_subscription: opts.stripe_subscription || null,
  };
  payload.sig = createHmac("sha256", secret)
    .update(canonicalBody(payload))
    .digest("base64url");
  return payload;
}
