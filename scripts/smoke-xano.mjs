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

  // Auth lock · no key must be rejected (proves precondition is wired)
  const noKey = await fetch(xanoUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (noKey.status === 401 || noKey.status === 403) {
    ok(`direct Xano rejects missing X-API-Key (${noKey.status})`);
  } else {
    fail("direct Xano auth lock", `expected 401/403 without key, got ${noKey.status}`);
  }

  if (!xanoKey) {
    console.log("skip direct Xano insert (set XANO_API_KEY = value in Xano sk_live_innsegall_ops_)");
    return;
  }

  const headers = { "Content-Type": "application/json", "X-API-Key": xanoKey };

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
  for (const [label, body] of [
    [
      "install_ping",
      {
        event: "install_ping",
        payload: {
          engine_version: "0.4.0-alpha",
          macos_major: "14",
          day,
          install_id: "00000000-0000-4000-8000-smoke0002",
        },
      },
    ],
    [
      "marketing_ping",
      {
        event: "marketing_ping",
        payload: {
          day,
          page: "home",
          ref_channel: "direct",
          session_id: "00000000-0000-4000-8000-smoke0003",
        },
      },
    ],
    [
      "issue_spotlight",
      {
        event: "issue_spotlight",
        payload: {
          day,
          event_type: "identified",
          issue_key: "clicked_bad_link:browser_profile",
          issue_slug: "after-suspicious-link-macintosh",
          flow: "clicked_bad_link",
          attention_buckets: ["browser_profile"],
          fix_categories: ["credential_rotation"],
          engine_version: "0.4.0-alpha",
          content_hash: "smoke0004issue",
        },
      },
    ],
  ]) {
    const res = await fetch(`${base}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 204) {
      ok(`prod ${label} 204 (XANO_EVENTS_URL not set on Vercel yet)`);
      continue;
    }
    if (res.status === 202) {
      const j = await res.json().catch(() => ({}));
      if (j.forwarded) ok(`prod ${label} 202 forwarded to Xano`);
      else fail(`prod ${label} 202`, "forwarded:false");
      continue;
    }
    fail(`prod ${label}`, `status ${res.status}`);
  }
}

console.log(`innsegall smoke-xano · ${base}\n`);
await smokeDirectXano();
await smokeProdTelemetry();
console.log(failed ? `\n${failed} fail` : "\nXano smoke passed");
process.exit(failed ? 1 : 0);
