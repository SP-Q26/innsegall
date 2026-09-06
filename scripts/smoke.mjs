#!/usr/bin/env node
/**
 * Innsegall full smoke · self-test + tier fixtures + HTML render assertions.
 */
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCard } from "../src/card.mjs";
import { ENGINE_VERSION } from "../src/constants.mjs";
import { renderChartPage, loadHistorySeries } from "../src/history-chart.mjs";
import { runParley } from "../src/parley/index.mjs";
import { renderHtml, renderMarkdown } from "../src/render.mjs";
import { applySmokeTierFixtures, SMOKE_CHECKS } from "../src/smoke-fixtures.mjs";
import { saveCard } from "../src/storage.mjs";
import { validateCard } from "../src/validate.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let failed = 0;

function assert(name, cond) {
  if (!cond) {
    console.error(`FAIL: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

function section(name) {
  console.log(`\n── ${name} ──`);
}

section(`engine v${ENGINE_VERSION}`);

const base = buildCard({ flow: "mac_hygiene", userInputs: {} });
const card = applySmokeTierFixtures(base);

assert("smoke flag", card.smoke === true);
assert("smoke escalate verdict", card.verdict === "ESCALATE");
assert("smoke has fail tier", card.checks_run.some((c) => c.id === SMOKE_CHECKS.escalate.id));
assert("smoke has warn tier", card.checks_run.some((c) => c.id === SMOKE_CHECKS.review.id));
assert("smoke has pass tier", card.checks_run.some((c) => c.id === SMOKE_CHECKS.clear.id));
assert(
  "smoke housekeeping row",
  card.checks_run.some((c) => c.id === "launch_ghosts" && c.evidence?.some((e) => e.includes("com.smoke.innsegall.demo")))
);
assert("smoke stats fail>=1", (card.stats.fail || 0) >= 1);
assert("smoke stats warn>=1", (card.stats.warn || 0) >= 1);
assert("smoke fixes", card.fixes_recommended.some((f) => f.id === "smoke_escalate_playbook"));

const errors = validateCard(card);
assert("smoke validates", errors.length === 0);
if (errors.length) console.error("  ", errors.join("; "));

const md = renderMarkdown(card);
const html = renderHtml(card);
assert("smoke markdown tag", md.includes("[SMOKE]"));
assert("smoke html banner", html.includes("smoke-banner"));
assert("armory ship", html.includes("armory-slot ship"));
assert("armory optics", html.includes("armory-slot optics"));
assert("armory claymore", html.includes("armory-slot claymore"));
assert("section review", html.includes('id="section-review"'));
assert("section escalate hot", html.includes("section-escalate is-hot"));
assert("section housekeeping", html.includes('id="section-housekeeping"'));
assert("section actions", html.includes('id="section-actions"'));
assert("section intel", html.includes('id="section-intel"'));
assert("voyage chart", html.includes("voyage-chart"));
assert("card column", html.includes("card-column"));
assert("layout tokens", html.includes("--page-max"));
assert("smoke playbook in html", html.includes("smoke_escalate_playbook") || html.includes("Demo horn playbook"));

const parley = runParley(card, { intent: "explain_evidence" });
assert("parley dry-run", parley.status === "dry_run");
assert("parley tool_call", parley.tool_call?.tool === "parley_delegate");

section("write artifacts");
const outDir = join(root, ".smoke");
mkdirSync(outDir, { recursive: true });
const jsonPath = join(outDir, "smoke-card.json");
const htmlPath = join(outDir, "smoke-card.html");
const mdPath = join(outDir, "smoke-card.md");
writeFileSync(jsonPath, JSON.stringify(card, null, 2), "utf8");
writeFileSync(htmlPath, html, "utf8");
writeFileSync(mdPath, md, "utf8");
console.log(`Wrote ${jsonPath}`);
console.log(`Wrote ${htmlPath}`);

const series = loadHistorySeries(48);
if (series.length) {
  const chartPath = join(outDir, "smoke-voyage.html");
  writeFileSync(chartPath, renderChartPage(series), "utf8");
  console.log(`Wrote ${chartPath}`);
}

const desktopHtml = join(homedir(), "Desktop", `innsegall-smoke-${ENGINE_VERSION}.html`);
try {
  writeFileSync(desktopHtml, html, "utf8");
  console.log(`Wrote ${desktopHtml}`);
  if (process.platform === "darwin" && process.argv.includes("--open")) {
    execSync(`open "${desktopHtml}"`, { stdio: "ignore" });
  }
} catch (e) {
  console.warn(`Desktop write skipped: ${e.message}`);
}

try {
  saveCard(card);
  console.log("Saved smoke card to history");
} catch {
  console.warn("History save skipped");
}

section("self-test subprocess");
try {
  execSync("node scripts/self-test.mjs", { cwd: root, stdio: "inherit" });
} catch {
  failed++;
  console.error("FAIL: self-test subprocess");
}

console.log(failed ? `\n${failed} smoke gate(s) failed` : "\nSmoke sweep passed");
process.exit(failed ? 1 : 0);
