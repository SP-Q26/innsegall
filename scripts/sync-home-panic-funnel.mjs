#!/usr/bin/env node
/**
 * Home panic funnel · scare-first avenue selector on index.html.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = join(root, "web", "index.html");
const hub = JSON.parse(readFileSync(join(root, "fixtures", "home-panic-funnel.json"), "utf8"));

const START = "<!-- HOME_PANIC_FUNNEL_START -->";
const END = "<!-- HOME_PANIC_FUNNEL_END -->";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function laneCard(lane) {
  if (lane.primary_href) {
    return `            <article class="card home-device-card home-device-card--compact home-device-card--${esc(lane.id)}">
              <h3>${esc(lane.title)}</h3>
              <p>${lane.body}</p>
              <div class="home-device-card-actions">
                <a class="btn-horn btn-horn--compact" href="${esc(lane.primary_href)}">${esc(lane.primary_cta)}</a>
                <a class="btn-link" href="${esc(lane.secondary_href)}">${esc(lane.secondary_cta)}</a>
              </div>
            </article>`;
  }
  return `            <article class="card home-device-card home-device-card--compact home-device-card--${esc(lane.id)}">
              <h3>${esc(lane.title)}</h3>
              <p>${lane.body}</p>
              <div class="home-device-card-actions">
                <a class="btn-horn btn-horn--compact" href="${esc(lane.href)}">${esc(lane.cta)}</a>
                <a class="btn-link" href="${esc(lane.secondary_href)}">${esc(lane.secondary_cta)}</a>
              </div>
            </article>`;
}

const avenues = hub.avenues
  .map(
    (a) =>
      `            <a class="avenue-card" href="${esc(a.href)}"><span class="avenue-card__device">${esc(a.device)}</span><span class="avenue-card__label">${esc(a.label)}</span></a>`
  )
  .join("\n");

const moreOptions = hub.more_options
  .map((o) => `              <a class="btn-link" href="${esc(o.href)}">${esc(o.label)}</a>`)
  .join("\n");

const block = `${START}
      <section class="section home-start-here" id="start-here" aria-labelledby="start-here-banner">
        <p class="section-label">${esc(hub.section_label)}</p>
        <h2 id="start-here-banner" class="home-panic-banner">${esc(hub.panic_banner)}</h2>

        <div class="device-selector device-selector--primary" aria-label="${esc(hub.device_selector_label)}">
          <p class="device-selector-lead device-selector-lead--tight">${hub.device_selector_lead}</p>
          <div class="card-grid home-device-funnel home-device-funnel--compact home-device-funnel--hero">
${hub.lanes.map(laneCard).join("\n")}
          </div>
        </div>

        <h3 id="start-here-title" class="home-scare-title">${esc(hub.title)}</h3>
        <p class="section-lead">${hub.lead}</p>

        <div class="avenue-selector" role="navigation" aria-label="${esc(hub.avenue_label)}">
          <p class="panic-jump-label">${esc(hub.avenue_label)}</p>
          <div class="avenue-grid">
${avenues}
          </div>
        </div>

        <details class="home-more-options">
          <summary>${esc(hub.more_options_label)}</summary>
          <p class="home-more-options-links">
${moreOptions}
          </p>
        </details>
      </section>
${END}`;

let html = readFileSync(indexPath, "utf8");
if (!html.includes(START) || !html.includes(END)) {
  console.error("sync-home-panic-funnel: missing HOME_PANIC_FUNNEL markers in index.html");
  process.exit(1);
}
const re = new RegExp(`${START}[\\s\\S]*?${END}`);
html = html.replace(re, block);

const funnelRe = new RegExp(`${START}[\\s\\S]*?${END}`);
const startIdx = html.indexOf('id="start-here"');
const heroIdx = html.indexOf('class="hero"');
if (startIdx > heroIdx && heroIdx > 0) {
  const m = html.match(funnelRe);
  if (m) {
    const funnelBlock = m[0];
    html = html.replace(funnelBlock, "");
    html = html.replace(/<main id="main">\s*/, `<main id="main">\n      ${funnelBlock.trim()}\n\n      `);
  }
}

writeFileSync(indexPath, html, "utf8");
console.log(`sync-home-panic-funnel · index.html · v${hub.version}`);
