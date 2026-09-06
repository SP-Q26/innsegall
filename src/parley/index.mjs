import { buildParleyContext } from "./context.mjs";
import { hasUserGemini, hasUserDeepSeek, hasUserProviderKey } from "./credentials.mjs";
import { buildParleyMessages } from "./prompt.mjs";
import { PROVIDERS, classifyParleyRoute, solasCaps } from "./router.mjs";
import { runStaticParley } from "./static.mjs";
import { PARLEY_DELEGATE_TOOL, buildDelegateToolCall } from "./tools.mjs";

export { buildParleyContext, buildParleyMessages, classifyParleyRoute, solasCaps, PROVIDERS };
export { PARLEY_DELEGATE_TOOL, buildDelegateToolCall };
export { runStaticParley, hasUserProviderKey, hasUserGemini, hasUserDeepSeek };

/**
 * Plan or execute a Parley session. Default: dry-run (no network).
 * Live Solas requires BYOK keys; otherwise static card explain.
 */
export function runParley(card, options = {}) {
  const {
    intent = "explain_evidence",
    message = "",
    sessionUses = 0,
    dailyUses = 0,
    execute = false,
    meshAvailable = false,
  } = options;

  const hasGateway = Boolean(process.env.PARLEY_GATEWAY_URL);
  const route = classifyParleyRoute({
    intent,
    verdict: card.verdict,
    sessionUses,
    dailyUses,
    hasGateway,
    meshAvailable,
    hasUserGemini: hasUserGemini(),
    hasUserDeepSeek: hasUserDeepSeek(),
  });

  const cardContext = buildParleyContext(card, { message });
  const messages = buildParleyMessages(card, cardContext, message);
  const provider = PROVIDERS[route.provider];
  const toolCall = buildDelegateToolCall({
    intent,
    cardContext,
    route,
    userMessage: message,
  });

  const plan = {
    parley_id: `parley-${card.card_id.slice(0, 8)}`,
    status: execute ? "executing" : "planned",
    route,
    provider: provider
      ? { id: provider.id, label: provider.label, model: provider.model }
      : null,
    caps: solasCaps(),
    tool_call: toolCall,
    tools_available: [PARLEY_DELEGATE_TOOL],
    messages_preview: {
      system_chars: messages.system.length,
      user_chars: messages.user.length,
    },
    revenue: {
      billable: route.billable,
      estimated_usd: route.estimatedUsd,
      margin_note: route.billable
        ? "Beacon gateway routing fee applies"
        : route.lane === "static"
          ? "Solas static · no platform subsidy · BYOK or Beacon for live AI"
          : "Solas BYOK · your API key · no Innsegall markup",
    },
  };

  if (route.lane === "static") {
    const staticResult = runStaticParley(card, { intent, message });
    plan.static = staticResult;
    plan.response = staticResult.response;
    plan.status = execute ? "static" : "dry_run";
    if (!execute) {
      plan.hint =
        "Static Parley from card data. Pass --execute for the same text, or set GEMINI_API_KEY / DEEPSEEK_API_KEY for live Solas.";
    }
    return plan;
  }

  if (!execute) {
    plan.status = "dry_run";
    plan.hint =
      "Pass --execute with GEMINI_API_KEY, DEEPSEEK_API_KEY, or PARLEY_GATEWAY_URL to call a provider.";
    return plan;
  }

  const keyEnv = provider?.envKey;
  if (route.lane === "mesh") {
    plan.status = "mesh_pending";
    plan.response =
      "Mesh subagent dispatch not wired in CLI v0 · use tool_call payload with your orchestrator.";
    return plan;
  }

  if (!keyEnv || !process.env[keyEnv]) {
    plan.status = "missing_credentials";
    plan.error = `Set ${keyEnv} or use static Parley (no --execute).`;
    return plan;
  }

  plan.status = "live_stub";
  plan.response =
    "Provider HTTP adapter ships in Phase 3b · plan + tool_call are ready for subagent orchestrators.";
  return plan;
}
