/**
 * Optional backup lane · Time Machine + cloud · not a scout check.
 */
import { execSync } from "node:child_process";
import { PRICING } from "./constants.mjs";

export const BACKUP_PLAYBOOK_TITLE = "Two steps to protect your work";

export const BACKUP_PLAYBOOK_STEPS = [
  {
    title: "Set up Time Machine",
    body:
      "Apple’s built-in Time Machine is your best defense against malware or accidental deletion. Plug in an external hard drive, go to System Settings → General → Time Machine, and turn it on. It runs quietly in the background and saves everything automatically.",
  },
  {
    title: "Use a secure cloud backup",
    body:
      "If your external drive is lost or damaged, a cloud backup keeps you safe. Services like iCloud Drive, Google Drive, or Microsoft OneDrive can automatically sync your active work folders.",
  },
];

export function backupGuideUrl() {
  return `${PRICING.site_url.replace(/\/$/, "")}/guide#backup`;
}

export function formatBackupPlaybookTerminal() {
  const lines = [
    "",
    BACKUP_PLAYBOOK_TITLE,
    "",
    ...BACKUP_PLAYBOOK_STEPS.map((step, i) => [`${i + 1}. ${step.title}`, `   ${step.body}`, ""].join("\n")),
    `Field manual · ${backupGuideUrl()}`,
    "",
  ];
  return lines.join("\n");
}

/** @param {{ openGuide?: boolean; quiet?: boolean }} opts */
export function showBackupPlaybookTerminal(opts = {}) {
  console.error(formatBackupPlaybookTerminal());
  if (opts.openGuide && process.platform === "darwin" && !opts.quiet) {
    try {
      execSync(`open "${backupGuideUrl()}"`, { stdio: "ignore" });
    } catch {
      /* ignore */
    }
  }
}

export function isBackupMenuChoice(line) {
  const t = String(line || "").trim().toLowerCase();
  return (
    t === "2" ||
    t === "backup" ||
    t === "backups" ||
    t === "time machine" ||
    t === "timemachine"
  );
}

export const BACKUP_MENU_HINT = "Press 2 or type backup · Time Machine + cloud";

/** Battle Scout HTML · optional calm next step after scare. */
export function renderBackupPlaybookSection() {
  const url = backupGuideUrl();
  const items = BACKUP_PLAYBOOK_STEPS
    .map(
      (step) =>
        `<li><strong>${escapeHtml(step.title)}</strong> · ${escapeHtml(step.body)}</li>`
    )
    .join("\n          ");
  return `<section id="section-backup-playbook" class="section section-housekeeping jump-section" aria-labelledby="backup-playbook-title">
        <div class="section-label section-label-tier">
          <span class="tier-chip chip-housekeeping">Optional</span>
          <span id="backup-playbook-title">${escapeHtml(BACKUP_PLAYBOOK_TITLE)}</span>
        </div>
        <p class="section-lead">Innsegall does not back up your Mac · these are Apple and vendor tools you control locally.</p>
        <ul class="housekeeping-list backup-playbook-list">
          ${items}
        </ul>
        <p class="muted" style="margin-top:0.75rem;font-size:0.9rem"><a href="${escapeHtml(url)}">Field manual · backup steps</a></p>
      </section>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
