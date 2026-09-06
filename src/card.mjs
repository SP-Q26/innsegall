import { randomUUID } from "node:crypto";
import { tally } from "./checks-util.mjs";
import { runChecks, projectWatch } from "./checks.mjs";
import {
  ENGINE_VERSION,
  FLOWS,
  PRODUCT,
  SCHEMA_VERSION,
} from "./constants.mjs";
import { fixesFromChecks } from "./fixes.mjs";
import { attachQuickActions } from "./quick-actions.mjs";
import { applySmokeTierFixtures } from "./smoke-fixtures.mjs";
import { platformVersion } from "./shell.mjs";
import { computeVerdict, summaryLine } from "./verdict.mjs";

export { computeVerdict, summaryLine };

export function buildCard({ flow, projectPath, userInputs, smoke = false, voyage = false }) {
  const inputs = {
    entered_password: Boolean(userInputs?.entered_password),
    downloaded_file: Boolean(userInputs?.downloaded_file),
  };
  const checks = runChecks(flow, projectPath, inputs);
  const verdict = computeVerdict(checks, inputs);
  const stats = tally(checks);

  const card = {
    schema_version: SCHEMA_VERSION,
    card_id: randomUUID(),
    created_at: new Date().toISOString(),
    product: PRODUCT,
    brand: PRODUCT,
    flow,
    flow_label: FLOWS[flow] || flow,
    platform: "macos",
    platform_version: platformVersion(),
    verdict,
    summary: summaryLine(verdict, checks),
    stats,
    checks_run: checks,
    fixes_recommended: attachQuickActions(fixesFromChecks(checks, inputs)),
    project_watch: null,
    user_inputs: inputs,
    redactions: [],
    engine_version: ENGINE_VERSION,
    signature: null,
    voyage: Boolean(voyage),
  };

  if (flow === "project_safe" || projectPath) {
    card.project_watch = projectWatch(projectPath || process.cwd());
  }

  if (smoke) {
    return applySmokeTierFixtures(card);
  }

  return card;
}
