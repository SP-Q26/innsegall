#!/usr/bin/env node
/** Innsegall glass + sword arrival · static audit */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let fail = 0;

function need(rel) {
  const p = join(WEB, rel);
  if (!existsSync(p)) {
    console.error("P0 MISSING", rel);
    fail++;
    return "";
  }
  return readFileSync(p, "utf8");
}

for (const r of [
  "inn-glass-arrival-lottie.js",
  "inn-glass-arrival.css",
  "lottie/inn-glass-arrival-lottie.json",
  "lottie/inn-glass-arrival-fallback.svg",
]) {
  need(r);
}

const js = need("inn-glass-arrival-lottie.js");
if (!js.includes("inn-glass-arrival-lottie.json")) fail++;
if (!js.includes("lottie.loadAnimation")) fail++;
if (!js.includes("HOLD_MS = 420") || !js.includes("WALL_MS = 1600")) fail++;

const css = need("inn-glass-arrival.css");
if (!css.includes("innGlassThrough")) fail++;

for (const page of ["index.html", "alpha.html"]) {
  const html = need(page);
  if (!html.includes("inn-glass-arrival")) fail++;
}

if (fail) process.exit(1);
console.log("OK glass + sword arrival audit (Innsegall)");
