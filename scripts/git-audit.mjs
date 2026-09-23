#!/usr/bin/env node
/**
 * Full git audit · identity · sync with origin · workspace hygiene · PII scan on staged diff.
 * Usage: npm run audit:git
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function run(name, cmd, { allowFail = false } = {}) {
  try {
    execSync(cmd, { cwd: root, stdio: "inherit" });
    return true;
  } catch {
    if (!allowFail) {
      console.error(`FAIL git-audit · ${name}`);
      failed++;
    }
    return false;
  }
}

function sh(cmd) {
  return execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
}

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  Innsegall git audit (main)                                  ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

const branch = sh("git branch --show-current");
const upstream = sh("git rev-parse --abbrev-ref @{u} 2>/dev/null || echo none");
console.log(`branch · ${branch} · upstream · ${upstream}`);

try {
  sh("git fetch origin main --quiet");
} catch {
  console.log("note: git fetch skipped (offline or no remote)");
}

const ahead = sh("git rev-list --count origin/main..HEAD 2>/dev/null || echo 0");
const behind = sh("git rev-list --count HEAD..origin/main 2>/dev/null || echo 0");
console.log(`sync · ahead ${ahead} · behind ${behind}`);
if (Number(behind) > 0) {
  console.error("FAIL git-audit · branch behind origin/main · git pull");
  failed++;
}
if (Number(ahead) > 0) {
  const authors = sh("git log origin/main..HEAD --format='%ae | %an'");
  for (const line of authors.split("\n").filter(Boolean)) {
    const [email, name] = line.split("|").map((s) => s.trim());
    if (!email?.includes("@users.noreply.github.com")) {
      console.error(`FAIL git-audit · unpushed author · ${email} · ${name}`);
      failed++;
    }
  }
}

const porcelain = sh("git status --porcelain");
const unstagedDirty = porcelain
  .split("\n")
  .filter(Boolean)
  .some((line) => line.startsWith("??") || (line.length > 1 && line[1] !== " "));
if (porcelain) {
  if (unstagedDirty) {
    console.log("\nworking tree (unstaged or untracked):");
    console.log(porcelain);
    console.error("FAIL git-audit · commit or stash unstaged changes first");
    failed++;
  } else {
    console.log("ok: staged changes only (ready to commit)");
  }
  const scanPaths = sh("git diff --cached --name-only")
    .split("\n")
    .filter((f) => f && !f.endsWith("git-audit.mjs") && !f.endsWith("check-git-identity.mjs"));
  const staged = scanPaths.length ? sh(`git diff --cached -- ${scanPaths.join(" ")}`) : "";
  const added = staged.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++"));
  const secretLine =
    /@gmail\.|@icloud\.|@me\.com|@hotmail\.|@proton|sk_live_[a-zA-Z0-9]{8,}|whsec_[a-zA-Z0-9]{8,}/i;
  if (added.some((l) => secretLine.test(l))) {
    console.error("FAIL git-audit · staged diff may contain PII or secrets");
    failed++;
  }
} else {
  console.log("ok: working tree clean");
}

run("check:git-identity", "npm run check:git-identity");
run("audit:workspace", "npm run audit:workspace");

const head = sh("git rev-parse --short HEAD");
const originHead = sh("git rev-parse --short origin/main 2>/dev/null || echo unknown");
console.log(`\nHEAD ${head} · origin/main ${originHead}`);

if (existsSync(join(root, "CANONICAL_CLONE.md"))) {
  console.error(
    "FAIL git-audit · remove CANONICAL_CLONE.md from this clone · edit ~/innsegall or ~/Desktop/innsegall only"
  );
  failed++;
}

if (failed) {
  console.error(`\n${failed} git-audit failure(s)`);
  process.exit(1);
}
console.log("\nGit audit passed");
