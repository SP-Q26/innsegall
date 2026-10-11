#!/usr/bin/env node
/** llms.txt must stay aligned with watch-hub Field Glass (survives sync-gospel). */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const hub = JSON.parse(readFileSync(join(root, "fixtures", "watch-hub.json"), "utf8"));
const llms = readFileSync(join(root, "web", "llms.txt"), "utf8");
const latest = hub.latest_field_glass;
let failed = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

check("llms watch hub url", llms.includes("/watch"));
check("llms watch-feed.xml", llms.includes("/watch-feed.xml"));
check("llms latest Field Glass slug", llms.includes(`/blog/${latest.slug}`));
check("llms Safari field guides block", llms.includes("Safari field guides"));
check("llms Chrome Mac field guides block", llms.includes("Chrome on Mac field guides"));
check("llms AI helping order", llms.includes("If a human or AI is helping"));
check("llms someone-remoted guide", llms.includes("/blog/someone-remoted-into-my-mac"));

if (failed) process.exit(1);
console.log("llms watch canon audit passed");
