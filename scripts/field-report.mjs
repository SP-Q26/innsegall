#!/usr/bin/env node
/**
 * Field Report social bot · local operator CLI.
 * Generates anonymized daily blog markdown. Never uploads telemetry.
 *
 *   node innsegall/scripts/field-report.mjs
 *   node innsegall/scripts/field-report.mjs --out public/innsegall/blog
 *   node innsegall/scripts/field-report.mjs --dry-run
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildFieldReportMarkdown, writeFieldReport } from "../src/field-report.mjs";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const defaultOut = join(pkgRoot, "web", "blog");

const flags = { dryRun: false, out: defaultOut, date: null };
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a === "--dry-run") flags.dryRun = true;
  else if (a === "--out" && process.argv[i + 1]) flags.out = process.argv[++i];
  else if (a === "--date" && process.argv[i + 1]) flags.date = process.argv[++i];
}

const md = buildFieldReportMarkdown({ date: flags.date });

if (flags.dryRun) {
  console.log(md);
  process.exit(0);
}

const result = writeFieldReport(flags.out, { date: flags.date });
console.log(`Field Report written · ${result.mdPath}`);
console.log("No user data leaves this machine unless you git-push the markdown yourself.");
