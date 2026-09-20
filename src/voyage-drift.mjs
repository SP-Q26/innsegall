/**
 * Read-only drift between scouts · Voyage rhythm · not a persistence blocker.
 */
import { CHECK_CATALOG } from "./check-catalog.mjs";

const PERSISTENCE_DRIFT_IDS = ["launch_ghosts", "login_items", "config_profiles"];

/**
 * @param {object} current
 * @param {object|null} previous
 * @returns {{ id: string, name: string, from: string|null, to: string }[]|null}
 */
export function persistenceDriftSincePrevious(current, previous) {
  if (!previous || current?.smoke || previous?.smoke) return null;
  const curr = new Map((current.checks_run || []).map((c) => [c.id, c.status]));
  const prev = new Map((previous.checks_run || []).map((c) => [c.id, c.status]));
  const changes = [];
  for (const id of PERSISTENCE_DRIFT_IDS) {
    const from = prev.get(id) ?? null;
    const to = curr.get(id) ?? null;
    if (from === to) continue;
    if (!to) continue;
    const name = CHECK_CATALOG[id]?.looked_at?.split("(")[0]?.trim() || id;
    changes.push({ id, name, from, to });
  }
  return changes.length ? changes : null;
}
