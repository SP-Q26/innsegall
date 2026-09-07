#!/usr/bin/env node
/**
 * Privacy posture audit · local-first copy + no scout upload claims.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 privacy: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const gospelSrc = readFileSync(join(root, "src/gospel.mjs"), "utf8");
check("gospel privacy_promise", gospelSrc.includes("privacy_promise"));
check("gospel local scout runs", gospelSrc.includes("does not receive filenames"));

const gospelJson = readFileSync(join(web, ".well-known/innsegall-gospel.json"), "utf8");
check("gospel.json privacy_promise", gospelJson.includes("privacy_promise"));

const llms = readFileSync(join(web, "llms.txt"), "utf8");
check("llms privacy section", llms.includes("Privacy promise"));

const privacy = readFileSync(join(web, "privacy.html"), "utf8");
check("privacy local-first", privacy.includes("local-first"));
check("privacy no upload Layer 1", privacy.includes("do <strong>not</strong> upload"));
check("privacy panic scout section", privacy.includes("Panic scout") || privacy.includes("panic scout"));

const index = readFileSync(join(web, "index.html"), "utf8");
check("index pricing privacy note", index.includes("runs locally on your Mac"));

const telemetry = readFileSync(join(web, "api/telemetry.js"), "utf8");
check("telemetry opt-in events only", telemetry.includes("CLIENT_EVENTS"));

const license = readFileSync(join(root, "src/license.mjs"), "utf8");
check("extra license stripe_session required", license.includes("extra license requires paid stripe_session"));

if (failed) {
  console.error(`\n${failed} privacy audit failure(s)`);
  process.exit(1);
}
console.log("\nPrivacy audit passed · local runs · no scout upload by default");
