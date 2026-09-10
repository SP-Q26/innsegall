#!/usr/bin/env node
/**
 * Install / bootstrap automation audit · one-click + curl + launchd path.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 install-flow: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const installSh = readFileSync(join(web, "scripts", "innsegall-alpha-install.sh"), "utf8");
const commandPath = join(web, "scripts", "Innsegall-Install.command");
const cli = readFileSync(join(root, "bin", "innsegall.mjs"), "utf8");
const alpha = readFileSync(join(web, "alpha.html"), "utf8");
const gospel = readFileSync(join(web, ".well-known", "innsegall-gospel.json"), "utf8");

check("Innsegall-Install.command exists", existsSync(commandPath));
if (existsSync(commandPath)) {
  const head = readFileSync(commandPath, "utf8").slice(0, 80);
  check(".command shebang", head.startsWith("#!/bin/bash"));
  check(".command curls install.sh", readFileSync(commandPath, "utf8").includes("innsegall-alpha-install.sh"));
}

check("install.sh bootstrap step", installSh.includes(" bootstrap"));
check("install.sh absolute node in wrapper", installSh.includes('NODE_BIN="$(command -v node)"'));
check("install.sh PATH for brew", installSh.includes("/opt/homebrew/bin"));
check(
  "install.sh uses linked CLI for bootstrap",
  installSh.includes("INNSEGALL_BIN") && installSh.includes('"${INNSEGALL_BIN}" bootstrap')
);

check("CLI bootstrap command", cli.includes('case "bootstrap"') || cli.includes('case "bootstrap":'));
check("CLI onboard alias", cli.includes('case "onboard"'));
check("voyage-schedule module", existsSync(join(root, "src", "voyage-schedule.mjs")));
check("bootstrap module", existsSync(join(root, "src", "bootstrap.mjs")));
check("APPLE_DEVELOPER_ID doc", existsSync(join(root, "docs", "APPLE_DEVELOPER_ID.md")));
check("INSTALL_WITHOUT_SIGNED_ZIP doc", existsSync(join(root, "docs", "INSTALL_WITHOUT_SIGNED_ZIP.md")));
check("alpha documents unsigned zip defer", alpha.includes("gatekeeper") || alpha.includes("Terminal"));
check("macos installer template", existsSync(join(root, "packaging/macos/app-template/Contents/MacOS/install")));
check("build-macos-installer script", existsSync(join(root, "scripts", "build-macos-installer-app.sh")));

check("alpha one-click CTA", alpha.includes("Innsegall-Install.command"));
check("alpha bootstrap mention", alpha.includes("bootstrap") || alpha.includes("welcome scout"));

check("gospel one_click url", gospel.includes("Innsegall-Install.command"));
check("gospel bootstrap step", gospel.includes("innsegall bootstrap"));

check("smoke-live lists .command", readFileSync(join(root, "scripts", "smoke-live.mjs"), "utf8").includes("Innsegall-Install.command"));

const vercel = readFileSync(join(web, "vercel.json"), "utf8");
check("scripts served (vercel.json present)", vercel.includes("rewrites") || existsSync(join(web, "scripts")));

if (failed) {
  console.error(`\n${failed} install-flow audit failure(s)`);
  process.exit(1);
}
console.log("\nInstall-flow audit passed · bootstrap + one-click path wired");
