#!/usr/bin/env node
/**
 * Macintosh watch hub · /watch HTML + RSS from fixtures/watch-hub.json.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderBlogPostHtml } from "./render-blog-post.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const hub = JSON.parse(readFileSync(join(root, "fixtures", "watch-hub.json"), "utf8"));
const SITE = "https://innsegall.com";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listItems(items, mapFn) {
  return items.map(mapFn).join("\n");
}

function renderWatchBody() {
  const latest = hub.latest_field_glass;
  const latestHref = `/blog/${latest.slug}`;

  const trendUl = listItems(
    hub.trending_guides,
    (g) => `          <li><a href="${esc(g.href)}">${esc(g.query)}</a></li>`
  );
  const scoutUl = listItems(
    hub.scout_trends,
    (g) => `          <li><a href="${esc(g.href)}">${esc(g.label)}</a></li>`
  );
  const archiveUl = listItems(
    hub.field_glass_archive,
    (g) =>
      `          <li><a href="/blog/${esc(g.slug)}">${esc(g.title)}</a> · <time datetime="${g.date}">${g.date}</time></li>`
  );
  const eventsUl = listItems(
    hub.events,
    (e) =>
      `          <li><time datetime="${e.date}">${e.date}</time> · <a href="${esc(e.href)}">${esc(e.title)}</a></li>`
  );

  return `
      <p class="section-label">Macintosh watch</p>
      <h1>Field Glass · watch hub</h1>
      <p class="article-lead">Trending Mac searches mapped to <strong>field guides</strong> · weekly Field Glass desk · Voyage calendar · post-scare triage · not antivirus.</p>
      <p><a class="btn-horn btn-horn--compact" href="/alpha">Send the scout</a> · <a href="/boat">Our lane</a> · <a href="/blog">Field Report</a></p>

      <section class="card" aria-labelledby="watch-latest">
        <h2 id="watch-latest">Latest Field Glass</h2>
        <p><strong><a href="${latestHref}">${esc(latest.title)}</a></strong> · ${latest.read_minutes} min read · <time datetime="${latest.date}">${latest.date}</time></p>
        <p>${esc(latest.description)}</p>
        <p><a href="${latestHref}">Read the desk update →</a> · <a type="application/rss+xml" href="/watch-feed.xml">RSS</a></p>
      </section>

      <section aria-labelledby="watch-trending">
        <h2 id="watch-trending">Trending guides</h2>
        <ul>
${trendUl}
        </ul>
      </section>

      <section aria-labelledby="watch-scout">
        <h2 id="watch-scout">Scout lane signals</h2>
        <ul>
${scoutUl}
        </ul>
      </section>

      <section aria-labelledby="watch-events">
        <h2 id="watch-events">Voyage &amp; calendar</h2>
        <ul>
${eventsUl}
        </ul>
      </section>

      <section aria-labelledby="watch-archive">
        <h2 id="watch-archive">Field Glass archive</h2>
        <ul>
${archiveUl}
        </ul>
      </section>`;
}

function renderFieldGlassOct7Body() {
  return `
      <p class="legal-nav"><a href="/blog">← Field Report</a> · <a href="/watch">Macintosh watch</a> · <a href="/blog/field-glass-oct-2-2026">Oct 2 desk</a></p>
      <p class="section-label">Field Glass · update</p>
      <h1>Field Glass update · October 7, 2026</h1>
      <p class="blog-rune-divider" aria-hidden="true">ᚠ · ᚢ · ᚦ</p>
      <p class="legal-meta">October 7, 2026 · ~6 min read</p>

      <p><strong>Innsegall</strong> · mid-October scare season · <strong>next Voyage sails Oct 15</strong> · read-only scout lane · map searches to field guides and <a href="/alpha">Send the scout</a>.</p>

      <section aria-labelledby="fg-feel"><h2 id="fg-feel">What matters this week</h2>
        <table style="width:100%;border-collapse:collapse;font-size:0.95rem">
          <thead><tr><th style="text-align:left;padding:0.5rem;border-bottom:1px solid var(--gold,#F4C95D)">You feel</th><th style="text-align:left;padding:0.5rem;border-bottom:1px solid var(--gold,#F4C95D)">Start here</th></tr></thead>
          <tbody>
            <tr><td style="padding:0.5rem;vertical-align:top">Popup said virus</td><td style="padding:0.5rem"><a href="/blog/fake-virus-popup-macintosh">Fake virus popup</a> · <a href="/alpha">Send the scout</a></td></tr>
            <tr><td style="padding:0.5rem;vertical-align:top">Mac slow · not sure if hacked</td><td style="padding:0.5rem"><a href="/blog/mac-performance-panic-vs-security-panic">Performance vs security panic</a></td></tr>
            <tr><td style="padding:0.5rem;vertical-align:top">Clicked a weird link</td><td style="padding:0.5rem"><a href="/blog/clicked-suspicious-link-macintosh">Suspicious link</a></td></tr>
            <tr><td style="padding:0.5rem;vertical-align:top">Safari notification spam</td><td style="padding:0.5rem"><a href="/blog/safari-fake-virus-notifications-mac">Safari fake notifications</a></td></tr>
            <tr><td style="padding:0.5rem;vertical-align:top">Quota full on Voyage day</td><td style="padding:0.5rem"><code>innsegall scout</code> · <a href="/supplies">Supplies</a></td></tr>
          </tbody>
        </table>
        <p>Pricing · panic <strong>$4.20</strong> · clan <strong>$6.67/mo</strong> · <a href="/supplies">Supplies</a>.</p>
      </section>

      <section aria-labelledby="fg-mist"><h2 id="fg-mist">Trending mist → Innsegall lane</h2>
        <ul>
          <li><a href="/blog/fake-virus-popup-macintosh">Fake virus popup Mac</a></li>
          <li><a href="/blog/mac-slow-after-suspicious-download">Mac slow after download</a></li>
          <li><a href="/blog/mac-performance-panic-vs-security-panic">Hacked or just slow?</a></li>
          <li><a href="/blog/do-i-need-antivirus-mac-2026">Do I need antivirus Mac 2026</a></li>
          <li><a href="/blog/pasted-terminal-command-mac-scare">Pasted Terminal command</a></li>
        </ul>
        <p><strong>Default move:</strong> <a href="/alpha">Send the scout</a> · <a href="/boat">Is Innsegall for you?</a> · <a href="/watch">Macintosh watch</a></p>
      </section>

      <section aria-labelledby="fg-brief"><h2 id="fg-brief">Mac news brief (calm)</h2>
        <ul>
          <li><strong>Scare popups</strong> · force-quit the browser tab · do not call the number on screen.</li>
          <li><strong>Software Update</strong> · patch what Apple ships · especially if you use Screen Sharing.</li>
          <li><strong>ClickFix</strong> · never paste into Terminal from a web page.</li>
          <li><strong>Voyage rhythm</strong> · free scouts <strong>1st &amp; 15th</strong> · next sail <strong>Oct 15</strong> · <a href="/blog/voyage-health-tracker-1st-15th">tracker</a>.</li>
        </ul>
      </section>

      <section aria-labelledby="fg-habits"><h2 id="fg-habits">Three calm habits</h2>
        <ol>
          <li>Scout before subscription panic · LIKELY_OK is a normal outcome.</li>
          <li>Back up files you care about · <a href="/guide#backup">Time Machine + cloud</a>.</li>
          <li>Copy the Battle Scout for any AI assistant · plain English · no doom feed.</li>
        </ol>
      </section>`;
}

function patchWatchHtml() {
  const path = join(web, "watch.html");
  const start = "<!-- INNSEGALL_WATCH_BODY_START -->";
  const end = "<!-- INNSEGALL_WATCH_BODY_END -->";
  const body = renderWatchBody();
  if (!existsSync(path)) {
    console.error("sync-watch-hub: missing web/watch.html shell");
    process.exit(1);
  }
  let html = readFileSync(path, "utf8");
  const re = new RegExp(`${start}[\\s\\S]*${end}`);
  if (!re.test(html)) {
    console.error("sync-watch-hub: watch.html missing body markers");
    process.exit(1);
  }
  html = html.replace(re, `${start}\n${body}\n      ${end}`);
  writeFileSync(path, html, "utf8");
  console.log("sync-watch-hub · watch.html body");
}

function writeRss() {
  const latest = hub.latest_field_glass;
  const items = hub.field_glass_archive
    .map((g) => {
      const url = `${SITE}/blog/${g.slug}`;
      return `  <item>
    <title>${esc(g.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${new Date(g.date).toUTCString()}</pubDate>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Innsegall · Field Glass watch</title>
    <link>${SITE}/watch</link>
    <description>${esc(latest.description)}</description>
    <language>en-us</language>
    <atom:link href="${SITE}/watch-feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
  writeFileSync(join(web, "watch-feed.xml"), xml, "utf8");
  console.log("sync-watch-hub · watch-feed.xml");
}

function writeFieldGlassHtml() {
  const latest = hub.latest_field_glass;
  const bodyHtml = renderFieldGlassOct7Body();
  const html = renderBlogPostHtml({
    title: latest.title.replace(/ · Innsegall$/, ""),
    description: latest.description,
    slug: latest.slug,
    date: latest.date,
    agentHint: "Field Glass Oct 7 · Macintosh watch hub at innsegall.com/watch · trending → field guides",
    reportType: "field_glass",
    bodyHtml,
  });
  writeFileSync(join(web, "blog", `${latest.slug}.html`), html, "utf8");
  console.log(`sync-watch-hub · blog/${latest.slug}.html`);
}

patchWatchHtml();
writeRss();
writeFieldGlassHtml();
console.log("sync-watch-hub done");
