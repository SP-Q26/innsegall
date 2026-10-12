#!/usr/bin/env node
/**
 * vercel.json route sources · must pass Vercel path-to-regexp (CLI deploy validates strictly).
 * Git-connected deploys may have shipped invalid patterns until manual `vercel deploy`.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL vercel-routes: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const vercel = JSON.parse(readFileSync(join(web, "vercel.json"), "utf8"));

/** Patterns that broke deploy (Vercel CLI 63+): PCRE-style extension groups. */
const FORBIDDEN_SOURCE = [
  { id: "extension-alternation", re: /\(svg\|png|webp\|ico/ },
  { id: "pcre-extension-group", re: /\(.*\\\./ },
];

function auditSources(label, entries) {
  for (const [i, entry] of (entries || []).entries()) {
    const source = entry?.source;
    if (!source || typeof source !== "string") {
      check(`${label}[${i}] source string`, false);
      continue;
    }
    for (const ban of FORBIDDEN_SOURCE) {
      if (ban.re.test(source)) {
        check(`${label}[${i}] source`, false, `forbidden ${ban.id}: ${source}`);
      }
    }
    if (source.includes("(.*") && source.includes("|")) {
      check(`${label}[${i}] source`, false, `alternation inside (.*): ${source}`);
    }
  }
}

auditSources("headers", vercel.headers);
auditSources("redirects", vercel.redirects);
auditSources("rewrites", vercel.rewrites);

const headers = vercel.headers || [];
const imageExt = [".svg", ".png", ".webp", ".ico"];
for (const ext of imageExt) {
  const literal = ext.slice(1);
  check(
    `image cache header /:path*.${literal}`,
    headers.some((h) => h.source === `/:path*.${literal}`)
  );
}

const badImageRegex = headers.some((h) => /\(.*\\\./.test(h.source || ""));
check("no legacy image regex header", !badImageRegex);

const globalSecurity = headers.find((h) => h.source === "/(.*)");
check("global security headers /(.*)", Boolean(globalSecurity?.headers?.length));

const samplesFrame = headers.find((h) => h.source === "/samples/(.*)");
check("samples iframe CSP", samplesFrame?.headers?.some((x) => x.key === "Content-Security-Policy"));

if (process.env.VERCEL_ROUTE_BUILD_AUDIT === "1") {
  const { execSync } = await import("node:child_process");
  try {
    execSync("npx vercel@63.1.2 build --yes", { cwd: root, stdio: "pipe" });
    check("vercel build validates vercel.json", true);
  } catch (e) {
    const msg = String(e.stderr || e.stdout || e.message || "");
    check("vercel build validates vercel.json", false, msg.split("\n").slice(-3).join(" "));
  }
}

if (failed) process.exit(1);
console.log("vercel routes audit passed");
