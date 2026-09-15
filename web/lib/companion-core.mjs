/**
 * Innsegall web companion · shared validation + voyage helpers (browser + audit).
 */

export const COMPANION_STORAGE_KEY = "innsegall_companion_inbox_v1";
export const COMPANION_FORMAT = "innsegall-battle-scout-ai/v1";
export const MAX_IMPORT_BYTES = 512 * 1024;

const TRIAGE = new Set(["LIKELY_OK", "FIX_LIST", "ESCALATE"]);

export function validateBattleScoutAi(raw) {
  let payload = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return { ok: false, error: "Paste is empty." };
    if (trimmed.length > MAX_IMPORT_BYTES) {
      return { ok: false, error: "Report is too large (max 512 KB)." };
    }
    try {
      payload = JSON.parse(trimmed);
    } catch {
      return { ok: false, error: "Not valid JSON." };
    }
  }
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Expected a JSON object." };
  }
  if (payload.format !== COMPANION_FORMAT) {
    return { ok: false, error: `Wrong format · expected ${COMPANION_FORMAT}.` };
  }
  if (!TRIAGE.has(payload.verdict) || !TRIAGE.has(payload.triage_level)) {
    return { ok: false, error: "Missing or invalid verdict / triage_level." };
  }
  if (!payload.summary || typeof payload.summary !== "string") {
    return { ok: false, error: "Missing summary." };
  }
  if (!payload.flow || typeof payload.flow !== "string") {
    return { ok: false, error: "Missing flow." };
  }
  const cardId = payload.card_id || `${payload.flow}-${payload.created_at || "unknown"}`;
  if (!Array.isArray(payload.does_not_check) || payload.does_not_check.length < 1) {
    return { ok: false, error: "Missing does_not_check scope list." };
  }
  const report = {
    ...payload,
    card_id: cardId,
  };
  return { ok: true, report };
}

export function inboxEntryKey(report) {
  return `${report.card_id}::${report.created_at || ""}`;
}

/** Free-tier voyage days: 1st and 15th (local calendar). */
export function isFreeVoyageDay(date = new Date()) {
  const d = date.getDate();
  return d === 1 || d === 15;
}

export function nextFreeVoyageDate(from = new Date()) {
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 10, 0, 0, 0);
  for (let i = 0; i < 62; i++) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() + i);
    if (isFreeVoyageDay(d)) return d;
  }
  return cursor;
}

export function formatVoyageLabel(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
