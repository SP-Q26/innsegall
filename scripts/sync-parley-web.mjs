#!/usr/bin/env node
/** Copy Parley + constants into web/lib for Vercel (project root = web). */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "web", "lib", "parley");
mkdirSync(dest, { recursive: true });

writeFileSync(join(dest, "constants.mjs"), readFileSync(join(root, "src", "constants.mjs"), "utf8"));

for (const file of ["prompt.mjs", "static.mjs"]) {
  let code = readFileSync(join(root, "src", "parley", file), "utf8");
  code = code.replaceAll('from "../constants.mjs"', 'from "./constants.mjs"');
  writeFileSync(join(dest, file), code, "utf8");
}

console.log("sync-parley-web · web/lib/parley ready");
