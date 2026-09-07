#!/usr/bin/env node
/** Reject commits with personal/machine git identity (repo gate). */
import { execSync } from "node:child_process";

const bad = /(@gmail\.|@icloud\.|@me\.com|@hotmail\.|\.lan>|\.local>)/i;

try {
  const log = execSync("git log -5 --format=%ae|%an", { encoding: "utf8" }).trim().split("\n");
  let failed = 0;
  for (const line of log) {
    const [email, name] = line.split("|");
    if (!email?.includes("@users.noreply.github.com") || bad.test(email) || bad.test(name || "")) {
      console.error(`FAIL: git identity · ${email} · ${name}`);
      failed++;
    }
  }
  if (failed) {
    console.error("\nSet repo-local: git config user.email 293159210+SP-Q26@users.noreply.github.com");
    process.exit(1);
  }
  console.log("ok: git identity (last 5 commits)");
} catch {
  console.log("skip: not a git repo");
}
