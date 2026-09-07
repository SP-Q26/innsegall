#!/usr/bin/env node
/**
 * Live site smoke · forked from SPQ smoke-ephemeris.mjs path list pattern.
 * Usage:
 *   node scripts/smoke-live.mjs --base=https://innsegall.com
 *   npm run smoke:live
 */
const PATHS = [
  "/",
  "/alpha",
  "/guide",
  "/map",
  "/boat",
  "/clan",
  "/warriors",
  "/privacy",
  "/tos",
  "/success",
  "/blog",
  "/llms.txt",
  "/innsegall-ai-bus.json",
  "/.well-known/innsegall-gospel.json",
  "/scripts/innsegall-alpha-install.sh",
  "/innsegall.css",
];

function getArg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
}

const base = (getArg("base", "https://innsegall.com") || "").replace(/\/$/, "");
let fail = 0;
let ok = 0;

function pass(msg) {
  console.log(`ok  ${msg}`);
  ok++;
}

function failMsg(msg) {
  console.error(`FAIL ${msg}`);
  fail++;
}

async function check(path) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const text = await res.text();
    if (res.status < 200 || res.status >= 400) {
      failMsg(`${res.status} ${path}`);
      return;
    }
    if (path === "/" && !text.includes("Send the scout")) {
      failMsg(`${path} missing primary CTA copy`);
      return;
    }
    if (path === "/alpha" && !text.includes("innsegall-ai-bus")) {
      failMsg(`${path} missing ai-bus embed`);
      return;
    }
    if (path === "/innsegall-ai-bus.json") {
      try {
        const bus = JSON.parse(text);
        if (bus.schema !== "innsegall-ai-bus" || bus.primary_cta !== "Send the scout") {
          failMsg(`${path} invalid ai-bus schema or CTA`);
          return;
        }
      } catch {
        failMsg(`${path} invalid JSON`);
        return;
      }
    }
    if (path === "/.well-known/innsegall-gospel.json") {
      try {
        const gospel = JSON.parse(text);
        const tel = gospel?.privacy_promise?.telemetry || "";
        if (!tel.includes("default") && !tel.includes("on by default")) {
          failMsg(`${path} telemetry policy not default-on in gospel`);
          return;
        }
      } catch {
        failMsg(`${path} invalid JSON`);
        return;
      }
    }
    if (path.endsWith(".css") && !text.includes("--fjord-deep")) {
      failMsg(`${path} missing innsegall.css design tokens`);
      return;
    }
    pass(`${res.status} ${path}`);
  } catch (e) {
    failMsg(`${path} ${e.message}`);
  }
}

console.log(`innsegall smoke-live · ${base}\n`);
for (const p of PATHS) {
  await check(p);
}

console.log("── www apex redirect ──");
try {
  const res = await fetch("https://www.innsegall.com/", { redirect: "manual" });
  if (res.status === 308 || res.status === 301) {
    pass(`www → apex ${res.status}`);
  } else {
    failMsg(`www redirect expected 308/301 got ${res.status}`);
  }
} catch (e) {
  failMsg(`www redirect ${e.message}`);
}

console.log("── Stripe checkout probe ──");
try {
  const res = await fetch(`${base}/api/stripe/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sku: "extra" }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 503 && data.error === "stripe_not_configured") {
    console.log("warn checkout 503 stripe_not_configured · set STRIPE_SECRET_KEY on Vercel");
  } else if (res.status === 200 && data.url?.includes("checkout.stripe.com")) {
    const mode = data.url.includes("/test/") ? "test" : "live";
    pass(`checkout returns Stripe hosted URL (${mode})`);
  } else {
    failMsg(`checkout ${res.status} ${JSON.stringify(data).slice(0, 120)}`);
  }
} catch (e) {
  failMsg(`checkout probe ${e.message}`);
}

console.log("── License API shape ──");
try {
  const res = await fetch(`${base}/api/license?session_id=not_a_stripe_session`);
  const data = await res.json().catch(() => ({}));
  if (res.status === 400 && data.error === "missing_session_id") {
    pass("license rejects bad session_id shape");
  } else if (res.status === 402 || res.status === 404) {
    pass("license reachable (stripe session lookup)");
  } else if (res.status === 503) {
    console.log("warn license 503 stripe_not_configured");
  } else {
    failMsg(`license ${res.status} ${JSON.stringify(data).slice(0, 80)}`);
  }
} catch (e) {
  failMsg(`license probe ${e.message}`);
}

console.log("── Webhook guard ──");
try {
  const res = await fetch(`${base}/api/stripe/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (res.status === 400 || res.status === 503) {
    pass(`webhook rejects unsigned POST (${res.status})`);
  } else {
    failMsg(`webhook expected 400/503 got ${res.status}`);
  }
} catch (e) {
  failMsg(`webhook probe ${e.message}`);
}

console.log("── Telemetry noop ──");
try {
  const res = await fetch(`${base}/api/telemetry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: "install_ping",
      payload: {
        engine_version: "0.4.0-alpha",
        macos_major: "14",
        day: new Date().toISOString().slice(0, 10),
        install_id: "smoke-live-probe",
      },
    }),
  });
  if (res.status === 204 || res.status === 202) {
    pass(`telemetry accepts install_ping (${res.status})`);
  } else {
    failMsg(`telemetry ${res.status}`);
  }
} catch (e) {
  failMsg(`telemetry probe ${e.message}`);
}

console.log(`\n${ok} ok · ${fail} fail`);
process.exit(fail ? 1 : 0);
