#!/usr/bin/env node
/**
 * Public web must not leak internal competitor / roadmap intel or back-of-house ops copy.
 * Scans marketing HTML, all public HTML, llms.txt, ai-bus, and gospel JSON.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
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

/** Back-of-house · never on customer HTML (allowlisted slugs may discuss checkout ops). */
const BACK_OF_HOUSE = [
  { id: "home path leak", re: /\/Users\/[a-zA-Z0-9_-]+/ },
  { id: "sk_live ops key hint", re: /sk_live_innsegall/ },
  { id: "operator desk phrase", re: /operator desk/i },
  { id: "Most operators", re: /Most operators have/i },
  { id: "Xano vendor in copy", re: /\bXano\b/ },
  { id: "Stripe live aside", re: /Stripe live/i },
];

const STRIPE_LIVE_ALLOW = new Set([
  "blog/field-desk-stripe-live-sep-2026.html",
  "blog/field-glass-sep-19-2026.html",
  "blog/field-glass-sep-2026.html",
  "blog/field-glass-sep-22-2026.html",
]);

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL client-facing: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

function scanText(label, text, rules = FORBIDDEN) {
  for (const rule of rules) {
    if (rule.re.test(text)) {
      check(`${label} · no ${rule.id}`, false);
    }
  }
}

function stripEmbeddedAgentJson(html) {
  return html
    .replace(/<script type="application\/json" id="innsegall-gospel">[\s\S]*?<\/script>/gi, "")
    .replace(/<script type="application\/json" id="innsegall-ai-bus">[\s\S]*?<\/script>/gi, "");
}

function scanBackOfHouse(relPath, text) {
  const body = stripEmbeddedAgentJson(text);
  for (const rule of BACK_OF_HOUSE) {
    if (rule.id === "Stripe live aside" && STRIPE_LIVE_ALLOW.has(relPath)) continue;
    if (rule.re.test(body)) {
      check(`${relPath} · no ${rule.id}`, false);
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
  scanBackOfHouse(page, withoutGospel);
}

function walkHtml(dir, base = web) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, base);
    else if (name.endsWith(".html")) {
      const rel = relative(web, p).replace(/\\/g, "/");
      const html = readFileSync(p, "utf8");
      scanBackOfHouse(rel, html);
    }
  }
}
walkHtml(web);

const blogBad = [];
function walkBlogCompetitor(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkBlogCompetitor(p);
    else if (name.endsWith(".html")) {
      const html = readFileSync(p, "utf8");
      if (html.includes("see the full competitor map") || html.includes("Competitor map")) {
        blogBad.push(p.replace(web + "/", ""));
      }
    }
  }
}
walkBlogCompetitor(join(web, "blog"));
check("blog no competitor-map CTA", blogBad.length === 0, blogBad.slice(0, 3).join(", "));

console.log(failed ? `\n${failed} client-facing failure(s)` : "\nClient-facing audit passed");
process.exit(failed ? 1 : 0);
