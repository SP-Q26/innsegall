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

async function check(path) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    const text = await res.text();
    if (res.status < 200 || res.status >= 400) {
      console.error(`FAIL ${res.status} ${path}`);
      fail++;
      return;
    }
    if (path === "/" && !text.includes("Send the scout")) {
      console.error(`FAIL ${path} missing primary CTA copy`);
      fail++;
      return;
    }
    if (path === "/alpha" && !text.includes("innsegall-ai-bus")) {
      console.error(`FAIL ${path} missing ai-bus embed`);
      fail++;
      return;
    }
    if (path === "/innsegall-ai-bus.json") {
      try {
        const bus = JSON.parse(text);
        if (bus.schema !== "innsegall-ai-bus" || bus.primary_cta !== "Send the scout") {
          console.error(`FAIL ${path} invalid ai-bus schema or CTA`);
          fail++;
          return;
        }
      } catch {
        console.error(`FAIL ${path} invalid JSON`);
        fail++;
        return;
      }
    }
    if (path.endsWith(".css") && !text.includes("--sea-deep")) {
      console.error(`FAIL ${path} missing innsegall.css tokens`);
      fail++;
      return;
    }
    console.log(`ok  ${res.status} ${path}`);
    ok++;
  } catch (e) {
    console.error(`FAIL ${path} ${e.message}`);
    fail++;
  }
}

console.log(`innsegall smoke-live · ${base}\n`);
for (const p of PATHS) {
  await check(p);
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
    console.log("ok  checkout returns Stripe hosted URL");
    ok++;
  } else {
    console.error(`FAIL checkout ${res.status} ${JSON.stringify(data).slice(0, 120)}`);
    fail++;
  }
} catch (e) {
  console.error(`FAIL checkout probe ${e.message}`);
  fail++;
}

console.log(`\n${ok} ok · ${fail} fail`);
process.exit(fail ? 1 : 0);
