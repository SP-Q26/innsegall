#!/usr/bin/env node
/**
 * Ease-of-use audit · panic scout must be one command / mist-gate prompt, not paste URLs.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 ease-of-use: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const cli = readFileSync(join(root, "bin", "innsegall.mjs"), "utf8");
const terminal = readFileSync(join(root, "src", "terminal.mjs"), "utf8");
const installSh = readFileSync(join(root, "web", "scripts", "innsegall-alpha-install.sh"), "utf8");
const promptMod = readFileSync(join(root, "src", "extra-scout-prompt.mjs"), "utf8");

check("CLI scout command", cli.includes('case "scout"'));
check("mist gate offers prompt module", cli.includes("offerExtraScoutAtMistGate"));
check("open panic uses Stripe checkout", cli.includes('openStripeCheckout("extra"'));
check("extra-scout press 1 hint", promptMod.includes("press 1 or type scout"));
check("mist gate backup option", promptMod.includes("BACKUP_MENU_HINT") && promptMod.includes("isBackupMenuChoice"));
check("backup playbook module", readFileSync(join(root, "src", "backup-playbook.mjs"), "utf8").includes("Time Machine"));
check("CLI backup command", cli.includes('case "backup"'));
check("guide backup section", readFileSync(join(root, "web", "guide.html"), "utf8").includes('id="backup"'));
check("formatQuotaTerminal scout hint", terminal.includes("innsegall scout") || terminal.includes("EXTRA_SCOUT_MENU_LINE"));
check(
  "install.sh no paste buy=extra",
  !installSh.includes('open "${SITE_URL}/?buy=extra"') && installSh.includes("innsegall scout")
);
check(
  "terminal plan status no paste buy=extra",
  !terminal.includes('open "${PRICING.site_url}/?buy=extra"')
);
check(
  "CLI voyage off-day no paste buy=extra",
  !cli.includes('Panic now · open "${PRICING.site_url}/?buy=extra"')
);

if (failed) {
  console.error(`\n${failed} ease-of-use audit failure(s)`);
  process.exit(1);
}
console.log("\nEase-of-use audit passed · panic scout via scout command + mist gate");
