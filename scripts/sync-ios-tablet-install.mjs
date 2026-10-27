#!/usr/bin/env node
/**
 * iOS / iPad install walkthrough · Companion Add to Home Screen · Settings tour.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const guide = JSON.parse(
  readFileSync(join(root, "fixtures", "ios-tablet-install-guide.json"), "utf8")
);

const SITE = "https://innsegall.com";
const INSTALL_START = "<!-- INNSEGALL_PLATFORM_INSTALL_START -->";
const INSTALL_END = "<!-- INNSEGALL_PLATFORM_INSTALL_END -->";
const COMPANION_START = "<!-- INNSEGALL_COMPANION_INSTALL_START -->";
const COMPANION_END = "<!-- INNSEGALL_COMPANION_INSTALL_END -->";
const PAGE_START = "<!-- INNSEGALL_MOBILE_INSTALL_PAGE_START -->";
const PAGE_END = "<!-- INNSEGALL_MOBILE_INSTALL_PAGE_END -->";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderSteps(steps) {
  return steps
    .map(
      (s, i) => `          <li>
            <strong>Step ${i + 1} · ${esc(s.title)}</strong>
            <span>${s.body}</span>
          </li>`
    )
    .join("\n");
}

function renderSettingsTour() {
  const rows = guide.settings_tour.items
    .map(
      (item) => `          <tr><th scope="row">${item.label}</th><td><code class="settings-path">${item.path}</code></td></tr>`
    )
    .join("\n");
  return `        <h3 class="panic-step-title">${esc(guide.settings_tour.title)}</h3>
        <table class="settings-lookup-table">
          <thead><tr><th scope="col">What you need</th><th scope="col">Where to tap</th></tr></thead>
          <tbody>
${rows}
          </tbody>
        </table>`;
}

function renderPlatformInstall(deviceKey) {
  const d = guide.devices[deviceKey];
  const tabletTip = d.tablet_tip
    ? `        <p class="platform-install-tip">${d.tablet_tip}</p>\n`
    : "";
  return `${INSTALL_START}
      <section class="platform-install panic-well panic-well--hero" id="install-companion" aria-labelledby="install-companion-title">
        <p class="section-label">Install on ${esc(d.device_name)}</p>
        <h2 class="panic-well-title" id="install-companion-title">${esc(guide.companion_track.title)}</h2>
        <p class="panic-well-lead">${guide.companion_track.lead} ${guide.honesty}</p>
        <p class="platform-install-note">${d.add_to_home_note}</p>
${tabletTip}        <ol class="steps platform-install-steps">
${renderSteps(guide.companion_track.steps)}
        </ol>
        <p class="platform-install-actions">
          <a class="btn-horn btn-horn--fill" href="/companion">Open Companion</a>
          <a class="btn-secondary" href="${d.install_page}">Full install walkthrough</a>
          <a class="btn-link" href="/alpha">Mac scout</a>
        </p>
        <h3 class="panic-step-title">${esc(guide.panic_pin_track.title)}</h3>
        <ol class="panic-steps">
${guide.panic_pin_track.steps.map((s) => `          <li><strong>${esc(s.title)}</strong> · ${s.body}</li>`).join("\n")}
        </ol>
${renderSettingsTour()}
      </section>
${INSTALL_END}`;
}

function renderInstallPage(deviceKey) {
  const d = guide.devices[deviceKey];
  return `${PAGE_START}
      <p class="section-label">Install · ${esc(d.device_name)}</p>
      <h1>${esc(d.page_title)}</h1>
      <p class="article-lead">${d.hero}</p>
      <p class="legal-meta">${guide.honesty}</p>

      <section class="platform-install panic-well" aria-labelledby="install-page-companion">
        <h2 class="panic-well-title" id="install-page-companion">${esc(guide.companion_track.title)}</h2>
        <p class="platform-install-note">${d.add_to_home_note}</p>
        <ol class="steps platform-install-steps">
${renderSteps(guide.companion_track.steps)}
        </ol>
        <p><a class="btn-horn btn-horn--fill" href="/companion">Open Companion now</a></p>
      </section>

      <section class="panic-well" aria-labelledby="install-page-panic">
        <h2 class="panic-step-title" id="install-page-panic">${esc(guide.panic_pin_track.title)}</h2>
        <ol class="panic-steps">
${guide.panic_pin_track.steps.map((s) => `          <li><strong>${esc(s.title)}</strong> · ${s.body}</li>`).join("\n")}
        </ol>
        <p><a class="btn-secondary" href="${d.page}">Open ${esc(d.device_name)} panic guide</a></p>
      </section>

      <section class="panic-well panic-well--mac" aria-labelledby="install-page-settings">
        <h2 class="panic-step-title" id="install-page-settings">${esc(guide.settings_tour.title)}</h2>
        <table class="settings-lookup-table">
          <thead><tr><th scope="col">What you need</th><th scope="col">Where to tap</th></tr></thead>
          <tbody>
${guide.settings_tour.items.map((item) => `            <tr><th scope="row">${item.label}</th><td><code class="settings-path">${item.path}</code></td></tr>`).join("\n")}
          </tbody>
        </table>
        <p class="panic-well-footer"><a href="/install">Install on Mac</a> · scout runs on the computer · not pocket antivirus</p>
      </section>
${PAGE_END}`;
}

function renderCompanionInstall() {
  return `${COMPANION_START}
      <section class="companion-install-walk" id="install-companion" aria-labelledby="companion-install-title">
        <h2 class="companion-h2" id="companion-install-title">Install on iPhone or iPad</h2>
        <p class="companion-muted">${guide.companion_track.lead}</p>
        <ol class="steps platform-install-steps companion-install-steps">
${renderSteps(guide.companion_track.steps)}
        </ol>
        <p class="companion-muted">${guide.honesty}</p>
        <p><a href="/install/ios">iPhone walkthrough</a> · <a href="/install/tablet">iPad walkthrough</a> · <a href="/ios">Panic guide</a></p>
      </section>
${COMPANION_END}`;
}

function replaceBlock(html, start, end, block) {
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!re.test(html)) {
    console.error(`sync-ios-tablet-install: missing ${start}`);
    process.exit(1);
  }
  return html.replace(re, block);
}

function patchPlatformFile(filename, deviceKey) {
  const path = join(web, filename);
  let html = readFileSync(path, "utf8");
  html = replaceBlock(html, INSTALL_START, INSTALL_END, renderPlatformInstall(deviceKey));
  writeFileSync(path, html, "utf8");
  console.log(`sync-ios-tablet-install · ${filename}`);
}

function patchInstallHead(html, deviceKey, route) {
  const dev = guide.devices[deviceKey];
  const url = `${SITE}${route}`;
  const title = `${dev.page_title} · Innsegall Companion`;
  const description = `Add Innsegall Companion to your ${dev.device_name} Home Screen · import Battle Scout receipts · step-by-step Safari · no App Store · Mac runs the scout.`;
  const escAttr = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${escAttr(description)}">`
  );
  html = html.replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${url}">`);
  html = html.replace(/property="og:url" content="[^"]+"/g, `property="og:url" content="${url}"`);
  html = html.replace(/name="twitter:url" content="[^"]+"/g, `name="twitter:url" content="${url}"`);
  html = html.replace(/property="og:title" content="[^"]+"/g, `property="og:title" content="${escAttr(title)}"`);
  html = html.replace(/name="twitter:title" content="[^"]+"/g, `name="twitter:title" content="${escAttr(title)}"`);
  html = html.replace(
    /property="og:description" content="[^"]+"/g,
    `property="og:description" content="${escAttr(description)}"`
  );
  html = html.replace(
    /name="twitter:description" content="[^"]+"/g,
    `name="twitter:description" content="${escAttr(description)}"`
  );
  return html;
}

function ensureInstallPage(filename, deviceKey, route) {
  const path = join(web, filename);
  if (!existsSync(path)) {
    console.error(`sync-ios-tablet-install: create ${filename} with ${PAGE_START} markers first`);
    process.exit(1);
  }
  let html = readFileSync(path, "utf8");
  html = replaceBlock(html, PAGE_START, PAGE_END, renderInstallPage(deviceKey));
  html = patchInstallHead(html, deviceKey, route);
  writeFileSync(path, html, "utf8");
  mirrorInstallNestedPath(html, route);
  ensureRewrite(route, `/${filename}`);
  ensureSitemap(`${SITE}${route}`);
  console.log(`sync-ios-tablet-install · ${filename}`);
}

/** cleanUrls: /install/ios must be install/ios.html (install.html shadows rewrites). */
function mirrorInstallNestedPath(html, route) {
  const m = route.match(/^\/install\/(ios|tablet)$/);
  if (!m) return;
  const nestedDir = join(web, "install");
  mkdirSync(nestedDir, { recursive: true });
  const nestedPath = join(nestedDir, `${m[1]}.html`);
  writeFileSync(nestedPath, html, "utf8");
  console.log(`sync-ios-tablet-install · install/${m[1]}.html`);
}

