#!/usr/bin/env node
/**
 * Abuse / exploit path audit · credits must flow through Stripe → signed license only.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 abuse: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const telemetry = readFileSync(join(web, "api/telemetry.js"), "utf8");
check("telemetry blocks checkout_complete client", telemetry.includes('error: "server_only"'));
check("telemetry PII denylist", telemetry.includes("FORBIDDEN_KEYS"));
check("telemetry path rejection", telemetry.includes("PATH_LIKE"));
check("telemetry marketing_ping enum", telemetry.includes("marketing_ping") && telemetry.includes("MARKETING_PAGES"));
check("telemetry issue_spotlight enum", telemetry.includes("issue_spotlight") && telemetry.includes("validateIssueSpotlight"));

const parley = readFileSync(join(web, "api/parley.js"), "utf8");
check("parley rate limit", parley.includes("rate_limited") && parley.includes("checkParleyRateLimit"));
check("parley message cap", parley.includes(".slice(0, 2000)"));
check("parley discovery GET", parley.includes('req.method === "GET"'));

const checkout = readFileSync(join(web, "api/stripe/checkout.js"), "utf8");
check("checkout requires stripe key", checkout.includes("stripe_not_configured"));
check("checkout no promo codes", checkout.includes("allow_promotion_codes: false"));

const licenseApi = readFileSync(join(web, "api/license.js"), "utf8");
check("license requires paid session", licenseApi.includes("payment_incomplete"));
check("license session id prefix", licenseApi.includes('startsWith("cs_")'));
check("license uses HMAC builder", licenseApi.includes("buildLicensePayload"));

const bin = readFileSync(join(root, "bin/innsegall.mjs"), "utf8");
check("plan --credit operator gated", bin.includes('requireOperator("innsegall plan --credit")'));
check("plan --clan operator gated", bin.includes('requireOperator("innsegall plan --clan")'));

const quota = readFileSync(join(root, "src/quota.mjs"), "utf8");
check("clan env bypass operator gated", quota.includes("isOperatorMode()") && quota.includes("INNSEGALL_CLAN"));

const srcLicense = readFileSync(join(root, "src/license.mjs"), "utf8");
check("license replay guard", srcLicense.includes("license already redeemed"));
check("license timing-safe verify", srcLicense.includes("timingSafeEqual"));
check("extra license stripe_session gate", srcLicense.includes("extra license requires paid stripe_session"));
check("extra credit cap at import", srcLicense.includes("Math.min"));

const operator = readFileSync(join(root, "src/operator.mjs"), "utf8");
check("operator mode flag", operator.includes('INNSEGALL_OPERATOR === "1"'));

check("ai-discovery manifest", existsSync(join(web, ".well-known/ai-discovery.json")));
check("favicon svg", existsSync(join(web, "favicon.svg")));
check("web manifest", existsSync(join(web, "site.webmanifest")));
check("ai.txt", existsSync(join(web, "ai.txt")));

if (failed) {
  console.error(`\n${failed} abuse audit failure(s)`);
  process.exit(1);
}
console.log("\nAbuse audit passed · paid credits via Stripe license only");
