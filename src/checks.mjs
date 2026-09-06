import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { checkId, fail, pass, warn } from "./checks-util.mjs";
import { CLAYMORE } from "./constants.mjs";
import { expandHome, sh } from "./shell.mjs";

const ADWARE_MARKERS = [
  "com.debilo.Safefinder",
  "Safefinder",
  "Genieo",
  "mackeeper",
  "advancedmaccleaner",
  "searchmarquis",
  "chilltab",
];

function plistBinary(plistPath) {
  const json = sh(`plutil -convert json -o - "${plistPath}" 2>/dev/null`, {
    allowFail: true,
  });
  if (!json) return null;
  try {
    const obj = JSON.parse(json);
    if (typeof obj.Program === "string") return obj.Program;
    if (Array.isArray(obj.ProgramArguments) && obj.ProgramArguments[0]) {
      return String(obj.ProgramArguments[0]);
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Classify stale launch plists · vendor housekeeping vs true ghosts. */
export function classifyLaunchItem(plistName, missingBin) {
  const b = plistName;
  const m = (missingBin || "").toLowerCase();

  if (/malwarebytes/i.test(b) && /Helper/i.test(b)) {
    if (existsSync("/Applications/Malwarebytes.app")) {
      return {
        tier: "housekeeping",
        hint: "Malwarebytes is installed · open Malwarebytes → Help → Repair. Don't delete this plist by hand.",
      };
    }
  }

  if (/^com\.epson\./i.test(b) || m.includes("/epson/")) {
    return {
      tier: "housekeeping",
      hint: "Epson service leftover. Delete the plist if you removed Epson software.",
    };
  }

  if (b === "com.spotify.webhelper.plist" || m.includes("spotifywebhelper")) {
    return {
      tier: "housekeeping",
      hint: "Spotify Web Helper ghost. Reinstall Spotify or delete this plist.",
    };
  }

  if (/steamclean/i.test(b) || /valvesoftware\.steam/i.test(b)) {
    return {
      tier: "housekeeping",
      hint: "Steam cleanup task leftover. Harmless · delete plist if Steam works fine.",
    };
  }

  if (/^com\.wdc\./i.test(b) || /wd[- ]?discovery/i.test(b) || /wdtrash/i.test(b)) {
    return {
      tier: "housekeeping",
      hint: "WD Discovery leftover. Delete plist if you uninstalled WD software.",
    };
  }

  if (/canon/i.test(b) || /masterinstaller/i.test(b)) {
    return {
      tier: "housekeeping",
      hint: "Canon installer helper ghost. Remove plist only if printing still works.",
    };
  }

  return { tier: "ghost", hint: "Broken launch item · remove plist or reinstall the app." };
}

function partitionLaunchItems() {
  const ghosts = [];
  const housekeeping = [];
  for (const item of listLaunchGhosts()) {
    const name = basename(item.plist);
    const classified = classifyLaunchItem(name, item.missing);
    if (classified.tier === "housekeeping") {
      housekeeping.push({ ...item, hint: classified.hint });
    } else {
      ghosts.push(item);
    }
  }
  return { ghosts, housekeeping };
}

function listLaunchGhosts() {
  const ghosts = [];
  const dirs = [
    join(homedir(), "Library/LaunchAgents"),
    "/Library/LaunchAgents",
    "/Library/LaunchDaemons",
  ];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    const entries = sh(`ls -1 "${dir}" 2>/dev/null`, { allowFail: true })
      .split("\n")
      .filter(Boolean);
    for (const entry of entries) {
      if (!entry.endsWith(".plist")) continue;
      const full = join(dir, entry);
      const bin = plistBinary(full);
      if (bin && bin.startsWith("/") && !existsSync(bin)) {
        ghosts.push({ plist: full, missing: bin });
      }
    }
  }
  return ghosts;
}

function readHosts() {
  try {
    const raw = readFileSync("/etc/hosts", "utf8");
    const suspicious = [];
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      if (/^127\.0\.0\.1\s+localhost\b/.test(t)) continue;
      if (/^::1\s+localhost\b/.test(t)) continue;
      if (t.startsWith("255.255.255.255")) continue;
      if (/^fe80::1%lo0\s+localhost\b/.test(t)) continue;
      suspicious.push(t);
    }
    return suspicious;
  } catch {
    return [];
  }
}

function dnsSummary() {
  const out = sh("scutil --dns 2>/dev/null | head -60", { allowFail: true });
  const v4 = (out.match(/nameserver\[\d+\] : ([\d.]+)/g) || []).map((m) =>
    m.replace(/nameserver\[\d+\] : /, "")
  );
  const v6 = (out.match(/nameserver\[\d+\] : ([0-9a-f:]+)/gi) || [])
    .map((m) => m.replace(/nameserver\[\d+\] : /i, ""))
    .filter((ip) => ip.includes(":"));
  return [...new Set([...v4, ...v6])].slice(0, 8);
}

function proxySettings() {
  const found = [];
  const services = sh("networksetup -listallnetworkservices 2>/dev/null", {
    allowFail: true,
  })
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("*"));
  for (const iface of services.slice(0, 6)) {
    for (const key of ["webproxy", "securewebproxy", "socksfirewallproxy"]) {
      const v = sh(`networksetup -get${key} "${iface}" 2>/dev/null`, {
        allowFail: true,
      });
      if (v && /Enabled: Yes/i.test(v)) {
        const host = (v.match(/Server: (.+)/) || [])[1] || "?";
        found.push(`${iface}: ${key} → ${host}`);
      }
    }
  }
  return found;
}

