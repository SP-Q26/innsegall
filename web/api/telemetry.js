/**
 * Innsegall telemetry · anonymized operator aggregates only.
 * POST { event, payload } · forwards to XANO_EVENTS_URL when set · else 204 no-op.
 * Never accepts Battle Scout bodies, paths, emails, or checkout_complete from clients.
 */

import { forwardToXano } from "../lib/xano-forward.mjs";

const ALLOWED_EVENTS = new Set([
  "install_ping",
  "scout_aggregate",
  "marketing_ping",
  "issue_spotlight",
  "checkout_complete",
]);
const CLIENT_EVENTS = new Set([
  "install_ping",
  "scout_aggregate",
  "marketing_ping",
  "issue_spotlight",
]);

const ISSUE_EVENT_TYPES = new Set(["identified", "resolved"]);

const MARKETING_PAGES = new Set([
  "home",
  "alpha",
  "guide",
  "map",
  "boat",
  "clan",
  "warriors",
  "blog",
  "blog_post",
  "privacy",
  "tos",
  "success",
  "sample",
  "other",
]);

const REF_CHANNELS = new Set([
  "direct",
  "search",
  "agent",
  "social",
  "warrior",
  "internal",
  "unknown",
]);

const FORBIDDEN_KEYS = new Set([
  "email",
  "e_mail",
  "mail",
  "path",
  "filepath",
  "file_path",
  "hostname",
  "host",
  "username",
  "user",
  "name",
  "first_name",
  "last_name",
  "phone",
  "address",
  "ip",
  "ip_address",
  "card",
  "card_id",
  "card_json",
  "html",
  "body",
  "transcript",
  "parley",
  "password",
  "token",
  "secret",
  "license",
  "stripe_customer",
  "customer_email",
]);

