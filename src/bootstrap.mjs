/**
 * First-install onboarding · welcome scout + automatic Voyage schedule.
 */
import { installVoyageSchedule, defaultInnsegallBin, voyageScheduleSummary } from "./voyage-schedule.mjs";
import { savePrefs, loadPrefs } from "./preferences.mjs";

/**
 * @param {{ skipScout?: boolean; skipSchedule?: boolean; innsegallBin?: string }} opts
 */
export function bootstrapOnboard(opts = {}) {
  const summary = voyageScheduleSummary();
  let schedule = null;

  if (!opts.skipSchedule) {
    const bin = opts.innsegallBin || defaultInnsegallBin();
    schedule = installVoyageSchedule({ innsegallBin: bin, load: true });
    savePrefs({
      voyage_schedule_installed_at: new Date().toISOString(),
      voyage_schedule_plist: schedule.plistPath,
    });
  }

  savePrefs({ bootstrap_at: new Date().toISOString() });

  return {
    summary,
    schedule,
    prefs: loadPrefs(),
  };
}
