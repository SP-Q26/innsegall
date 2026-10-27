/** Shared route resolution for innsegall marketing HTML link audits. */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

export const SITE_ORIGIN = "https://innsegall.com";

export const PAGE_ROUTES = new Set([
  "/",
  "/alpha",
  "/guide",
  "/stability",
  "/install",
  "/install/ios",
  "/install/tablet",
  "/ios",
  "/companion",
  "/supplies",
  "/tablet",
  "/map",
  "/watch",
  "/boat",
  "/clan",
  "/msp",
  "/warriors",
  "/blog",
  "/es",
  "/pt",
  "/fr",
  "/ar",
  "/es/blog",
  "/pt/blog",
  "/privacy",
  "/tos",
  "/success",
  "/llms.txt",
  "/ai.txt",
  "/innsegall-ai-bus.json",
  "/samples/battle-scout-demo",
]);

/** Neutral demo home segment in file:// quick-open links (see export-sample-scout.mjs). */
export const DEMO_FILE_HOME_USERS = new Set(["You"]);

export function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

export function pathOnly(href) {
  const bare = href.split("#")[0].split("?")[0];
  return bare.replace(/\/$/, "") || "/";
}

export function isStaticAsset(path) {
  if (!path || path === "/") return false;
  if (path.startsWith("/og/")) return true;
  if (path.startsWith("/scripts/")) return true;
  if (path.startsWith("/.well-known/")) return true;
  if (path.startsWith("/api/")) return true;
  if (path.startsWith("/stripe/")) return true;
  if (/\.(css|svg|png|jpg|jpeg|gif|webmanifest|js|json|txt|xml|ico|woff2?|map|sh|command|mjs)$/i.test(path)) {
    return true;
  }
  return false;
}

export function resolvePageFile(webRoot, path) {
  if (path === "/") return join(webRoot, "index.html");
  const localeHome = path.match(/^\/(es|pt|fr|ar)$/);
  if (localeHome) return join(webRoot, localeHome[1], "index.html");
  const localeBlog = path.match(/^\/(es|pt)\/blog(?:\/(.+))?$/);
  if (localeBlog) {
    if (!localeBlog[2]) return join(webRoot, localeBlog[1], "blog", "index.html");
    return join(webRoot, localeBlog[1], "blog", `${localeBlog[2]}.html`);
  }
  if (path === "/blog") return join(webRoot, "blog", "index.html");
  if (path.startsWith("/blog/")) return join(webRoot, path.slice(1) + ".html");
  if (path === "/install/ios") return join(webRoot, "install-ios.html");
  if (path === "/install/tablet") return join(webRoot, "install-tablet.html");
  return join(webRoot, path.replace(/^\//, "") + ".html");
}

export function routeExists(webRoot, path) {
  if (PAGE_ROUTES.has(path)) return true;
  if (path.startsWith("/blog/") || path === "/blog" || /^\/(es|pt)\/blog/.test(path)) {
    return existsSync(resolvePageFile(webRoot, path));
  }
  if (path.startsWith("/samples/")) {
    const samplePath = join(webRoot, path.slice(1));
    if (existsSync(samplePath)) return true;
    return existsSync(`${samplePath}.html`);
  }
  const filePath = resolvePageFile(webRoot, path);
  if (existsSync(filePath)) return true;
  if (["/llms.txt", "/ai.txt", "/innsegall-ai-bus.json"].includes(path)) {
    return existsSync(join(webRoot, path.replace(/^\//, "")));
  }
  return false;
}

export function fileHrefLooksLikePii(href) {
  if (!href.startsWith("file://")) return false;
  const m = href.match(/^file:\/\/\/Users\/([^/]+)\//);
  if (!m) return false;
  return !DEMO_FILE_HOME_USERS.has(m[1]);
}

export function auditSitemap(webRoot, onFail) {
  const sitemap = readFileSync(join(webRoot, "sitemap.xml"), "utf8");
  for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    let path = m[1].replace(SITE_ORIGIN, "") || "/";
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    if (isStaticAsset(path)) continue;
    if (!routeExists(webRoot, path)) onFail({ rel: "sitemap.xml", raw: m[1], why: "sitemap-missing", path });
  }
}

export function auditVercelRewrites(webRoot, onFail) {
  const vercelPath = join(webRoot, "vercel.json");
  if (!existsSync(vercelPath)) return;
  const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
  for (const r of vercel.rewrites || []) {
    const dest = r.destination;
    if (!dest?.startsWith("/")) continue;
    const p = pathOnly(dest);
    if (isStaticAsset(p)) continue;
    const fp = join(webRoot, p.replace(/^\//, ""));
    if (!existsSync(fp) && !routeExists(webRoot, p)) {
      onFail({ rel: "vercel.json", raw: dest, why: "rewrite-dest-missing", path: p });
    }
  }
}
