#!/usr/bin/env node
/**
 * Innsegall CLI · Battle Scout for Macintosh · v0.4
 */

import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCard } from "../src/card.mjs";
import { ENGINE_VERSION, FLOWS, PRICING } from "../src/constants.mjs";
import { renderHtml, renderMarkdown } from "../src/render.mjs";
import { loadHistorySeries, renderChartPage } from "../src/history-chart.mjs";
import { expandHome, platformVersion, sh } from "../src/shell.mjs";
import {
  checkScoutQuota,
  formatPlanStatus,
  loadQuota,
  recordScoutUse,
  setPlan,
  addExtraCredits,
  voyageSlotForDate,
  nextVoyageDate,
  VOYAGE_DAYS,
} from "../src/quota.mjs";
import { listCards, loadCardById, saveCard, supportPath } from "../src/storage.mjs";
import { runParley } from "../src/parley/index.mjs";
import { validateCard } from "../src/validate.mjs";
import { importLicenseFile } from "../src/license.mjs";

function usage() {
  console.log(`Innsegall ${ENGINE_VERSION} · know you're okay.

  innsegall run [options]           Check + HTML card + open (full send)
  innsegall check [options]         Run read-only check → Battle Scout JSON
  innsegall render <card.json>      Export markdown / HTML
  innsegall show <card_id>          Show saved card from history
  innsegall history                 List saved cards
  innsegall voyage [options]         Scheduled hygiene (1st & 15th) · opens Battle Scout in browser
  innsegall chart [options]         Sea-map health history (HTML)
  innsegall parley [options]        Plan AI Parley assist (dry-run default)
  innsegall smoke [options]          Full smoke sweep (tier fixtures + gates)
  innsegall flows                   List flow names
  innsegall runes                    Read the runes · Macintosh ready for a scout?
  innsegall plan [options]          Scout quota · free 2/mo · clan unlimited
    --import-license <file.json>    Apply Stripe license after checkout

Check / run options:
  --flow <name>        mac_hygiene | clicked_bad_link | project_safe
  --project <path>     Watch a git repo (Flow C)
  --out <file.json>    Write card JSON
  --entered-password   ESCALATE: password entered on suspicious page
  --downloaded-file    Flag suspicious download + scan Downloads
  --quiet              JSON only on stdout (check)

Render options:
  --md <file.md>       Markdown export
  --html <file.html>   Styled HTML (Print → PDF in browser)
  --open               Open HTML in browser (macOS)

  --smoke              Inject tier fixtures (bypass quota)
  --force              Bypass scout quota (dev only)

Plan options:
  --clan               Activate clan plan locally (alpha · after purchase)
  --credit <n>         Grant extra scout credits (alpha · after $4.20 payment)
  --free               Reset to free tier

Voyage options:
  --install-schedule   Install launchd job (1st & 15th at 10:00)
  --quiet              Less console output (scheduled voyage still opens browser)
  --no-open            Skip opening Battle Scout in browser

Examples:
  innsegall voyage
  innsegall voyage --install-schedule
  innsegall plan --credit 1
  innsegall run --flow clicked_bad_link
  innsegall parley --card ~/Desktop/card.json --intent explain_evidence
  innsegall check --flow project_safe --project ~/SPQ --out ~/Desktop/card.json
  innsegall render ~/Desktop/card.json --html ~/Desktop/battle-scout.html --open
`);
}

function parseFlags(argv, start = 2) {
  const flags = { _: [] };
  for (let i = start; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--flow" && argv[i + 1]) flags.flow = argv[++i];
    else if (a === "--project" && argv[i + 1]) flags.project = argv[++i];
    else if (a === "--out" && argv[i + 1]) flags.out = argv[++i];
    else if (a === "--md" && argv[i + 1]) flags.md = argv[++i];
    else if (a === "--html" && argv[i + 1]) flags.html = argv[++i];
    else if (a === "--entered-password") flags.enteredPassword = true;
    else if (a === "--downloaded-file") flags.downloadedFile = true;
    else if (a === "--quiet") flags.quiet = true;
    else if (a === "--open") flags.open = true;
    else if (a === "--card" && argv[i + 1]) flags.card = argv[++i];
    else if (a === "--intent" && argv[i + 1]) flags.intent = argv[++i];
    else if (a === "--message" && argv[i + 1]) flags.message = argv[++i];
    else if (a === "--execute") flags.execute = true;
    else if (a === "--json") flags.json = true;
    else if (a === "--smoke") flags.smoke = true;
    else if (a === "--force") flags.force = true;
    else if (a === "--clan") flags.clan = true;
    else if (a === "--free") flags.free = true;
    else if (a === "--credit" && argv[i + 1]) flags.credit = Number(argv[++i]);
    else if (a === "--install-schedule") flags.installSchedule = true;
    else if (a === "--no-open") flags.noOpen = true;
    else if (a === "--import-license" && argv[i + 1]) flags.importLicense = argv[++i];
    else if (a === "--help" || a === "-h") flags.help = true;
    else if (!a.startsWith("-")) flags._.push(a);
  }
  return flags;
}

