#!/usr/bin/env node
/**
 * Launch readiness audit · exit 1 on P0 gaps in repo (not ops).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

function runSubAudit(script) {
  try {
    execSync(`node scripts/${script}`, { cwd: root, stdio: "inherit" });
  } catch {
    failed++;
  }
}

const requiredFiles = [
  "web/index.html",
  "web/alpha.html",
  "web/guide.html",
  "web/map.html",
  "web/boat.html",
  "web/clan.html",
  "web/warriors.html",
  "web/privacy.html",
  "web/tos.html",
  "web/success.html",
  "web/robots.txt",
  "web/innsegall.css",
  "web/favicon.svg",
  "web/site.webmanifest",
  "web/ai.txt",
  "web/og/innsegall-card.png",
  "web/innsegall-nav.js",
  "web/api/stripe/checkout.js",
  "web/api/stripe/webhook.js",
  "web/api/license.js",
  "web/api/telemetry.js",
  "web/api/parley.js",
  "web/scripts/innsegall-alpha-install.sh",
  "web/.well-known/innsegall-gospel.json",
  "web/.well-known/ai-discovery.json",
  "web/llms.txt",
  "web/innsegall-ai-bus.json",
  "web/sitemap.xml",
  "web/vercel.json",
  "web/blog/index.html",
];

for (const f of requiredFiles) {
  check(`exists ${f}`, existsSync(join(root, f)));
}

const vercel = JSON.parse(readFileSync(join(web, "vercel.json"), "utf8"));
const rewriteDests = (vercel.rewrites || []).map((r) => r.destination);
const requiredRewrites = [
  "/boat.html",
  "/guide.html",
  "/map.html",
  "/clan.html",
  "/warriors.html",
  "/success.html",
  "/alpha.html",
  "/privacy.html",
  "/tos.html",
];
for (const dest of requiredRewrites) {
  check(`vercel rewrite ${dest}`, rewriteDests.includes(dest));
}

const index = readFileSync(join(web, "index.html"), "utf8");
check("index gospel block", index.includes("INNSEGALL_GOSPEL_START"));
check("index ai-bus block", index.includes("INNSEGALL_AI_BUS_START"));
check("index css cache-bust", /innsegall\.css\?v=12/.test(index));
check("guide battle scout sample", /battle-scout-sample/.test(readFileSync(join(web, "guide.html"), "utf8")));
check("sample scout demo", existsSync(join(web, "samples/battle-scout-demo.html")));
check("index primary CTA", index.includes("Send the scout"));

const gospel = readFileSync(join(web, ".well-known", "innsegall-gospel.json"), "utf8");
check("gospel competitor_boat", gospel.includes("competitor_boat") || gospel.includes("agent_warriors"));
check("gospel privacy_promise", gospel.includes("privacy_promise"));

const install = readFileSync(join(web, "scripts/innsegall-alpha-install.sh"), "utf8");
check("install links innsegall bin", install.includes(".local/bin/innsegall"));

const sitemap = readFileSync(join(web, "sitemap.xml"), "utf8");
const sitemapRoutes = ["/alpha", "/guide", "/map", "/boat", "/clan", "/warriors", "/privacy", "/tos", "/blog"];
for (const route of sitemapRoutes) {
  check(`sitemap ${route}`, sitemap.includes(`https://innsegall.com${route}`));
}

const blogDir = join(web, "blog");
const blogPosts = readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html");
check("blog posts present", blogPosts.length >= 8, `found ${blogPosts.length}`);

runSubAudit("audit-seo.mjs");
runSubAudit("audit-social-preview.mjs");
runSubAudit("audit-abuse.mjs");
runSubAudit("audit-privacy.mjs");
runSubAudit("audit-ai-bus.mjs");
runSubAudit("audit-brand-ban.mjs");
runSubAudit("audit-claymore.mjs");
runSubAudit("audit-stripe.mjs");

if (failed) {
  console.error(`\n${failed} P0 audit failure(s)`);
  process.exit(1);
}
console.log("\nLaunch repo audit passed (ops: GitHub · Vercel · DNS · Stripe still manual)");