const PATH_LIKE =
  /(?:^|[\s"'`])(?:~\/|\/Users\/|\/home\/|\/var\/|C:\\|\\\\|[A-Za-z]:\\|\.ssh|Library\/Application Support)/;

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function findPiiViolation(value, path = "payload") {
  if (value === null || value === undefined) return null;

  if (typeof value === "string") {
    if (PATH_LIKE.test(value)) {
      return `${path}: path-like string`;
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return `${path}: email-like string`;
    }
    return null;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = findPiiViolation(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }

  if (isPlainObject(value)) {
    for (const [key, nested] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(String(key).toLowerCase())) {
        return `${path}.${key}: forbidden key`;
      }
      const hit = findPiiViolation(nested, `${path}.${key}`);
      if (hit) return hit;
    }
  }

  return null;
}

function validateInstallPing(payload) {
  if (!isPlainObject(payload)) return "payload must be an object";
  const { engine_version, macos_major, day, install_id } = payload;
  if (typeof engine_version !== "string" || engine_version.length > 32) {
    return "engine_version required (max 32 chars)";
  }
  if (typeof macos_major !== "string" || !/^\d{1,2}$/.test(macos_major)) {
    return "macos_major required (major version digits only)";
  }
  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return "day required (YYYY-MM-DD)";
  }
  if (typeof install_id !== "string" || install_id.length > 64) {
    return "install_id required (max 64 chars)";
  }
  if (payload.warrior_ref != null) {
    if (typeof payload.warrior_ref !== "string" || payload.warrior_ref.length > 64) {
      return "warrior_ref max 64 chars";
    }
  }
  return null;
}

function validateMarketingPing(payload) {
  if (!isPlainObject(payload)) return "payload must be an object";
  if (typeof payload.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(payload.day)) {
    return "day required (YYYY-MM-DD)";
  }
  if (typeof payload.page !== "string" || !MARKETING_PAGES.has(payload.page)) {
    return "page required (known category enum)";
  }
  if (typeof payload.ref_channel !== "string" || !REF_CHANNELS.has(payload.ref_channel)) {
    return "ref_channel required (known enum)";
  }
  if (typeof payload.session_id !== "string" || payload.session_id.length > 64) {
    return "session_id required (max 64 chars)";
  }
  if (payload.warrior_ref != null) {
    if (typeof payload.warrior_ref !== "string" || payload.warrior_ref.length > 64) {
      return "warrior_ref max 64 chars";
    }
  }
  return null;
}

function validateIssueSpotlight(payload) {
  if (!isPlainObject(payload)) return "payload must be an object";
  if (typeof payload.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(payload.day)) {
    return "day required (YYYY-MM-DD)";
  }
  if (typeof payload.event_type !== "string" || !ISSUE_EVENT_TYPES.has(payload.event_type)) {
    return "event_type required (identified|resolved)";
  }
  if (typeof payload.issue_key !== "string" || payload.issue_key.length > 64) {
    return "issue_key required (max 64 chars)";
  }
  if (typeof payload.issue_slug !== "string" || payload.issue_slug.length > 80) {
    return "issue_slug required (max 80 chars)";
  }
  if (typeof payload.flow !== "string" || payload.flow.length > 32) {
    return "flow required (max 32 chars)";
  }
  if (!Array.isArray(payload.attention_buckets) || payload.attention_buckets.length > 8) {
    return "attention_buckets required (array, max 8)";
  }
  if (!Array.isArray(payload.fix_categories) || payload.fix_categories.length > 8) {
    return "fix_categories required (array, max 8)";
  }
  for (const b of payload.attention_buckets) {
    if (typeof b !== "string" || b.length > 48) return "attention_buckets items max 48 chars";
  }
  for (const f of payload.fix_categories) {
    if (typeof f !== "string" || f.length > 48) return "fix_categories items max 48 chars";
  }
  if (typeof payload.engine_version !== "string" || payload.engine_version.length > 32) {
    return "engine_version required (max 32 chars)";
  }
  if (typeof payload.content_hash !== "string" || payload.content_hash.length > 24) {
    return "content_hash required (max 24 chars)";
  }
  return null;
}

function validateScoutAggregate(payload) {
  if (!isPlainObject(payload)) return "payload must be an object";
  if (typeof payload.day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(payload.day)) {
    return "day required (YYYY-MM-DD)";
  }
  if (typeof payload.total_scouts !== "number" || payload.total_scouts < 0) {
    return "total_scouts required (non-negative number)";
  }
  if (!isPlainObject(payload.by_verdict) || !isPlainObject(payload.by_flow)) {
    return "by_verdict and by_flow required objects";
  }
  return null;
}

function validatePayload(event, payload) {
  if (event === "install_ping") return validateInstallPing(payload);
  if (event === "scout_aggregate") return validateScoutAggregate(payload);
  if (event === "marketing_ping") return validateMarketingPing(payload);
  if (event === "issue_spotlight") return validateIssueSpotlight(payload);
  if (event === "checkout_complete") return "checkout_complete is server-only";
  return "unknown event";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "invalid_json" });
    }
  }

  const event = body?.event;
  const payload = body?.payload;

  if (typeof event !== "string" || !ALLOWED_EVENTS.has(event)) {
    return res.status(400).json({ error: "invalid_event" });
  }

  if (!CLIENT_EVENTS.has(event)) {
    return res.status(403).json({ error: "server_only", event });
  }

  const shapeErr = validatePayload(event, payload);
  if (shapeErr) {
    return res.status(400).json({ error: "invalid_payload", message: shapeErr });
  }

  const piiErr = findPiiViolation(payload);
  if (piiErr) {
    return res.status(422).json({ error: "pii_rejected", message: piiErr });
  }

  if (!process.env.XANO_EVENTS_URL) {
    return res.status(204).end();
  }

  try {
    await forwardToXano(event, payload, "vercel_telemetry");
    return res.status(202).json({ ok: true, forwarded: true });
  } catch (e) {
    console.error("telemetry", e.message);
    const hint = e.code === "xano_key_mismatch" ? "xano_key_mismatch" : "xano_forward_failed";
    return res.status(502).json({
      error: "forward_failed",
      hint,
      fix: "Vercel XANO_API_KEY must match Xano sk_live_innsegall_ops_ value · see innsegall.com/stability",
    });
  }
}
