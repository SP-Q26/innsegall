/**
 * Local CLI preferences · telemetry opt-out, rate-limit markers, update cache.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ensureDirs, supportPath } from "./storage.mjs";

const PREFS_FILE = "preferences.json";

export function utcDay(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function loadPrefs() {
  ensureDirs();
  const path = join(supportPath(), PREFS_FILE);
  if (!existsSync(path)) return {};
  try {
    const raw = JSON.parse(readFileSync(path, "utf8"));
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

/** @param {Record<string, unknown>} patch */
export function savePrefs(patch) {
  ensureDirs();
  const path = join(supportPath(), PREFS_FILE);
  const next = { ...loadPrefs(), ...patch };
  writeFileSync(path, JSON.stringify(next, null, 2), "utf8");
  return next;
}
