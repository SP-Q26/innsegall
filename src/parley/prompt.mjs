import { gaelicMarkdown } from "../constants.mjs";
import { VERDICT_COPY } from "../constants.mjs";

const PARLEY_SYSTEM = `You are the Parley guide for Innsegall · calm, plain English, 90% practical / 10% Gaelic warmth.
You may use one approved Gaelic phrase from the card voice spec when opening or closing.
Never claim infection without evidence from the Battle Scout.
Never instruct rm -rf, sudo, or paste Terminal commands from the web.
If the user entered a password on a suspicious page, say Sound the Horn and rotate credentials from a clean device.
End with one clear next action.`;

export function buildParleyMessages(card, context, userMessage = "") {
  const vc = VERDICT_COPY[card.verdict] || {};
  const gaelic = gaelicMarkdown(vc);

  const userBlock = [
    `Verdict: ${context.verdict}`,
    `Summary: ${context.summary}`,
    context.fixes?.length
      ? `Recommended fixes:\n${context.fixes.map((f) => `- [${f.tier}] ${f.title}: ${f.summary || ""}`).join("\n")}`
      : "",
    context.attention_checks?.length
      ? `Checks needing attention:\n${context.attention_checks.map((c) => `- ${c.name} (${c.status}): ${c.detail}`).join("\n")}`
      : "",
    userMessage ? `User question: ${userMessage}` : "",
    gaelic ? `Voice (optional echo): ${gaelic}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    system: PARLEY_SYSTEM,
    user: userBlock,
  };
}
