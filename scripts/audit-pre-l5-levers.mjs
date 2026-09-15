#!/usr/bin/env node
/**
 * Pre-L5 lever audit · repo-owned gates before Apple Developer enrollment.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 pre-l5: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const preL5 = readFileSync(join(root, "docs", "PRE_L5_LEVERS.md"), "utf8");
const phase7 = existsSync(join(root, "docs", "PHASE_7_PLAN.md"))
  ? readFileSync(join(root, "docs", "PHASE_7_PLAN.md"), "utf8")
  : "";
const distro = readFileSync(join(root, "docs", "DISTRIBUTION_PLAYBOOK.md"), "utf8");
const gospel = readFileSync(join(root, "src", "gospel.mjs"), "utf8");
const cli = readFileSync(join(root, "bin", "innsegall.mjs"), "utf8");
const installSh = readFileSync(join(root, "web", "scripts", "innsegall-alpha-install.sh"), "utf8");

check("PRE_L5_LEVERS.md exists", preL5.includes("T01") && preL5.includes("L5"));
check("PRE_L5 no em dash", !preL5.includes("—"));
check("PHASE_7 no stale 5 queued copy", !phase7.includes("5 queued competitor"));
check("PHASE_7 O1 shipped wording", phase7.includes("mac_lane_absorption shipped"));
check("DISTRIBUTION primary install is curl", distro.includes("innsegall-alpha-install.sh"));
check(
  "DISTRIBUTION defers signed zip pre-L5",
  distro.includes("After L5") || distro.includes("pre-L5") || distro.includes("404")
);
check("gospel no queued absorption", !gospel.includes('status: "queued"'));
check("self-update in CLI", cli.includes("tryGitFastForward"));
check("open panic in CLI", cli.includes('case "open"') && cli.includes("buy=extra"));
check("install.sh panic hint", installSh.includes("?buy=extra"));
check("HOMEBREW formula", existsSync(join(root, "packaging", "homebrew", "innsegall.rb")));
check("INSTALL_WITHOUT_SIGNED_ZIP", existsSync(join(root, "docs", "INSTALL_WITHOUT_SIGNED_ZIP.md")));

if (failed) {
  console.error(`\n${failed} pre-l5 audit failure(s)`);
  process.exit(1);
}
console.log("\nPre-L5 lever audit passed · repo gates aligned");
