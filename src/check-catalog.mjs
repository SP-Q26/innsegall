/**
 * Battle Scout check scope · plain-language limits per check.
 * Presentation only · does not change probe logic.
 */
import { PRICING } from "./constants.mjs";
import { anonymizeCheckId, bucketFlow } from "./field-report.mjs";
import { ISSUE_CATALOG } from "./issue-spotlight.mjs";

/** Global limits · shown once at bottom of every Battle Scout. */
export const GLOBAL_DOES_NOT_CHECK = [
  "Real-time malware scanning, removal, or quarantine of active threats",
  "Whether someone else is reading your email, iCloud, or bank accounts right now",
  "Network traffic, keystrokes, or screen capture while you use the Mac",
  "Windows, Linux, iPhone, or iPad (Macintosh only today)",
  "Guaranteed proof that nothing bad will ever happen later",
];

export const GLOBAL_SCOPE_LEAD =
  "A clear scout is honest about its lane. Passing these checks means we did not see common scareware leftovers in the places we read · not that your Mac is invulnerable forever.";

export const LAY_OF_LAND_URL = `${PRICING.site_url}/#lay-of-the-land`;

/** @type {Record<string, { looked_at: string, does_not_cover: string, why_matters: string, issue_key?: string }>} */
export const CHECK_CATALOG = {
  launch_ghosts: {
    looked_at: "Startup lists (LaunchAgents, LaunchDaemons, login items) that point at apps or files that are missing",
    does_not_cover: "Apps that still launch but behave badly, or kernel-level malware",
    why_matters:
      "Broken launch items slow login and are a common place scareware hides after you delete the main app",
    issue_key: "mac_hygiene:launch_items",
  },
  adware_markers: {
    looked_at: "Known adware file names, folders, and browser-extension patterns left on disk",
    does_not_cover: "Brand-new malware with no known signature, or threats only in memory",
    why_matters:
      "Fake virus popups often leave named leftovers · finding them explains odd browser behavior",
    issue_key: "mac_hygiene:adware_leftovers",
  },
  hosts_file: {
    looked_at: "Your Mac's hosts file for unexpected redirects to sketchy domains",
    does_not_cover: "DNS changes made only on your router or phone, or VPN-only routing",
    why_matters:
      "Scareware sometimes edits hosts to lock you onto their \"support\" pages",
  },
  dns_resolvers: {
    looked_at: "Which DNS servers your Mac is set to use (Wi‑Fi and Ethernet)",
    does_not_cover: "DNS on other devices, or encrypted DNS inside a browser only",
    why_matters:
      "Fake cleaners often switch DNS so they can intercept or nag you on every site",
    issue_key: "mac_hygiene:dns",
  },
  system_proxy: {
    looked_at: "System-wide web proxy settings that could funnel traffic through a stranger",
    does_not_cover: "Browser-only extensions, or corporate proxies your IT installed on purpose",
    why_matters:
      "Unexpected proxies are a classic persistence trick after scare popups",
    issue_key: "mac_hygiene:dns",
  },
  gatekeeper: {
    looked_at: "Whether macOS Gatekeeper and quarantine protections are turned on as expected",
    does_not_cover: "Whether every app you run is trustworthy · only whether core guards are enabled",
    why_matters:
      "Disabled Gatekeeper makes it easier to run downloaded scareware installers",
  },
  security_software: {
    looked_at: "Whether known security tools (Malwarebytes, etc.) are installed and responding",
    does_not_cover: "Full scans, license status, or whether those tools found anything today",
    why_matters:
      "Knowing what protection you already have avoids duplicate panic subscriptions",
  },
  firefox_profile: {
    looked_at: "Firefox profiles for suspicious extensions, search hijacks, and odd home pages",
    does_not_cover: "Safari or Chrome, or activity inside private windows we cannot see",
    why_matters:
      "After a bad link, browsers are often the first place redirects and spam extensions land",
    issue_key: "clicked_bad_link:browser_profile",
  },
  safari_profile: {
    looked_at: "Safari extensions and homepage/search settings for obvious hijacks",
    does_not_cover: "Firefox or Chrome, or iCloud-synced settings on other devices",
    why_matters:
      "Safari is the default browser · scare pages often target it first on Mac",
    issue_key: "clicked_bad_link:browser_profile",
  },
  chrome_profile: {
    looked_at: "Chrome profiles for suspicious extensions, policies, and search overrides",
    does_not_cover: "Other browsers, or Chrome on a different user account",
    why_matters:
      "Extension spam after a scare popup usually shows up as odd Chrome behavior",
    issue_key: "clicked_bad_link:browser_profile",
  },
  login_items: {
    looked_at: "Items set to open automatically when you log in (System Settings list)",
    does_not_cover: "Background services that do not appear in Login Items, or iCloud-only apps",
    why_matters:
      "Mystery login items are a common \"why is my Mac slow?\" clue after scareware",
    issue_key: "mac_hygiene:launch_items",
  },
  recent_installs: {
    looked_at: "Apps and packages installed in roughly the last seven days",
    does_not_cover: "Installs older than a week, or drag-and-drop apps with no installer record",
    why_matters:
      "The thing you installed right after the popup is often the actual trouble",
  },
  config_profiles: {
    looked_at: "Configuration and MDM profiles that can lock settings or install remote management",
    does_not_cover: "Profiles your employer installed on a work Mac you already expect",
    why_matters:
      "Unexpected profiles can mean someone else controls settings on your personal Mac",
    issue_key: "mac_hygiene:mdm_profiles",
  },
  recent_downloads: {
    looked_at: "Files in Downloads from the last ~48 hours that look risky (installers, scripts)",
    does_not_cover: "Files you moved elsewhere, cloud-only downloads, or email attachments",
    why_matters:
      "The file you grabbed after clicking the link is the one to quarantine first",
    issue_key: "clicked_bad_link:downloads_window",
  },
  project_watch: {
    looked_at: "Your git project folder for recent commits, branch, and obvious secret-file risks",
    does_not_cover: "Non-git folders, remote repos, or whether GitHub credentials were stolen",
    why_matters:
      "Creators worry about code and keys after a scare · this calms the repo question",
    issue_key: "project_safe:project_watch",
  },
};

