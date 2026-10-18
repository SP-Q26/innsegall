#!/usr/bin/env node
/**
 * HEAD/GET probe of unique external https URLs in web HTML.
 * Usage: node scripts/smoke-external-links.mjs [--timeout=12000] [--concurrency=6]
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { collectAllWebUrls } from "./lib/collect-html-urls.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");

const timeoutMs = Number(process.argv.find((a) => a.startsWith("--timeout="))?.split("=")[1] || 12000);
const concurrency = Number(process.argv.find((a) => a.startsWith("--concurrency="))?.split("=")[1] || 6);

/** Hosts that often block bots; warn instead of fail on 403. */
const SOFT_403_HOSTS = new Set([
  "www.linkedin.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "www.facebook.com",
]);

/** Origin-only preconnect targets (HEAD / often 404; real assets use longer paths). */
const PRECONNECT_ORIGINS = new Set([
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
]);

/** Documented not live yet · warn only (see docs/PRE_L5_LEVERS.md T11). */
const PENDING_EXTERNAL = new Set(["https://github.com/SP-Q26/homebrew-innsegall"]);

function normalizeExternal(url) {
  return url.split("#")[0].trim();
}

async function probeUrl(url) {
  const signal = AbortSignal.timeout(timeoutMs);
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, { method, redirect: "follow", signal });
      if (method === "GET" && res.body) {
        try {
          await res.body.cancel();
        } catch {
          /* ignore */
        }
      }
      return { status: res.status, method };
    } catch (e) {
      if (method === "GET") throw e;
    }
  }
  throw new Error("probe failed");
}

function classifyResult(url, status) {
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return "fail";
  }
  if (status >= 200 && status < 400) return "ok";
  if (status === 405) return "ok";
  if (status === 403 && SOFT_403_HOSTS.has(host)) return "warn";
  if (status === 403 || status === 401) return "warn";
  if (status === 404 || status === 410 || status >= 500) return "fail";
  return "warn";
}

async function runPool(urls, worker) {
  const results = [];
  let i = 0;
  async function next() {
    while (i < urls.length) {
      const idx = i++;
      results[idx] = await worker(urls[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, () => next()));
  return results;
}

const { external } = collectAllWebUrls(web);
const urls = [...external].map(normalizeExternal).sort();

console.log(`innsegall smoke-external-links · ${urls.length} unique URLs · timeout ${timeoutMs}ms\n`);

const results = await runPool(urls, async (url) => {
  if (PRECONNECT_ORIGINS.has(url)) {
    return { url, status: null, method: "skip", bucket: "ok", error: null };
  }
  if (PENDING_EXTERNAL.has(url)) {
    return {
      url,
      status: null,
      method: "skip",
      bucket: "warn",
      error: "pending publish (not gated)",
    };
  }
  try {
    const { status, method } = await probeUrl(url);
    const bucket = classifyResult(url, status);
    return { url, status, method, bucket, error: null };
  } catch (e) {
    return { url, status: null, method: null, bucket: "fail", error: e.message };
  }
});

let ok = 0;
let warn = 0;
let fail = 0;
const failures = [];
const warnings = [];

for (const r of results) {
  if (r.bucket === "ok") ok++;
  else if (r.bucket === "warn") {
    warn++;
    warnings.push(r);
  } else {
    fail++;
    failures.push(r);
  }
}

console.log(`${ok} ok · ${warn} warn · ${fail} fail`);

if (warnings.length) {
  console.log("\nWarnings (review; not gated):");
  for (const w of warnings.slice(0, 15)) {
    console.log(`  WARN ${w.status ?? "—"} ${w.url}${w.error ? ` · ${w.error}` : ""}`);
  }
  if (warnings.length > 15) console.log(`  … and ${warnings.length - 15} more`);
}

if (failures.length) {
  console.error("\nFailures:");
  for (const f of failures) {
    console.error(`  FAIL ${f.status ?? "—"} ${f.url}${f.error ? ` · ${f.error}` : ""}`);
  }
  process.exit(1);
}

console.log("\nPASS");
process.exit(0);
