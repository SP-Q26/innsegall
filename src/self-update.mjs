/**
 * Fast-forward local git clone before scout runs (alpha install path).
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { paint, ansi } from "./terminal.mjs";

/**
 * Git fast-forward before a scout/voyage · scheduled runs log when the engine refreshed.
 * @param {{ smoke?: boolean; quiet?: boolean; scheduled?: boolean; voyage?: boolean }} opts
 */
export function preflightScoutUpdate(opts = {}) {
  if (opts.smoke) return { skipped: true, reason: "smoke" };
  const result = tryGitFastForward({ quiet: Boolean(opts.quiet && !opts.scheduled) });
  const label = opts.voyage || opts.scheduled ? "voyage" : "scout";
  if (!opts.quiet || opts.scheduled) {
    if (result.updated) {
      console.log(
        paint(
          ansi.beam,
          `Engine refreshed before ${label} · ${result.before} → ${result.after}`
        )
      );
    } else if (opts.scheduled && result.ok && !result.skipped) {
      console.log(paint(ansi.dim, "Engine current · no git update before voyage."));
    }
  }
  return result;
}

const __root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function repoRoot() {
  return __root;
}

/** @param {{ quiet?: boolean }} opts */
export function tryGitFastForward(opts = {}) {
  if (process.env.INNSEGALL_NO_SELF_UPDATE === "1") {
    return { skipped: true, reason: "disabled" };
  }
  if (!existsSync(join(__root, ".git"))) {
    return { skipped: true, reason: "not_git" };
  }
  try {
    execSync("git fetch --quiet origin 2>/dev/null || true", { cwd: __root, stdio: "pipe" });
    const before = execSync("git rev-parse --short HEAD", { cwd: __root, encoding: "utf8" }).trim();
    execSync("git pull --ff-only --quiet", { cwd: __root, stdio: "pipe" });
    const after = execSync("git rev-parse --short HEAD", { cwd: __root, encoding: "utf8" }).trim();
    const updated = before !== after;
    if (updated && !opts.quiet) {
      console.log(paint(ansi.beam, `Innsegall updated · ${before} → ${after}`));
    }
    return { ok: true, updated, before, after };
  } catch {
    return { ok: false, reason: "pull_failed" };
  }
}
