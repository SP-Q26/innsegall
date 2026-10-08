#!/usr/bin/env node
/**
 * Live internal link crawl · innsegall.com paths from HTML + sitemap.
 * Usage: node scripts/smoke-links-live.mjs --base=https://innsegall.com
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = (
  process.argv.find((a) => a.startsWith("--base="))?.split("=").slice(1).join("=") ||
  "https://innsegall.com"
).replace(/\/$/, "");

const SKIP_EXT = /\.(css|js|png|jpg|jpeg|gif|svg|webmanifest|xml|json|txt|sh|command|mjs)$/i;
const MAIL_TEL = /^(mailto:|tel:)/;

function pathOnly(href) {
  const bare = href.split("#")[0].split("?")[0];
  return bare.replace(/\/$/, "") || "/";
}

function toInternalPath(href) {
  if (!href || MAIL_TEL.test(href)) return null;
  if (href.startsWith("/")) return pathOnly(href);
  if (href.startsWith(base)) return pathOnly(href.slice(base.length) || "/");
  return null;
}

function seedFromSitemap() {
  const xml = readFileSync(join(root, "web", "sitemap.xml"), "utf8");
  const paths = new Set(["/"]);
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const p = toInternalPath(m[1]);
    if (p) paths.add(p);
  }
  return paths;
}

function seedFromRepoBlog() {
  const blogDir = join(root, "web", "blog");
  return readdirSync(blogDir)
    .filter((n) => n.endsWith(".html") && n !== "index.html")
    .map((n) => `/blog/${n.replace(/\.html$/, "")}`);
}

function extractHrefs(html) {
  const out = [];
  for (const m of html.matchAll(/href=["']([^"']+)["']/gi)) out.push(m[1]);
  return out;
}

const queue = [...new Set([...seedFromSitemap(), ...seedFromRepoBlog()])];
const seen = new Set();
const discovered = new Set(queue);
let ok = 0;
let fail = 0;
const failures = [];

async function fetchPage(path) {
  const url = `${base}${path === "/" ? "" : path}`;
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  return { res, text, url };
}

console.log(`innsegall smoke-links-live · ${base}\n`);
console.log(`seed paths: ${queue.length}\n`);

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  if (path.startsWith("/api")) continue;

  try {
    const { res, text } = await fetchPage(path);
    if (res.status < 200 || res.status >= 400) {
      fail++;
      failures.push(`${res.status} ${path}`);
      continue;
    }
    ok++;
    for (const href of extractHrefs(text)) {
      const internal = toInternalPath(href);
      if (!internal) continue;
      if (SKIP_EXT.test(internal)) continue;
      if (internal.startsWith("/api")) continue;
      if (internal.startsWith("/.well-known/")) continue;
      if (internal.startsWith("/og/")) continue;
      if (internal.startsWith("/stripe/")) continue;
      if (!discovered.has(internal)) {
        discovered.add(internal);
        queue.push(internal);
      }
    }
  } catch (e) {
    fail++;
    failures.push(`${path} · ${e.message}`);
  }
}

console.log(`crawled ${seen.size} unique internal paths`);
console.log(`${ok} ok · ${fail} fail`);
if (failures.length) {
  console.error("\nFailures:");
  for (const f of failures.slice(0, 40)) console.error(`  FAIL ${f}`);
  if (failures.length > 40) console.error(`  … and ${failures.length - 40} more`);
}
process.exit(fail ? 1 : 0);
