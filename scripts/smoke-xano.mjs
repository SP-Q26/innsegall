#!/usr/bin/env node
/**
 * Xano wire smoke · direct API + production telemetry forward.
 *
 * Usage:
 *   XANO_EVENTS_URL=... XANO_API_KEY=... node scripts/smoke-xano.mjs
 *   node scripts/smoke-xano.mjs --base=https://innsegall.com
 */
const args = process.argv.slice(2);
const baseArg = args.find((a) => a.startsWith("--base="));
const base = baseArg ? baseArg.split("=")[1].replace(/\/$/, "") : "https://innsegall.com";

const xanoUrl = process.env.XANO_EVENTS_URL;
const xanoKey = process.env.XANO_API_KEY;
const day = new Date().toISOString().slice(0, 10);

let failed = 0;

function ok(name) {
  console.log(`ok  ${name}`);
}

function fail(name, detail) {
  console.error(`FAIL ${name}${detail ? ` · ${detail}` : ""}`);
  failed++;
}

async function smokeDirectXano() {
  if (!xanoUrl) {
    console.log("skip direct Xano (set XANO_EVENTS_URL)");
    return;
  }
  const headers = { "Content-Type": "application/json" };
  if (xanoKey) headers["X-API-Key"] = xanoKey;

  const body = {
    event: "install_ping",
    payload: {
      engine_version: "0.4.0-alpha",
      macos_major: "14",
      day,
      install_id: "00000000-0000-4000-8000-smoke0001",
    },
    day,
    engine_version: "0.4.0-alpha",
    source: "manual_smoke",
    received_at: new Date().toISOString(),
  };

  const res = await fetch(xanoUrl, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) {
    fail("direct Xano POST", `${res.status} ${text.slice(0, 200)}`);
    return;
  }
  ok(`direct Xano POST ${res.status}`);
  if (!text.includes('"ok"') && !text.includes('"id"')) {
    fail("direct Xano response shape", text.slice(0, 120));
  } else {
    ok("direct Xano response ok/id");
  }

  // Forbidden key should 400
  const bad = await fetch(xanoUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      event: "install_ping",
      payload: { email: "nope@example.com", day },
      day,
      source: "manual_smoke",
    }),
  });
  if (bad.status >= 400 && bad.status < 500) {
    ok(`direct Xano rejects email in payload (${bad.status})`);
  } else {
    fail("direct Xano PII guard", `expected 4xx got ${bad.status}`);
  }
}

async function smokeProdTelemetry() {
  const res = await fetch(`${base}/api/telemetry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "install_ping",
      payload: {
        engine_version: "0.4.0-alpha",
        macos_major: "14",
        day,
        install_id: "00000000-0000-4000-8000-smoke0002",
      },
    }),
  });
  if (res.status === 204) {
    ok("prod telemetry 204 (XANO_EVENTS_URL not set on Vercel yet)");
    return;
  }
  if (res.status === 202) {
    const j = await res.json().catch(() => ({}));
    if (j.forwarded) ok("prod telemetry 202 forwarded to Xano");
    else fail("prod telemetry 202", "forwarded:false");
    return;
  }
  fail("prod telemetry", `status ${res.status}`);
}

console.log(`innsegall smoke-xano · ${base}\n`);
await smokeDirectXano();
await smokeProdTelemetry();
console.log(failed ? `\n${failed} fail` : "\nXano smoke passed");
process.exit(failed ? 1 : 0);
