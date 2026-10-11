/** Google Fonts · one URL sitewide · fewer weights · display=swap */
export const FONT_STYLESHEET_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;600&display=swap";

/** HTML lines injected after innsegall.css (sync-site-chrome · render-blog-post). */
export function fontHeadLines() {
  return [
    `  <link rel="preconnect" href="https://fonts.googleapis.com">`,
    `  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
    `  <link rel="stylesheet" href="${FONT_STYLESHEET_HREF}">`,
  ].join("\n");
}

export const FONT_LINK_RE =
  /<link[^>]*fonts\.googleapis\.com[^>]*>\s*|<link[^>]*fonts\.gstatic\.com[^>]*>\s*/gi;
