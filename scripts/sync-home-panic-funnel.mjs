#!/usr/bin/env node
/**
 * Home panic funnel · device chips + filtered scare avenues on index pages.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const hub = JSON.parse(readFileSync(join(root, "fixtures", "home-panic-funnel.json"), "utf8"));

const START = "<!-- HOME_PANIC_FUNNEL_START -->";
const END = "<!-- HOME_PANIC_FUNNEL_END -->";

const INDEX_TARGETS = [
  { rel: "index.html", blogPrefix: "", blogIndex: "/blog" },
  { rel: "es/index.html", blogPrefix: "/es", blogIndex: "/es/blog" },
  { rel: "pt/index.html", blogPrefix: "/pt", blogIndex: "/pt/blog" },
  { rel: "fr/index.html", blogPrefix: "", blogIndex: "/blog" },
  { rel: "ar/index.html", blogPrefix: "", blogIndex: "/blog" },
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function localizeHref(href, blogPrefix) {
  if (!blogPrefix || !href.startsWith("/blog/")) return href;
  return `${blogPrefix}${href}`;
}

function localizeMoreOptions(opts, blogIndex) {
  return opts.map((o) => {
    if (o.href === "/blog") return { ...o, href: blogIndex };
    return o;
  });
}

function buildBlock(blogPrefix, blogIndex) {
  const chips = hub.lanes
    .map(
      (lane) =>
        `            <button type="button" class="home-device-chip home-device-chip--${esc(lane.id)}" data-device-filter="${esc(lane.id)}" aria-pressed="false">${esc(lane.title)}</button>`
    )
    .join("\n");

  const avenues = hub.avenues
    .map((a) => {
      const href = localizeHref(a.href, blogPrefix);
      return `            <a class="avenue-card" href="${esc(href)}" data-device-key="${esc(a.device_key)}"><span class="avenue-card__device">${esc(a.device)}</span><span class="avenue-card__label">${esc(a.label)}</span></a>`;
    })
    .join("\n");

  const moreOptions = localizeMoreOptions(hub.more_options, blogIndex)
    .map((o) => `              <a class="btn-link" href="${esc(o.href)}">${esc(o.label)}</a>`)
    .join("\n");

  return `${START}
      <section class="section home-start-here" id="start-here" aria-labelledby="start-here-banner" data-home-panic-funnel>
        <p class="section-label">${esc(hub.section_label)}</p>
        <h2 id="start-here-banner" class="home-panic-banner">${esc(hub.panic_banner)}</h2>

        <div class="home-device-chips-wrap">
          <p class="home-device-chips-label">${esc(hub.device_selector_label)}</p>
          <p class="home-device-chips-lead">${esc(hub.device_selector_lead)}</p>
          <div class="home-device-chips" role="group" aria-label="${esc(hub.device_selector_label)}">
${chips}
          </div>
        </div>

        <p class="home-scare-hint" data-home-scare-hint>${esc(hub.scare_hint)}</p>

        <div class="home-scare-panel" data-home-scare-panel hidden>
          <h3 id="start-here-title" class="home-scare-title">${esc(hub.title)}</h3>
          <p class="section-lead home-scare-lead">${esc(hub.lead)}</p>

          <div class="avenue-selector avenue-selector--filtered" role="navigation" aria-label="${esc(hub.avenue_aria_label)}" data-home-avenue>
            <div class="avenue-grid">
${avenues}
            </div>
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
}

function patchIndex(rel, block) {
  const indexPath = join(web, rel);
  let html = readFileSync(indexPath, "utf8");
  if (!html.includes(START) || !html.includes(END)) {
    console.error(`sync-home-panic-funnel: missing markers in ${rel}`);
    process.exit(1);
  }
  const re = new RegExp(`${START}[\\s\\S]*?${END}`);
  html = html.replace(re, block);

  if (rel === "index.html") {
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
    html = html.replace(
      "<strong>Pick your situation first</strong> · then <strong>You're clear</strong>, <strong>Small fixes</strong>, or <strong>Get help</strong>",
      "<strong>What happened?</strong> · then <strong>You're clear</strong>, <strong>Small fixes</strong>, or <strong>Get help</strong>"
    );
    html = html.replace(
      /<a class="btn-horn btn-horn--fill" href="#start-here">What scared you\?<\/a>/,
      '<a class="btn-horn btn-horn--fill" href="#start-here">Start here</a>'
    );
  }

  writeFileSync(indexPath, html, "utf8");
  console.log(`sync-home-panic-funnel · ${rel}`);
}

for (const t of INDEX_TARGETS) {
  patchIndex(t.rel, buildBlock(t.blogPrefix, t.blogIndex));
}

console.log(`sync-home-panic-funnel done · v${hub.version}`);
