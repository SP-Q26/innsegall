/** Extract href/src URLs from HTML under web/. */
import { readFileSync } from "node:fs";
import { walkHtml } from "./audit-link-routes.mjs";

const ATTR_RE = /(?:href|src)\s*=\s*("([^"]*)"|'([^']*)')/gi;

export function collectUrlsFromHtml(html) {
  const urls = [];
  for (const m of html.matchAll(ATTR_RE)) {
    urls.push(m[2] ?? m[3] ?? "");
  }
  return urls;
}

export function collectAllWebUrls(webRoot) {
  const byFile = [];
  const external = new Set();
  const internal = new Set();

  for (const file of walkHtml(webRoot)) {
    const rel = file.replace(webRoot + "/", "");
    const html = readFileSync(file, "utf8");
    const entries = [];
    for (const raw of collectUrlsFromHtml(html)) {
      entries.push(raw);
      if (!raw || raw.startsWith("#")) continue;
      if (/^(javascript:|data:|mailto:|tel:)/i.test(raw)) continue;
      if (raw.startsWith("file:")) continue;
      if (/^https?:\/\//i.test(raw)) external.add(raw.split("#")[0]);
      else if (raw.startsWith("/")) internal.add(raw);
    }
    byFile.push({ rel, entries });
  }

  return { byFile, external, internal };
}
