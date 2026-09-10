#!/usr/bin/env node
/**
 * L2 dry-run matrix · FREE_LANE_SPRINT.md
 * Rehearses license, CLI, handoff, and Xano wire without live charges.
 */
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const support =
  process.env.INNSEGALL_SUPPORT_DIR || join(root, ".smoke", "self-test-support");

const steps = [
  { name: "License / credits dry-test", cmd: "node scripts/dry-test-license.mjs" },
  { name: "AI handoff audit", cmd: "node scripts/audit-ai-handoff.mjs" },
  { name: "Battle Scout smoke", cmd: "node scripts/smoke.mjs" },
  {
    name: "CLI self-test",
    cmd: "node scripts/self-test.mjs",
    env: { INNSEGALL_SUPPORT_DIR: support },
  },
  { name: "Xano wire (live)", cmd: "npm run diagnose:xano", optional: true },
];

let failed = 0;

console.log("innsegall dry-run-lanes · L2 matrix\n");

for (const step of steps) {
  console.log(`── ${step.name} ──`);
  try {
    execSync(step.cmd, {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, ...step.env },
    });
    console.log(`ok · ${step.name}\n`);
  } catch (e) {
    if (step.optional) {
      console.log(`warn · ${step.name} (optional · check network / XANO env)\n`);
    } else {
      failed++;
      console.error(`FAIL · ${step.name}\n`);
    }
  }
}

if (failed) {
  console.error(`${failed} required dry-run step(s) failed`);
  process.exit(1);
}

console.log("dry-run-lanes PASS · ops rehearsal green");
