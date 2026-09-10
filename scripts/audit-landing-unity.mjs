#!/usr/bin/env node
/**
 * Landing unity · every marketing page explains lane + CTA for humans and AI crawlers.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { INNSEGALL_GOSPEL } from "../src/gospel.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

const KEY_PAGES = [
  "index.html",
  "alpha.html",
  "guide.html",
  "boat.html",
  "clan.html",
  "warriors.html",
  "map.html",
  "stability.html",
  "blog/index.html",
];

const BLOG_SEO_SLUGS = [
  "fake-virus-popup-macintosh",
  "clicked-suspicious-link-macintosh",
  "after-suspicious-link-macintosh",
  "what-is-a-battle-scout",
];

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 landing: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

function walkBlog(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isFile() && name.endsWith(".html") && name !== "index.html") {
      out.push(name.replace(/\.html$/, ""));
    }
  }
  return out;
}

check("gospel landing object", Boolean(INNSEGALL_GOSPEL.landing?.summary_human));
check("gospel unity markers", (INNSEGALL_GOSPEL.landing?.unity_markers?.length || 0) >= 4);

for (const rel of KEY_PAGES) {
  const path = join(web, rel);
  if (!existsSync(path)) {
    check(`${rel} exists`, false);
    continue;
  }
  const html = readFileSync(path, "utf8");
  const label = rel.replace(".html", "");
  check(`${label} meta description`, /<meta name="description"/i.test(html));
  check(
    `${label} ai-bus embed`,
    html.includes('id="innsegall-ai-bus"') || html.includes("innsegall-ai-bus")
  );
  check(`${label} llms alternate`, html.includes("/llms.txt"));
  check(
    `${label} lane clarity`,
    /post-scare/i.test(html) || /between popups/i.test(html) || /not antivirus/i.test(html)
  );
  check(
    `${label} primary CTA`,
    html.includes("Send the scout") || html.includes("Bring the scout")
  );
}

const index = readFileSync(join(web, "index.html"), "utf8");
check("index sr-only site summary", index.includes('id="site-summary"'));
check("index triage levels named", /LIKELY_OK|FIX_LIST|ESCALATE/.test(index));
check("index links /alpha", index.includes('href="/alpha"'));
check("index links /blog", index.includes('href="/blog"'));
check(
  "index blog SEO hub",
  BLOG_SEO_SLUGS.every((slug) => index.includes(`/blog/${slug}`))
);

const sitemap = readFileSync(join(web, "sitemap.xml"), "utf8");
for (const slug of BLOG_SEO_SLUGS) {
  check(`sitemap blog/${slug}`, sitemap.includes(`/blog/${slug}`));
}
check("sitemap llms.txt", sitemap.includes("/llms.txt"));
check(
  "sitemap battle-scout schema",
  sitemap.includes("battle-scout-ai-v1.schema.json")
);

const blogSlugs = walkBlog(join(web, "blog"));
for (const slug of blogSlugs) {
  check(`sitemap includes blog/${slug}`, sitemap.includes(`/blog/${slug}`));
}

for (const slug of BLOG_SEO_SLUGS) {
  const blogPath = join(web, "blog", `${slug}.html`);
  if (!existsSync(blogPath)) {
    check(`blog file ${slug}`, false);
    continue;
  }
  const html = readFileSync(blogPath, "utf8");
  check(`${slug} canonical`, html.includes('rel="canonical"'));
  check(`${slug} links alpha`, html.includes("/alpha"));
}

if (failed) {
  console.error(`\n${failed} landing-unity failure(s)`);
  process.exit(1);
}
console.log("\nLanding unity audit passed · humans + agents + SEO routes");
