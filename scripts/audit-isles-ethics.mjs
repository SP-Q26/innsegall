#!/usr/bin/env node
/**
 * Isles portfolio + ethics canon audit · entity ladder · gospel forbidden · stripe truth.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { INNSEGALL_GOSPEL } from "../src/gospel.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 isles-ethics: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const portfolioPath = join(root, "docs/ISLES_PORTFOLIO.md");
check("ISLES_PORTFOLIO.md exists", existsSync(portfolioPath));

if (existsSync(portfolioPath)) {
  const portfolio = readFileSync(portfolioPath, "utf8");
  check("portfolio Isles + DBA", portfolio.includes("Isles") && portfolio.includes("DBA"));
  check("portfolio tripwire 800", portfolio.includes("800"));
  check("portfolio tripwire 3-4k", portfolio.includes("3") && portfolio.includes("4k"));
  check("portfolio split on risk", portfolio.toLowerCase().includes("split") || portfolio.includes("spin-out"));
  check("portfolio MMI separate", portfolio.includes("MMI") && portfolio.toLowerCase().includes("do not"));
  check("portfolio ethics section", portfolio.toLowerCase().includes("ethics"));
  check("portfolio no skeleton framing", portfolio.toLowerCase().includes("skeleton") || portfolio.includes("acquirable"));
  check("portfolio SPQ sister note", portfolio.includes("SPQ") || portfolio.includes("spquant"));
  check("portfolio ships.network", portfolio.includes("ships.network"));
  check("portfolio audit commands", portfolio.includes("audit-isles-ethics"));
  check("portfolio launchpad link", portfolio.includes("isles/LAUNCHPAD") || portfolio.includes("juvenile"));
}

const stripeState = readFileSync(join(root, "docs/STRIPE_CATALOG_STATE.md"), "utf8");
check("STRIPE_CATALOG operator truth", /operator truth/i.test(stripeState) && stripeState.includes("ISLES_PORTFOLIO"));

const llc = readFileSync(join(root, "docs/LLC_NOTES.md"), "utf8");
check("LLC_NOTES links portfolio", llc.includes("ISLES_PORTFOLIO"));

const mustNot = INNSEGALL_GOSPEL.ai_triage_onboarding?.agent_must_not || [];
check("gospel agent_must_not", mustNot.length >= 3);
check(
  "gospel no scareware support",
  mustNot.some((f) => String(f).toLowerCase().includes("scareware") || String(f).toLowerCase().includes("offshore"))
);

const ethics = INNSEGALL_GOSPEL.ethics || [];
check("gospel ethics bullets", Array.isArray(ethics) && ethics.length >= 3);

check("CODE_OF_CONDUCT.md", existsSync(join(root, "CODE_OF_CONDUCT.md")));
check("AI_HANDOFF_ONBOARDING.md", existsSync(join(root, "docs/AI_HANDOFF_ONBOARDING.md")));
check("STABILITY.md", existsSync(join(root, "docs/STABILITY.md")));

if (failed) {
  console.error(`\n${failed} isles-ethics audit failure(s)`);
  process.exit(1);
}
console.log("\nIsles ethics audit passed · portfolio canon + gospel floor");
