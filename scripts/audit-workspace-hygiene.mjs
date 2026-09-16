#!/usr/bin/env node
/**
 * Workspace hygiene · one canonical clone · no secrets in git · sane root layout.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL workspace: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const ALLOWED_ROOT_FILES = new Set([
  ".env.local",
  ".gitignore",
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md",
  "LICENSE",
  "README.md",
  "package-lock.json",
  "package.json",
]);

const ALLOWED_ROOT_DIRS = new Set([
  ".git",
  ".github",
  ".smoke",
  ".vercel",
  "bin",
  "docs",
  "fixtures",
  "node_modules",
  "packaging",
  "scripts",
  "src",
  "web",
]);

for (const name of readdirSync(root)) {
  const p = join(root, name);
  const st = statSync(p);
  if (st.isDirectory()) {
    check(`root dir allowed · ${name}`, ALLOWED_ROOT_DIRS.has(name));
  } else if (st.isFile()) {
    check(`root file allowed · ${name}`, ALLOWED_ROOT_FILES.has(name));
  }
}

check(".gitignore ignores .env*", readFileSync(join(root, ".gitignore"), "utf8").includes(".env"));
check(".gitignore ignores .smoke", readFileSync(join(root, ".gitignore"), "utf8").includes(".smoke"));
check(".gitignore ignores .vercel", readFileSync(join(root, ".gitignore"), "utf8").includes(".vercel"));

let trackedSecrets = "";
try {
  trackedSecrets = execSync("git ls-files '.env' '.env.local' 'web/.env.local'", {
    cwd: root,
    encoding: "utf8",
  }).trim();
} catch {
  trackedSecrets = "";
}
check("no tracked env files", !trackedSecrets, trackedSecrets || "");

const otherClones = [
  join(process.env.HOME || "", "SPQ", "innsegall"),
  join(process.env.HOME || "", "Desktop", "innsegall"),
];
const thisReal = root;
const siblings = otherClones.filter((p) => p !== thisReal && existsSync(join(p, ".git")));
if (siblings.length) {
  console.log(
    `note: other clone(s) detected · use one working copy · see docs/WORKSPACE_CANON.md`
  );
  for (const s of siblings) {
    console.log(`  · ${s}`);
  }
}

check("web/ is deploy root", existsSync(join(root, "web", "vercel.json")));
check("docs/WORKSPACE_CANON.md", existsSync(join(root, "docs", "WORKSPACE_CANON.md")));

if (failed) {
  console.error(`\n${failed} workspace hygiene failure(s)`);
  process.exit(1);
}
console.log("\nWorkspace hygiene passed");
