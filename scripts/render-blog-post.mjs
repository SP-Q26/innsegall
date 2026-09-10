#!/usr/bin/env node
/** Minimal blog article HTML shell · sync-site-chrome fills header/footer on deploy. */
import { PRICING } from "../src/constants.mjs";

const OG_URL = "https://innsegall.com/og/innsegall-card.png";
const CSS_VER = 15;

/**
 * @param {{
 *   title: string,
 *   description: string,
 *   slug: string,
 *   date: string,
 *   bodyHtml: string,
 *   agentHint: string,
 *   reportType?: string,
 * }} opts
 */
export function renderBlogPostHtml(opts) {
  const url = `${PRICING.site_url}/blog/${opts.slug}`;
  const label = opts.reportType === "issue_spotlight" ? "Issue spotlight" : "Field Report";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${escapeHtml(opts.title)} · Innsegall</title>
  <meta name="description" content="${escapeHtml(opts.description)}">
  <meta name="robots" content="index,follow">
  <meta name="theme-color" content="#0B1D2E">
  <link rel="canonical" href="${url}">

  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Innsegall">
  <meta property="og:title" content="${escapeHtml(opts.title)}">
  <meta property="article:published_time" content="${opts.date}">
  <meta name="twitter:image" content="${OG_URL}">
  <meta name="twitter:image:alt" content="Innsegall · Know you're okay · Macintosh triage">
  <meta name="twitter:description" content="${escapeHtml(opts.description)}">
  <meta name="twitter:title" content="${escapeHtml(opts.title)}">
  <meta name="twitter:site" content="@innsegall">
  <meta property="og:locale" content="en_US">
  <meta property="og:description" content="${escapeHtml(opts.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${OG_URL}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="Innsegall · Know you're okay · Macintosh triage">
  <meta name="twitter:card" content="summary_large_image">

  <meta name="innsegall:gospel" content="https://innsegall.com/.well-known/innsegall-gospel.json">
  <link rel="alternate" type="text/plain" href="https://innsegall.com/llms.txt" title="Innsegall · AI agent gospel (llms.txt)">
  <meta name="innsegall:agent-hint" content="${escapeHtml(opts.agentHint)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/favicon.svg">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/innsegall.css?v=${CSS_VER}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": ${jsonString(opts.title)},
    "datePublished": ${jsonString(opts.date)},
    "author": { "@id": "https://innsegall.com/#organization" },
    "publisher": { "@id": "https://innsegall.com/#organization" },
    "url": ${jsonString(url)},
    "description": ${jsonString(opts.description)},
    "inLanguage": "en-US"
  }
  </script>
  <script type="application/json" id="innsegall-field-report-agent-hint">${JSON.stringify({
    innsegall_agent_hint: opts.agentHint,
    gospel_url: "https://innsegall.com/.well-known/innsegall-gospel.json",
    llms_txt: "https://innsegall.com/llms.txt",
    agent_read_order: ["llms.txt", "innsegall-ai-bus.json", "innsegall-gospel.json"],
  })}</script>
