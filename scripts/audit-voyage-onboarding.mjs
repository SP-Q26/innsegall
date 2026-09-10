#!/usr/bin/env node
/** Phase 8 · Voyage rhythm surfaced on alpha + guide after install. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");
let failed = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`P0 voyage-onboarding: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const guide = readFileSync(join(web, "guide.html"), "utf8");
const alpha = readFileSync(join(web, "alpha.html"), "utf8");

check("guide voyage rhythm section", guide.includes("id=\"voyage-rhythm\""));
check("guide bootstrap schedule", guide.includes("innsegall voyage --install-schedule"));
check("guide voyage blog link", guide.includes("/blog/voyage-health-tracker-1st-15th"));

check("alpha voyage onboarding anchor", alpha.includes("id=\"voyage-onboarding\""));
check("alpha bootstrap mentioned", alpha.includes("innsegall bootstrap"));
check("alpha 1st and 15th", /1st.*15th/i.test(alpha));

console.log(failed ? `\n${failed} voyage-onboarding failure(s)` : "\nVoyage onboarding audit passed");
process.exit(failed ? 1 : 0);
