/**
 * Boot + post-scan ops · update check · anonymous improvement telemetry.
 */
import { ENGINE_VERSION, PRICING } from "./constants.mjs";
import { loadPrefs, savePrefs, utcDay } from "./preferences.mjs";
import {
  checkForUpdates,
  pingInstall,
  sendIssueSpotlight,
  sendScoutAggregate,
  telemetryEnabled,
} from "./telemetry-client.mjs";
import { paint, ansi } from "./terminal.mjs";

const INSTALL_SCRIPT = `${PRICING.site_url}/scripts/innsegall-alpha-install.sh`;

function bootOpts(opts = {}) {
  return {
    quiet: Boolean(opts.quiet),
    noTelemetry: Boolean(opts.noTelemetry),
    force: Boolean(opts.force),
  };
}

/**
 * @param {{ trigger: 'runes'|'scan'|'boot'|'bootstrap', card?: object, previousCard?: object|null, quiet?: boolean, noTelemetry?: boolean, force?: boolean }} opts
 */
export async function runBootOps(opts = {}) {
  const o = bootOpts(opts);
  const results = {};

  results.update = await checkForUpdates(o);

  if (telemetryEnabled(o)) {
    if (opts.trigger === "runes" || opts.trigger === "scan" || opts.trigger === "bootstrap") {
      results.ping = await pingInstall(o);
    }
    if (opts.trigger === "scan" && opts.card) {
      results.aggregate = await sendScoutAggregate(opts.card, o);
      results.issue_spotlight = await sendIssueSpotlight(opts.card, opts.previousCard ?? null, o);
    }
  }

  printBootMessages(results, o);
  return results;
}

function printBootMessages(results, opts) {
  if (opts.quiet) return;

  const upd = results.update;
  if (upd?.updateAvailable) {
    console.log(
      paint(
        ansi.beam,
        `\nUpdate available · ${upd.latest} (you have ${upd.current || ENGINE_VERSION})`
      )
    );
    console.log(paint(ansi.dim, `  curl -fsSL ${INSTALL_SCRIPT} | bash`));
  }

  if (!telemetryEnabled(opts)) return;

  const prefs = loadPrefs();
  if (!prefs.telemetry_notice_shown) {
    savePrefs({ telemetry_notice_shown: true });
    console.log(
      paint(
        ansi.dim,
        "\nWe don't want your scout data · only anonymous category counts to improve the tools · innsegall plan --telemetry-off to opt out"
      )
    );
  }
}
