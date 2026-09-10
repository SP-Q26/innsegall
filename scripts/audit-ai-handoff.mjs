#!/usr/bin/env node
/**
 * AI handoff lane · onboarding doc, sample paste fixture, gospel triage canon.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { INNSEGALL_GOSPEL } from "../src/gospel.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const docPath = join(root, "docs/AI_HANDOFF_ONBOARDING.md");
check("AI_HANDOFF_ONBOARDING.md exists", existsSync(docPath));

if (existsSync(docPath)) {
  const doc = readFileSync(docPath, "utf8");
  check("handoff doc mentions scout-paste", doc.includes("#innsegall-scout-paste"));
  check("handoff doc mentions llms.txt", doc.includes("llms.txt"));
  check("handoff doc mentions ai-bus", doc.includes("ai-bus"));
  check("handoff doc triage levels", doc.includes("LIKELY_OK") && doc.includes("FIX_LIST") && doc.includes("ESCALATE"));
  check("handoff doc forbidden behaviors", doc.toLowerCase().includes("forbidden") || doc.includes("must not"));
}

const fixturePath = join(root, "fixtures/battle-scout-ai-v1.sample.json");
check("battle-scout sample fixture exists", existsSync(fixturePath));

let fixture = {};
if (existsSync(fixturePath)) {
  try {
    fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
    check("fixture json parses", true);
  } catch (e) {
    check("fixture json parses", false, e.message);
  }
}

check("fixture format schema", fixture.format === "innsegall-battle-scout-ai/v1");
check("fixture verdict", ["LIKELY_OK", "FIX_LIST", "ESCALATE"].includes(fixture.verdict));
check("fixture triage_level", fixture.triage_level === fixture.verdict);
check(
  "fixture triage_level enum",
  ["LIKELY_OK", "FIX_LIST", "ESCALATE"].includes(fixture.triage_level)
);

const gospelSrc = readFileSync(join(root, "src/gospel.mjs"), "utf8");
check(
  "gospel source references ai_triage or battle-scout-ai/v1",
  gospelSrc.includes("ai_triage_onboarding") || gospelSrc.includes("innsegall-battle-scout-ai/v1")
);

check("gospel ai_triage_onboarding object", INNSEGALL_GOSPEL.ai_triage_onboarding?.paste_format === "innsegall-battle-scout-ai/v1");
check(
  "gospel triage_levels",
  Array.isArray(INNSEGALL_GOSPEL.ai_triage_onboarding?.triage_levels) &&
    INNSEGALL_GOSPEL.ai_triage_onboarding.triage_levels.length === 3
);

const schemaPath = join(root, "web/.well-known/battle-scout-ai-v1.schema.json");
check("battle-scout-ai v1 json schema", existsSync(schemaPath));
if (existsSync(schemaPath)) {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  check("schema format const", schema.properties?.format?.const === "innsegall-battle-scout-ai/v1");
}

const webSample = join(root, "web/samples/battle-scout-ai-v1.sample.json");
check("web samples battle-scout-ai v1", existsSync(webSample));

check(
  "gospel json_schema_url",
  INNSEGALL_GOSPEL.ai_triage_onboarding?.json_schema_url?.includes("battle-scout-ai-v1.schema.json")
);

const guide = readFileSync(join(root, "web/guide.html"), "utf8");
check("guide AI handoff section", guide.includes('id="ai-handoff"') && guide.includes("AI handoff"));

if (failed) {
  console.error(`\n${failed} ai-handoff audit failure(s)`);
  process.exit(1);
}
console.log("ok: ai-handoff audit");
