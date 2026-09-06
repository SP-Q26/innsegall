import { VERDICT_COPY } from "../constants.mjs";

const INTENT_LEAD = {
  explain_evidence: "Here is what your Battle Scout found, in plain English.",
  next_step: "Your next step, based on this card:",
  playbook_step: "Walk-through for the top recommended fix:",
  threat_context: "Context from your card (not a live threat feed):",
};

/**
 * Generate a Parley-style response from card verdict + fixes · no LLM, no network.
 */
export function runStaticParley(card, { intent = "explain_evidence", message = "" } = {}) {
  const vc = VERDICT_COPY[card.verdict] || {};
  const parts = [];

  parts.push(INTENT_LEAD[intent] || INTENT_LEAD.explain_evidence);
  parts.push(`${vc.headline || card.verdict} — ${card.summary}`);

  if (message?.trim()) {
    parts.push(`You asked: "${message.trim().slice(0, 500)}"`);
  }

  const attention = (card.checks_run || []).filter((c) => c.status === "warn" || c.status === "fail");
  if (attention.length) {
    const lines = attention.slice(0, 6).map((c) => `• ${c.name}: ${c.detail}`);
    parts.push(`Checks that need attention:\n${lines.join("\n")}`);
  }

  const fixes = card.fixes_recommended || [];
  if (fixes.length) {
    if (intent === "playbook_step" && fixes[0]?.steps?.length) {
      const steps = fixes[0].steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
      parts.push(`${fixes[0].title} (${fixes[0].risk} risk):\n${steps}`);
    } else {
      const lines = fixes.map((f, i) => `${i + 1}. ${f.title} (${f.risk} risk)`);
      parts.push(`Recommended fixes:\n${lines.join("\n")}`);
    }
  }

  if (card.user_inputs?.entered_password) {
    parts.push(
      "You reported entering a password on a suspicious page. Rotate those credentials from a clean device before using that account again."
    );
  }
  if (card.user_inputs?.downloaded_file) {
    parts.push("You reported a suspicious download. Quarantine it (do not open) and re-run the check after cleanup.");
  }

  const stats = card.stats || {};
  parts.push(`Card stats: ${stats.pass ?? 0} clear · ${stats.warn ?? 0} review · ${stats.fail ?? 0} escalate.`);

  parts.push(
    "— Static Parley (built from your card). Add GEMINI_API_KEY or DEEPSEEK_API_KEY for live Solas AI, or use Beacon for deep Parley."
  );

  return {
    lane: "static",
    intent,
    source: "card",
    response: parts.filter(Boolean).join("\n\n"),
  };
}
