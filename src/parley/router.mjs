/**
 * Parley router · BYOK Solas, static fallback, paid Beacon lane.
 */

export const PARLEY_INTENTS = {
  explain_evidence: {
    label: "Explain what the card found",
    lane: "solas",
    maxTokens: 600,
  },
  next_step: {
    label: "What should I do next?",
    lane: "solas",
    maxTokens: 500,
  },
  playbook_step: {
    label: "Walk one fix step",
    lane: "solas",
    maxTokens: 800,
  },
  threat_context: {
    label: "How does this relate to current threats?",
    lane: "solas",
    maxTokens: 700,
  },
  deep_parley: {
    label: "Sound the Horn · escalation help",
    lane: "beacon",
    maxTokens: 4000,
  },
  sound_horn: {
    label: "Sound the Horn · what to do now",
    lane: "solas",
    maxTokens: 900,
  },
  agent_help: {
    label: "Another agent needs bounded Mac hygiene context",
    lane: "mesh",
    maxTokens: 1200,
  },
};

export const PROVIDERS = {
  static: {
    id: "static",
    label: "Static Parley (card-only)",
    lane: "static",
    model: "card/verdict+fixes",
    costPer1k: 0,
    note: "No API key · explain from Battle Scout data",
  },
  gemini_flash_free: {
    id: "gemini_flash_free",
    label: "Gemini Flash (BYOK)",
    lane: "solas",
    model: "gemini-2.0-flash",
    costPer1k: 0,
    envKey: "GEMINI_API_KEY",
    note: "User GEMINI_API_KEY · small explains only",
  },
  deepseek_chat_free: {
    id: "deepseek_chat_free",
    label: "DeepSeek Chat (BYOK)",
    lane: "solas",
    model: "deepseek-chat",
    costPer1k: 0,
    envKey: "DEEPSEEK_API_KEY",
    note: "User DEEPSEEK_API_KEY · Solas explains",
  },
  innsegall_gateway: {
    id: "innsegall_gateway",
    label: "Innsegall Beacon gateway",
    lane: "beacon",
    model: "gateway/auto",
    costPer1k: 0.002,
    marginBps: 1800,
    envKey: "PARLEY_GATEWAY_URL",
    note: "Routed API · user credits or subscription; routing margin applies",
  },
  mesh_subagent: {
    id: "mesh_subagent",
    label: "Registered mesh subagent",
    lane: "mesh",
    model: "subagent/declared",
    costPer1k: 0,
    note: "External agent · overflow to Beacon gateway",
  },
};

const SOLAS_SESSION_CAP = 3;
const SOLAS_DAILY_CAP = 12;

function pickByokProvider({ hasUserGemini, hasUserDeepSeek }) {
  if (hasUserGemini) return "gemini_flash_free";
  if (hasUserDeepSeek) return "deepseek_chat_free";
  return null;
}

function staticRoute({ spec, reason, upgrade = false, estimatedUsd = 0 }) {
  return {
    lane: "static",
    provider: "static",
    billable: false,
    reason,
    upgrade,
    maxTokens: Math.min(spec.maxTokens, 400),
    estimatedUsd,
  };
}

/**
 * @param {{ intent: string, verdict: string, sessionUses?: number, dailyUses?: number, hasGateway?: boolean, meshAvailable?: boolean, hasUserGemini?: boolean, hasUserDeepSeek?: boolean }}
 */
export function classifyParleyRoute({
  intent,
  verdict,
  sessionUses = 0,
  dailyUses = 0,
  hasGateway = false,
  meshAvailable = false,
  hasUserGemini = false,
  hasUserDeepSeek = false,
}) {
  const spec = PARLEY_INTENTS[intent] || PARLEY_INTENTS.explain_evidence;
  const overCap = sessionUses >= SOLAS_SESSION_CAP || dailyUses >= SOLAS_DAILY_CAP;
  const hasByok = hasUserGemini || hasUserDeepSeek;

  if (spec.lane === "beacon" || intent === "deep_parley") {
    if (hasGateway) {
      return {
        lane: "beacon",
        provider: "innsegall_gateway",
        billable: true,
        reason: "Deep Parley · routed through Beacon gateway (margin applies)",
        maxTokens: spec.maxTokens,
        estimatedUsd: 0.008,
      };
    }
    return staticRoute({
      spec,
      reason: "Deep Parley requires Beacon gateway credits or BYOK Solas keys",
    });
  }

  if (intent === "agent_help" && meshAvailable) {
    return {
      lane: "mesh",
      provider: "mesh_subagent",
      billable: false,
      reason: "Mesh subagent · agent handles bounded explain; overflow routes to Beacon",
      maxTokens: spec.maxTokens,
      estimatedUsd: 0,
    };
  }

  if (overCap) {
    if (hasGateway) {
      return {
        lane: "beacon",
        provider: "innsegall_gateway",
        billable: true,
        reason: "Solas cap reached · continue via Beacon gateway",
        maxTokens: Math.min(spec.maxTokens, 400),
        estimatedUsd: 0.003,
      };
    }
    return staticRoute({
      spec,
      reason:
        "Solas cap reached · static explain only · upgrade to Beacon or wait for daily reset",
      upgrade: true,
    });
  }

  const byokProvider = pickByokProvider({ hasUserGemini, hasUserDeepSeek });
  if (!byokProvider) {
    return staticRoute({
      spec,
      reason: "Solas static · add GEMINI_API_KEY or DEEPSEEK_API_KEY for live AI",
    });
  }

  return {
    lane: "solas",
    provider: byokProvider,
    billable: false,
    reason: "Solas lane · BYOK explain (your API key)",
    maxTokens: spec.maxTokens,
    estimatedUsd: 0,
  };
}

export function solasCaps() {
  return { perSession: SOLAS_SESSION_CAP, perDay: SOLAS_DAILY_CAP };
}
