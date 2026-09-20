#!/usr/bin/env node
/**
 * Public web must not leak internal competitor / roadmap intel.
 * Scans marketing HTML (body-ish), llms.txt, ai-bus, and gospel JSON.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

const PUBLIC_JSON = [
  join(web, ".well-known", "innsegall-gospel.json"),
  join(web, "innsegall-ai-bus.json"),
  join(web, "llms.txt"),
];

const FORBIDDEN = [
  { id: "competitor_boat key", re: /"competitor_boat"/ },
  { id: "mac_lane_absorption", re: /mac_lane_absorption/ },
  { id: "their weakness", re: /their weakness/i },
  { id: "their_game", re: /"their_game"/ },
  { id: "our_boat column", re: /"our_boat"/ },
  { id: "endgame leak", re: /\bendgame\b/i },
  { id: "platform_order key", re: /"platform_order"/ },
  { id: "moat array", re: /"moat"\s*:/ },
  { id: "Xano ships", re: /Xano ships/i },
  { id: "our boat vs their war", re: /our boat vs their war/i },
  { id: "strategic fit inside a larger AV", re: /strategic fit inside a larger AV/i },
];

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL client-facing: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

function scanText(label, text) {
  for (const rule of FORBIDDEN) {
    if (rule.re.test(text)) {
      check(`${label} · no ${rule.id}`, false);
    }
  }
}

for (const path of PUBLIC_JSON) {
  const text = readFileSync(path, "utf8");
  scanText(path.split("/").slice(-2).join("/"), text);
}
check("public json scans", true);

const marketingPages = [
  "boat.html",
  "map.html",
  "warriors.html",
  "index.html",
  "guide.html",
];
for (const page of marketingPages) {
  const html = readFileSync(join(web, page), "utf8");
  const withoutGospel = html
    .replace(/<!-- INNSEGALL_GOSPEL_START -->[\s\S]*?<!-- INNSEGALL_GOSPEL_END -->/g, "")
    .replace(/<!-- INNSEGALL_AI_BUS_START -->[\s\S]*?<!-- INNSEGALL_AI_BUS_END -->/g, "");
  scanText(page, withoutGospel);
}

const blogBad = [];
function walkHtml(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p);
    else if (name.endsWith(".html")) {
      const html = readFileSync(p, "utf8");
      if (html.includes("see the full competitor map") || html.includes("Competitor map")) {
        blogBad.push(p.replace(web + "/", ""));
      }
    }
  }
}
walkHtml(join(web, "blog"));
check("blog no competitor-map CTA", blogBad.length === 0, blogBad.slice(0, 3).join(", "));

console.log(failed ? `\n${failed} client-facing failure(s)` : "\nClient-facing audit passed");
process.exit(failed ? 1 : 0);
