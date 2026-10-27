#!/usr/bin/env node
/**
 * Companion device guide · light review checklist + panic shortcuts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const guide = JSON.parse(
  readFileSync(join(root, "fixtures", "companion-device-guide.json"), "utf8")
);
const companionPath = join(web, "companion.html");
const START = "<!-- INNSEGALL_COMPANION_DEVICE_GUIDE_START -->";
const END = "<!-- INNSEGALL_COMPANION_DEVICE_GUIDE_END -->";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const shortcuts = guide.panic_shortcuts
  .map((s) => `            <a class="companion-shortcut" href="${esc(s.href)}">${esc(s.label)}</a>`)
  .join("\n");

const mac = guide.mac_lane;
const block = `${START}
      <section class="companion-device-guide" id="companion-device-guide" aria-labelledby="companion-device-guide-title">
        <h2 class="companion-h2" id="companion-device-guide-title">${esc(guide.light_review_title)}</h2>
        <p class="companion-muted">${guide.light_review_lead}</p>

        <div class="companion-light-signals" id="companion-light-signals" aria-live="polite"></div>

        <div class="companion-checklist-progress" id="companion-checklist-progress" hidden></div>
        <ul class="companion-checklist" id="companion-checklist-root" aria-label="On-device review checklist"></ul>

        <h3 class="companion-h3">Panic shortcuts</h3>
        <div class="companion-shortcut-grid">
${shortcuts}
        </div>

        <aside class="companion-mac-lane card">
          <h3 class="companion-h3">${esc(mac.title)}</h3>
          <p>${mac.body}</p>
          <div class="companion-actions">
            <a class="btn-horn btn-horn--compact" href="${esc(mac.primary_href)}">${esc(mac.primary_label)}</a>
            <a class="btn-link" href="${esc(mac.secondary_href)}">${esc(mac.secondary_label)}</a>
          </div>
        </aside>
      </section>
${END}`;

let html = readFileSync(companionPath, "utf8");
if (!html.includes(START)) {
  html = html.replace(
    /<!-- INNSEGALL_COMPANION_INSTALL_END -->/,
    `<!-- INNSEGALL_COMPANION_INSTALL_END -->\n\n${block}`
  );
} else {
  html = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), block);
}
writeFileSync(companionPath, html, "utf8");
console.log(`sync-companion-guide · companion.html · v${guide.version}`);
