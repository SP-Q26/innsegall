#!/usr/bin/env node
/** P0 · Macintosh watch hub fixture ↔ web surfaces. */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const blogDir = join(web, "blog");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 watch: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const hub = JSON.parse(readFileSync(join(root, "fixtures", "watch-hub.json"), "utf8"));
const latest = hub.latest_field_glass;
const vercel = readFileSync(join(web, "vercel.json"), "utf8");
const sitemap = readFileSync(join(web, "sitemap.xml"), "utf8");
const watch = existsSync(join(web, "watch.html"))
  ? readFileSync(join(web, "watch.html"), "utf8")
  : "";

check("watch-hub fixture version", Boolean(hub.version));
check("watch.html exists", existsSync(join(web, "watch.html")));
check("watch body markers", watch.includes("INNSEGALL_WATCH_BODY_START"));
check("watch links latest Field Glass", watch.includes(`/blog/${latest.slug}`));
const map = existsSync(join(web, "map.html")) ? readFileSync(join(web, "map.html"), "utf8") : "";
check("map tree links /watch", map.includes('href="/watch">/watch</a>'));
check("watch-feed.xml", existsSync(join(web, "watch-feed.xml")));
check("vercel /watch rewrite", vercel.includes('"/watch"'));
check("sitemap /watch", sitemap.includes("innsegall.com/watch"));
check(`blog html ${latest.slug}`, existsSync(join(blogDir, `${latest.slug}.html`)));
check("vercel latest field glass rewrite", vercel.includes(`"/blog/${latest.slug}"`));

for (const g of [...hub.trending_guides, ...hub.scout_trends]) {
  const path = g.href.split("#")[0];
  if (!path.startsWith("/blog/")) continue;
  const slug = path.replace("/blog/", "");
  check(`guide target ${slug}`, existsSync(join(blogDir, `${slug}.html`)));
}

const blogSlugs = new Set(
  readdirSync(blogDir)
    .filter((n) => n.endsWith(".html") && n !== "index.html")
    .map((n) => n.replace(/\.html$/, ""))
);
for (const g of hub.field_glass_archive) {
  check(`archive ${g.slug}`, blogSlugs.has(g.slug));
}

if (failed) process.exit(1);
console.log("audit-watch-hub PASS");
