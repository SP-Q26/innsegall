#!/usr/bin/env node
/** Parley serverless handler must import cleanly (Vercel FUNCTION_INVOCATION_FAILED guard). */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`FAIL parley-api: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const src = readFileSync(join(root, "web", "api", "parley.js"), "utf8");
const source = readFileSync(join(root, "web", "lib", "parley", "parley-api.source.js"), "utf8");

check("parley source exists", existsSync(join(root, "web", "lib", "parley", "parley-api.source.js")));
check("parley source lib imports", source.includes('from "./prompt.mjs"'));
check("forbidden ../../lib in source", !source.includes("../../lib/parley-rate-limit"));
check("web/lib/parley prompt", existsSync(join(root, "web", "lib", "parley", "prompt.mjs")));
check("parley bundled marker", src.includes("bundle-parley-api.mjs"));
check("parley bundled export", src.includes("export default") || src.includes("handler as default"));
check("forbidden ../../lib in bundle", !src.includes("../../lib/parley-rate-limit"));

try {
  await import(join(root, "web", "api", "parley.js"));
  check("parley.js module loads", true);
} catch (e) {
  check("parley.js module loads", false);
  console.error(e.message);
}

if (failed) process.exit(1);
console.log("parley API audit passed");
