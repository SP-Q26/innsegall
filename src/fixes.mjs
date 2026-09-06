export function fixesFromChecks(checks, userInputs = {}) {
  const fixes = [];

  if (userInputs.entered_password) {
    fixes.push({
      id: "rotate_credentials",
      title: "Rotate passwords you entered on the suspicious page",
      risk: "high",
      requires_sudo: false,
      automatable: false,
      steps: [
        "Change that site’s password from a clean browser session.",
        "If it was your Apple or email password, change those too.",
        "Enable 2FA where available.",
      ],
    });
  }

  if (userInputs.downloaded_file) {
    fixes.push({
      id: "quarantine_download",
      title: "Quarantine the suspicious download",
      risk: "medium",
      requires_sudo: false,
      automatable: false,
      steps: [
        "Move the file from Downloads to Trash (do not open it).",
        "Empty Trash after confirming the filename in this card.",
        "Re-run the check.",
      ],
    });
  }

  const ghosts = checks.find((c) => c.id === "launch_ghosts");
  if (ghosts?.status === "warn") {
    fixes.push({
      id: "review_launch_ghosts",
      title: "Remove or fix broken launch items",
      risk: "low",
      requires_sudo: true,
      automatable: false,
      steps: [
        "Open each non-optional plist listed in Needs review.",
        "If the app is gone, delete the plist or run the vendor uninstaller.",
        "Reboot once after cleanup.",
      ],
    });
  } else if (
    ghosts?.status === "pass" &&
    ghosts.detail?.includes("optional vendor") &&
    ghosts.evidence?.length
  ) {
    fixes.push({
      id: "optional_launch_cleanup",
      title: "Optional: clean vendor launch leftovers",
      risk: "low",
      requires_sudo: true,
      automatable: false,
      steps: [
        "These are stale Epson, Spotify, Steam, WD, Canon, or Malwarebytes helpers · not malware.",
        "Malwarebytes: use Help → Repair; don't delete its helper plist by hand.",
        "Others: delete the plist if you removed the app, then reboot once.",
      ],
    });
  }

  const adware = checks.find((c) => c.id === "adware_markers");
  if (adware?.status === "warn" || adware?.status === "fail") {
    fixes.push({
      id: "remove_adware_leftovers",
      title: "Remove known adware leftovers",
      risk: "low",
      requires_sudo: false,
      automatable: false,
      steps: [
        "Quit browsers. Remove listed folders/files (or use Malwarebytes scan).",
        "Restart the Mac once.",
        "Re-run Innsegall check.",
      ],
    });
  }

  const ff = checks.find((c) => c.id === "firefox_profile");
  if (ff?.status === "warn") {
    fixes.push({
      id: "firefox_hardening",
      title: "Review Firefox profile settings",
      risk: "low",
      requires_sudo: false,
      automatable: false,
      steps: [
        "Firefox → Settings → Search → confirm default search engine.",
        "Keep protective user.js if present (see docs/house-call).",
        "Remove unknown extensions.",
      ],
    });
  }

  const safari = checks.find((c) => c.id === "safari_profile");
  if (safari?.status === "warn") {
    fixes.push({
      id: "safari_extensions",
      title: "Review Safari extensions",
      risk: "low",
      requires_sudo: false,
      automatable: false,
      steps: [
        "Safari → Settings → Extensions → remove anything unfamiliar.",
        "Safari → Settings → Search → confirm provider.",
      ],
    });
  }

  return fixes;
}
