import { SITE, LOCALES } from "./blog-i18n-config.mjs";
import { GLOSSARY } from "./blog-i18n-glossary.mjs";
import { extractMainArticleHtml, slugFromCanonical } from "./blog-i18n-extract.mjs";

function escAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function hreflangBlock(slug) {
  const en = `${SITE}/blog/${slug}`;
  const es = `${SITE}/es/blog/${slug}`;
  const pt = `${SITE}/pt/blog/${slug}`;
  return [
    `  <link rel="alternate" hreflang="en" href="${en}">`,
    `  <link rel="alternate" hreflang="es" href="${es}">`,
    `  <link rel="alternate" hreflang="pt" href="${pt}">`,
    `  <link rel="alternate" hreflang="x-default" href="${en}">`,
  ].join("\n");
}

function replaceHeaderStrings(html, g) {
  let out = html;
  out = out.replace(/Skip to content/g, g.skip);
  out = out.replace(/href="\/alpha">Get started/g, `href="/alpha">${g.getStarted}`);
  out = out.replace(/href="\/watch">Trending/g, `href="/watch">${g.trending}`);
  out = out.replace(/href="\/blog">Help/g, `href="/blog">${g.help}`);
  out = out.replace(/href="\/clan">Clan/g, `href="/clan">${g.clan}`);
  out = out.replace(/locale-picker__option--soon" data-locale-code="es"/g, 'data-locale-code="es"');
  out = out.replace(/locale-picker__option--soon" data-locale-code="pt-BR"/g, 'data-locale-code="pt-BR"');
  out = out.replace(/Espa\u00f1ol <span class="locale-picker__badge">soon<\/span>/g, "Espa\u00f1ol");
  out = out.replace(/Portugu\u00eas <span class="locale-picker__badge">soon<\/span>/g, "Portugu\u00eas");
  out = out.replace(/aria-disabled="true"/g, "");
  return out;
}

function prefixBlogHrefs(html, prefix) {
  let out = html;
  out = out.replace(/href="\/blog\//g, `href="${prefix}/blog/`);
  out = out.replace(/href="\/blog"/g, `href="${prefix}/blog"`);
  out = out.replace(new RegExp(`href="${prefix}${prefix}/blog/`, "g"), `href="${prefix}/blog/`);
  return out;
}

function swapUrls(html, slug, localeKey) {
  const cfg = LOCALES[localeKey];
  const enPath = `/blog/${slug}`;
  const locPath = `${cfg.prefix}/blog/${slug}`;
  let out = html;
  out = out.replaceAll(`${SITE}${enPath}`, `${SITE}${locPath}`);
  out = out.replaceAll(`"${enPath}"`, `"${locPath}"`);
  out = out.replace(/<html lang="en">/i, `<html lang="${cfg.htmlLang}">`);
  out = out.replace(/property="og:locale" content="en_US"/i, `property="og:locale" content="${cfg.ogLocale}"`);
  if (out.includes('"inLanguage": "en-US"')) {
    out = out.replace('"inLanguage": "en-US"', `"inLanguage": "${cfg.htmlLang}"`);
  }
  return out;
}

function injectHreflang(html, slug) {
  const block = hreflangBlock(slug);
  if (html.includes('hreflang="es"')) return html;
  if (html.includes('rel="canonical"')) {
    return html.replace(/(<link rel="canonical"[^>]*>)/i, `$1\n${block}`);
  }
  return html.replace(/<head>/i, `<head>\n${block}`);
}

function replaceMainArticle(html, newMainInner, g, slug, localeKey) {
  const cfg = LOCALES[localeKey];
  const notice = `<p class="locale-notice blog-i18n-notice">${g.localeNotice}<a href="${SITE}/blog/${slug}">${g.localeNoticeEnLink}</a>.</p>`;
  const wrapped = `${notice}\n${newMainInner}`;
  const mainRe = /(<main[^>]*>)([\s\S]*?)(<\/main>)/i;
  const navTop = `<p class="legal-nav"><a href="${cfg.prefix}/blog">${g.backToBlog}</a></p>\n      <p class="section-label">${g.fieldGuide}</p>\n`;
  const navBottom = `\n      <p class="legal-nav" style="margin-top:2rem;">\n        <a href="/alpha">${g.sendScout}</a> · <a href="${cfg.prefix}/blog">${g.allPosts}</a>\n      </p>`;
  return html.replace(mainRe, (_, open, _inner, close) => {
    const bodyOnly = wrapped;
    return `${open}\n      ${navTop}${bodyOnly}${navBottom}\n    ${close}`;
  });
}

function clampMetaDescription(text, max = 165) {
  const s = String(text || "").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  const body = sp > 80 ? cut.slice(0, sp) : cut;
  return `${body}…`;
}

function patchTitleMeta(html, title, description) {
  let out = html;
  const fullTitle = `${title} · Innsegall`;
  const desc = clampMetaDescription(description);
  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escAttr(fullTitle)}</title>`);
  out = out.replace(/<meta name="description" content="[^"]*"/i, `<meta name="description" content="${escAttr(desc)}"`);
  out = out.replace(/property="og:title" content="[^"]*"/gi, `property="og:title" content="${escAttr(title)}"`);
  out = out.replace(/property="og:description" content="[^"]*"/gi, `property="og:description" content="${escAttr(desc)}"`);
  out = out.replace(/name="twitter:title" content="[^"]*"/gi, `name="twitter:title" content="${escAttr(title)}"`);
  out = out.replace(/name="twitter:description" content="[^"]*"/gi, `name="twitter:description" content="${escAttr(desc)}"`);
  const headlineRe = /"headline":\s*"[^"]*"/;
  if (headlineRe.test(out)) out = out.replace(headlineRe, `"headline": ${JSON.stringify(title)}`);
  const descRe = /"description":\s*"[^"]*"/;
  if (descRe.test(out)) out = out.replace(descRe, `"description": ${JSON.stringify(desc)}`);
  return out;
}

/**
 * @param {string} enHtml full EN article page
 * @param {"es"|"pt-BR"} localeKey
 * @param {{ title?: string, description?: string, mainHtml?: string }} fixture
 */
export function localizeBlogPostHtml(enHtml, localeKey, fixture) {
  const cfg = LOCALES[localeKey];
  const g = GLOSSARY[localeKey];
  const slug = slugFromCanonical(enHtml) || "";
  let html = enHtml;
  html = swapUrls(html, slug, localeKey);
  html = prefixBlogHrefs(html, cfg.prefix);
  html = injectHreflang(html, slug);
  if (fixture.title || fixture.description) {
    html = patchTitleMeta(html, fixture.title || "", fixture.description || "");
  }
  const mainHtml = fixture.mainHtml || extractMainArticleHtml(enHtml);
  html = replaceMainArticle(html, mainHtml, g, slug, localeKey);
  html = replaceHeaderStrings(html, g);
  html = html.replace(/Send the scout/g, g.sendScout);
  html = html.replace(/We send the scout/g, g.ctaStripLabel);
  html = html.replace(/Know you&apos;re okay · Macintosh triage/g, g.footerTagline);
  return html;
}

/** Add hreflang alternates on EN post when locales ship. */
export function addEnHreflang(html, slug) {
  return injectHreflang(html, slug);
}
