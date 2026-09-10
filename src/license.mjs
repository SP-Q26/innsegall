/**
 * Signed license.json · Stripe success → local quota unlock.
 * Alpha: HMAC-SHA256 with INNSEGALL_LICENSE_SECRET (server) embedded verify key in CLI.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expandHome } from "./shell.mjs";
import { setPlan, addExtraCredits } from "./quota.mjs";
import { ensureDirs, supportPath } from "./storage.mjs";

const REDEMPTIONS_FILE = "license-redemptions.json";

/** Public verify secret baked for alpha · replace with asymmetric keys in prod. */
export const LICENSE_VERIFY_SECRET =
  process.env.INNSEGALL_LICENSE_VERIFY_SECRET ||
  "innsegall-alpha-license-v1-do-not-forge";

export function buildLicensePayload(opts) {
  const payload = {
    product: "Innsegall",
    plan: opts.plan,
    extra_credits: opts.extra_credits ?? 0,
    seats:
      opts.seats ??
      (opts.plan === "msp" ? 10 : opts.plan === "clan" ? 5 : 1),
    issued_at: opts.issued_at || new Date().toISOString(),
    valid_until: opts.valid_until ?? null,
    stripe_session: opts.stripe_session || null,
    stripe_subscription: opts.stripe_subscription || null,
  };
  payload.sig = signPayload(payload);
  return payload;
}

function signPayload(payload) {
  const secret = process.env.INNSEGALL_LICENSE_SECRET || LICENSE_VERIFY_SECRET;
  const body = canonicalBody(payload);
  return createHmac("sha256", secret).update(body).digest("base64url");
}

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

function redemptionsPath() {
  return join(supportPath(), REDEMPTIONS_FILE);
}

function loadRedemptions() {
  ensureDirs();
  const path = redemptionsPath();
  if (!existsSync(path)) {
    return { sessions: [], subscriptions: [] };
  }
  try {
    const raw = JSON.parse(readFileSync(path, "utf8"));
    return {
      sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
      subscriptions: Array.isArray(raw.subscriptions) ? raw.subscriptions : [],
    };
  } catch {
    return { sessions: [], subscriptions: [] };
  }
}

function saveRedemptions(data) {
  ensureDirs();
  writeFileSync(redemptionsPath(), JSON.stringify(data, null, 2), "utf8");
}

function redemptionKey(license) {
  if (license.stripe_session) return { kind: "sessions", id: license.stripe_session };
  if (license.stripe_subscription) return { kind: "subscriptions", id: license.stripe_subscription };
  return null;
}

export function isAlphaVerifySecret() {
  return !process.env.INNSEGALL_LICENSE_VERIFY_SECRET;
}

export function verifyLicense(license) {
  if (!license?.sig || !license?.plan) return { ok: false, error: "missing fields" };
  if (license.valid_until && new Date(license.valid_until) < new Date()) {
    return { ok: false, error: "license expired" };
  }
  const expected = signPayload(license);
  try {
    const a = Buffer.from(license.sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, error: "invalid signature" };
    }
  } catch {
    return { ok: false, error: "invalid signature" };
  }
  return { ok: true };
}

export function importLicenseFile(filePath) {
  const raw = readFileSync(expandHome(filePath), "utf8");
  const license = JSON.parse(raw);
  const v = verifyLicense(license);
  if (!v.ok) throw new Error(v.error);

  if (isAlphaVerifySecret() && process.env.INNSEGALL_WARN_ALPHA_SECRET !== "0") {
    console.warn(
      "License verify uses alpha default secret · set INNSEGALL_LICENSE_VERIFY_SECRET in production builds."
    );
  }

  const key = redemptionKey(license);
  if (key) {
    const redeemed = loadRedemptions();
    if (redeemed[key.kind].includes(key.id)) {
      throw new Error("license already redeemed on this Mac");
    }
    redeemed[key.kind] = [...redeemed[key.kind], key.id];
    saveRedemptions(redeemed);
  }

  if (license.plan === "clan" || license.plan === "msp") {
    if (!license.stripe_session && !license.stripe_subscription) {
      throw new Error("paid roster license requires stripe_session or stripe_subscription");
    }
    setPlan(license.plan, { seats: license.seats });
    const seats = license.seats || (license.plan === "msp" ? 10 : 5);
    return {
      plan: license.plan,
      message:
        license.plan === "msp"
          ? `MSP roster activated · unlimited scouts · ${seats} seats billed`
          : "Clan plan activated · unlimited scouts",
    };
  }
  if (license.plan === "extra" || license.extra_credits > 0) {
    if (!license.stripe_session) {
      throw new Error("extra license requires paid stripe_session");
    }
    const n = Math.min(Math.max(0, license.extra_credits || 1), 1);
    addExtraCredits(n);
    return { plan: "extra", credits: n, message: `Added ${n} extra scout credit(s)` };
  }
  throw new Error("unknown license plan");
}
