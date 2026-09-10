/**
 * Scout quota · local billing gate.
 * Free: 2 Voyages per month on the 1st and 15th · extra runs need credits or clan.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isOperatorMode } from "./operator.mjs";
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
    welcome_scout_redeemed: false,
    scouts_used: 0,
    scouts_limit: PRICING.free.scouts_per_month,
    updated_at: new Date().toISOString(),
  };
}

function syncScoutCount(q) {
  const voyages = (q.voyage_completed || []).length;
  const extra = q.extra_used || 0;
  const welcome = q.welcome_scout_redeemed ? 1 : 0;
  q.scouts_used = voyages + extra + welcome;
  return q;
}

export function voyageSlotForDate(d = new Date()) {
  const day = d.getDate();
  if (VOYAGE_DAYS.includes(day)) return day;
  return null;
}

/** Next upcoming voyage calendar day (1 or 15) · nearest future slot. */
export function nextVoyageDate(d = new Date()) {
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  for (const vd of VOYAGE_DAYS) {
    if (vd > day) return new Date(y, m, vd);
  }
  return new Date(y, m + 1, VOYAGE_DAYS[0]);
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
        welcome_scout_redeemed: Boolean(raw.welcome_scout_redeemed),
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
  return isOperatorMode() && (process.env.INNSEGALL_CLAN === "1" || process.env.INNSEGALL_PLAN === "clan");
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

  if (!q.welcome_scout_redeemed) {
    return {
      allowed: true,
      quota: q,
      reason: "welcome_scout",
      charge: { type: "welcome" },
    };
  }

  const reason = slot ? "limit_reached" : "off_voyage_day";

  return {
    allowed: false,
    quota: q,
    reason,
    message: formatQuotaBlocked(q, d, reason),
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
  } else if (charge?.type === "welcome") {
    q.welcome_scout_redeemed = true;
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

export function formatQuotaBlocked(q, d = new Date(), reason = "limit_reached") {
  const next = nextVoyageDate(d);
  const nextStr = next.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const voyages = (q.voyage_completed || []).join(", ") || "none";
  const headline =
    reason === "off_voyage_day"
      ? "The scout waits for voyage tide."
      : "This moon's free scouts have sailed.";
  return [
    headline,
    reason === "off_voyage_day"
      ? "Today is not a voyage day · free scouts sail the 1st & 15th."
      : "",
    `Voyage days · ${VOYAGE_DAYS.join(" & ")} of each month`,
    `Voyages sailed · ${voyages}`,
    `Next voyage · ${nextStr}`,
    `Welcome scout · ${q.welcome_scout_redeemed ? "redeemed" : "ready (one free run any day)"}`,
    `Horn credits · ${Math.max(0, (q.extra_credits || 0) - (q.extra_used || 0))}`,
    "",
    "Roads forward:",
    `  [1] Panic scout · $${PRICING.extra_run.usd.toFixed(2)} · ${PRICING.site_url}/#pricing`,
    `  [2] Clan · $${PRICING.clan.usd_monthly.toFixed(2)}/mo · 5 seats · unlimited`,
    `  [3] War-band · earn credits · ${PRICING.site_url}/warriors`,
    "",
    `Toll gate → license.json → innsegall plan --import-license ~/Downloads/innsegall-license.json`,
    `Field manual · ${PRICING.site_url}/guide · Map · ${PRICING.site_url}/map`,
  ]
    .filter(Boolean)
    .join("\n");
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
    welcome_scout_redeemed: Boolean(q.welcome_scout_redeemed),
    remaining:
      q.plan === "clan"
        ? "unlimited"
        : Math.max(0, (q.scouts_limit ?? PRICING.free.scouts_per_month) - used),
    next_voyage: nextVoyageDate().toISOString().slice(0, 10),
  };
}
