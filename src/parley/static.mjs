import { VERDICT_COPY, CLAYMORE, PRICING } from "../constants.mjs";

const INTENT_LEAD = {
  explain_evidence: `Here's what your scout found${CLAYMORE}plain English, no jargon.`,
  next_step: "Your next move, from this card:",
  playbook_step: "Walk-through for the top deed on your list:",
  threat_context: "Context from your card (not a live threat feed):",
  sound_horn: `The Horn is up. Solas read your scout${CLAYMORE}here's your line tonight:`,
};

/**
 * Generate a Parley-style response from card verdict + fixes · no LLM, no network.
 */
export function runStaticParley(card, { intent = "explain_evidence", message = "" } = {}) {
  const vc = VERDICT_COPY[card.verdict] || {};
  const parts = [];

  parts.push(INTENT_LEAD[intent] || INTENT_LEAD.explain_evidence);
  parts.push(`**${vc.headline || card.verdict}**${CLAYMORE}${card.summary}`);

  if (message?.trim()) {
    parts.push(`You asked: "${message.trim().slice(0, 500)}"`);
  }

  const attention = (card.checks_run || []).filter((c) => c.status === "warn" || c.status === "fail");
  if (attention.length) {
    const lines = attention.slice(0, 6).map((c) => `• ${c.name}: ${c.detail}`);
    parts.push(`Why we flagged this:\n${lines.join("\n")}`);
  }

  const fixes = card.fixes_recommended || [];
  if (fixes.length) {
    if (intent === "playbook_step" && fixes[0]?.steps?.length) {
      const steps = fixes[0].steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
      parts.push(`Do this now${CLAYMORE}${fixes[0].title} (${fixes[0].risk} risk):\n${steps}`);
    } else {
      const lines = fixes.map((f, i) => `${i + 1}. ${f.title} (${f.risk} risk)`);
      parts.push(`Do this now:\n${lines.join("\n")}`);
    }
  }

  if (card.user_inputs?.entered_password) {
    parts.push(
      "You told the scout you entered a password on a suspicious page. Change that password from a device you trust before you sign in there again."
    );
  }
  if (card.user_inputs?.downloaded_file) {
    parts.push("You reported a suspicious download. Move it to Trash without opening it, then send the scout again.");
  }

  if (card.verdict === "ESCALATE" || intent === "sound_horn") {
    parts.push(
      `Sound the Horn: rotate passwords from a clean device, quarantine suspicious downloads, and bring your clan or email ${PRICING.contact_email} if you're still unsure. You are not alone on this road.`
    );
  }

  const stats = card.stats || {};
  parts.push(`Scout tally: ${stats.pass ?? 0} clear · ${stats.warn ?? 0} review · ${stats.fail ?? 0} escalate.`);

  parts.push(
    `${CLAYMORE.trim()} Solas from your Battle Scout. Live help at innsegall.com when you're online · otherwise this summary is instant from your card.`
  );

  return {
    lane: "static",
    intent,
    source: "card",
    response: parts.filter(Boolean).join("\n\n"),
  };
}
