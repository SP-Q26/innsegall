/**
 * Shared Xano forward · innsegall_events shape.
 */
export async function forwardToXano(event, payload, source = "vercel") {
  const url = process.env.XANO_EVENTS_URL;
  if (!url) return { forwarded: false };

  const headers = { "Content-Type": "application/json" };
  // Custom handshake · Xano env sk_live_innsegall_ops_ / sk_test_innsegall_ops_ precondition (not Meta API key).
  if (process.env.XANO_API_KEY) {
    headers["X-API-Key"] = process.env.XANO_API_KEY;
  }

  const day =
    payload?.day ||
    new Date().toISOString().slice(0, 10);

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      event,
      payload,
      day,
      engine_version: payload?.engine_version || null,
      source,
      received_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`xano_forward_failed ${res.status} ${text.slice(0, 200)}`);
  }
  return { forwarded: true };
}
