import { tally } from "./checks-util.mjs";
import { CLAYMORE } from "./constants.mjs";
import { attachQuickActions } from "./quick-actions.mjs";
import { fixesFromChecks } from "./fixes.mjs";
import { computeVerdict, summaryLine } from "./verdict.mjs";

const SMOKE_HK = `[optional] com.smoke.innsegall.demo.plist → /tmp/SmokeVendor.app${CLAYMORE}Demo housekeeping row · safe to ignore`;

/** One synthetic check per armory tier for preview / QA. */
export const SMOKE_CHECKS = {
  clear: {
    id: "smoke_clear_tier",
    name: "[SMOKE] Clear longship",
    status: "pass",
    detail: "Demo pass · paints the clear / ship tier in the armory.",
    evidence: [],
  },
  review: {
    id: "smoke_review_tier",
    name: "[SMOKE] Review field glass",
    status: "warn",
    detail: "Demo warn · optics tier · not a real finding on your Mac.",
    evidence: ["smoke://fixture/optics-tier"],
  },
  escalate: {
    id: "smoke_escalate_tier",
    name: "[SMOKE] Horn claymore",
    status: "fail",
    detail: "Demo fail · claymore tier · triggers horn zone styling only.",
    evidence: ["smoke://fixture/claymore-tier"],
  },
};

/**
 * Inject tier fixtures into a real card. Sets card.smoke = true and recomputes verdict/stats/fixes.
 */
export function applySmokeTierFixtures(card) {
  const checks = [...(card.checks_run || [])].filter(
    (c) => !String(c.id).startsWith("smoke_")
  );

  let launch = checks.find((c) => c.id === "launch_ghosts");
  if (!launch) {
    launch = {
      id: "launch_ghosts",
      name: "Launch item health",
      status: "pass",
      detail: "Smoke fixture launch scan",
      evidence: [],
    };
    checks.push(launch);
  }
  const evidence = [...(launch.evidence || [])];
  if (!evidence.some((e) => e.includes("com.smoke.innsegall.demo"))) {
    evidence.push(SMOKE_HK);
  }
  const launchIdx = checks.findIndex((c) => c.id === "launch_ghosts");
  checks[launchIdx] = {
    ...launch,
    evidence,
    detail: launch.detail?.includes("SMOKE")
      ? launch.detail
      : `${launch.detail || "Launch items scanned"}. Includes smoke optional vendor row.`,
  };

  checks.push(SMOKE_CHECKS.clear, SMOKE_CHECKS.review, SMOKE_CHECKS.escalate);

  const userInputs = card.user_inputs || {};
  const verdict = computeVerdict(checks, userInputs);
  const stats = tally(checks);
  let fixes = fixesFromChecks(checks, userInputs);

  if (!fixes.some((f) => f.id === "smoke_escalate_playbook")) {
    fixes = [
      ...fixes,
      {
        id: "smoke_escalate_playbook",
        title: "[SMOKE] Demo horn playbook step",
        risk: "low",
        requires_sudo: false,
        automatable: false,
        steps: [
          "This card is a smoke demo · your Mac was not re-scanned for this row.",
          "Real horn flow: rotate creds, quarantine downloads, Sound the Horn.",
          "Delete this card from history when done previewing.",
        ],
      },
    ];
  }

  return {
    ...card,
    smoke: true,
    smoke_label: "SMOKE DEMO · tier fixtures only · not a live threat read",
    checks_run: checks,
    verdict,
    summary: `[SMOKE] ${summaryLine(verdict, checks)}`,
    stats,
    fixes_recommended: attachQuickActions(fixes),
  };
}