function writeParent(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function defaultOutPath(flow) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return join(homedir(), "Desktop", `innsegall-${flow}-${stamp}.json`);
}

function defaultHtmlPath(jsonPath) {
  return jsonPath.replace(/\.json$/i, ".html");
}

function cmdCheck(flags) {
  const flow = flags.flow || "mac_hygiene";
  if (!FLOWS[flow]) {
    console.error(`Unknown flow: ${flow}`);
    process.exit(1);
  }

  const quotaOpts = {
    smoke: Boolean(flags.smoke),
    force: Boolean(flags.force),
    voyage: Boolean(flags.voyage),
  };
  const gate = checkScoutQuota(quotaOpts);
  if (!gate.allowed) {
    console.error(gate.message || "Scout quota exceeded.");
    process.exit(2);
  }

  const project = flags.project ? expandHome(flags.project) : null;
  const card = buildCard({
    flow,
    projectPath: project,
    userInputs: {
      entered_password: flags.enteredPassword,
      downloaded_file: flags.downloadedFile,
    },
    smoke: Boolean(flags.smoke),
    voyage: Boolean(flags.voyage),
  });
  const errors = validateCard(card);
  if (errors.length) {
    console.error("Card validation failed:", errors.join("; "));
    process.exit(1);
  }
  recordScoutUse({ ...quotaOpts, charge: gate.charge });
  const saved = saveCard(card);
  const out = expandHome(flags.out || (flags.quiet ? null : defaultOutPath(flow)));
  if (out) {
    writeParent(out);
    writeFileSync(out, JSON.stringify(card, null, 2), "utf8");
    flags._outPath = out;
  }
  if (!flags.quiet) {
    const status = formatPlanStatus(loadQuota());
    console.log(`Innsegall ${ENGINE_VERSION} · ${card.verdict}`);
    console.log(card.summary);
    console.log(
      `Scouts this month: ${status.scouts_used}/${status.scouts_limit} (${status.plan})`
    );
    if (out) console.log(`Wrote ${out}`);
    if (saved) console.log(`Saved ${saved}`);
  } else if (!out) {
    console.log(JSON.stringify(card, null, 2));
  }
  return card;
}

function cmdRun(flags) {
  flags.out = flags.out || defaultOutPath(flags.flow || "mac_hygiene");
  const card = cmdCheck({ ...flags, quiet: false });
  const html = expandHome(flags.html || defaultHtmlPath(flags._outPath || flags.out));
  writeParent(html);
  writeFileSync(html, renderHtml(card), "utf8");
  console.log(`Wrote ${html}`);
  if (process.platform === "darwin") {
    execSync(`open "${html}"`, { stdio: "ignore" });
  }
}

function cmdRender(flags) {
  const input = flags._[0];
  if (!input) {
    console.error("Usage: innsegall render <card.json> [--md] [--html] [--open]");
    process.exit(1);
  }
  let card;
  try {
    card = JSON.parse(readFileSync(expandHome(input), "utf8"));
  } catch (e) {
    console.error(`Could not read card: ${e.message}`);
    process.exit(1);
  }
  const errors = validateCard(card);
  if (errors.length) {
    console.warn("Warning:", errors.join("; "));
  }
  if (flags.md) {
    const p = expandHome(flags.md);
    writeParent(p);
    writeFileSync(p, renderMarkdown(card), "utf8");
    if (!flags.quiet) console.log(`Wrote ${p}`);
  }
  if (flags.html) {
    const p = expandHome(flags.html);
    writeParent(p);
    writeFileSync(p, renderHtml(card), "utf8");
    if (!flags.quiet) console.log(`Wrote ${p}`);
    if (flags.open && process.platform === "darwin") {
      execSync(`open "${p}"`, { stdio: "ignore" });
    }
  }
  if (!flags.md && !flags.html) {
    console.log(renderMarkdown(card));
  }
}

function cmdShow(flags) {
  const id = flags._[0];
  if (!id) {
    console.error("Usage: innsegall show <card_id>");
    process.exit(1);
  }
  const card = loadCardById(id);
  if (!card) {
    console.error(`Card not found: ${id}`);
    process.exit(1);
  }
  console.log(renderMarkdown(card));
}

function cmdHistory() {
  const cards = listCards(30);
  if (!cards.length) {
    console.log(`No cards yet. Run: innsegall run`);
    console.log(`Storage: ${supportPath()}/cards/`);
    return;
  }
  for (const c of cards) {
    console.log(`${c.created_at}  ${c.verdict.padEnd(10)}  ${c.flow.padEnd(18)}  ${c.card_id}`);
  }
}