function firefoxProfileSummary() {
  const base = join(homedir(), "Library/Application Support/Firefox/Profiles");
  if (!existsSync(base)) return { active: null };
  const dirs = readdirSync(base).filter((d) => !d.startsWith("."));
  const profiles = dirs.map((d) => {
    const dir = join(base, d);
    const prefs = join(dir, "prefs.js");
    let search = "unknown";
    if (existsSync(prefs)) {
      const raw = readFileSync(prefs, "utf8");
      const patterns = [
        /browser\.search\.defaultenginename",\s*"([^"]+)"/,
        /browser\.search\.defaultenginename","([^"]+)"/,
      ];
      for (const p of patterns) {
        const m = raw.match(p);
        if (m) {
          search = m[1];
          break;
        }
      }
    }
    let extCount = 0;
    const extDir = join(dir, "extensions");
    if (existsSync(extDir)) {
      extCount = readdirSync(extDir).filter((f) => !f.startsWith(".")).length;
    }
    return {
      name: d,
      search,
      hasUserJs: existsSync(join(dir, "user.js")),
      extensions: extCount,
      mtime: statSync(dir).mtimeMs,
    };
  });
  const active = profiles.sort((a, b) => b.mtime - a.mtime)[0] || null;
  return { active };
}

function safariSummary() {
  const extDir = join(homedir(), "Library/Safari/Extensions");
  let extensions = 0;
  try {
    if (existsSync(extDir)) {
      extensions = readdirSync(extDir).filter((f) => !f.startsWith(".")).length;
    }
  } catch {
    extensions = -1; // TCC / privacy blocked
  }
  const homepage =
    sh('defaults read com.apple.Safari HomePage 2>/dev/null', { allowFail: true }) ||
    "";
  const search =
    sh('defaults read com.apple.Safari SearchProviderIdentifier 2>/dev/null', {
      allowFail: true,
    }) || "default";
  return { extensions, homepage, search };
}

function chromeSummary() {
  const prefsPath = join(
    homedir(),
    "Library/Application Support/Google/Chrome/Default/Preferences"
  );
  if (!existsSync(prefsPath)) return null;
  try {
    const prefs = JSON.parse(readFileSync(prefsPath, "utf8"));
    const search =
      prefs?.default_search_provider_data?.template_url_data?.short_name ||
      prefs?.default_search_provider?.name ||
      "unknown";
    return { search };
  } catch {
    return { search: "unreadable" };
  }
}

function adwareLeftovers() {
  const hits = [];
  const scanRoots = [
    join(homedir(), "Library/LaunchAgents"),
    join(homedir(), "Library/Application Scripts"),
    join(homedir(), "Library/Containers"),
    join(homedir(), "Library/LaunchDaemons"),
  ];
  for (const root of scanRoots) {
    if (!existsSync(root)) continue;
    let names = [];
    try {
      names = readdirSync(root);
    } catch {
      continue;
    }
    for (const name of names) {
      const lower = name.toLowerCase();
      if (ADWARE_MARKERS.some((m) => lower.includes(m.toLowerCase()))) {
        hits.push(join(root, name));
      }
    }
  }
  return hits;
}

function securitySoftware() {
  const found = [];
  const paths = [
    "/Applications/Malwarebytes.app",
    "/Library/Application Support/Malwarebytes",
    "/Applications/Bitdefender",
    "/Applications/AVG AntiVirus.app",
    "/Applications/Cisco/Cisco AnyConnect Secure Mobility Client.app",
  ];
  for (const p of paths) {
    if (existsSync(p)) found.push(basename(p.replace(/\.app$/, "")) || p);
  }
  const running = sh(
    "pgrep -lf 'Malwarebytes|bitdefender|avg|norton|kaspersky' 2>/dev/null | head -5",
    { allowFail: true }
  );
  if (running) found.push(...running.split("\n").map((l) => l.trim()).filter(Boolean));
  return [...new Set(found)].slice(0, 8);
}

function gatekeeperStatus() {
  return sh("spctl --status 2>/dev/null", { allowFail: true }) || "unknown";
}

function recentDownloads(hours = 48) {
  const dl = join(homedir(), "Downloads");
  if (!existsSync(dl)) return [];
  const cutoff = Date.now() - hours * 3600000;
  const risky = [];
  let names = [];
  try {
    names = readdirSync(dl);
  } catch {
    return ["Downloads folder not readable (Full Disk Access may be required)"];
  }
  for (const name of names) {
    if (name.startsWith(".")) continue;
    const full = join(dl, name);
    try {
      const st = statSync(full);
      if (!st.isFile() || st.mtimeMs < cutoff) continue;
      if (/\.(dmg|pkg|zip|app|exe|scr|command)$/i.test(name)) {
        risky.push(`${name} (${new Date(st.mtimeMs).toISOString().slice(0, 16)})`);
      }
    } catch {
      /* skip */
    }
  }
  return risky.slice(0, 10);
}

function loginItems() {
  const out = sh(
    `osascript -e 'tell application "System Events" to get the name of every login item' 2>/dev/null`,
    { allowFail: true }
  );
  if (!out) return [];
  return out.split(", ").map((s) => s.trim()).filter(Boolean);
}

function recentInstalls(days = 7) {
  const log = "/var/log/install.log";
  if (!existsSync(log)) return [];
  const raw = sh(`tail -800 "${log}" 2>/dev/null`, { allowFail: true });
  const cutoff = Date.now() - days * 86400000;
  const lines = [];
  for (const line of raw.split("\n")) {
    const m = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
    if (!m) continue;
    const t = new Date(m[1].replace(" ", "T")).getTime();
    if (t >= cutoff && /Installed|PackageKit|installer/i.test(line)) {
      const short = line.replace(/^.*?] /, "").slice(0, 100);
      if (!lines.includes(short)) lines.push(short);
    }
  }
  return lines.slice(-12);
}

export function projectWatch(root) {
  const abs = expandHome(root);
  const result = {
    roots: [abs],
    git_branch: null,
    git_clean: null,
    recent_commits: 0,
    unexpected_changes: [],
  };
  if (!existsSync(abs)) {
    result.unexpected_changes.push(`Path not found: ${abs}`);
    return result;
  }
  if (!existsSync(join(abs, ".git"))) {
    result.unexpected_changes.push("Not a git repository");
    return result;
  }
  result.git_branch =
    sh(`git -C "${abs}" branch --show-current 2>/dev/null`, { allowFail: true }) ||
    null;
  const status = sh(`git -C "${abs}" status --porcelain 2>/dev/null`, {
    allowFail: true,
  });
  result.git_clean = !status || status.length === 0;
  const log = sh(`git -C "${abs}" log --oneline -10 2>/dev/null`, {
    allowFail: true,
  });
  result.recent_commits = log ? log.split("\n").filter(Boolean).length : 0;
  if (status) {
    result.unexpected_changes = status
      .split("\n")
      .filter(Boolean)
      .slice(0, 12)
      .map((l) => l.slice(0, 80));
  }
  return result;
}

/** Read-only Mac checks. */
export function runChecks(flow, projectPath, userInputs = {}) {
  const checks = [];
  const badLink = flow === "clicked_bad_link";

  let c = checkId("launch_ghosts", "Launch item health");
  const { ghosts, housekeeping } = partitionLaunchItems();
  if (ghosts.length === 0 && housekeeping.length === 0) {
    checks.push(pass(c, "No launch plists pointing at missing binaries."));
  } else if (ghosts.length === 0) {
    checks.push(
      pass(
        c,
        `No risky launch ghosts. ${housekeeping.length} optional vendor cleanup(s).`,
        housekeeping.map(
          (h) => `${h.plist} → ${h.missing}${CLAYMORE}${h.hint}`
        )
      )
    );
  } else {
    const evidence = ghosts.map((g) => `${g.plist} → ${g.missing}`);
    for (const h of housekeeping) {
      evidence.push(
        `[optional] ${basename(h.plist)} → ${h.missing}${CLAYMORE}${h.hint}`
      );
    }
    checks.push(
      warn(
        c,
        `${ghosts.length} launch item(s) point at files that are gone.`,
        evidence
      )
    );
  }

  c = checkId("adware_markers", "Known adware leftovers");
  const adware = adwareLeftovers();
  checks.push(
    adware.length === 0
      ? pass(c, "No known adware folder names in Library.")
      : warn(c, `${adware.length} suspicious path(s) found.`, adware)
  );

  c = checkId("hosts_file", "Hosts file");
  const hosts = readHosts();
  checks.push(
    hosts.length === 0
      ? pass(c, "No unusual /etc/hosts entries.")
      : warn(c, `${hosts.length} non-default hosts entry(ies).`, hosts)
  );

  c = checkId("dns_resolvers", "DNS resolvers");
  const dns = dnsSummary();
  checks.push(
    pass(
      c,
      dns.length ? `Resolvers: ${dns.join(", ")}` : "Could not read DNS config.",
      dns
    )
  );

  c = checkId("system_proxy", "System proxy");
  const proxy = proxySettings();
  checks.push(
    proxy.length === 0
      ? pass(c, "No system HTTP/SOCKS proxy enabled.")
      : warn(c, "System proxy enabled.", proxy)
  );

  c = checkId("gatekeeper", "Gatekeeper");
  const gk = gatekeeperStatus();
  checks.push(
    /assessments enabled/i.test(gk)
      ? pass(c, gk)
      : warn(c, `Gatekeeper: ${gk}`)
  );

  c = checkId("security_software", "Security software");
  const sec = securitySoftware();
  checks.push(
    pass(
      c,
      sec.length ? `Detected: ${sec.join("; ")}` : "No common AV paths detected.",
      sec
    )
  );

  c = checkId("firefox_profile", "Firefox");
  const ff = firefoxProfileSummary();
  if (!ff.active) {
    checks.push(pass(c, "Firefox not installed or no profiles found."));
  } else {
    const detail = `Profile ${ff.active.name}; search: ${ff.active.search}; extensions: ${ff.active.extensions}; user.js: ${ff.active.hasUserJs ? "yes" : "no"}`;
    const badSearch = /safefinder|searchmarquis|yahoo/i.test(ff.active.search || "");
    checks.push(
      badSearch
        ? warn(c, `${detail} · review search engine.`, [ff.active.name])
        : pass(c, detail, [ff.active.name])
    );
  }

  c = checkId("safari_profile", "Safari");
  const safari = safariSummary();
  if (safari.extensions < 0) {
    checks.push(
      pass(c, `Safari present; extension folder not readable (privacy). Search id: ${safari.search}.`)
    );
  } else if (safari.extensions > 0) {
    checks.push(
      pass(c, `${safari.extensions} extension(s); search id: ${safari.search}.`, [
        `extensions: ${safari.extensions}`,
      ])
    );
  } else {
    checks.push(pass(c, `No Safari extensions folder; search id: ${safari.search}.`));
  }

  c = checkId("chrome_profile", "Chrome");
  const chrome = chromeSummary();
  checks.push(
    chrome
      ? pass(c, `Default profile search: ${chrome.search}.`)
      : pass(c, "Chrome not installed or no Default profile.")
  );

  c = checkId("login_items", "Login items");
  const items = loginItems();
  checks.push(
    pass(
      c,
      items.length
        ? `${items.length} login item(s) at startup.`
        : "No login items (or could not read).",
      items
    )
  );

  c = checkId("recent_installs", "Recent software installs (7d)");
  const installs = recentInstalls(7);
  checks.push(
    pass(
      c,
      installs.length
        ? `${installs.length} install log event(s) in the last 7 days.`
        : "No recent install.log activity (or log unavailable).",
      installs
    )
  );

  c = checkId("config_profiles", "Configuration profiles");
  const profiles = sh("profiles list 2>/dev/null | head -25", { allowFail: true });
  if (!profiles || profiles.includes("There are no configuration profiles")) {
    checks.push(pass(c, "No configuration profiles installed."));
  } else {
    checks.push(
      warn(
        c,
        "Configuration profiles present · review if unexpected (VPN/work).",
        profiles.split("\n").slice(0, 8)
      )
    );
  }

  if (badLink || userInputs.downloaded_file) {
    c = checkId("recent_downloads", "Recent Downloads (48h)");
    const dls = recentDownloads(48);
    const blocked = dls[0]?.includes("not readable");
    checks.push(
      blocked
        ? pass(c, dls[0])
        : dls.length === 0
          ? pass(c, "No risky recent downloads (.dmg/.pkg/.zip) in last 48h.")
          : warn(c, `${dls.length} recent installer/archive in Downloads.`, dls)
    );
  }

  if (flow === "project_safe" || projectPath) {
    c = checkId("project_watch", "Project / repo watch");
    const pw = projectWatch(projectPath || process.cwd());
    if (pw.unexpected_changes.some((x) => x.includes("not found"))) {
      checks.push(fail(c, "Watched project path missing.", pw.unexpected_changes));
    } else if (!pw.git_clean) {
      checks.push(
        warn(
          c,
          `Branch ${pw.git_branch || "?"} has uncommitted work · your project is still here.`,
          pw.unexpected_changes.length
            ? pw.unexpected_changes
            : [`root: ${pw.roots[0]}`]
        )
      );
    } else {
      checks.push(
        pass(
          c,
          `Branch ${pw.git_branch || "?"} clean; ${pw.recent_commits} recent commit(s).`,
          [`root: ${pw.roots[0]}`]
        )
      );
    }
  }

  return checks;
}
