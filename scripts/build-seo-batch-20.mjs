#!/usr/bin/env node
/**
 * Generate 20 SEO field guides from fixtures/blog-seo-batch-20.json
 * · HTML · blog-posts-seo.json · vercel rewrites · sitemap · blog index cards.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderBlogPostHtml } from "./render-blog-post.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const blogDir = join(web, "blog");
const DATE = "2026-09-23";
const BATCH = JSON.parse(readFileSync(join(root, "fixtures", "blog-seo-batch-20.json"), "utf8"));

const MANIFESTO = `
      <blockquote style="border-left:3px solid var(--gold,#F4C95D);padding-left:1rem;margin:1.5rem 0;color:var(--mist,#a8d8ff);font-style:italic;">
        With Innsegall, no one is your enemy · you have no foe.<br>
        <em>Chan eil nàmhaid agad.</em>
      </blockquote>`;

function guideHtml(post) {
  const sections = (post.sections || [])
    .map((s) => `<h2>${s.h}</h2>\n<p>${s.p}</p>`)
    .join("\n");
  const related = post.related
    ? `<h2>Related field guides</h2>\n<ul>${post.related.map((r) => `<li><a href="${r.href}">${r.label}</a></li>`).join("")}</ul>`
    : "";
  return `
      <h1>${post.h1}</h1>
      <p class="blog-rune-divider" aria-hidden="true">ᚠ · ᚢ · ᚦ</p>
      <p class="legal-meta">September 23, 2026 · ~6 min read</p>
      ${MANIFESTO}
      <p>${post.lead}</p>
      ${sections}
      ${related}
      <h2>Next step</h2>
      <p>${post.cta || '<a class="btn-horn btn-horn--compact" href="/alpha">Send the scout</a> on your Macintosh · <a href="/boat">Our lane</a> · not antivirus.'}</p>`;
}

const seoPack = JSON.parse(readFileSync(join(root, "fixtures", "blog-posts-seo.json"), "utf8"));
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

writeFileSync(join(root, "fixtures", "blog-posts-seo.json"), JSON.stringify(seoPack, null, 2) + "\n", "utf8");

const vercelPath = join(web, "vercel.json");
const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
const rewriteSet = new Set(vercel.rewrites.map((r) => r.source));
for (const post of BATCH.posts) {
  const source = `/blog/${post.slug}`;
  if (!rewriteSet.has(source)) {
    vercel.rewrites.push({
      source,
      destination: `/blog/${post.slug}.html`,
    });
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
let blogIndex = readFileSync(blogIndexPath, "utf8");
const cardHtml = cards
  .map(
    (c) => `
        <article class="card">
          <h2 class="card-title"><a href="/blog/${c.slug}">${c.title}</a></h2>
          <p>${c.blurb}</p>
        </article>`
  )
  .join("\n");
const marker = '<p class="section-label" style="margin-top:var(--space-6)">All chronicles</p>';
if (blogIndex.includes(marker) && !blogIndex.includes(`/blog/${BATCH.posts[0].slug}`)) {
  blogIndex = blogIndex.replace(
    marker,
    `${marker}
      <p class="section-label" style="margin-top:var(--space-4)">Search guides · Sep 2026 batch</p>
      <div class="card-grid">${cardHtml}
      </div>`
  );
  writeFileSync(blogIndexPath, blogIndex, "utf8");
}

console.log(`SEO batch done · ${BATCH.posts.length} posts · sync: npm run sync-blog-seo && npm run sync-site-chrome`);
