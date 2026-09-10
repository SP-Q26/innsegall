/**
 * Anonymous improvement telemetry · category counts only · no paths or PII.
 * On by default · opt out: INNSEGALL_TELEMETRY=0 · innsegall plan --telemetry-off
 */
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ENGINE_VERSION, PRICING } from "./constants.mjs";
import { buildScoutAggregatePayload } from "./field-report.mjs";
import { buildIssueSpotlightPayload } from "./issue-spotlight.mjs";
import { loadPrefs, savePrefs, utcDay } from "./preferences.mjs";
import { ensureDirs, supportPath } from "./storage.mjs";
import { platformVersion } from "./shell.mjs";

const INSTALL_ID_FILE = "install_id.json";
const TELEMETRY_URL = `${PRICING.site_url}/api/telemetry`;
const GOSPEL_URL = `${PRICING.site_url}/.well-known/innsegall-gospel.json`;

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

/** Default on unless env, flag, or saved opt-out. */
export function telemetryEnabled(opts = {}) {
  if (opts.noTelemetry) return false;
  if (process.env.INNSEGALL_TELEMETRY === "0") return false;
  if (process.env.INNSEGALL_TELEMETRY === "1") return true;
  const prefs = loadPrefs();
  if (prefs.telemetry_opt_out) return false;
  return true;
}

export function warriorRef() {
  return process.env.INNSEGALL_WARRIOR_REF || null;
}

export async function postTelemetry(event, payload, opts = {}) {
  try {
    const res = await fetch(TELEMETRY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload }),
    });
    if (!opts.quiet && res.status === 204) {
      return { ok: true, note: "telemetry_noop" };
    }
    if (res.ok) return { ok: true, status: res.status };
    return { ok: false, status: res.status };
  } catch {
    return { ok: false, offline: true };
  }
}

/** @param {{ quiet?: boolean, noTelemetry?: boolean, force?: boolean }} opts */
export async function pingInstall(opts = {}) {
  if (!telemetryEnabled(opts)) return { skipped: true, reason: "disabled" };

  const day = utcDay();
  const prefs = loadPrefs();
  if (prefs.last_install_ping_day === day && !opts.force) {
    return { skipped: true, reason: "already_sent" };
  }

  const macos = platformVersion();
  const macos_major = String(macos).split(".")[0] || "0";
  const payload = {
    engine_version: ENGINE_VERSION,
    macos_major,
    day,
    install_id: getInstallId(),
  };
  const ref = warriorRef();
  if (ref) payload.warrior_ref = ref.slice(0, 64);

  const result = await postTelemetry("install_ping", payload, opts);
  if (result.ok) savePrefs({ last_install_ping_day: day });
  return result;
}

/** @param {object} card @param {{ quiet?: boolean, noTelemetry?: boolean, force?: boolean }} opts */
export async function sendScoutAggregate(card, opts = {}) {
  if (!telemetryEnabled(opts)) return { skipped: true, reason: "disabled" };
  if (card?.smoke) return { skipped: true, reason: "smoke" };

  const day = utcDay();
  const prefs = loadPrefs();
  if (prefs.last_aggregate_day === day && !opts.force) {
    return { skipped: true, reason: "already_sent" };
  }

  const payload = buildScoutAggregatePayload(day);
  if (!payload || payload.total_scouts < 1) {
    return { skipped: true, reason: "no_data" };
  }

  const result = await postTelemetry("scout_aggregate", payload, opts);
  if (result.ok) savePrefs({ last_aggregate_day: day });
  return result;
}

/** @param {object} card @param {object|null} previousCard @param {{ quiet?: boolean, noTelemetry?: boolean, force?: boolean }} opts */
export async function sendIssueSpotlight(card, previousCard, opts = {}) {
  if (!telemetryEnabled(opts)) return { skipped: true, reason: "disabled" };
  if (card?.smoke) return { skipped: true, reason: "smoke" };

  const day = utcDay();
  const payload = buildIssueSpotlightPayload(card, previousCard, day);
  if (!payload) return { skipped: true, reason: "no_issue_event" };

  const prefs = loadPrefs();
  const dedupeKey = `issue_${payload.issue_key}_${payload.event_type}`;
  const sent = prefs.issue_spotlight_sent || {};
  if (sent[dedupeKey] === day && !opts.force) {
    return { skipped: true, reason: "already_sent_today" };
  }

  const result = await postTelemetry("issue_spotlight", payload, opts);
  if (result.ok) {
    savePrefs({
      issue_spotlight_sent: { ...sent, [dedupeKey]: day },
    });
  }
  return { ...result, payload };
}

/** Check gospel for a newer engine_version · once per UTC day unless force. */
export async function checkForUpdates(opts = {}) {
  if (process.env.INNSEGALL_NO_UPDATE_CHECK === "1") {
    return { skipped: true, reason: "disabled" };
  }

  const prefs = loadPrefs();
  const day = utcDay();
  if (prefs.last_update_check_day === day && !opts.force) {
    if (prefs.last_update_latest != null) {
      return {
        cached: true,
        ok: true,
        latest: prefs.last_update_latest,
        current: ENGINE_VERSION,
        updateAvailable: Boolean(prefs.last_update_available),
      };
    }
  }

  try {
    const res = await fetch(GOSPEL_URL, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { ok: false, status: res.status };
    const data = await res.json();
    const latest = data?.engine_version || null;
    const updateAvailable = Boolean(latest && latest !== ENGINE_VERSION);
    savePrefs({
      last_update_check_day: day,
      last_update_latest: latest,
      last_update_available: updateAvailable,
    });
    return {
      ok: true,
      latest,
      current: ENGINE_VERSION,
      updateAvailable,
    };
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