function patchCompanion() {
  const path = join(web, "companion.html");
  let html = readFileSync(path, "utf8");
  if (html.includes(COMPANION_START)) {
    html = replaceBlock(html, COMPANION_START, COMPANION_END, renderCompanionInstall());
  } else {
    html = html.replace(
      /<aside class="companion-install-hint"[\s\S]*?<\/aside>/,
      renderCompanionInstall()
    );
  }
  writeFileSync(path, html, "utf8");
  console.log("sync-ios-tablet-install · companion.html");
}

function ensureRewrite(source, destination) {
  const vercelPath = join(web, "vercel.json");
  const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
  const exists = vercel.rewrites.some((r) => r.source === source);
  if (!exists) {
    vercel.rewrites.push({ source, destination });
    writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n", "utf8");
    console.log(`sync-ios-tablet-install · vercel ${source}`);
  }
}

function ensureSitemap(loc) {
  const sitemapPath = join(web, "sitemap.xml");
  if (!existsSync(sitemapPath)) return;
  let sitemap = readFileSync(sitemapPath, "utf8");
  if (sitemap.includes(`<loc>${loc}</loc>`)) return;
  const today = new Date().toISOString().slice(0, 10);
  const block = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
  sitemap = sitemap.replace("</urlset>", `${block}</urlset>`);
  writeFileSync(sitemapPath, sitemap, "utf8");
  console.log(`sync-ios-tablet-install · sitemap ${loc}`);
}

patchPlatformFile("ios.html", "ios");
patchPlatformFile("tablet.html", "tablet");
patchCompanion();
ensureInstallPage("install-ios.html", "ios", "/install/ios");
ensureInstallPage("install-tablet.html", "tablet", "/install/tablet");

console.log(`sync-ios-tablet-install done · v${guide.version}`);
