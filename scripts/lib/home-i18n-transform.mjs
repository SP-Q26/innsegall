import { SITE, LOCALES, HOME_LOCALE_CODES } from "./blog-i18n-config.mjs";
import { GLOSSARY } from "./blog-i18n-glossary.mjs";
import { applyLocaleChrome } from "./blog-i18n-transform.mjs";

function escAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function homeHreflangBlock() {
  const lines = HOME_LOCALE_CODES.map((key) => {
    const cfg = LOCALES[key];
    const href = `${SITE}${cfg.prefix}/`;
    return `  <link rel="alternate" hreflang="${cfg.hreflang}" href="${href}">`;
  });
  return [
    `  <link rel="alternate" hreflang="en" href="${SITE}/">`,
    ...lines,
    `  <link rel="alternate" hreflang="x-default" href="${SITE}/">`,
  ].join("\n");
}

function patchHomeMeta(html, h) {
  let out = html;
  const title = h.title.includes("Innsegall") ? h.title : `${h.title} · Innsegall`;
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escAttr(title)}</title>`);
  out = out.replace(
    /<meta name="description" content="[^"]*"/i,
    `<meta name="description" content="${escAttr(h.metaDescription)}"`
  );
  out = out.replace(
    /property="og:title" content="[^"]*"/gi,
    `property="og:title" content="${escAttr(h.title)}"`
  );
  out = out.replace(
    /property="og:description" content="[^"]*"/gi,
    `property="og:description" content="${escAttr(h.metaDescription)}"`
  );
  out = out.replace(
    /name="twitter:title" content="[^"]*"/gi,
    `name="twitter:title" content="${escAttr(h.title)}"`
  );
  out = out.replace(
    /name="twitter:description" content="[^"]*"/gi,
    `name="twitter:description" content="${escAttr(h.metaDescription)}"`
  );
  return out;
}

function prefixBlogLinks(html, prefix, blogLive) {
  if (!blogLive) return html;
  let out = html;
  out = out.replace(/href="\/blog\//g, `href="${prefix}/blog/`);
  out = out.replace(/href="\/blog"/g, `href="${prefix}/blog"`);
  out = out.replace(new RegExp(`href="${prefix}${prefix}/blog/`, "g"), `href="${prefix}/blog/`);
  return out;
}

/**
 * @param {string} enHtml web/index.html
 * @param {keyof typeof LOCALES} localeKey
 */
