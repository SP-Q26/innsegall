import { execSync } from "node:child_process";
import { homedir } from "node:os";
import { resolve } from "node:path";

export function sh(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 15000,
      ...opts,
    }).trim();
  } catch (e) {
    return opts.allowFail ? (e.stdout?.toString()?.trim() || "") : null;
  }
}

export function expandHome(p) {
  if (!p) return p;
  return p.startsWith("~") ? resolve(homedir(), p.slice(1)) : resolve(p);
}

export function platformVersion() {
  return sh("sw_vers -productVersion", { allowFail: true }) || "unknown";
}
