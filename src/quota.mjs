/**
 * Scout quota · local billing gate.
 * Free: 2 Voyages per month on the 1st and 15th · extra runs need credits or clan.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PRICING } from "./constants.mjs";
import { ensureDirs, supportPath } from "./storage.mjs";

export const VOYAGE_DAYS = [1, 15];
const QUOTA_FILE = "quota.json";

function monthKey(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function quotaPath() {
  return join(supportPath(), QUOTA_FILE);
}

function defaultQuota() {
  return {
    plan: "free",
    month: monthKey(),
    voyage_completed: [],
    extra_credits: 0,
    extra_used: 0,
    scouts_used: 0,
    scouts_limit: PRICING.free.scouts_per_month,
    updated_at: new Date().toISOString(),
  };
}

function syncScoutCount(q) {
  const voyages = (q.voyage_completed || []).length;
  const extra = q.extra_used || 0;
  q.scouts_used = voyages + extra;
  return q;
}

export function voyageSlotForDate(d = new Date()) {
  const day = d.getDate();
  if (VOYAGE_DAYS.includes(day)) return day;
  return null;
}

/** Next voyage calendar day (1 or 15) for messaging. */
export function nextVoyageDate(d = new Date()) {
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  if (day < 15) {
    return new Date(y, m, 15);
  }
  return new Date(y, m + 1, 1);
}

export function loadQuota() {
  ensureDirs();
  const path = quotaPath();
  if (!existsSync(path)) return defaultQuota();
  try {
    const raw = JSON.parse(readFileSync(path, "utf8"));
    if (raw.month !== monthKey()) {
      const plan = raw.plan === "clan" ? "clan" : "free";
      return syncScoutCount({
        ...defaultQuota(),
        plan,
        scouts_limit:
          plan === "clan" ? PRICING.clan.scouts_per_month : PRICING.free.scouts_per_month,
      });
    }
    const q = syncScoutCount({ ...defaultQuota(), ...raw });
    q.scouts_limit =
      q.plan === "clan" ? PRICING.clan.scouts_per_month : PRICING.free.scouts_per_month;
    return q;
  } catch {
    return defaultQuota();
  }
}

export function saveQuota(q) {
  ensureDirs();
  syncScoutCount(q);
  const path = quotaPath();
  writeFileSync(
    path,
    JSON.stringify({ ...q, updated_at: new Date().toISOString() }, null, 2),
    "utf8"
  );
  return path;
}

/** @param {{ plan?: string, extra_credits?: number }} opts */
export function setPlan(plan, opts = {}) {
  const q = loadQuota();
  if (plan === "clan") {
    q.plan = "clan";
    q.scouts_limit = PRICING.clan.scouts_per_month;
  } else {
    q.plan = "free";
    q.scouts_limit = PRICING.free.scouts_per_month;
  }
  if (typeof opts.extra_credits === "number") {
    q.extra_credits = Math.max(0, opts.extra_credits);
  }
  saveQuota(q);
  return q;
}

export function addExtraCredits(n = 1) {
  const q = loadQuota();
  q.extra_credits = (q.extra_credits || 0) + n;
  saveQuota(q);
  return q;
}

function isClanBypass() {
  return process.env.INNSEGALL_CLAN === "1" || process.env.INNSEGALL_PLAN === "clan";
}

/**
 * @param {{ smoke?: boolean, force?: boolean; voyage?: boolean; date?: Date }} opts
 */
export function checkScoutQuota(opts = {}) {
  if (opts.smoke || opts.force) {
    return { allowed: true, quota: loadQuota(), reason: "bypass", charge: null };
  }
  if (isClanBypass()) {
    return { allowed: true, quota: { ...loadQuota(), plan: "clan" }, reason: "clan_env", charge: null };
  }

  const q = loadQuota();
  if (q.plan === "clan") {
    return { allowed: true, quota: q, reason: "clan_plan", charge: null };
  }

  const d = opts.date || new Date();
  const slot = voyageSlotForDate(d);
  const completed = q.voyage_completed || [];

  if (opts.voyage && slot && !completed.includes(slot)) {
    return { allowed: true, quota: q, reason: "voyage_slot", charge: { type: "voyage", slot } };
  }

  if (!opts.voyage && slot && !completed.includes(slot)) {
    return { allowed: true, quota: q, reason: "voyage_day", charge: { type: "voyage", slot } };
  }

  const creditsLeft = (q.extra_credits || 0) - (q.extra_used || 0);
  if (creditsLeft > 0) {
    return { allowed: true, quota: q, reason: "extra_credit", charge: { type: "extra" } };
  }

  return {
    allowed: false,
    quota: q,
    reason: "limit_reached",
    message: formatQuotaBlocked(q, d),
    charge: null,
  };
}

export function recordScoutUse(opts = {}) {
  if (opts.smoke || opts.force || opts.skipRecord) return loadQuota();
  if (isClanBypass()) return loadQuota();

  const q = loadQuota();
  if (q.plan === "clan") return q;

  const charge = opts.charge || opts._charge;
  if (charge?.type === "voyage" && charge.slot) {
    if (!q.voyage_completed.includes(charge.slot)) {
      q.voyage_completed = [...(q.voyage_completed || []), charge.slot].sort((a, b) => a - b);
    }
  } else if (charge?.type === "extra") {
    q.extra_used = (q.extra_used || 0) + 1;
  } else {
    const d = opts.date || new Date();
    const slot = voyageSlotForDate(d);
    if (slot && !(q.voyage_completed || []).includes(slot)) {
      q.voyage_completed = [...(q.voyage_completed || []), slot].sort((a, b) => a - b);
    } else {
      q.extra_used = (q.extra_used || 0) + 1;
    }
  }

  saveQuota(q);
  return q;
}

export function formatQuotaBlocked(q, d = new Date()) {
  const next = nextVoyageDate(d);
  const nextStr = next.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const voyages = (q.voyage_completed || []).join(", ") || "none";
  return [
    `Battle Scout limit reached for this month.`,
    `Voyages completed (1st & 15th): ${voyages}. Next scheduled voyage: ${nextStr}.`,
    `Extra run: $${PRICING.extra_run.usd.toFixed(2)} · ${PRICING.site_url}/#pricing`,
    `Clan unlimited (5 seats): $${PRICING.clan.usd_monthly.toFixed(2)}/mo · ${PRICING.site_url}/#pricing`,
    `Pay → download license.json → innsegall plan --import-license ~/Downloads/innsegall-license.json`,
  ].join("\n");
}

export function formatPlanStatus(q) {
  const limit =
    q.plan === "clan" ? "unlimited" : String(q.scouts_limit ?? PRICING.free.scouts_per_month);
  const used = q.scouts_used ?? 0;
  const creditsLeft = Math.max(0, (q.extra_credits || 0) - (q.extra_used || 0));
  return {
    plan: q.plan,
    month: q.month,
    scouts_used: used,
    scouts_limit: limit,
    voyage_completed: q.voyage_completed || [],
    voyage_days: VOYAGE_DAYS,
    extra_credits: q.extra_credits || 0,
    extra_credits_remaining: creditsLeft,
    remaining:
      q.plan === "clan"
        ? "unlimited"
        : Math.max(0, (q.scouts_limit ?? PRICING.free.scouts_per_month) - used),
    next_voyage: nextVoyageDate().toISOString().slice(0, 10),
  };
}