function cmdChart(flags) {
  const series = loadHistorySeries(48);
  if (!series.length) {
    console.log("No voyages yet. Run: innsegall run");
    return;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const html = expandHome(flags.html || join(homedir(), "Desktop", `innsegall-voyage-chart-${stamp}.html`));
  writeParent(html);
  writeFileSync(html, renderChartPage(series), "utf8");
  console.log(`Voyage chart · ${series.length} checks · mean health ${Math.round(series.reduce((a, p) => a + p.score, 0) / series.length)}`);
  console.log(`Wrote ${html}`);
  if (flags.open && process.platform === "darwin") {
    execSync(`open "${html}"`, { stdio: "ignore" });
  }
}

function cmdFlows() {
  for (const [id, label] of Object.entries(FLOWS)) {
    console.log(`  ${id.padEnd(20)} ${label}`);
  }
}

function cmdParley(flags) {
  const cardPath = flags.card || flags._[0];
  if (!cardPath) {
    console.error("Usage: innsegall parley --card <card.json> [--intent explain_evidence] [--message \"...\"] [--execute] [--json]");
    process.exit(1);
  }
  let card;
  try {
    card = JSON.parse(readFileSync(expandHome(cardPath), "utf8"));
  } catch (e) {
    console.error(`Could not read card: ${e.message}`);
    process.exit(1);
  }
  const plan = runParley(card, {
    intent: flags.intent || "explain_evidence",
    message: flags.message || "",
    execute: Boolean(flags.execute),
  });
  if (flags.json) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }
  console.log(`Parley ${plan.status} · ${plan.route.lane} → ${plan.provider?.label || plan.route.provider}`);
  console.log(plan.route.reason);
  console.log(`Billable: ${plan.revenue.billable} · est $${plan.revenue.estimated_usd}`);
  if (plan.hint) console.log(plan.hint);
  console.log("\nTool call (subagent):");
  console.log(JSON.stringify(plan.tool_call, null, 2));
}

function cmdSmoke(flags) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const args = ["scripts/smoke.mjs"];
  if (flags.open) args.push("--open");
  execSync(`node ${args.join(" ")}`, { cwd: root, stdio: "inherit" });
}

function cmdPlan(flags) {
  if (flags.importLicense) {
    try {
      const result = importLicenseFile(flags.importLicense);
      console.log(result.message);
      console.log(JSON.stringify(formatPlanStatus(loadQuota()), null, 2));
    } catch (e) {
      console.error(`License import failed: ${e.message}`);
      process.exit(1);
    }
    return;
  }
  if (flags.clan) {
    const q = setPlan("clan");
    console.log("Clan plan activated locally (alpha). Unlimited scouts · 5 seats.");
    console.log(JSON.stringify(formatPlanStatus(q), null, 2));
    return;
  }
  if (flags.free) {
    const q = setPlan("free");
    console.log("Free plan · 2 voyages/mo (1st & 15th).");
    console.log(JSON.stringify(formatPlanStatus(q), null, 2));
    return;
  }
  if (flags.credit && flags.credit > 0) {
    const q = addExtraCredits(flags.credit);
    console.log(`Added ${flags.credit} extra scout credit(s).`);
    console.log(JSON.stringify(formatPlanStatus(q), null, 2));
    return;
  }
  const q = loadQuota();
  const status = formatPlanStatus(q);
  console.log(`Innsegall ${ENGINE_VERSION} · plan`);
  console.log(JSON.stringify(status, null, 2));
  console.log("");
  console.log(`Free: ${PRICING.free.scouts_per_month} voyages/mo on days ${VOYAGE_DAYS.join(" & ")}`);
  console.log(`Extra run: $${PRICING.extra_run.usd.toFixed(2)} · credits remaining: ${status.extra_credits_remaining}`);
  console.log(`Clan: $${PRICING.clan.usd_monthly.toFixed(2)}/mo · ${PRICING.clan.seats} seats · unlimited`);
  console.log(`Next voyage: ${status.next_voyage}`);
  console.log(`Upgrade: ${PRICING.site_url}/#pricing`);
}

