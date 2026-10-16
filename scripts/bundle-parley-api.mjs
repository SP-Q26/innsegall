#!/usr/bin/env node
/** Bundle Parley for Vercel · single api/parley.js with ai-bus JSON inlined. */
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const entry = join(web, "lib", "parley", "parley-api.source.js");
const out = join(web, "api", "parley.js");

const esbuildPkg = join(root, "node_modules", "esbuild");
let build;
try {
  ({ build } = await import(pathToFileURL(join(esbuildPkg, "lib", "main.js")).href));
} catch {
  execSync("npm install --no-save esbuild@0.25.9", { cwd: root, stdio: "inherit" });
  ({ build } = await import(pathToFileURL(join(esbuildPkg, "lib", "main.js")).href));
}

await build({
  entryPoints: [entry],
  outfile: out,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  loader: { ".json": "json" },
  banner: { js: "// @generated bundle-parley-api.mjs · do not edit\n" },
});

console.log("bundle-parley-api · web/api/parley.js ready");
