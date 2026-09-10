#!/usr/bin/env node
/**
 * Issue spotlight publisher · anonymized identify/resolve → blog posts.
 *
 *   node scripts/publish-issue-spotlights.mjs --from-fixtures
 *   node scripts/publish-issue-spotlights.mjs --from-events fixtures/issue-spotlight-events.json
 *   node scripts/publish-issue-spotlights.mjs --dry-run
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  aggregateIssueSpotlightEvents,
  buildIssueSpotlightMarkdown,
  buildIssueSpotlightPayload,
  detectIssueEvent,
  issueMeta,
} from "../src/issue-spotlight.mjs";
import { loadLocalCardsForReport } from "../src/field-report.mjs";
import { loadCardById, listCards } from "../src/storage.mjs";
import { renderBlogPostHtml, issueSpotlightBodyHtml } from "./render-blog-post.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const blogDir = join(root, "web", "blog");
const sitemapPath = join(root, "web", "sitemap.xml");
const indexPath = join(blogDir, "index.html");

const flags = { dryRun: false, fromFixtures: false, fromEvents: null, fromCards: false };
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a === "--dry-run") flags.dryRun = true;
  else if (a === "--from-fixtures") flags.fromFixtures = true;
  else if (a === "--from-cards") flags.fromCards = true;
  else if (a === "--from-events" && process.argv[i + 1]) flags.fromEvents = process.argv[++i];
}

function eventsFromCards() {
  const metas = listCards(100);
  const events = [];
  for (let i = 0; i < metas.length; i++) {
    const current = loadCardById(metas[i].card_id);
    const previous = i + 1 < metas.length ? loadCardById(metas[i + 1].card_id) : null;
    const payload = buildIssueSpotlightPayload(current, previous);
    if (payload) events.push(payload);
  }
  return events;
}

function eventsFromFixtures() {
  const path = join(root, "fixtures", "issue-spotlight-events.json");
  return JSON.parse(readFileSync(path, "utf8"));
}

function collectEvents() {
  if (flags.fromEvents) {
    return JSON.parse(readFileSync(flags.fromEvents, "utf8"));
  }
  if (flags.fromFixtures) return eventsFromFixtures();
  if (flags.fromCards) return eventsFromCards();
  return eventsFromFixtures();
}

function ensureSitemapEntry(slug, date) {
  if (!existsSync(sitemapPath)) return;
  const loc = `https://innsegall.com/blog/${slug}`;
  let xml = readFileSync(sitemapPath, "utf8");
  if (xml.includes(loc)) {
    xml = xml.replace(
      new RegExp(`(<loc>${loc}</loc>\\s*<lastmod>)[^<]+(</lastmod>)`),
      `$1${date}$2`
    );
  } else {
    const block = `  <url>
    <loc>${loc}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>
`;
    xml = xml.replace("</urlset>", `${block}</urlset>`);
  }
  if (!flags.dryRun) writeFileSync(sitemapPath, xml, "utf8");
}

function ensureBlogIndexCard(slug, title, dek) {
  if (!existsSync(indexPath)) return;
  const href = `/blog/${slug}`;
  let html = readFileSync(indexPath, "utf8");
  if (html.includes(href)) return;
  const card = `        <article class="card">
          <h2 class="card-title"><a href="${href}">${title}</a></h2>
          <p>${dek}</p>
        </article>
`;
  html = html.replace('<div class="card-grid">', `<div class="card-grid">\n${card}`);
  if (!flags.dryRun) writeFileSync(indexPath, html, "utf8");
}

const events = collectEvents();
const aggregates = aggregateIssueSpotlightEvents(events);

if (!aggregates.length) {
  console.log("No issue spotlight events to publish.");
  process.exit(0);
}

let published = 0;
for (const stats of aggregates) {
  const meta = issueMeta(stats.issue_key);
  const slug = meta.slug;
  const date = stats.last_day || new Date().toISOString().slice(0, 10);
  const md = buildIssueSpotlightMarkdown(stats, { date });
  const bodyHtml = issueSpotlightBodyHtml(stats, meta);
  const html = renderBlogPostHtml({
    title: meta.title,
    description: meta.dek,
    slug,
    date,
    bodyHtml,
    agentHint: meta.agent_hint,
    reportType: "issue_spotlight",
  });

  if (flags.dryRun) {
    console.log(`would publish · ${slug} · identified=${stats.identified} resolved=${stats.resolved}`);
    continue;
  }

  writeFileSync(join(blogDir, `${slug}.md`), md, "utf8");
  writeFileSync(join(blogDir, `${slug}.html`), html, "utf8");
  ensureSitemapEntry(slug, date);
  ensureBlogIndexCard(slug, meta.title, meta.dek.slice(0, 120));
  published++;
  console.log(`published · /blog/${slug}`);
}

console.log(
  flags.dryRun
    ? `dry-run · ${aggregates.length} issue pattern(s)`
    : `issue spotlight publish done · ${published} post(s)`
);
