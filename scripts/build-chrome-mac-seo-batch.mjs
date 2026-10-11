#!/usr/bin/env node
/**
 * Google Chrome on Mac SEO field guides · fixtures/chrome-mac-seo-batch.json
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderBlogPostHtml } from "./render-blog-post.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const blogDir = join(web, "blog");
const BATCH = JSON.parse(readFileSync(join(root, "fixtures", "chrome-mac-seo-batch.json"), "utf8"));
const DATE = BATCH.date;

const MANIFESTO = `
      <blockquote style="border-left:3px solid var(--gold,#F4C95D);padding-left:1rem;margin:1.5rem 0;color:var(--mist,#a8d8ff);font-style:italic;">
        With Innsegall, no one is your enemy · you have no foe.<br>
        <em>Chan eil nàmhaid agad.</em>
      </blockquote>`;

const AGENT_HELP = `
      <section aria-labelledby="agent-help-order"><h2 id="agent-help-order">If you are helping someone (human or AI)</h2>
        <ol>
          <li><strong>Name the browser.</strong> On many Macs the scare happened in <strong>Google Chrome</strong> · fixes live in Chrome settings first.</li>
          <li><strong>Browser before subscriptions.</strong> Close the trap · fix notifications or search · do not upsell antivirus from the same scammer.</li>
          <li><strong>Macintosh scout last.</strong> When the <strong>computer</strong> needs evidence · <a href="/alpha">Send the scout</a> · read-only · paste Battle Scout for any AI assistant.</li>
        </ol>
        <p class="legal-meta">Innsegall does not scan inside Chrome · we guide calm steps · Mac Battle Scout for the machine.</p>
      </section>`;

function guideHtml(post) {
  const sections = (post.sections || [])
    .map((s) => `<h2>${s.h}</h2>\n<p>${s.p}</p>`)
    .join("\n");
  return `
      <h1>${post.h1}</h1>
      <p class="blog-rune-divider" aria-hidden="true"></p>
      <p class="legal-meta">October 11, 2026 · ~5 min read</p>
      ${MANIFESTO}
      <p>${post.lead}</p>
      ${AGENT_HELP}
      ${sections}
      <h2>Next step</h2>
      <p>${post.cta || '<a class="btn-horn btn-horn--compact" href="/alpha">Send the scout</a>'}</p>`;
}

const seoPackPath = join(root, "fixtures", "blog-posts-seo.json");
const seoPack = JSON.parse(readFileSync(seoPackPath, "utf8"));
const cards = [];

for (const post of BATCH.posts) {
  const bodyHtml = guideHtml(post);
  const html = renderBlogPostHtml({
    title: post.h1,
    description: post.description,
    slug: post.slug,
    date: DATE,
    agentHint: post.agentHint,
    bodyHtml,
  });
  writeFileSync(join(blogDir, `${post.slug}.html`), html, "utf8");
  seoPack.posts[post.slug] = {
    description: post.description,
    datePublished: DATE,
    dateModified: DATE,
  };
  cards.push({ slug: post.slug, title: post.cardTitle || post.h1, blurb: post.cardBlurb });
  console.log(`wrote blog/${post.slug}.html`);
}

writeFileSync(seoPackPath, JSON.stringify(seoPack, null, 2) + "\n", "utf8");

const vercelPath = join(web, "vercel.json");
const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
const rewriteSet = new Set(vercel.rewrites.map((r) => r.source));
for (const post of BATCH.posts) {
  const source = `/blog/${post.slug}`;
  if (!rewriteSet.has(source)) {
    vercel.rewrites.push({ source, destination: `/blog/${post.slug}.html` });
    rewriteSet.add(source);
  }
}
writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n", "utf8");

const sitemapPath = join(web, "sitemap.xml");
let sitemap = readFileSync(sitemapPath, "utf8");
for (const post of BATCH.posts) {
  const loc = `https://innsegall.com/blog/${post.slug}`;
  if (!sitemap.includes(loc)) {
    const block = `  <url>
    <loc>${loc}</loc>
    <lastmod>${DATE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    sitemap = sitemap.replace("</urlset>", `${block}</urlset>`);
  }
}
writeFileSync(sitemapPath, sitemap, "utf8");

const blogIndexPath = join(blogDir, "index.html");
if (existsSync(blogIndexPath)) {
  let blogIndex = readFileSync(blogIndexPath, "utf8");
  const marker = '<p class="section-label" style="margin-top:var(--space-4)">Chrome on Mac · search guides</p>';
  const cardHtml = cards
    .map(
      (c) => `
        <article class="card">
          <h2 class="card-title"><a href="/blog/${c.slug}">${c.title}</a></h2>
          <p>${c.blurb}</p>
        </article>`
    )
    .join("\n");
  if (!blogIndex.includes(marker)) {
    const insertBefore = '<p class="section-label" style="margin-top:var(--space-4)">Safari on Mac · search guides</p>';
    if (blogIndex.includes(insertBefore)) {
      blogIndex = blogIndex.replace(
        insertBefore,
        `${marker}
      <div class="card-grid">${cardHtml}
      </div>
      ${insertBefore}`
      );
      writeFileSync(blogIndexPath, blogIndex, "utf8");
      console.log("blog/index.html · Chrome on Mac section");
    }
  }
}

console.log(`Chrome Mac SEO batch done · ${BATCH.posts.length} posts`);
