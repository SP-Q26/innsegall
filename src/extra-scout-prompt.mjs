/**
 * Mist gate · extra panic scout without copy-paste URLs.
 * TTY: press 1 or type scout → Stripe Checkout in browser.
 */
import readline from "node:readline";
import { PRICING } from "./constants.mjs";
import { openStripeCheckout } from "./checkout-open.mjs";
import {
  BACKUP_MENU_HINT,
  isBackupMenuChoice,
  showBackupPlaybookTerminal,
} from "./backup-playbook.mjs";

export const EXTRA_SCOUT_MENU_LINE = `Need a panic scout · $${PRICING.extra_run.usd.toFixed(2)} · press 1 or type scout`;

export function extraScoutCliHint() {
  return "Panic scout · innsegall scout  (or press 1 at the mist gate)";
}

export function extraScoutAfterPayHint() {
  return "After pay · innsegall import · innsegall run";
}

/** @param {import("./quota.mjs").QuotaRecord} q */
export function shouldOfferExtraScoutCheckout(q) {
  const credits = Math.max(0, (q.extra_credits || 0) - (q.extra_used || 0));
  return credits <= 0;
}

/**
 * @param {{ quiet?: boolean; smoke?: boolean; json?: boolean; noPrompt?: boolean; noCheckout?: boolean }} flags
 */
export function canPromptExtraScout(flags = {}) {
  if (flags.quiet || flags.json || flags.smoke || flags.noPrompt) return false;
  if (!process.stdin.isTTY || !process.stdout.isTTY) return false;
  if (process.env.INNSEGALL_NO_PROMPT === "1") return false;
  return true;
}

function isScoutChoice(line) {
  const t = String(line || "").trim().toLowerCase();
  return t === "1" || t === "scout" || t === "panic" || t === "extra" || t === "buy";
}

function isQuitChoice(line) {
  const t = String(line || "").trim().toLowerCase();
  return t === "" || t === "q" || t === "quit" || t === "n" || t === "no";
}

/**
 * @param {{ quiet?: boolean; noCheckout?: boolean }} opts
 * @returns {Promise<boolean>} true if checkout was opened (or URL printed)
 */
export async function promptExtraScoutCheckout(opts = {}) {
  if (!canPromptExtraScout(opts)) return false;

  console.error("");
  console.error(EXTRA_SCOUT_MENU_LINE);
  console.error(`  ${BACKUP_MENU_HINT}`);
  console.error("  q · wait for the next voyage");
  console.error("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
    terminal: true,
  });

  const line = await new Promise((resolve) => {
    rl.question("> ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });

  if (isBackupMenuChoice(line)) {
    showBackupPlaybookTerminal({ openGuide: true, quiet: opts.quiet });
    return true;
  }

  if (isQuitChoice(line) || !isScoutChoice(line)) {
    return false;
  }

  try {
    await openStripeCheckout("extra", {
      quiet: opts.quiet,
      noCheckout: opts.noCheckout,
    });
    return true;
  } catch (e) {
    console.error(`Checkout could not open · ${e.message}`);
    console.error("Try · innsegall scout");
    return false;
  }
}

/**
 * @param {{ quota: object; flags?: object }} ctx
 */
export async function offerExtraScoutAtMistGate(ctx) {
  const { quota, flags = {} } = ctx;
  if (!shouldOfferExtraScoutCheckout(quota)) return false;
  if (!canPromptExtraScout(flags)) return false;
  return promptExtraScoutCheckout(flags);
}
