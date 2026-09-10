#!/usr/bin/env node
/** Issue spotlight loop gate · detect · telemetry · publish. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildIssueSpotlightMarkdown,
  buildIssueSpotlightPayload,
  detectIssueEvent,
  aggregateIssueSpotlightEvents,
} from "../src/issue-spotlight.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL issue-spotlight: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const fixtures = JSON.parse(
  readFileSync(join(root, "fixtures", "issue-spotlight-cards.json"), "utf8")
);
const events = JSON.parse(
  readFileSync(join(root, "fixtures", "issue-spotlight-events.json"), "utf8")
);

const identified = detectIssueEvent(fixtures.current_identified, null);
check("detect identified", identified?.event_type === "identified");

const resolved = detectIssueEvent(fixtures.current_clear, fixtures.previous);
check("detect resolved", resolved?.event_type === "resolved");

const payload = buildIssueSpotlightPayload(fixtures.current_clear, fixtures.previous);
check("payload shape", payload?.event_type === "resolved" && payload.issue_slug);
check("payload no email key", !JSON.stringify(payload).includes("email"));

const agg = aggregateIssueSpotlightEvents(events);
check("aggregate events", agg.length >= 2);

const md = buildIssueSpotlightMarkdown(agg[0]);
check("markdown report_type", md.includes("report_type: issue_spotlight"));
check("markdown no paths", !md.includes("/Users/"));
check("markdown agent hint", md.includes("innsegall_agent_hint"));

const telemetry = readFileSync(join(root, "web", "api", "telemetry.js"), "utf8");
check("telemetry issue_spotlight", telemetry.includes("issue_spotlight"));
check("telemetry validateIssueSpotlight", telemetry.includes("validateIssueSpotlight"));

const ops = readFileSync(join(root, "src", "ops-boot.mjs"), "utf8");
check("ops-boot wires spotlight", ops.includes("sendIssueSpotlight"));
check("fetch-issue-spotlight-events script", existsSync(join(root, "scripts", "fetch-issue-spotlight-events.mjs")));
check("publish-issue-spotlight-pipeline script", existsSync(join(root, "scripts", "publish-issue-spotlight-pipeline.mjs")));
check("issue-spotlight GH workflow", existsSync(join(root, ".github", "workflows", "issue-spotlight-publish.yml")));

console.log(failed ? `\n${failed} issue-spotlight failure(s)` : "\nIssue spotlight audit passed");
process.exit(failed ? 1 : 0);