function cmdVoyage(flags) {
  const slot = voyageSlotForDate();
  if (!slot && !flags.force && !flags.smoke) {
    const next = nextVoyageDate();
    const nextStr = next.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    console.error(`Today is not a voyage day. Innsegall runs on the ${VOYAGE_DAYS.join(" and ")} of each month.`);
    console.error(`Next voyage: ${nextStr}. Need one now? Extra run $${PRICING.extra_run.usd.toFixed(2)} · innsegall plan --credit 1 after purchase.`);
    process.exit(1);
  }

  if (flags.installSchedule) {
    const bin = join(dirname(fileURLToPath(import.meta.url)), "innsegall.mjs");
    const plistPath = join(homedir(), "Library/LaunchAgents/com.innsegall.voyage.plist");
    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.innsegall.voyage</string>
  <key>ProgramArguments</key>
  <array>
    <string>${process.execPath}</string>
    <string>${bin}</string>
    <string>voyage</string>
    <string>--quiet</string>
    <string>--open</string>
  </array>
  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Day</key><integer>1</integer><key>Hour</key><integer>10</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Day</key><integer>15</integer><key>Hour</key><integer>10</integer><key>Minute</key><integer>0</integer></dict>
  </array>
  <key>StandardOutPath</key><string>${join(supportPath(), "voyage.log")}</string>
  <key>StandardErrorPath</key><string>${join(supportPath(), "voyage.err")}</string>
</dict>
</plist>`;
    mkdirSync(dirname(plistPath), { recursive: true });
    writeFileSync(plistPath, plist, "utf8");
    try {
      execSync(`launchctl unload "${plistPath}" 2>/dev/null; launchctl load "${plistPath}"`, { stdio: "ignore" });
      console.log(`Voyage schedule installed · ${plistPath}`);
      console.log(`Runs 10:00 local on the 1st and 15th · logs in ${supportPath()}`);
    } catch (e) {
      console.log(`Wrote ${plistPath}`);
      console.log(`Run: launchctl load "${plistPath}"`);
    }
    return;
  }

  flags.flow = "mac_hygiene";
  flags.voyage = true;
  flags.out = flags.out || defaultOutPath("voyage");
  const card = cmdCheck({ ...flags, quiet: Boolean(flags.quiet) });
  const html = expandHome(flags.html || defaultHtmlPath(flags._outPath || flags.out));
  writeParent(html);
  writeFileSync(html, renderHtml(card), "utf8");
  if (!flags.quiet) {
    console.log(`Your voyage · ${card.verdict} · ${html}`);
  }
  const shouldOpen = !flags.noOpen && process.platform === "darwin";
  if (shouldOpen) {
    execSync(`open "${html}"`, { stdio: "ignore" });
  } else if (!flags.quiet && !shouldOpen) {
    console.log(`Open in browser: open "${html}"`);
  }
}

function cmdRunes() {
  const ok = [];
  const warn = [];
  if (process.platform !== "darwin") warn.push("Not macOS · scout commands need a Macintosh");
  else ok.push(`macOS ${platformVersion()}`);
  const node = process.version;
  if (parseInt(node.slice(1), 10) >= 20) ok.push(`Node ${node}`);
  else warn.push(`Node ${node} · recommend >= 20`);
  if (sh("which git", { allowFail: true })) ok.push("git available");
  else warn.push("git not found · project_safe limited");
  if (sh("which plutil", { allowFail: true })) ok.push("plutil available");
  else warn.push("plutil missing · launch ghost scan degraded");
  try {
    mkdirSync(supportPath(), { recursive: true });
    ok.push(`Storage writable: ${supportPath()}`);
  } catch {
    warn.push(`Cannot write ${supportPath()}`);
  }
  console.log("Read the runes · Innsegall\n");
  for (const m of ok) console.log(`  ✓ ${m}`);
  for (const m of warn) console.log(`  ⚠ ${m}`);
  if (warn.length) {
    console.log("\nThe mist is thick · fix warnings before you send the scout.");
  } else {
    console.log("\nSolas on the path · you're clear to run a scout.");
  }
  process.exit(warn.length ? 1 : 0);
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const flags = parseFlags(["_", ...rest], 1);

  if (!cmd || cmd === "--help" || cmd === "-h" || flags.help) {
    usage();
    return;
  }

  if (process.platform !== "darwin" && ["check", "run", "runes", "doctor"].includes(cmd)) {
    console.error("Innsegall check requires macOS.");
    process.exit(1);
  }

  switch (cmd) {
    case "run":
      cmdRun(flags);
      break;
    case "check":
      cmdCheck(flags);
      break;
    case "render":
      cmdRender(flags);
      break;
    case "show":
      cmdShow(flags);
      break;
    case "history":
      cmdHistory();
      break;
    case "chart":
      cmdChart(flags);
      break;
    case "voyage":
      cmdVoyage(flags);
      break;
    case "parley":
      cmdParley(flags);
      break;
    case "smoke":
      cmdSmoke(flags);
      break;
    case "flows":
      cmdFlows();
      break;
    case "runes":
    case "doctor":
      if (cmd === "doctor") {
        console.error("Note: doctor → runes · read the runes before your scout.\n");
      }
      cmdRunes();
      break;
    case "plan":
      cmdPlan(flags);
      break;
    default:
      console.error(`Unknown command: ${cmd}`);
      usage();
      process.exit(1);
  }
}

main();
