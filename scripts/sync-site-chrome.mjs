#!/usr/bin/env node
/**
 * Unify site header, OG image, CSS cache-bust · run before deploy.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const OG_URL = "https://innsegall.com/og/innsegall-card.png";
const CSS_VER = 16;

const CANONICAL_HEADER = `<header class="site-header">
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
    </header>`;

const OG_BLOCK = `  <meta property="og:image" content="${OG_URL}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="Innsegall · Know you're okay · Macintosh triage">
  <meta name="twitter:image" content="${OG_URL}">`;

const NAV_SCRIPT = `  <script src="/innsegall-nav.js?v=${CSS_VER}" defer></script>`;

const FAVICON_BLOCK = `  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/favicon.svg">
  <link rel="manifest" href="/site.webmanifest">`;

const CANONICAL_FOOTER = `    <footer class="site-footer">
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
        <a href="/stability">Stability</a>
        <a href="https://github.com/SP-Q26/innsegall" rel="noopener noreferrer">Open engine</a>
        <a href="/tos">Terms</a>
        <a href="/privacy">Privacy</a>
        <a href="mailto:hello@innsegall.com">hello@innsegall.com</a>
      </nav>
    </footer>`;

const SITE = "https://innsegall.com";
const OG_ALT = "Innsegall · Know you're okay · Macintosh triage";
const TWITTER_SITE = "@innsegall";

function escAttr(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function readMeta(html, key) {
  const re = new RegExp(
    `<meta (?:property|name)="${key}" content="([^"]*)"`,
    "i"
  );
  return html.match(re)?.[1] || "";
}

function hasMeta(html, key) {
  return new RegExp(`(?:property|name)="${key}"`, "i").test(html);
}

function insertAfter(html, anchorRe, block) {
  if (!anchorRe.test(html)) return html + block;
  return html.replace(anchorRe, (m) => `${m}\n${block}`);
}

function ensureMeta(html, key, value, useProperty = key.startsWith("og:") || key.startsWith("article:")) {
  if (!value || hasMeta(html, key)) return html;
  const attr = useProperty ? "property" : "name";
  const tag = `  <meta ${attr}="${key}" content="${escAttr(value)}">`;
  if (hasMeta(html, "og:title")) {
    return insertAfter(html, /<meta property="og:title"[^>]*>/, tag);
  }
  if (html.includes('rel="canonical"')) {
    return insertAfter(html, /<link rel="canonical"[^>]*>/, tag);
  }
  return insertAfter(html, /<meta name="description"[^>]*>/, tag);
}

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

function fixSocialPreview(html, filePath) {
  if (html.includes('name="robots" content="noindex"')) return fixOg(html);

  let out = fixOg(html);
  const rel = filePath.replace(/\\/g, "/");
  const isArticle = rel.includes("/blog/") && !rel.endsWith("blog/index.html");
  const pageTitle = out.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || "Innsegall";
  const description = readMeta(out, "description");
  const canonical = out.match(/rel="canonical" href="([^"]*)"/)?.[1] || "";
  const ogTitle = readMeta(out, "og:title") || pageTitle;
  const ogDescription = readMeta(out, "og:description") || description;
  const ogUrl = readMeta(out, "og:url") || canonical;

  out = ensureMeta(out, "og:type", isArticle ? "article" : "website");
  out = ensureMeta(out, "og:site_name", "Innsegall");
  out = ensureMeta(out, "og:locale", "en_US");
  out = ensureMeta(out, "og:title", ogTitle);
  out = ensureMeta(out, "og:description", ogDescription);
  if (ogUrl) out = ensureMeta(out, "og:url", ogUrl);

  out = ensureMeta(out, "twitter:card", "summary_large_image", false);
  out = ensureMeta(out, "twitter:site", TWITTER_SITE, false);
  out = ensureMeta(out, "twitter:title", ogTitle, false);
  out = ensureMeta(out, "twitter:description", ogDescription, false);
  out = ensureMeta(out, "twitter:image:alt", OG_ALT, false);

  if (isArticle) {
    const published =
      out.match(/"datePublished":\s*"([^"]+)"/)?.[1] ||
      readMeta(out, "article:published_time");
    if (published) {
      out = ensureMeta(out, "article:published_time", published);
    }
  }

  return out;
}

function replaceHeader(html) {
  if (!html.includes('class="site-header"')) return html;
  return html.replace(/<header class="site-header">[\s\S]*?<\/header>/, CANONICAL_HEADER);
}

function fixOg(html) {
  let out = html;
  out = out.replace(/<!-- og:image:[\s\S]*?-->\s*/g, "");
  out = out.replace(
    /<meta property="og:image" content="data:image[^"]*"\s*\/?>/g,
    ""
  );
  out = out.replace(/<meta property="og:image:alt"[^>]*\/?>\s*/g, "");
  out = out.replace(/<meta property="og:image:width"[^>]*\/?>\s*/g, "");
  out = out.replace(/<meta property="og:image:height"[^>]*\/?>\s*/g, "");
  out = out.replace(/<meta property="og:image:type"[^>]*\/?>\s*/g, "");
  out = out.replace(/<meta name="twitter:image"[^>]*\/?>\s*/g, "");

  if (!out.includes(OG_URL)) {
    if (out.includes('property="og:url"')) {
      out = out.replace(
        /(<meta property="og:url"[^>]*\/?>)/,
        `$1\n${OG_BLOCK}`
      );
    } else if (out.includes('property="og:title"')) {
      out = out.replace(
        /(<meta property="og:title"[^>]*\/?>)/,
        `$1\n${OG_BLOCK}`
      );
    } else if (out.includes("<title>")) {
      out = out.replace(/(<title>[^<]*<\/title>)/, `$1\n${OG_BLOCK}`);
    }
  } else if (!out.includes("og:image:width")) {
    out = out.replace(
      /(<meta property="og:image" content="[^"]*"\s*\/?>)/,
      `$1\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:image:type" content="image/png">\n  <meta property="og:image:alt" content="Innsegall · Know you're okay · Macintosh triage">`
    );
    if (!out.includes("twitter:image")) {
      out = out.replace(
        /(<meta property="og:image:alt"[^>]*\/?>)/,
        `$1\n  <meta name="twitter:image" content="${OG_URL}">`
      );
    }
  }

  if (out.includes('name="twitter:card" content="summary"')) {
    out = out.replace(
      'name="twitter:card" content="summary"',
      'name="twitter:card" content="summary_large_image"'
    );
  } else if (!out.includes('name="twitter:card"') && out.includes(OG_URL)) {
    out = out.replace(
      OG_BLOCK,
      `${OG_BLOCK}\n  <meta name="twitter:card" content="summary_large_image">`
    );
  }

  if (!out.includes("og:site_name") && out.includes("<head>")) {
    out = out.replace(
      "<head>",
      `<head>\n  <meta property="og:site_name" content="Innsegall">\n  <meta property="og:locale" content="en_US">`
    );
  }

  if (out.includes(OG_URL) && !out.includes('name="twitter:image"')) {
    if (out.includes('name="twitter:image:alt"')) {
      out = out.replace(
        /(<meta name="twitter:image:alt"[^>]*\/?>)/,
        `<meta name="twitter:image" content="${OG_URL}">\n  $1`
      );
    } else if (out.includes('name="twitter:card"')) {
      out = out.replace(
        /(<meta name="twitter:card"[^>]*\/?>)/,
        `$1\n  <meta name="twitter:image" content="${OG_URL}">`
      );
    }
  }

  return out;
}

