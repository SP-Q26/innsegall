import { homedir } from "node:os";

/** Redact home paths before anything leaves the machine. */
export function redactPath(s) {
  const home = homedir();
  if (!s || typeof s !== "string") return s;
  return s.split(home).join("~/");
}

/**
 * Bounded Battle Scout slice for Parley · no raw telemetry upload by default.
 * User must opt in before `execute: true` on a live provider call.
 */
export function buildParleyContext(card, { message = "" } = {}) {
  const fixes = (card.fixes_recommended || []).map((f) => ({
    id: f.id,
    title: f.title,
    tier: f.tier,
    summary: f.summary,
  }));

  const checks = (card.checks_run || [])
    .filter((c) => c.status !== "pass")
    .map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      detail: redactPath(c.detail),
      evidence: (c.evidence || []).slice(0, 8).map((e) => redactPath(e)),
    }));

  return {
    card_id: card.card_id,
    verdict: card.verdict,
    flow: card.flow,
    summary: card.summary,
    stats: card.stats,
    fixes,
    attention_checks: checks,
    user_message: message.slice(0, 2000),
    user_inputs: {
      entered_password: Boolean(card.user_inputs?.entered_password),
      downloaded_file: Boolean(card.user_inputs?.downloaded_file),
    },
  };
}
