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

function fieldGlassDisplayDate(isoDate) {
  const [y, m, d] = isoDate.split("-");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

function renderFieldGlassBody() {
  const latest = hub.latest_field_glass;
  const desk = hub.field_glass_desk;
  if (!desk) {
    console.error("sync-watch-hub: missing field_glass_desk in watch-hub.json");
    process.exit(1);
  }
  const displayDate = fieldGlassDisplayDate(latest.date);
  const feelRows = desk.feel_rows
    .map(
      (r) =>
        `            <tr><td style="padding:0.5rem;vertical-align:top">${r.feel}</td><td style="padding:0.5rem">${r.start}</td></tr>`
    )
    .join("\n");
  const mistUl = desk.mist_links.map((l) => `          <li><a href="${l.href}">${l.label}</a></li>`).join("\n");
  const briefUl = desk.news_brief.map((b) => `          <li>${b}</li>`).join("\n");
  const habitsOl = desk.habits.map((h) => `          <li>${h}</li>`).join("\n");

  return `
      <p class="legal-nav"><a href="/blog">← Field Report</a> · <a href="/watch">Macintosh watch</a> · <a href="${desk.prev_href}">${desk.prev_label}</a></p>
      <p class="section-label">Field Glass · update</p>
      <h1>Field Glass update · ${displayDate}</h1>
      <p class="blog-rune-divider" aria-hidden="true">ᚠ · ᚢ · ᚦ</p>
      <p class="legal-meta">${displayDate} · ~${latest.read_minutes} min read</p>

      <p>${desk.intro_html}</p>

      <section aria-labelledby="fg-feel"><h2 id="fg-feel">What matters this week</h2>
        <table style="width:100%;border-collapse:collapse;font-size:0.95rem">
          <thead><tr><th style="text-align:left;padding:0.5rem;border-bottom:1px solid var(--gold,#F4C95D)">You feel</th><th style="text-align:left;padding:0.5rem;border-bottom:1px solid var(--gold,#F4C95D)">Start here</th></tr></thead>
          <tbody>
${feelRows}
          </tbody>
        </table>
        <p>Pricing · panic <strong>$4.20</strong> · clan <strong>$6.67/mo</strong> · <a href="/supplies">Supplies</a>.</p>
      </section>

      <section aria-labelledby="fg-mist"><h2 id="fg-mist">Trending mist → Innsegall lane</h2>
        <ul>
${mistUl}
        </ul>
        <p><strong>Default move:</strong> <a href="/alpha">Send the scout</a> · <a href="/ios">iPhone/iPad hub</a> · <a href="/boat">Is Innsegall for you?</a> · <a href="/watch">Macintosh watch</a></p>
      </section>

      <section aria-labelledby="fg-brief"><h2 id="fg-brief">News brief (calm)</h2>
        <ul>
${briefUl}
        </ul>
      </section>

      <section aria-labelledby="fg-habits"><h2 id="fg-habits">Three calm habits</h2>
        <ol>
${habitsOl}
        </ol>
      </section>`;
}

function ensureLatestFieldGlassRoutes() {
  const latest = hub.latest_field_glass;
  const loc = `${SITE}/blog/${latest.slug}`;
  const vercelPath = join(web, "vercel.json");
  const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
  const source = `/blog/${latest.slug}`;
  if (!vercel.rewrites.some((r) => r.source === source)) {
    vercel.rewrites.push({ source, destination: `/blog/${latest.slug}.html` });
    writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n", "utf8");
    console.log(`sync-watch-hub · vercel rewrite ${source}`);
  }
  const sitemapPath = join(web, "sitemap.xml");
  let sitemap = readFileSync(sitemapPath, "utf8");
  if (!sitemap.includes(loc)) {
    const block = `  <url>
    <loc>${loc}</loc>
    <lastmod>${latest.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>
`;
    sitemap = sitemap.replace("</urlset>", `${block}</urlset>`);
    writeFileSync(sitemapPath, sitemap, "utf8");
    console.log(`sync-watch-hub · sitemap ${latest.slug}`);
  }
  const seoPath = join(root, "fixtures", "blog-posts-seo.json");
  const seoPack = JSON.parse(readFileSync(seoPath, "utf8"));
  if (!seoPack.posts[latest.slug]) {
    seoPack.posts[latest.slug] = {
      description: latest.description,
      datePublished: latest.date,
      dateModified: latest.date,
    };
    writeFileSync(seoPath, JSON.stringify(seoPack, null, 2) + "\n", "utf8");
    console.log(`sync-watch-hub · blog-posts-seo ${latest.slug}`);
  }
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
  const bodyHtml = renderFieldGlassBody();
  const html = renderBlogPostHtml({
    title: latest.title.replace(/ · Innsegall$/, ""),
    description: latest.description,
    slug: latest.slug,
    date: latest.date,
    agentHint: `Field Glass ${latest.date} · Macintosh watch at innsegall.com/watch · iOS hub innsegall.com/ios`,
    reportType: "field_glass",
    bodyHtml,
  });
  writeFileSync(join(web, "blog", `${latest.slug}.html`), html, "utf8");
  console.log(`sync-watch-hub · blog/${latest.slug}.html`);
}

patchWatchHtml();
writeRss();
ensureLatestFieldGlassRoutes();
writeFieldGlassHtml();
console.log("sync-watch-hub done");
