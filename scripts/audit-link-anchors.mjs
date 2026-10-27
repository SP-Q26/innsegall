#!/usr/bin/env node
/**
 * Internal hash links · id anchors must exist on target pages.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { walkHtml, pathOnly, routeExists, resolvePageFile } from "./lib/audit-link-routes.mjs";
import { collectUrlsFromHtml } from "./lib/collect-html-urls.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const hub = JSON.parse(
  readFileSync(join(root, "fixtures", "home-panic-funnel.json"), "utf8")
);

const REQUIRED = new Map([
  ["/ios", ["install-companion", "bad-link", "fake-popup", "typed-password"]],
  ["/tablet", ["install-companion", "bad-link", "fake-popup", "typed-password"]],
  ["/companion", ["install-companion", "companion-device-guide", "main"]],
  ["/", ["start-here", "main"]],
]);

for (const a of hub.avenues) {
  const path = pathOnly(a.href);
  const hash = a.href.split("#")[1];
  if (!hash) continue;
  if (!REQUIRED.has(path)) REQUIRED.set(path, []);
  const list = REQUIRED.get(path);
  if (!list.includes(hash)) list.push(hash);
}

function pageHasId(html, id) {
  return new RegExp(`\\bid="${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(html);
}

let failed = 0;
const seen = new Set();

for (const file of walkHtml(web)) {
  const rel = file.replace(web + "/", "");
  if (rel.startsWith("samples/")) continue;
  const html = readFileSync(file, "utf8");
  for (const raw of collectUrlsFromHtml(html)) {
    if (!raw.startsWith("/") || !raw.includes("#")) continue;
    const path = pathOnly(raw);
    const hash = raw.split("#")[1]?.split("?")[0];
    if (!hash || hash === "main") continue;
    const key = `${path}#${hash}`;
    if (seen.has(key)) continue;
    if (!routeExists(web, path)) continue;
    const target = resolvePageFile(web, path);
    const targetHtml = readFileSync(target, "utf8");
    if (!pageHasId(targetHtml, hash)) {
      console.error(`FAIL anchor: ${key} (linked from ${rel})`);
      failed++;
      seen.add(key);
    }
  }
}

for (const [path, ids] of REQUIRED) {
  const target = resolvePageFile(web, path);
  const targetHtml = readFileSync(target, "utf8");
  for (const id of ids) {
    if (!pageHasId(targetHtml, id)) {
      console.error(`FAIL required anchor: ${path}#${id}`);
      failed++;
    } else {
      console.log(`ok: required ${path}#${id}`);
    }
  }
}

if (failed) {
  console.error(`\n${failed} anchor failure(s)`);
  process.exit(1);
}
console.log("\nLink anchor audit passed");