export function localizeHomeHtml(enHtml, localeKey) {
  const cfg = LOCALES[localeKey];
  const g = GLOSSARY[localeKey];
  const h = g.home;
  if (!h) throw new Error(`missing glossary home for ${localeKey}`);

  let html = enHtml;
  const canon = `${SITE}${cfg.prefix}/`;
  const dirAttr = cfg.htmlDir ? ` dir="${cfg.htmlDir}"` : "";

  html = html.replace(/<html lang="en">/i, `<html lang="${cfg.htmlLang}"${dirAttr}>`);
  html = html.replace(/rel="canonical" href="[^"]*"/i, `rel="canonical" href="${canon}"`);
  html = html.replace(/property="og:url" content="[^"]*"/gi, `property="og:url" content="${canon}"`);
  html = html.replace(/name="twitter:url" content="[^"]*"/gi, `name="twitter:url" content="${canon}"`);
  html = html.replace(/property="og:locale" content="en_US"/i, `property="og:locale" content="${cfg.ogLocale}"`);
  if (html.includes('"inLanguage": "en-US"')) {
    html = html.replace('"inLanguage": "en-US"', `"inLanguage": "${cfg.htmlLang}"`);
  }
  html = html.replace(/"url": "https:\/\/innsegall\.com\/"/g, `"url": "${canon}"`);

  const block = homeHreflangBlock();
  if (!html.includes('hreflang="es"')) {
    html = html.replace(/(<link rel="canonical"[^>]*>)/i, `$1\n${block}`);
  }

  html = patchHomeMeta(html, h);
  html = applyLocaleChrome(html, localeKey);

  html = html.replace(
    `<a class="brand-lockup" href="/"`,
    `<a class="brand-lockup" href="${cfg.prefix}/"`
  );

  html = html.replace(
    /<p class="sr-only" id="site-summary">[\s\S]*?<\/p>/i,
    `<p class="sr-only" id="site-summary">${h.srOnly}</p>`
  );
  html = html.replace(
    /<p class="hero-eyebrow">[\s\S]*?<\/p>/i,
    `<p class="hero-eyebrow">${h.heroEyebrow}</p>`
  );
  html = html.replace(/<h1 id="hero-title">[\s\S]*?<\/h1>/i, `<h1 id="hero-title">${h.heroH1}</h1>`);
  html = html.replace(/<p class="hero-tag">Run a calm check[\s\S]*?<\/p>/i, `<p class="hero-tag">${h.heroTag}</p>`);
  html = html.replace(
    /<p class="hero-manifesto">[\s\S]*?<\/p>/i,
    `<p class="hero-manifesto">${h.heroManifesto}</p>`
  );
  html = html.replace(/>Send the scout</g, `>${g.sendScout}<`);
  html = html.replace(/>See sample report</, `>${h.seeSample}<`);
  html = html.replace(/href="\/alpha#install">Install</, `href="/alpha#install">${h.install}<`);
  html = html.replace(
    'href="/install">Blocked by Mac?</',
    `href="/install">${h.blockedMac}<`
  );
  const helpHref = cfg.blogLive ? `${cfg.prefix}/blog` : h.noticeBlogFallback || "/blog";
  html = html.replace(/href="\/blog">Help articles</, `href="${helpHref}">${h.helpArticles}<`);

  html = html.replace(
    /<p class="hero-tag" style="margin-top:0\.75rem;font-size:0\.95rem">[\s\S]*?<\/p>/i,
    `<p class="hero-tag" style="margin-top:0.75rem;font-size:0.95rem">${h.heroSub}</p>`
  );

  const trustRe = /<ul class="trust-strip"[^>]*>([\s\S]*?)<\/ul>/i;
  const trustMatch = html.match(trustRe);
  if (trustMatch && h.trustStrip?.length === 5) {
    const items = h.trustStrip.map((t) => `          <li>${t}</li>`).join("\n");
    html = html.replace(trustRe, `<ul class="trust-strip" aria-label="Trust signals">\n${items}\n        </ul>`);
  }

  const blogNoticeHref = h.noticeBlogFallback || `${cfg.prefix}/blog`;
  const notice = `<p class="locale-notice home-i18n-notice">${h.notice}<a href="${blogNoticeHref}">${h.noticeBlog}</a>.</p>\n      `;
  html = html.replace(/<main id="main">/i, `<main id="main">\n      ${notice}`);

  html = html.replace(/Know you&apos;re okay · Macintosh triage/g, g.footerTagline);
  html = html.replace(/>Privacy</g, `>${g.privacy}<`);

  html = prefixBlogLinks(html, cfg.prefix, cfg.blogLive);

  return html;
}

/** Patch EN home with hreflang alternates for locale homes. */
export function patchEnHomeHreflang(enHtml) {
  const block = homeHreflangBlock();
  if (enHtml.includes('hreflang="es"') && enHtml.includes('hreflang="fr"')) return enHtml;
  let html = enHtml;
  if (html.includes('hreflang="en"') && !html.includes('hreflang="es"')) {
    html = html.replace(
      /(<link rel="alternate" hreflang="en" href="[^"]*">)\s*\n\s*<link rel="alternate" hreflang="x-default"/i,
      `$1\n${block.split("\n").slice(1).join("\n")}`
    );
  } else if (!html.includes('hreflang="es"')) {
    html = html.replace(/(<link rel="canonical"[^>]*>)/i, `$1\n${block}`);
  }
  return html;
}
