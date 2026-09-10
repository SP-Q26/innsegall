#!/usr/bin/env node
/**
 * Xano wire diagnostic · explains 204 / 202 / 502 on /api/telemetry.
 *
 * Usage:
 *   node scripts/diagnose-xano-wire.mjs
 *   node scripts/diagnose-xano-wire.mjs --base=https://innsegall.com
 */
const base = (
  process.argv.find((a) => a.startsWith("--base="))?.split("=").slice(1).join("=") ||
  "https://innsegall.com"
).replace(/\/$/, "");

const day = new Date().toISOString().slice(0, 10);
const body = {
  event: "install_ping",
  payload: {
    engine_version: "0.4.0-alpha",
    macos_major: "14",
    day,
    install_id: "00000000-0000-4000-8000-diagnose01",
  },
};

function step(title) {
  console.log(`\n── ${title} ──`);
}

async function main() {
  console.log(`innsegall diagnose-xano-wire · ${base}`);
  console.log("Docs: docs/XANO_KEYS_LEFT.md\n");

  step("Production telemetry POST");
  let prodStatus;
  let prodJson = {};
  try {
    const res = await fetch(`${base}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    prodStatus = res.status;
    const text = await res.text();
    try {
      prodJson = JSON.parse(text);
    } catch {
      prodJson = { raw: text.slice(0, 200) };
    }
    console.log(`status: ${prodStatus}`);
    if (Object.keys(prodJson).length) console.log(JSON.stringify(prodJson, null, 2));
  } catch (e) {
    console.error(`fetch failed: ${e.message}`);
    process.exit(1);
  }

  if (prodStatus === 204) {
    console.log("\n✓ OK (noop): XANO_EVENTS_URL not set on Vercel · telemetry accepted but not forwarded.");
    console.log("  Fix: Vercel → XANO_EVENTS_URL + XANO_API_KEY → redeploy.");
    return;
  }

  if (prodStatus === 202 && prodJson.forwarded) {
    console.log("\n✓ OK: Vercel → Xano forward live.");
    return;
  }

  if (prodStatus === 502) {
    console.log("\n✗ 502 forward_failed · Vercel has XANO_EVENTS_URL but Xano rejected the request.");
    console.log("\nMost common fixes (in order):");
    console.log("  1. Vercel XANO_API_KEY must equal the VALUE stored in Xano env sk_live_innsegall_ops_");
    console.log("     (not the Meta API key · not a JWT · exact string match)");
    console.log("  2. Xano endpoint stack = docs/pastes/innsegall-events-post.xs · publish draft → live");
    console.log("  3. Turn OFF default JWT auth on POST /innsegall/events");
    console.log("  4. Redeploy Vercel after env change");
    console.log("\nLocal verify:");
    console.log("  export XANO_EVENTS_URL='https://x8ki-letl-twmt.n7.xano.io/api:innsegall_ops/innsegall/events'");
    console.log("  export XANO_API_KEY='<same as Xano sk_live_innsegall_ops_ value>'");
    console.log("  npm run smoke:xano");
    if (prodJson.hint === "xano_key_mismatch") {
      console.log("\n  Server hint: xano_key_mismatch (403/401 from Xano)");
    }
    process.exit(1);
  }

  console.log(`\nUnexpected status ${prodStatus} · run npm run smoke:xano with env vars set.`);
  process.exit(1);
}

await main();