function replaceFooter(html) {
  if (!html.includes('class="site-footer"')) return html;
  if (
    html.includes('href="/warriors"') &&
    html.includes("footer-note") &&
    html.includes('href="/guide"') &&
    html.includes('href="/stability"') &&
    html.includes("github.com/SP-Q26/innsegall")
  ) {
    return html;
  }
  return html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, CANONICAL_FOOTER);
}

function fixFavicon(html) {
  let out = html;
  out = out.replace(/<link rel="icon"[^>]*>\s*/g, "");
  out = out.replace(/<link rel="apple-touch-icon"[^>]*>\s*/g, "");
  out = out.replace(/<link rel="manifest"[^>]*>\s*/g, "");
  if (!out.includes("/favicon.svg")) {
    if (out.includes('rel="stylesheet"')) {
      out = out.replace(/(<link rel="stylesheet"[^>]*>)/, `${FAVICON_BLOCK}\n  $1`);
    } else if (out.includes("</head>")) {
      out = out.replace("</head>", `${FAVICON_BLOCK}\n</head>`);
    }
  }
  return out;
}

function fixSuccessPage(html) {
  let out = html;
  out = replaceHeader(out);
  out = fixOg(out);
  out = fixChrome(out);
  out = replaceFooter(out);
  if (!out.includes("innsegall-nav.js") && out.includes("</body>")) {
    out = out.replace("</body>", `${NAV_SCRIPT}\n</body>`);
  }
  return out;
}

function fixChrome(html) {
  let out = html;
  out = out.replace(/innsegall\.css\?v=\d+/g, `innsegall.css?v=${CSS_VER}`);
  out = out.replace(/innsegall-nav\.js\?v=\d+/g, `innsegall-nav.js?v=${CSS_VER}`);

  if (out.includes('class="site-header"') && !out.includes('class="skip-link"')) {
    out = out.replace(
      /<body([^>]*)>/,
      `<body$1>\n  <a class="skip-link" href="#main">Skip to content</a>`
    );
  }
  if (out.includes('class="site-header"') && !out.includes('class="beam-bg"')) {
    out = out.replace(
      /<a class="skip-link"[^>]*>Skip to content<\/a>/,
      `<a class="skip-link" href="#main">Skip to content</a>\n  <div class="beam-bg" aria-hidden="true"></div>`
    );
  }

  if (!out.includes("innsegall-nav.js") && out.includes("</body>")) {
    out = out.replace("</body>", `${NAV_SCRIPT}\n</body>`);
  }

  return out;
}

let changed = 0;
for (const file of walkHtml(web)) {
  const before = readFileSync(file, "utf8");
  let html = before;
  if (file.endsWith("success.html")) {
    html = fixSuccessPage(html);
  } else if (file.includes("/samples/")) {
    continue;
  } else {
    html = replaceHeader(html);
    html = fixSocialPreview(html, file);
    html = fixFavicon(html);
    html = fixChrome(html);
    html = replaceFooter(html);
  }
  if (html !== before) {
    writeFileSync(file, html, "utf8");
    changed++;
    console.log("synced:", file.replace(root + "/", ""));
  }
}

console.log(`site-chrome sync done · ${changed} files · CSS v${CSS_VER} · OG ${OG_URL}`);
