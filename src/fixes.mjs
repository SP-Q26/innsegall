export function fixesFromChecks(checks, userInputs = {}) {
  const fixes = [];

  if (userInputs.entered_password) {
    fixes.push({
      id: "rotate_credentials",
      title: "Rotate passwords you typed on the suspicious page",
      risk: "high",
      requires_sudo: false,
      automatable: false,
      steps: [
        "On a Mac or phone you trust, sign in and change that site's password.",
        "If it was your Apple ID or email password, change those too · from the same clean device.",
        "Turn on two-factor authentication where you can.",
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
        "Open Downloads. Move the suspicious file to Trash · do not open it.",
        "Empty Trash after you confirm the filename matches this card.",
        "Send the scout again when you're done.",
      ],
    });
  }

  const ghosts = checks.find((c) => c.id === "launch_ghosts");
  if (ghosts?.status === "warn") {
    fixes.push({
      id: "review_launch_ghosts",
      title: "Fix broken launch items",
      risk: "low",
      requires_sudo: true,
      automatable: false,
      steps: [
        "Open **Why we flagged this** and find Launch item health.",
        "For each plist listed (skip rows marked Optional): if the app is gone, delete the plist or run the vendor uninstaller.",
        "Reboot once, then send the scout again.",
      ],
    });
  } else if (
    ghosts?.status === "pass" &&
    ghosts.detail?.includes("optional vendor") &&
    ghosts.evidence?.length
  ) {
    fixes.push({
      id: "optional_launch_cleanup",
      title: "Optional: tidy vendor launch leftovers",
      risk: "low",
      requires_sudo: true,
      automatable: false,
      steps: [
        "These are stale Epson, Spotify, Steam, WD, Canon, or Malwarebytes helpers · not malware.",
        "Malwarebytes: use Help → Repair; don't delete its helper plist by hand.",
        "Other vendors: delete the plist only if you already removed the app, then reboot once.",
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
        "Quit all browsers.",
        "Remove the folders or files listed under **Why we flagged this** (or run a Malwarebytes scan).",
        "Restart your Mac once, then send the scout again.",
      ],
    });
  }

  const ff = checks.find((c) => c.id === "firefox_profile");
  if (ff?.status === "warn") {
    fixes.push({
      id: "firefox_hardening",
      title: "Review Firefox settings",
      risk: "low",
      requires_sudo: false,
      automatable: false,
      steps: [
        "Firefox → Settings → Search · confirm the default search engine is one you chose.",
        "Settings → Extensions · remove anything you don't remember adding.",
        "Keep protective user.js if this card says it's present.",
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
        "Safari → Settings → Extensions · remove anything unfamiliar.",
        "Safari → Settings → Search · confirm the search provider.",
      ],
    });
  }

  return fixes;
}
