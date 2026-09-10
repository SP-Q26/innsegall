/**
 * Voyage launchd schedule · 1st & 15th at 10:00 local.
 * Uses absolute paths so launchd finds node via the innsegall wrapper.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nextVoyageDate, VOYAGE_DAYS } from "./quota.mjs";
import { supportPath } from "./storage.mjs";

export const VOYAGE_PLIST_LABEL = "com.innsegall.voyage";

export function voyagePlistPath() {
  return join(homedir(), "Library/LaunchAgents", `${VOYAGE_PLIST_LABEL}.plist`);
}

/**
 * @param {{ innsegallBin?: string; hour?: number; minute?: number }} opts
 */
export function buildVoyagePlist(opts = {}) {
  const innsegallBin =
    opts.innsegallBin || join(homedir(), ".local", "bin", "innsegall");
  const hour = opts.hour ?? 10;
  const minute = opts.minute ?? 0;
  const logDir = supportPath();

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${VOYAGE_PLIST_LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${innsegallBin}</string>
    <string>voyage</string>
    <string>--quiet</string>
    <string>--open</string>
  </array>
  <key>StartCalendarInterval</key>
  <array>
    <dict><key>Day</key><integer>1</integer><key>Hour</key><integer>${hour}</integer><key>Minute</key><integer>${minute}</integer></dict>
    <dict><key>Day</key><integer>15</integer><key>Hour</key><integer>${hour}</integer><key>Minute</key><integer>${minute}</integer></dict>
  </array>
  <key>StandardOutPath</key><string>${join(logDir, "voyage.log")}</string>
  <key>StandardErrorPath</key><string>${join(logDir, "voyage.err")}</string>
</dict>
</plist>`;
}

/**
 * @param {{ innsegallBin?: string; load?: boolean }} opts
 */
export function installVoyageSchedule(opts = {}) {
  const plistPath = voyagePlistPath();
  const plist = buildVoyagePlist(opts);
  mkdirSync(dirname(plistPath), { recursive: true });
  mkdirSync(supportPath(), { recursive: true });
  writeFileSync(plistPath, plist, "utf8");

  if (opts.load !== false) {
    try {
      execSync(`launchctl bootout gui/$(id -u) "${plistPath}" 2>/dev/null; true`, {
        stdio: "ignore",
        shell: true,
      });
      execSync(`launchctl bootstrap gui/$(id -u) "${plistPath}"`, {
        stdio: "ignore",
        shell: true,
      });
    } catch {
      try {
        execSync(`launchctl unload "${plistPath}" 2>/dev/null; launchctl load "${plistPath}"`, {
          stdio: "ignore",
          shell: true,
        });
      } catch {
        return { plistPath, loaded: false };
      }
    }
  }

  return { plistPath, loaded: opts.load !== false };
}

export function voyageScheduleSummary(d = new Date()) {
  const next = nextVoyageDate(d);
  const nextStr = next.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return {
    voyage_days: VOYAGE_DAYS,
    next_voyage: next.toISOString().slice(0, 10),
    next_voyage_label: nextStr,
    schedule: "10:00 local on the 1st and 15th",
  };
}

export function defaultInnsegallBin() {
  return join(homedir(), ".local", "bin", "innsegall");
}

export function cliMjsPath() {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "bin", "innsegall.mjs");
}
