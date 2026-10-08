#!/usr/bin/env node
/**
 * iOS + tablet panic hub · shared scenarios from fixtures/ios-tablet-panic-hub.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const hub = JSON.parse(readFileSync(join(root, "fixtures", "ios-tablet-panic-hub.json"), "utf8"));

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fill(template, deviceCfg) {
  return template
    .replace(/\{device\}/g, deviceCfg.device)
    .replace(/\{scan_disclaimer\}/g, deviceCfg.scan_disclaimer);
}

function renderJumpNav(deviceKey) {
  const links = hub.scenarios
    .map((s) => `        <a class="panic-jump-link" href="#${esc(s.id)}">${esc(s.nav)}</a>`)
    .join("\n");
  return `
      <nav class="panic-jump-nav" aria-label="${esc(hub.jump_nav_label)}">
        <p class="panic-jump-label">${esc(hub.jump_nav_label)}</p>
        <div class="panic-jump-links">
${links}
        </div>
      </nav>`;
}

function renderScenario(scenario, deviceCfg, deviceKey, isFirst) {
  const id = scenario.id;
  const titleId = `${id}-${deviceKey}-title`;
  const sectionClass = deviceCfg.section_class;
  const title = fill(scenario.title, deviceCfg);
  const intro = fill(scenario.intro, deviceCfg);

  let body = "";
  if (scenario.match_rows) {
    const rows = scenario.match_rows
      .map((r) => `          <li><strong>${r.label}</strong> · ${r.body}</li>`)
      .join("\n");
    const firstMinute = hub.first_minute_steps.map((s) => `          <li>${s}</li>`).join("\n");
    body = `
        <h3 class="panic-step-title">${esc(hub.first_minute_title)}</h3>
        <ol class="panic-steps">
${firstMinute}
        </ol>
        <h3 class="panic-step-title">${esc(scenario.match_title)}</h3>
        <p>${scenario.match_intro}</p>
        <ul class="panic-match-list">
${rows}
        </ul>`;
  } else if (scenario.steps) {
    const steps = scenario.steps.map((s) => `          <li>${fill(s, deviceCfg)}</li>`).join("\n");
    body = `
        <h3 class="panic-step-title">${fill(scenario.steps_title, deviceCfg)}</h3>
        <ol class="panic-steps">
${steps}
        </ol>`;
  }

  const blog = scenario.blog_slug
    ? `        <p class="panic-field-guide"><a href="/blog/${esc(scenario.blog_slug)}">Field guide · ${esc(scenario.nav)}</a></p>`
    : "";

  const accent = isFirst ? " panic-well--hero" : "";
  return `
      <section class="${sectionClass}${accent}" id="${esc(id)}" aria-labelledby="${titleId}">
        <p class="platform-lane-kicker">${esc(hub.honesty_kicker)}</p>
        <h2 class="platform-lane-title panic-well-title" id="${titleId}">${title}</h2>
        <p class="panic-well-lead">${intro}</p>
${body}
${blog}
      </section>`;
}

function renderPanicHub(deviceKey) {
  const deviceCfg = hub.devices[deviceKey];
  const scenarios = hub.scenarios.map((s, i) => renderScenario(s, deviceCfg, deviceKey, i === 0)).join("\n");
  const siblingLine = `<a href="${deviceCfg.sibling_href}">Same guide for ${deviceCfg.sibling_label}</a>.`;
  const macBody = hub.mac_scout_body.replace("{sibling_line}", siblingLine);
  const sticky = `
      <div class="panic-sticky-bar" role="region" aria-label="Quick help">
        <a class="panic-sticky-link" href="#bad-link">Bad link</a>
        <a class="panic-sticky-link" href="#bad-email">Email</a>
        <a class="panic-sticky-link" href="#bad-download">Download</a>
        <a class="panic-sticky-link" href="/companion">Companion</a>
      </div>`;

  return `
      <div class="panic-hub" data-panic-version="${esc(hub.version)}">
${renderJumpNav(deviceKey)}
${scenarios}
        <section class="panic-well panic-well--mac" aria-labelledby="mac-scout-${deviceKey}">
          <h2 class="panic-step-title" id="mac-scout-${deviceKey}">${esc(hub.mac_scout_title)}</h2>
          <p>${macBody}</p>
          <p class="panic-well-footer">${hub.footer_cta}</p>
        </section>
      </div>
${sticky}`;
}

function patchLead(html, deviceCfg) {
  const leadRe = /(<p class="article-lead">)([\s\S]*?)(<\/p>)/;
  if (!leadRe.test(html)) return html;
  return html.replace(leadRe, (m, open, _inner, close) => {
    const base = deviceCfg.lead_panic;
    return `${open}${base} <a href="/companion">Companion inbox</a> · Add to Home Screen.${close}`;
  });
}

function patchMetaDescription(html, deviceCfg) {
  return html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${esc(deviceCfg.meta_description)}">`
  );
}

function patchFile(filename, deviceKey) {
  const path = join(web, filename);
  const start = "<!-- INNSEGALL_PANIC_HUB_START -->";
  const end = "<!-- INNSEGALL_PANIC_HUB_END -->";
  let html = readFileSync(path, "utf8");
  const re = new RegExp(`${start}[\\s\\S]*${end}`);
  if (!re.test(html)) {
    console.error(`sync-ios-tablet-panic: ${filename} missing panic hub markers`);
    process.exit(1);
  }
  const deviceCfg = hub.devices[deviceKey];
  const body = renderPanicHub(deviceKey);
  html = html.replace(re, `${start}\n${body}\n      ${end}`);
  html = patchLead(html, deviceCfg);
  html = patchMetaDescription(html, deviceCfg);
  writeFileSync(path, html, "utf8");
  console.log(`sync-ios-tablet-panic · ${filename}`);
}

patchFile("ios.html", "ios");
patchFile("tablet.html", "tablet");
console.log("sync-ios-tablet-panic done");
