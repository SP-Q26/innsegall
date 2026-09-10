#!/usr/bin/env node
/**
 * Innsegall self-test · run on macOS after engine changes.
 */
import { homedir } from "node:os";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyLaunchItem } from "../src/checks.mjs";
import { buildCard } from "../src/card.mjs";
import { FLOWS, ARTIFACT_NAME, PRICING } from "../src/constants.mjs";
import { renderHtml, renderMarkdown, buildScoutStructuredData, renderAiPaste, buildScoutAiPayload } from "../src/render.mjs";
import { ALL_CHECK_IDS, CHECK_CATALOG } from "../src/check-catalog.mjs";
import { validateCard } from "../src/validate.mjs";

let failed = 0;

function assert(name, cond) {
  if (!cond) {
    console.error(`FAIL: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

for (const flow of Object.keys(FLOWS)) {
  const card = buildCard({ flow, projectPath: null, userInputs: {} });
  assert(`${flow} builds`, card.checks_run.length >= 8);
  assert(`${flow} validates`, validateCard(card).length === 0);
  assert(`${flow} markdown`, renderMarkdown(card).includes("Innsegall"));
  assert(`${flow} html`, renderHtml(card).includes(ARTIFACT_NAME));
}

const escalate = buildCard({
  flow: "clicked_bad_link",
  userInputs: { entered_password: true },
});
assert("password escalates", escalate.verdict === "ESCALATE");
assert("password fix list", escalate.fixes_recommended.some((f) => f.id === "rotate_credentials"));

assert("epson housekeeping", classifyLaunchItem("com.epson.epsvcp.plist", "/Library/Caches/Epson/x").tier === "housekeeping");
assert("spotify housekeeping", classifyLaunchItem("com.spotify.webhelper.plist", "/SpotifyWebHelper").tier === "housekeeping");
assert("steam housekeeping", classifyLaunchItem("com.valvesoftware.steamclean.plist", "/steamclean").tier === "housekeeping");
assert("wd housekeeping", classifyLaunchItem("com.wdc.WD-Discovery.plist", "/WD Discovery").tier === "housekeeping");
assert("canon housekeeping", classifyLaunchItem("jp.co.canon.MasterInstaller.plist", "/PrivilegedHelperTools/jp.co.canon.MasterInstaller").tier === "housekeeping");

import { healthScore, loadHistorySeries, renderHealthChartSvg } from "../src/history-chart.mjs";
const hist = loadHistorySeries(5);
assert("history series array", Array.isArray(hist));
assert("health score ok", healthScore({ verdict: "LIKELY_OK", stats: { pass: 10, warn: 0, fail: 0 } }) >= 70);
assert("chart svg", renderHealthChartSvg(hist).includes("voyage-svg"));

import { applySmokeTierFixtures, SMOKE_CHECKS } from "../src/smoke-fixtures.mjs";
const smokeCard = applySmokeTierFixtures(buildCard({ flow: "mac_hygiene", userInputs: {} }));
assert("smoke tiers injected", smokeCard.verdict === "ESCALATE" && smokeCard.smoke === true);
assert("smoke html tiers", renderHtml(smokeCard).includes("smoke-banner") && renderHtml(smokeCard).includes("section-housekeeping"));

import { featuredPostUrl, renderThreatIntelSection } from "../src/threat-intel.mjs";
const sampleHtml = renderHtml(buildCard({ flow: "mac_hygiene", userInputs: {} }));
assert("field glass section", sampleHtml.includes("section-intel"));
assert("blog link", sampleHtml.includes(featuredPostUrl()));
assert("card column layout", sampleHtml.includes("card-column"));
assert("mac-first layout tokens", sampleHtml.includes("--page-max"));

import { classifyParleyRoute, buildParleyContext, runStaticParley } from "../src/parley/index.mjs";

const routeNoKeys = classifyParleyRoute({
  intent: "explain_evidence",
  verdict: "ESCALATE",
  hasUserGemini: false,
  hasUserDeepSeek: false,
});
assert("parley static route no keys", routeNoKeys.lane === "static");

const routeByok = classifyParleyRoute({
  intent: "explain_evidence",
  verdict: "ESCALATE",
  hasUserGemini: true,
  hasUserDeepSeek: false,
});
assert("parley solas route BYOK", routeByok.lane === "solas");

const staticParley = runStaticParley(escalate, { intent: "explain_evidence" });
assert("static parley response", staticParley.lane === "static" && staticParley.response.length > 40);
assert("static parley mentions verdict", staticParley.response.includes("Sound the Horn") || staticParley.response.includes("ESCALATE"));

const ctx = buildParleyContext(escalate);
assert("parley redacted context", ctx.verdict === "ESCALATE" && !JSON.stringify(ctx).includes(homedir()));

const htmlEscalate = renderHtml(escalate);
assert("parley section in html", htmlEscalate.includes('id="parley"'));
assert("parley live body in html", htmlEscalate.includes('id="parley-live-body"'));
assert("horn sound button in html", htmlEscalate.includes('id="horn-sound-btn"'));
assert("parley embed in html", htmlEscalate.includes('id="innsegall-parley-embed"'));
assert("share battle scout button", htmlEscalate.includes("battle-scout-share"));
assert("ai paste textarea", htmlEscalate.includes('id="innsegall-scout-paste"'));
assert("copy for ai label", htmlEscalate.includes("Copy Battle Scout for AI"));
assert("scope limits section", htmlEscalate.includes('id="section-scope"'));
assert("check looked at copy", htmlEscalate.includes("Looked at"));
assert("check does not cover copy", htmlEscalate.includes("Does not cover"));
assert("why check matters link", htmlEscalate.includes("check-learn"));
assert("download report button", htmlEscalate.includes("battle-scout-download"));
assert("markdown export store", htmlEscalate.includes('id="innsegall-scout-md"'));
for (const id of ALL_CHECK_IDS) {
  const meta = CHECK_CATALOG[id];
  assert(`catalog ${id} looked_at`, Boolean(meta?.looked_at && meta?.does_not_cover && meta?.why_matters));
}
const mdEscalate = renderMarkdown(escalate);
assert("markdown scope footer", mdEscalate.includes("What this scout does not check"));
const aiPaste = renderAiPaste(escalate);
assert("ai paste instructions", aiPaste.includes("Instructions for the AI reading this"));
assert("ai paste json block", aiPaste.includes("innsegall-battle-scout-ai/v1"));
assert("ai paste audit log", aiPaste.includes("Audit log"));
const aiPayload = buildScoutAiPayload(smokeCard);
assert("ai payload format", aiPayload.format === "innsegall-battle-scout-ai/v1");
assert("ai payload attention", aiPayload.attention_checks.length >= 1);
const launchScope = aiPayload.clear_checks.find((c) => c.id === "launch_ghosts");
assert(
  "ai payload scope fields",
  launchScope?.looked_at && launchScope?.does_not_cover && aiPayload.does_not_check?.length >= 3
);
assert("pricing footer", PRICING && htmlEscalate.includes(PRICING.solas.note.slice(0, 20)));
assert("passage upsell on escalate", htmlEscalate.includes('id="passage-tier"'));
assert("passage upsell clan link", htmlEscalate.includes("/clan"));
assert("passage upsell buy links", htmlEscalate.includes("buy=extra") && htmlEscalate.includes("buy=clan"));
assert("horn uses hello@", !htmlEscalate.includes("help@innsegall.com"));
assert("horn uses hello@", htmlEscalate.includes("hello@innsegall.com"));

import {
  checkScoutQuota,
  formatPlanStatus,
  loadQuota,
  saveQuota,
  VOYAGE_DAYS,
  nextVoyageDate,
} from "../src/quota.mjs";
assert("pricing free scouts", PRICING.free.scouts_per_month === 2);
assert("pricing clan monthly", PRICING.clan.usd_monthly === 6.67);
assert("quota force bypass", checkScoutQuota({ force: true }).allowed === true);
const quotaBefore = loadQuota();
const offVoyage = new Date("2026-09-06T12:00:00");
if (!quotaBefore.welcome_scout_redeemed) {
  assert("welcome scout off-voyage", checkScoutQuota({ date: offVoyage }).reason === "welcome_scout");
}
saveQuota({
  ...quotaBefore,
  welcome_scout_redeemed: true,
  voyage_completed: [],
  extra_credits: 0,
  extra_used: 0,
});
const blocked = checkScoutQuota({ date: offVoyage });
assert("off voyage day reason", !blocked.allowed && blocked.reason === "off_voyage_day");
saveQuota(quotaBefore);
assert("voyage days", VOYAGE_DAYS.join() === "1,15");

import { buildVoyagePlist, voyageScheduleSummary } from "../src/voyage-schedule.mjs";
const plist = buildVoyagePlist({ innsegallBin: "/tmp/.local/bin/innsegall" });
assert("voyage plist bin path", plist.includes("/tmp/.local/bin/innsegall"));
assert("voyage plist days", plist.includes("<integer>1</integer>") && plist.includes("<integer>15</integer>"));
const sum = voyageScheduleSummary(new Date("2026-09-06T12:00:00"));
assert("next voyage sep 6", sum.next_voyage === "2026-09-15");
assert("next voyage day 1", nextVoyageDate(new Date("2026-09-01T12:00:00")).getDate() === 15);
assert("next voyage day 15", nextVoyageDate(new Date("2026-09-15T18:00:00")).getMonth() === 9 && nextVoyageDate(new Date("2026-09-15T18:00:00")).getDate() === 1);
const planStatus = formatPlanStatus(loadQuota());
assert("quota plan field", planStatus.plan === "free" || planStatus.plan === "clan");

import { buildFieldReportMarkdown } from "../src/field-report.mjs";
const reportMd = buildFieldReportMarkdown({ slices: [] });
assert("field report privacy pledge", reportMd.includes("never share your data"));
assert("field report no paths", !reportMd.includes(homedir()));
assert("field report yaml frontmatter", reportMd.startsWith("---\ninnsegall_product:"));
assert("field report verdict counts", reportMd.includes("verdict_counts:") && reportMd.includes("fix_list:"));

import {
  buildIssueSpotlightMarkdown,
  buildIssueSpotlightPayload,
  detectIssueEvent,
  aggregateIssueSpotlightEvents,
} from "../src/issue-spotlight.mjs";
const issueFixtures = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures", "issue-spotlight-cards.json"), "utf8")
);
assert("issue detect identified", detectIssueEvent(issueFixtures.current_identified, null)?.event_type === "identified");
assert("issue detect resolved", detectIssueEvent(issueFixtures.current_clear, issueFixtures.previous)?.event_type === "resolved");
const issuePayload = buildIssueSpotlightPayload(issueFixtures.current_clear, issueFixtures.previous);
assert("issue payload resolved", issuePayload?.event_type === "resolved" && issuePayload.issue_slug);
const issueEvents = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "fixtures", "issue-spotlight-events.json"), "utf8")
);
const issueAgg = aggregateIssueSpotlightEvents(issueEvents);
const issueMd = buildIssueSpotlightMarkdown(issueAgg[0]);
assert("issue markdown type", issueMd.includes("report_type: issue_spotlight"));
assert("issue markdown no paths", !issueMd.includes(homedir()));

const scoutData = buildScoutStructuredData(buildCard({ flow: "mac_hygiene", userInputs: {} }));
assert("scout data product", scoutData.product === "Innsegall");
assert("scout data checks only id+status", scoutData.checks.every((c) => c.id && c.status && !c.detail));
assert("scout data no evidence", !JSON.stringify(scoutData).includes("evidence"));
const scoutHtml = renderHtml(buildCard({ flow: "mac_hygiene", userInputs: {} }));
assert("scout html structured block", scoutHtml.includes('id="innsegall-scout-data"'));
assert("scout html ld+json", scoutHtml.includes('type="application/ld+json"'));
assert("scout html agent meta", scoutHtml.includes('name="innsegall:artifact"'));
assert("scout html title format", scoutHtml.includes("<title>Battle Scout · Innsegall ·"));
assert("scout html no xx codename", !scoutHtml.includes("XX app"));

import { buildLicensePayload, verifyLicense } from "../src/license.mjs";
const lic = buildLicensePayload({ plan: "extra", extra_credits: 1, stripe_session: "cs_test" });
assert("license sign", lic.sig && verifyLicense(lic).ok);
assert("license gospel ref", scoutData.gospel?.includes("innsegall-gospel"));

try {
  execSync("node scripts/audit-claymore.mjs", { cwd: join(dirname(fileURLToPath(import.meta.url)), ".."), stdio: "pipe" });
  assert("claymore audit no em dash", true);
} catch {
  assert("claymore audit no em dash", false);
}

try {
  execSync("node scripts/audit-brand-ban.mjs", { cwd: join(dirname(fileURLToPath(import.meta.url)), ".."), stdio: "pipe" });
  assert("brand ban audit", true);
} catch {
  assert("brand ban audit", false);
}

try {
  execSync("node scripts/audit-ai-bus.mjs", { cwd: join(dirname(fileURLToPath(import.meta.url)), ".."), stdio: "pipe" });
  assert("ai-bus audit", true);
} catch {
  assert("ai-bus audit", false);
}

const indexHtml = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "web", "index.html"), "utf8");
assert("index ai-bus embed", indexHtml.includes('id="innsegall-ai-bus"') && indexHtml.includes("INNSEGALL_AI_BUS_START"));
assert("index no banned CTA", !/Run the check/i.test(indexHtml));

import { telemetryEnabled } from "../src/telemetry-client.mjs";
import { buildScoutAggregatePayload } from "../src/field-report.mjs";
const prevTelemetry = process.env.INNSEGALL_TELEMETRY;
delete process.env.INNSEGALL_TELEMETRY;
assert("telemetry default on", telemetryEnabled({}) === true);
process.env.INNSEGALL_TELEMETRY = "0";
assert("telemetry env off", telemetryEnabled({}) === false);
process.env.INNSEGALL_TELEMETRY = prevTelemetry;
const agg = buildScoutAggregatePayload("2099-01-01");
assert("aggregate empty day null", agg === null);

console.log(failed ? `\n${failed} failed` : "\nAll passed");
process.exit(failed ? 1 : 0);
