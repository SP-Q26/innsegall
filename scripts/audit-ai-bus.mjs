#!/usr/bin/env node
/**
 * AI-bus parity gate · JSON file, gospel sync, marketing embeds.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildInnsegallAiBus } from "../src/gospel.mjs";
import { ENGINE_VERSION } from "../src/constants.mjs";

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

const busPath = join(web, "innsegall-ai-bus.json");
check("ai-bus file exists", existsSync(busPath));

let fileBus;
try {
  fileBus = JSON.parse(readFileSync(busPath, "utf8"));
  check("ai-bus json parses", true);
} catch (e) {
  check("ai-bus json parses", false, e.message);
  fileBus = {};
}

check("ai-bus schema", fileBus.schema === "innsegall-ai-bus");
check("ai-bus version", fileBus.version === 1);
check("ai-bus primary_cta", fileBus.primary_cta === "Send the scout");
check("ai-bus engine_version", fileBus.engine_version === ENGINE_VERSION);
check("ai-bus contact", fileBus.contact === "hello@innsegall.com");
check(
  "ai-bus agent_surfaces",
  fileBus.agent_surfaces?.ai_bus === "#innsegall-ai-bus" &&
    fileBus.agent_surfaces?.ai_bus_json?.includes("innsegall-ai-bus.json") &&
    fileBus.agent_surfaces?.gospel_url?.includes("innsegall-gospel.json")
);
check("ai-bus agent_read_order", Array.isArray(fileBus.agent_read_order) && fileBus.agent_read_order.length >= 4);
check("ai-bus privacy_promise", fileBus.privacy_promise?.headline?.includes("Local runs"));

const canonBus = buildInnsegallAiBus();
const stripCompiled = (o) => {
  const { compiled_at, ...rest } = o;
  return rest;
};
const fileNorm = JSON.stringify(stripCompiled(fileBus));
const canonNorm = JSON.stringify(stripCompiled(canonBus));
check("ai-bus matches gospel builder", fileNorm === canonNorm);

const llms = readFileSync(join(web, "llms.txt"), "utf8");
check("llms.txt ai-bus mention", llms.includes("#innsegall-ai-bus") && llms.includes("__INNSEGALL_AI_BUS"));

const marketingPages = [
  "index.html",
  "alpha.html",
  "guide.html",
  "boat.html",
  "clan.html",
  "warriors.html",
  "map.html",
];
for (const page of marketingPages) {
  const html = readFileSync(join(web, page), "utf8");
  check(`${page} ai-bus markers`, html.includes("INNSEGALL_AI_BUS_START") && html.includes('id="innsegall-ai-bus"'));
  check(`${page} ai-bus window hook`, html.includes("window.__INNSEGALL_AI_BUS"));
  const match = html.match(/id="innsegall-ai-bus">(\{[\s\S]*?\})<\/script>/);
  if (match) {
    try {
      const embedded = JSON.parse(match[1]);
      check(`${page} embedded ai-bus schema`, embedded.schema === "innsegall-ai-bus");
      check(`${page} embedded primary_cta`, embedded.primary_cta === "Send the scout");
    } catch (e) {
      check(`${page} embedded ai-bus parses`, false, e.message);
    }
  } else {
    check(`${page} embedded ai-bus block`, false);
  }
}

if (failed) {
  console.error(`\n${failed} ai-bus audit failure(s) · run: npm run sync-gospel`);
  process.exit(1);
}
console.log("ok: ai-bus audit");