</head>
<body data-brand="innsegall" data-product="innsegall-for-macintosh">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="beam-bg" aria-hidden="true"></div>
  <div class="page">
    <header class="site-header">
      <a class="brand-lockup" href="/" aria-label="Innsegall home">
        <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="brand-beam" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
              <stop stop-color="#F4C95D" stop-opacity="0.9"/>
              <stop offset="1" stop-color="#A8D8FF" stop-opacity="0.2"/>
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="8" fill="#122A42"/>
          <rect x="1.5" y="1.5" width="37" height="37" rx="7" fill="none" stroke="#F4C95D" stroke-opacity="0.35" stroke-width="1"/>
          <text x="6" y="11" fill="#F4C95D" font-size="5" font-family="Georgia, serif" opacity="0.55">ᚠ</text>
          <text x="30" y="11" fill="#A8D8FF" font-size="5" font-family="Georgia, serif" opacity="0.45">ᚦ</text>
          <path d="M20 6v28" stroke="url(#brand-beam)" stroke-width="2" stroke-linecap="round"/>
          <ellipse cx="20" cy="30" rx="8" ry="3" fill="#E8A87C" opacity="0.85"/>
          <path d="M14 22c2-4 10-4 12 0" stroke="#A8D8FF" stroke-width="1.5" fill="none" opacity="0.7"/>
        </svg>
        <span>
          <span class="brand-word">Innsegall</span>
          <span class="brand-pronounce">IN-sheh-gal · built for Macintosh</span>
        </span>
      </a>
      <nav class="header-nav" aria-label="Site">
        <a href="/alpha">Field manual</a>
        <a href="/blog">Field Report</a>
        <a href="/clan">Clan</a>
      </nav>
    </header>

    <main id="main" class="section legal-doc blog-prose" style="border-top:none;padding-top:0;">
      <p class="legal-nav"><a href="/blog">← Field Report</a></p>
      <p class="section-label">${label}</p>
      ${opts.bodyHtml}
      <p class="legal-nav" style="margin-top:2rem;">
        <a href="/alpha">Send the scout</a> · <a href="/privacy">Privacy</a> · <a href="/blog">All posts</a>
      </p>
    </main>
    <section class="blog-cta-strip section" aria-label="Next step">
      <p class="section-label">We send the scout</p>
      <p class="section-lead">Most households have no security scout. <strong>Innsegall scouts for you</strong> · <a href="/alpha">Send the scout</a> on your Macintosh · or <a href="/clan">bring your clan</a> for unlimited scouts and shared receipts.</p>
    </section>
    <footer class="site-footer">
      <p>© 2026 Innsegall · Isles of the Norse · Know you're okay.</p>
      <p class="footer-note">Field Report · anonymized scout digests · <strong>Voyage</strong> tracker on the 1st &amp; 15th.</p>
      <nav class="footer-links" aria-label="Footer">
        <a href="/guide">Guide</a>
        <a href="/map">Map</a>
        <a href="/boat">The boat</a>
        <a href="/clan">Join the clan</a>
        <a href="/warriors">War-band of scribes</a>
        <a href="/alpha">Field manual</a>
        <a href="/blog">Field Report</a>
        <a href="/tos">Terms</a>
        <a href="/privacy">Privacy</a>
        <a href="mailto:hello@innsegall.com">hello@innsegall.com</a>
      </nav>
    </footer>
  </div>
  <script src="/innsegall-nav.js?v=${CSS_VER}" defer></script>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonString(s) {
  return JSON.stringify(s);
}

/** Markdown stats block → simple HTML body fragment */
export function issueSpotlightBodyHtml(stats, meta) {
  const total = stats.identified + stats.resolved;
  const buckets = Object.entries(stats.attention_buckets || {})
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `<li><strong>${k.replace(/_/g, " ")}</strong> · ${n} scout signal${n === 1 ? "" : "s"}</li>`)
    .join("\n          ");
  const fixes = Object.entries(stats.fix_categories || {})
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `<li><strong>${k.replace(/_/g, " ")}</strong> · ${n} time${n === 1 ? "" : "s"}</li>`)
    .join("\n          ");

  return `
      <h1>${escapeHtml(meta.title)}</h1>
      <p class="blog-rune-divider" aria-hidden="true">ᚠ · ᚢ · ᚦ</p>
      <p class="legal-meta"><strong>Innsegall</strong> · Issue spotlight · ${stats.last_day} · ${total} anonymized signal${total === 1 ? "" : "s"}</p>
      <blockquote style="border-left:3px solid var(--gold,#F4C95D);padding-left:1rem;margin:1.5rem 0;color:var(--mist,#a8d8ff);font-style:italic;">
        With Innsegall, no one is your enemy · you have no foe.<br>
        Category counts only · <strong>no</strong> user paths, emails, or card IDs.
      </blockquote>
      <p>${escapeHtml(meta.dek)}</p>
      <section aria-labelledby="signals-title">
        <h2 id="signals-title">What scouts reported</h2>
        <table style="width:100%;max-width:24rem;border-collapse:collapse;margin:1rem 0;">
          <thead>
            <tr><th style="text-align:left;padding:.5rem 0;border-bottom:1px solid rgba(168,216,255,.2);">Signal</th><th style="text-align:right;padding:.5rem 0;border-bottom:1px solid rgba(168,216,255,.2);">Count</th></tr>
          </thead>
          <tbody>
            <tr><td style="padding:.4rem 0;">Issue identified</td><td style="text-align:right;">${stats.identified}</td></tr>
            <tr><td style="padding:.4rem 0;">Issue resolved</td><td style="text-align:right;">${stats.resolved}</td></tr>
          </tbody>
        </table>
        ${buckets ? `<h3>Attention categories</h3><ul>${buckets}</ul>` : ""}
        ${fixes ? `<h3>Fix categories</h3><ul>${fixes}</ul>` : ""}
      </section>
      <section aria-labelledby="next-title">
        <h2 id="next-title">What to do</h2>
        <ol>
          <li><a href="/alpha">Send the scout</a> · read-only on your Macintosh</li>
          <li>Read your Battle Scout verdict · LIKELY_OK · FIX_LIST · ESCALATE</li>
          <li>Copy for AI if you want a second opinion from ChatGPT or Claude</li>
          <li><a href="/clan">Bring your clan</a> for unlimited household scouts</li>
        </ol>
      </section>`;
}
