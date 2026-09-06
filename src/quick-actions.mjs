import { homedir } from "node:os";
import { dirname } from "node:path";

export const LAUNCH_FOLDERS = [
  { id: "launch_agents", label: "LaunchAgents", path: "~/Library/LaunchAgents" },
  { id: "launch_agents_sys", label: "LaunchAgents (sys)", path: "/Library/LaunchAgents" },
  { id: "launch_daemons", label: "LaunchDaemons", path: "/Library/LaunchDaemons" },
  { id: "privileged_helpers", label: "PrivilegedHelpers", path: "/Library/PrivilegedHelperTools" },
];

export function expandHome(path, home = homedir()) {
  return String(path || "").replace(/^~(?=$|\/)/, home);
}

export function fileHref(path, home = homedir()) {
  const abs = expandHome(path, home);
  if (abs.startsWith("x-apple.")) return abs;
  return encodeURI(`file://${abs}`);
}

/** Attach quick_actions to fixes for HTML sub-buttons. */
export function attachQuickActions(fixes, home = homedir()) {
  const spq = process.env.INNSEGALL_SPQ_ROOT || `${home}/SPQ`;
  const recheck = `cd "${spq}" && npm run innsegall:run`;

  return fixes.map((fix) => {
    const actions = [...(fix.quick_actions || [])];

    if (fix.id === "optional_launch_cleanup" || fix.id === "review_launch_ghosts") {
      actions.push(
        { id: "open_launch_agents", label: "LaunchAgents", type: "open", path: "~/Library/LaunchAgents" },
        { id: "open_launch_daemons", label: "LaunchDaemons", type: "open", path: "/Library/LaunchDaemons" },
        { id: "open_helpers", label: "Helper tools", type: "open", path: "/Library/PrivilegedHelperTools" },
        { id: "copy_recheck", label: "Recheck", type: "copy", command: recheck, hint: "Paste in Terminal" }
      );
    }

    if (fix.id === "quarantine_download") {
      actions.push(
        { id: "open_downloads", label: "Downloads", type: "open", path: "~/Downloads" },
        { id: "copy_recheck", label: "Recheck", type: "copy", command: recheck, hint: "Paste in Terminal" }
      );
    }

    if (fix.id === "rotate_credentials") {
      actions.push(
        {
          id: "open_apple_id",
          label: "Apple ID",
          type: "open",
          path: "x-apple.systempreferences:com.apple.preferences.AppleIDPrefPane",
          external: true,
        },
        { id: "open_keychain", label: "Keychain", type: "open", path: "/Applications/Utilities/Keychain Access.app" }
      );
    }

    if (fix.id === "firefox_hardening") {
      actions.push({
        id: "open_firefox_profiles",
        label: "Firefox profiles",
        type: "open",
        path: "~/Library/Application Support/Firefox/Profiles",
      });
    }

    if (fix.id === "remove_adware_leftovers") {
      actions.push(
        { id: "open_mb", label: "Malwarebytes", type: "open", path: "/Applications/Malwarebytes.app" },
        { id: "copy_recheck", label: "Recheck", type: "copy", command: recheck, hint: "Paste in Terminal" }
      );
    }

    return { ...fix, quick_actions: dedupeActions(actions) };
  });
}

function dedupeActions(actions) {
  const seen = new Set();
  return actions.filter((a) => {
    const key = `${a.type}:${a.path || a.command}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function plistEvidenceActions(plistPath, home = homedir()) {
  const folder = dirname(expandHome(plistPath, home));
  const quoted = plistPath.includes(" ") ? `"${plistPath}"` : plistPath;
  const actions = [
    { id: "open_folder", label: "Folder", type: "open", path: folder },
    { id: "copy_path", label: "Copy path", type: "copy", command: plistPath },
  ];
  if (/malwarebytes/i.test(plistPath)) {
    actions.push({
      id: "open_mb",
      label: "Malwarebytes",
      type: "open",
      path: "/Applications/Malwarebytes.app",
    });
  } else {
    actions.push({
      id: "copy_remove",
      label: "Copy remove",
      type: "copy",
      command: `sudo rm ${quoted}`,
      hint: "Copied · paste in Terminal",
      confirm: "Copy sudo rm command? Only if you removed the app.",
    });
  }
  return actions;
}

export function tierSubActions(tier, home = homedir()) {
  const spq = process.env.INNSEGALL_SPQ_ROOT || `${home}/SPQ`;
  const recheck = `cd "${spq}" && npm run innsegall:run`;

  if (tier === "ship") {
    return [
      { id: "jump_chart", label: "Chart", type: "jump", jump: "section-chart" },
      { id: "jump_clear", label: "Audit log", type: "jump", jump: "section-clear" },
      { id: "copy_recheck", label: "Recheck", type: "copy", command: recheck, hint: "Paste in Terminal" },
    ];
  }
  if (tier === "optics") {
    return [
      { id: "jump_review", label: "Review", type: "jump", jump: "section-review" },
      { id: "open_launch_agents", label: "LaunchAgents", type: "open", path: "~/Library/LaunchAgents" },
      { id: "open_launch_daemons", label: "Daemons", type: "open", path: "/Library/LaunchDaemons" },
    ];
  }
  return [
    { id: "jump_escalate", label: "Horn zone", type: "jump", jump: "section-escalate" },
    { id: "open_helpers", label: "Helpers", type: "open", path: "/Library/PrivilegedHelperTools" },
    { id: "open_mb", label: "Malwarebytes", type: "open", path: "/Applications/Malwarebytes.app" },
  ];
}
