/**
 * Parley API · live Solas when GEMINI_API_KEY is set · static fallback always.
 * CORS open so Battle Scout HTML opened locally (file://) can fetch help.
 * GET returns agent discovery · links gospel read order for integrators.
 */
import { buildParleyMessages } from "../../src/parley/prompt.mjs";
import { runStaticParley } from "../../src/parley/static.mjs";
import { buildInnsegallAiBus } from "../../src/gospel.mjs";
import { checkParleyRateLimit, clientIp } from "../../lib/parley-rate-limit.mjs";

const SITE = "https://innsegall.com";

const INTENT_ALIASES = {
  explain: "explain_evidence",
  horn: "sound_horn",
  next: "next_step",
  sound_horn: "sound_horn",
  explain_evidence: "explain_evidence",
  next_step: "next_step",
  deep_parley: "deep_parley",
};

function parleyDiscovery() {
  const bus = buildInnsegallAiBus();
  return {
    service: "innsegall-parley",
    version: 1,
    description: "Card-bound Battle Scout explain · static fallback without GEMINI_API_KEY",
    agent_read_order: bus.agent_read_order,
    agent_surfaces: bus.agent_surfaces,
    usage: {
      method: "POST",
      body: {
        intent: "explain_evidence | next_step | sound_horn | deep_parley",
        card: "Battle Scout slice · verdict + checks_run required",
        message: "optional user question · max 2000 chars",
      },
      response: { lane: "live | static", response: "plain English assist" },
    },
    ethics: bus.ethics,
    gospel: `${SITE}/.well-known/innsegall-gospel.json`,
    llms_txt: `${SITE}/llms.txt`,
  };
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader(
    "Link",
    `<${SITE}/llms.txt>; rel="describedby", <${SITE}/.well-known/innsegall-gospel.json>; rel="describedby"`
  );
}

function cardFromBody(body) {
  const raw = body?.card || body;
  if (!raw?.verdict) return null;
  const fixes = raw.fixes_recommended || raw.fixes || [];
  const checks =
    raw.checks_run ||
    (raw.attention_checks || []).map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      detail: c.detail,
      evidence: c.evidence || [],
    }));
  return {
    card_id: raw.card_id || "web-parley",
    verdict: raw.verdict,
    flow: raw.flow || "mac_hygiene",
    summary: raw.summary || "",
    stats: raw.stats || {},
    fixes_recommended: fixes,
    checks_run: checks,
    user_inputs: raw.user_inputs || {},
  };
}

async function callGemini(messages) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${messages.system}\n\n${messages.user}` }] }],
      generationConfig: { maxOutputTokens: 900, temperature: 0.35 },
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim() || null;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") {
    return res.status(200).json(parleyDiscovery());
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return res.status(405).json({ error: "method_not_allowed", discovery: parleyDiscovery() });
  }

  const ip = clientIp(req);
  const rate = checkParleyRateLimit(ip);
  if (!rate.allowed) {
    res.setHeader("Retry-After", String(rate.retry_after_sec));
    return res.status(429).json({
      error: "rate_limited",
      retry_after_sec: rate.retry_after_sec,
      discovery: parleyDiscovery(),
    });
  }

  const body = req.body || {};
  const intentKey = INTENT_ALIASES[body.intent] || "explain_evidence";
  const message = String(body.message || "").slice(0, 2000);
  const card = cardFromBody(body);
  if (!card) return res.status(400).json({ error: "missing_card", discovery: parleyDiscovery() });

  const staticResult = runStaticParley(card, { intent: intentKey, message });
  const context = body.card || card;

  try {
    const live = await callGemini(buildParleyMessages(card, context, message));
    if (live) {
      return res.status(200).json({ lane: "live", response: live });
    }
  } catch (e) {
    console.error("parley", e);
  }

  return res.status(200).json({ lane: "static", response: staticResult.response });
}
