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
const vercel = JSON.parse(readFileSync(join(root, "web", "vercel.json"), "utf8"));
check("rate limit import path", src.includes('from "../lib/parley-rate-limit.mjs"'));
check("forbidden ../../lib import", !src.includes("../../lib/parley-rate-limit"));
check("web/lib/parley prompt", existsSync(join(root, "web", "lib", "parley", "prompt.mjs")));
check(
  "vercel parley includeFiles web lib",
  String(vercel.functions?.["api/parley.js"]?.includeFiles || "").includes("lib/parley")
);
check("parley uses web lib imports", src.includes('from "../lib/parley/prompt.mjs"'));

try {
  await import(join(root, "web", "api", "parley.js"));
  check("parley.js module loads", true);
} catch (e) {
  check("parley.js module loads", false);
  console.error(e.message);
}

if (failed) process.exit(1);
console.log("parley API audit passed");
