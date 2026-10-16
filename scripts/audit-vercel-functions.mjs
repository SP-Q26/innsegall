#!/usr/bin/env node
/**
 * Hobby plan guard · max 12 Serverless Functions per deployment.
 * Counts web/api JS files that export a default handler (deploy endpoints).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiRoot = join(root, "web", "api");
const MAX_HOBBY = 12;
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 vercel-functions: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else console.log(`ok: ${name}`);
}

function walkApi(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkApi(p, out);
    else if (name.endsWith(".js")) out.push(p);
  }
  return out;
}

const endpoints = [];
for (const file of walkApi(apiRoot)) {
  const rel = relative(join(root, "web"), file).replace(/\\/g, "/");
  const src = readFileSync(file, "utf8");
  if (!/export\s+default|export\s*\{\s*handler\s+as\s+default/.test(src)) {
    check(`non-endpoint in api (${rel})`, false, "move out of web/api or remove default export");
    continue;
  }
  endpoints.push(rel);
}

check(`serverless count <= ${MAX_HOBBY}`, endpoints.length <= MAX_HOBBY, `${endpoints.length}: ${endpoints.join(", ")}`);
check("no parley.bundled in api", !endpoints.some((e) => e.includes("parley.bundled")));
check("no parley.source in api", !endpoints.some((e) => e.includes("parley.source")));

if (failed) {
  console.error(`\n${failed} vercel function audit failure(s)`);
  process.exit(1);
}
console.log(`\nVercel functions audit OK · ${endpoints.length}/${MAX_HOBBY} slots`);
