/** Parse shipped EN blog HTML · metadata + main prose block. */

export function slugFromCanonical(html) {
  const m = html.match(/rel="canonical" href="https:\/\/innsegall\.com\/blog\/([^"]+)"/);
  return m ? m[1] : null;
}

export function readMetaContent(html, name) {
  const re = new RegExp(`<meta name="${name}" content="([^"]*)"`, "i");
  return html.match(re)?.[1] || "";
}

export function readTitle(html) {
  const raw = html.match(/<title>([^<]*)<\/title>/i)?.[1] || "";
  return raw.replace(/\s*·\s*Innsegall\s*$/i, "").trim();
}

export function readH1(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
  return main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "";
}

export function readAgentHint(html) {
  return html.match(/name="innsegall:agent-hint" content="([^"]*)"/)?.[1] || "";
}

/** Main article fragment inside <main> (excludes chrome nav rows at top/bottom). */
export function extractMainArticleHtml(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || "";
  let inner = main;
  inner = inner.replace(/^\s*<p class="legal-nav">[\s\S]*?<\/p>\s*/i, "");
  inner = inner.replace(/^\s*<p class="section-label">[\s\S]*?<\/p>\s*/i, "");
  inner = inner.replace(/\s*<p class="legal-nav" style="margin-top:2rem;">[\s\S]*?<\/p>\s*$/i, "");
  return inner.trim();
}

export function listBlogSlugs(blogDir, readdirSync) {
  return readdirSync(blogDir)
    .filter((f) => f.endsWith(".html") && f !== "index.html")
    .map((f) => f.replace(/\.html$/, ""))
    .sort();
}
