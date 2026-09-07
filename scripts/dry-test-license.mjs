#!/usr/bin/env node
/**
 * Dry test · license signing, verification, replay, operator gates (no Stripe network).
 */
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";

const supportDir = mkdtempSync(join(tmpdir(), "innsegall-dry-"));
process.env.INNSEGALL_LICENSE_SECRET = "dry-test-secret-32-chars-minimum!!";
process.env.INNSEGALL_LICENSE_VERIFY_SECRET = process.env.INNSEGALL_LICENSE_SECRET;
process.env.INNSEGALL_SUPPORT_DIR = supportDir;

const { buildLicensePayload, verifyLicense, importLicenseFile } = await import("../src/license.mjs");
const { loadQuota, saveQuota, checkScoutQuota, recordScoutUse } = await import("../src/quota.mjs");

let failed = 0;
function assert(name, ok) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const sessionId = `cs_test_dry_${Date.now()}`;
const extra = buildLicensePayload({
  plan: "extra",
  extra_credits: 1,
  stripe_session: sessionId,
});
assert("build extra license", extra.plan === "extra" && extra.sig);

const verifyOk = verifyLicense(extra);
assert("verify valid license", verifyOk.ok);

const tampered = { ...extra, extra_credits: 99 };
assert("reject tampered credits", !verifyLicense(tampered).ok);

const licensePath = join(supportDir, "innsegall-license.json");
writeFileSync(licensePath, JSON.stringify(extra, null, 2));
saveQuota({ ...loadQuota(), welcome_scout_redeemed: true, extra_credits: 0, extra_used: 0 });

const imported = importLicenseFile(licensePath);
assert("import adds credits", imported.plan === "extra" && imported.credits === 1);

let replayErr = "";
try {
  importLicenseFile(licensePath);
} catch (e) {
  replayErr = e.message;
}
assert("replay blocked locally", replayErr.includes("already redeemed"));

const bin = join(process.cwd(), "bin/innsegall.mjs");
const childEnv = { ...process.env, INNSEGALL_SUPPORT_DIR: supportDir };
let creditBlocked = "";
try {
  execSync(`node ${bin} plan --credit 5`, { encoding: "utf8", stdio: "pipe", env: childEnv });
} catch (e) {
  creditBlocked = e.stderr || e.stdout || "";
}
assert("plan --credit blocked without operator", /operator-only/i.test(creditBlocked));

let creditOk = "";
try {
  creditOk = execSync(`node ${bin} plan --credit 1`, {
    encoding: "utf8",
    env: { ...childEnv, INNSEGALL_OPERATOR: "1" },
  });
} catch {
  creditOk = "";
}
assert("plan --credit allowed for operator", /Added 1 extra scout credit/.test(creditOk));

// Panic scout quota · no free runs off voyage day after welcome spent
saveQuota({
  ...loadQuota(),
  month: "2026-09",
  welcome_scout_redeemed: true,
  voyage_completed: [1, 15],
  extra_credits: 0,
  extra_used: 0,
});
const offDay = new Date(2026, 8, 10);
const blockedPanic = checkScoutQuota({ date: offDay });
assert("panic blocked off voyage day", !blockedPanic.allowed && blockedPanic.reason === "off_voyage_day");

saveQuota({
  ...loadQuota(),
  welcome_scout_redeemed: true,
  voyage_completed: [1, 15],
  extra_credits: 1,
  extra_used: 0,
});
const panicOk = checkScoutQuota({ date: offDay });
assert("paid credit unlocks panic scout", panicOk.allowed && panicOk.reason === "extra_credit");
recordScoutUse({ charge: { type: "extra" } });
const panicSpent = checkScoutQuota({ date: offDay });
assert("panic blocked after credit consumed", !panicSpent.allowed);

// Extra license without stripe_session rejected
const noSession = buildLicensePayload({ plan: "extra", extra_credits: 1 });
const noSessionPath = join(supportDir, "no-session-license.json");
writeFileSync(noSessionPath, JSON.stringify(noSession, null, 2));
let noSessionErr = "";
try {
  importLicenseFile(noSessionPath);
} catch (e) {
  noSessionErr = e.message;
}
assert("extra license requires stripe_session", /stripe_session/i.test(noSessionErr));

// Tampered credit count in signed payload fails verify (already tested) · cap at 1 on import
const overCredit = buildLicensePayload({
  plan: "extra",
  extra_credits: 99,
  stripe_session: `cs_test_over_${Date.now()}`,
});
// Re-sign won't work with tampered body - test server would never issue 99. Simulate max cap:
const capPath = join(supportDir, "cap-license.json");
writeFileSync(capPath, JSON.stringify(overCredit, null, 2));
saveQuota({ ...loadQuota(), welcome_scout_redeemed: true, extra_credits: 0, extra_used: 0 });
const capped = importLicenseFile(capPath);
assert("extra import capped at 1 credit", capped.credits === 1);

const telemetryPath = join(process.cwd(), "web/api/telemetry.js");
const telemetry = readFileSync(telemetryPath, "utf8");
assert("telemetry server-only checkout", telemetry.includes("server_only"));

rmSync(supportDir, { recursive: true, force: true });

if (failed) {
  console.error(`\n${failed} dry-test failure(s)`);
  process.exit(1);
}
console.log("\nLicense dry-test passed");
