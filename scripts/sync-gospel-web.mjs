#!/usr/bin/env node
/**
 * Sync gospel assets to innsegall/web · run before deploy or after gospel edits.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  gospelJson,
  llmsTxt,
  renderGospelScriptBlock,
  renderAiBusScriptBlock,
  renderAgentHeadLinks,
  buildInnsegallAiBus,
  buildAiDiscovery,
} from "../src/gospel.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");

mkdirSync(join(web, ".well-known"), { recursive: true });
writeFileSync(join(web, ".well-known", "innsegall-gospel.json"), gospelJson(false) + "\n", "utf8");
writeFileSync(join(web, "llms.txt"), llmsTxt(), "utf8");
writeFileSync(
  join(web, "innsegall-ai-bus.json"),
  JSON.stringify(buildInnsegallAiBus(), null, 2) + "\n",
  "utf8"
);
writeFileSync(
  join(web, ".well-known", "ai-discovery.json"),
  JSON.stringify(buildAiDiscovery(), null, 2) + "\n",
  "utf8"
);

function injectBlock(filePath, startMarker, endMarker, block) {
  let html = readFileSync(filePath, "utf8");
  if (!html.includes(startMarker)) {
    const anchors = ['<link rel="icon"', '<link rel="stylesheet"'];
    let injected = false;
    for (const anchor of anchors) {
      if (html.includes(anchor)) {
        html = html.replace(anchor, `${block}\n  ${anchor}`);
        injected = true;
        break;
      }
    }
    if (!injected) {
      html = html.replace("</head>", `  ${block}\n</head>`);
    }
  } else {
    html = html.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), block);
  }
  writeFileSync(filePath, html, "utf8");
}

function injectAgentLinks(filePath) {
  const links = renderAgentHeadLinks().trim();
  let html = readFileSync(filePath, "utf8");
  if (html.includes("ai-discovery.json")) return;

  const legacyBlock =
    /<link rel="alternate" type="text\/plain" href="[^"]*\/llms\.txt"[^>]*>\s*<link rel="describedby" href="[^"]*\/innsegall-gospel\.json"[^>]*>\s*<link rel="alternate" type="application\/json" href="[^"]*\/innsegall-ai-bus\.json"[^>]*>/;
  if (legacyBlock.test(html)) {
    html = html.replace(legacyBlock, links);
  } else if (!html.includes("/llms.txt")) {
    const anchor = html.includes('<link rel="stylesheet"')
      ? '<link rel="stylesheet"'
      : "</head>";
    html = html.replace(anchor, `${links}\n  ${anchor}`);
  } else {
    html = html.replace(
      /(<link rel="alternate" type="application\/json" href="[^"]*\/innsegall-ai-bus\.json"[^>]*>)/,
      `$1\n  <link rel="alternate" type="text/plain" href="https://innsegall.com/ai.txt" title="Innsegall · AI discovery index">\n  <link rel="alternate" type="application/json" href="https://innsegall.com/.well-known/ai-discovery.json" title="Innsegall · AI discovery manifest">`
    );
  }
  writeFileSync(filePath, html, "utf8");
}

const gospelStart = "<!-- INNSEGALL_GOSPEL_START -->";
const gospelEnd = "<!-- INNSEGALL_GOSPEL_END -->";
const gospelBlock = `${gospelStart}\n${renderGospelScriptBlock()}\n  ${gospelEnd}`;

const busStart = "<!-- INNSEGALL_AI_BUS_START -->";
const busEnd = "<!-- INNSEGALL_AI_BUS_END -->";
const busBlock = `${busStart}\n${renderAiBusScriptBlock()}\n  ${busEnd}`;

for (const page of [
  "index.html",
  "alpha.html",
  "guide.html",
  "boat.html",
  "clan.html",
  "warriors.html",
  "map.html",
  "privacy.html",
  "tos.html",
  "blog/index.html",
]) {
  const pagePath = join(web, page);
  injectAgentLinks(pagePath);
  injectBlock(pagePath, gospelStart, gospelEnd, gospelBlock);
  injectBlock(pagePath, busStart, busEnd, busBlock);
}

console.log(
  "gospel synced:",
  join(web, "llms.txt"),
  join(web, ".well-known", "innsegall-gospel.json"),
  join(web, ".well-known", "ai-discovery.json"),
  join(web, "innsegall-ai-bus.json")
);
