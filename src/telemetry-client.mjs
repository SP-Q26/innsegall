/**
 * Opt-in install telemetry · anonymized · no paths or PII.
 */
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ENGINE_VERSION } from "./constants.mjs";
import { ensureDirs, supportPath } from "./storage.mjs";
import { platformVersion } from "./shell.mjs";

const INSTALL_ID_FILE = "install_id.json";
const TELEMETRY_URL = "https://innsegall.com/api/telemetry";

function installIdPath() {
  return join(supportPath(), INSTALL_ID_FILE);
}

export function getInstallId() {
  ensureDirs();
  const path = installIdPath();
  if (existsSync(path)) {
    try {
      const raw = JSON.parse(readFileSync(path, "utf8"));
      if (raw?.install_id) return raw.install_id;
    } catch {
      /* regenerate */
    }
  }
  const install_id = randomUUID();
  writeFileSync(
    path,
    JSON.stringify({ install_id, created_at: new Date().toISOString() }, null, 2),
    "utf8"
  );
  return install_id;
}

export function telemetryEnabled(opts = {}) {
  if (opts.share) return true;
  if (process.env.INNSEGALL_TELEMETRY === "1") return true;
  if (process.env.INNSEGALL_TELEMETRY === "0") return false;
  return false;
}

export function warriorRef() {
  return process.env.INNSEGALL_WARRIOR_REF || null;
}

/** @param {{ quiet?: boolean }} opts */
export async function pingInstall(opts = {}) {
  if (!telemetryEnabled(opts)) return { skipped: true };

  const macos = platformVersion();
  const macos_major = String(macos).split(".")[0] || "0";
  const payload = {
    engine_version: ENGINE_VERSION,
    macos_major,
    day: new Date().toISOString().slice(0, 10),
    install_id: getInstallId(),
  };
  const ref = warriorRef();
  if (ref) payload.warrior_ref = ref.slice(0, 64);

  try {
    const res = await fetch(TELEMETRY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "install_ping", payload }),
    });
    if (!opts.quiet && res.status === 204) {
      return { ok: true, note: "telemetry_noop" };
    }
    if (res.ok) return { ok: true };
    return { ok: false, status: res.status };
  } catch {
    return { ok: false, offline: true };
  }
}

export function reportHash(card) {
  const body = JSON.stringify({
    verdict: card?.verdict,
    flow: card?.flow,
    checks: (card?.checks_run || []).map((c) => `${c.id}:${c.status}`).sort(),
  });
  return createHash("sha256").update(body).digest("hex").slice(0, 12);
}
