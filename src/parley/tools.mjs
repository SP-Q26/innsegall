/**
 * Parley subagent tool definitions · same shape as MCP / Cursor Task delegation.
 * Parent Parley orchestrator calls `parley_delegate`; child runs bounded assist.
 */

export const PARLEY_DELEGATE_TOOL = {
  name: "parley_delegate",
  description:
    "Delegate bounded Innsegall Parley assist to a free Solas subagent (Gemini/DeepSeek) or paid Beacon gateway. Never upload full disk scans · only redacted card context.",
  inputSchema: {
    type: "object",
    properties: {
      intent: {
        type: "string",
        enum: [
          "explain_evidence",
          "next_step",
          "playbook_step",
          "threat_context",
          "deep_parley",
          "agent_help",
        ],
        description: "What kind of help the user or calling agent needs",
      },
      card_context: {
        type: "object",
        description:
          "Redacted Battle Scout slice from buildParleyContext() · verdict, fixes, attention checks only",
      },
      user_message: {
        type: "string",
        description: "Optional user question (max 2000 chars)",
      },
      prefer_free: {
        type: "boolean",
        default: true,
        description: "Try Solas free lane before Beacon gateway",
      },
      mesh_agent_id: {
        type: "string",
        description: "Optional registered mesh subagent id (agent_help intent)",
      },
    },
    required: ["intent", "card_context"],
  },
};

export const PARLEY_MESH_REGISTER_TOOL = {
  name: "parley_mesh_register",
  description:
    "Register an external AI agent as a Solas-tier subagent. Agent handles capped explains; earns structured feedback; overflow routes to paid Beacon pool.",
  inputSchema: {
    type: "object",
    properties: {
      agent_id: { type: "string" },
      display_name: { type: "string" },
      capabilities: {
        type: "array",
        items: { type: "string" },
        description: "e.g. explain_evidence, threat_context",
      },
      endpoint_url: {
        type: "string",
        description: "HTTPS webhook the router POSTs delegate payloads to",
      },
    },
    required: ["agent_id", "capabilities", "endpoint_url"],
  },
};

/** Tool call payload the parent agent emits for a child subagent. */
export function buildDelegateToolCall({ intent, cardContext, route, userMessage = "" }) {
  return {
    type: "tool_call",
    tool: PARLEY_DELEGATE_TOOL.name,
    arguments: {
      intent,
      card_context: cardContext,
      user_message: userMessage,
      route_hint: {
        lane: route.lane,
        provider: route.provider,
        max_tokens: route.maxTokens,
        billable: route.billable,
      },
    },
  };
}
