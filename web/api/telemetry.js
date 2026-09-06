/**
 * Innsegall telemetry · anonymized operator aggregates only.
 * POST { event, payload } · forwards to XANO_EVENTS_URL when set · else 204 no-op.
 * Never accepts Battle Scout bodies, paths, emails, or checkout_complete from clients.
 */

const ALLOWED_EVENTS = new Set(["install_ping", "scout_aggregate", "checkout_complete"]);
const CLIENT_EVENTS = new Set(["install_ping", "scout_aggregate"]);

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

/** Reject payloads that carry PII keys or path-like strings anywhere in the tree. */
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
  if (event === "checkout_complete") return "checkout_complete is server-only";
  return "unknown event";
}

async function forwardToXano(event, payload) {
  const url = process.env.XANO_EVENTS_URL;
  if (!url) return { forwarded: false };

  const headers = { "Content-Type": "application/json" };
  if (process.env.XANO_API_KEY) {
    headers.Authorization = `Bearer ${process.env.XANO_API_KEY}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      event,
      payload,
      source: "vercel_telemetry",
      received_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`xano_forward_failed ${res.status} ${text.slice(0, 200)}`);
  }

  return { forwarded: true };
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
    await forwardToXano(event, payload);
    return res.status(202).json({ ok: true, forwarded: true });
  } catch (e) {
    console.error("telemetry", e.message);
    return res.status(502).json({ error: "forward_failed" });
  }
}
