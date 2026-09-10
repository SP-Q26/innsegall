#!/usr/bin/env node
/** Internal link integrity · marketing HTML surfaces. */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

const PAGE_ROUTES = new Set([
  "/",
  "/alpha",
  "/guide",
  "/stability",
  "/map",
  "/boat",
  "/clan",
  "/warriors",
  "/blog",
  "/privacy",
  "/tos",
  "/success",
  "/llms.txt",
  "/ai.txt",
  "/innsegall-ai-bus.json",
  "/samples/battle-scout-demo",
]);

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function pathOnly(href) {
  const bare = href.split("#")[0].split("?")[0];
  return bare.replace(/\/$/, "") || "/";
}

function isStaticAsset(path) {
  if (path.startsWith("/og/")) return true;
  if (path.startsWith("/scripts/")) return true;
  if (path.startsWith("/.well-known/")) return true;
  if (/\.(css|svg|png|jpg|webmanifest|js|json|txt|xml)$/i.test(path)) return true;
  return false;
}

function resolvePageFile(path) {
  if (path === "/") return join(web, "index.html");
  if (path.startsWith("/blog/")) return join(web, path.slice(1) + ".html");
  return join(web, path.replace(/^\//, "") + ".html");
}

for (const file of walkHtml(web)) {
  if (file.includes("/samples/")) continue;
  const rel = file.replace(web + "/", "");
  const html = readFileSync(file, "utf8");
  const hrefs = [...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    const path = pathOnly(href);
    if (isStaticAsset(path)) continue;
    if (PAGE_ROUTES.has(path)) continue;
    if (path.startsWith("/blog/")) {
      const blogPath = join(web, path.slice(1) + ".html");
      if (!existsSync(blogPath)) {
        console.error(`FAIL link: ${rel} → ${href} (missing file)`);
        failed++;
      }
      continue;
    }
    console.error(`FAIL link: ${rel} → ${href} (unknown route)`);
    failed++;
  }
}

const sitemap = readFileSync(join(web, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const url of urls) {
  const path = url.replace("https://innsegall.com", "") || "/";
  if (path.startsWith("/blog/")) {
    if (!existsSync(join(web, path.slice(1) + ".html")) && path !== "/blog") {
      console.error(`FAIL sitemap: ${path}`);
      failed++;
    }
    continue;
  }
  if (path.startsWith("/.well-known/") || path.startsWith("/og/") || path.startsWith("/api/")) continue;
  if (path.startsWith("/samples/")) {
    const samplePath = join(web, path.slice(1));
    if (!existsSync(samplePath)) {
      console.error(`FAIL sitemap file: ${path}`);
      failed++;
    }
    continue;
  }
  if (path === "/blog") {
    if (!existsSync(join(web, "blog/index.html"))) failed++;
    continue;
  }
  const filePath = resolvePageFile(path);
  if (!existsSync(filePath) && !["/llms.txt", "/ai.txt", "/innsegall-ai-bus.json"].includes(path)) {
    console.error(`FAIL sitemap file: ${path}`);
    failed++;
  }
}

console.log(failed ? `\n${failed} link audit failure(s)` : "Link audit passed");
process.exit(failed ? 1 : 0);
