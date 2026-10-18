#!/usr/bin/env node
/**
 * Full marketing link audit · href/src (single + double quotes), sitemap, rewrites.
 * Skips externals (use smoke-external-links.mjs). Flags file:// home paths that are not demo-neutral.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  walkHtml,
  pathOnly,
  isStaticAsset,
  routeExists,
  fileHrefLooksLikePii,
  auditSitemap,
  auditVercelRewrites,
} from "./lib/audit-link-routes.mjs";
import { collectUrlsFromHtml } from "./lib/collect-html-urls.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");

const failures = [];
function fail(entry) {
  failures.push(entry);
}

const stats = {
  files: 0,
  internal: 0,
  external: 0,
  anchors: 0,
  fileLinks: 0,
  skippedSample: 0,
};

for (const file of walkHtml(web)) {
  const rel = file.replace(web + "/", "");
  const skipInternal = rel.startsWith("samples/") && process.argv.includes("--skip-samples");
  const html = readFileSync(file, "utf8");
  stats.files++;

  for (const raw of collectUrlsFromHtml(html)) {
    if (!raw || raw.startsWith("javascript:") || raw.startsWith("data:")) continue;
    if (raw.startsWith("mailto:") || raw.startsWith("tel:")) continue;
    if (raw.startsWith("#")) {
      stats.anchors++;
      continue;
    }
    if (raw.startsWith("file:")) {
      stats.fileLinks++;
      if (fileHrefLooksLikePii(raw)) {
        fail({ rel, raw, why: "file-href-pii" });
      }
      continue;
    }
    if (/^https?:\/\//i.test(raw)) {
      stats.external++;
      continue;
    }
    if (!raw.startsWith("/")) {
      fail({ rel, raw, why: "relative-not-root" });
      continue;
    }
    if (/\s/.test(raw)) {
      fail({ rel, raw, why: "whitespace-in-url" });
      continue;
    }
    if (skipInternal) {
      stats.skippedSample++;
      continue;
    }
    stats.internal++;
    const path = pathOnly(raw);
    if (isStaticAsset(path)) continue;
    if (!routeExists(web, path)) fail({ rel, raw, why: "missing-route", path });
  }

  for (const m of html.matchAll(/href="(\/blog\/[^"]*)"/g)) {
    const href = m[1];
    if (href.includes("- ") || /\/blog\/[^"]*\s/.test(href)) {
      fail({ rel, raw: href, why: "slug-whitespace" });
    }
  }
}

auditSitemap(web, fail);
auditVercelRewrites(web, fail);

console.log("innsegall audit-links-full\n");
console.log(`HTML files: ${stats.files}`);
console.log(
  `internal: ${stats.internal} · anchors: ${stats.anchors} · external (not checked here): ${stats.external} · file://: ${stats.fileLinks}`
);
console.log(`failures: ${failures.length}`);

if (failures.length) {
  for (const f of failures.slice(0, 40)) {
    console.error(`  FAIL [${f.why}] ${f.rel} → ${f.raw}${f.path ? ` (${f.path})` : ""}`);
  }
  if (failures.length > 40) console.error(`  … and ${failures.length - 40} more`);
  process.exit(1);
}

console.log("PASS");
process.exit(0);