export const ALL_CHECK_IDS = Object.keys(CHECK_CATALOG);

export function checkMeta(checkId) {
  return CHECK_CATALOG[checkId] || null;
}

function resolveIssueKey(checkId, flow) {
  const meta = checkMeta(checkId);
  if (meta?.issue_key && ISSUE_CATALOG[meta.issue_key]) return meta.issue_key;
  const bucket = anonymizeCheckId(checkId);
  const f = bucketFlow(flow || "mac_hygiene");
  const key = `${f}:${bucket}`;
  if (ISSUE_CATALOG[key]) return key;
  if (bucket === "browser_profile" && ISSUE_CATALOG["clicked_bad_link:browser_profile"]) {
    return "clicked_bad_link:browser_profile";
  }
  return null;
}

/** Public blog or lay-of-the-land anchor for "why this matters". */
export function learnMoreUrl(checkId, flow) {
  const key = resolveIssueKey(checkId, flow);
  if (key && ISSUE_CATALOG[key]?.slug) {
    return `${PRICING.site_url}/blog/${ISSUE_CATALOG[key].slug}/`;
  }
  return LAY_OF_LAND_URL;
}

export function learnMoreLabel(checkId, flow) {
  const key = resolveIssueKey(checkId, flow);
  return key && ISSUE_CATALOG[key]?.slug ? "Why this check matters" : "What the scout does and does not do";
}

/** Markdown lines for one check's scope block. */
export function formatCheckScopeMarkdown(check, flow) {
  const meta = checkMeta(check.id);
  if (!meta) return [];
  const url = learnMoreUrl(check.id, flow);
  return [
    `  - *Looked at:* ${meta.looked_at}`,
    `  - *Does not cover:* ${meta.does_not_cover}`,
    `  - *Why it matters:* ${meta.why_matters} · [Read more](${url})`,
  ];
}
