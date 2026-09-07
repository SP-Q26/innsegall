/**
 * Per-IP Parley rate limit · protects GEMINI_API_KEY spend on serverless.
 * Best-effort in-memory (per instance) · sufficient for alpha abuse deterrence.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 40;
const buckets = new Map();

export function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  if (Array.isArray(fwd) && fwd[0]) return String(fwd[0]).trim();
  return req.socket?.remoteAddress || "unknown";
}

export function checkParleyRateLimit(ip) {
  const now = Date.now();
  const key = ip || "unknown";
  let bucket = buckets.get(key);
  if (!bucket || now - bucket.start > WINDOW_MS) {
    bucket = { start: now, count: 0 };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    return {
      allowed: false,
      retry_after_sec: Math.ceil((bucket.start + WINDOW_MS - now) / 1000),
    };
  }
  return { allowed: true, remaining: MAX_REQUESTS - bucket.count };
}
