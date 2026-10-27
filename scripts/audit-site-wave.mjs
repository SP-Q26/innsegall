#!/usr/bin/env node
/**
 * Wave audit · stricter SEO/meta/blog + spacing tokens · unyielding gate.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CSS_HREF } from "./site-css-ver.mjs";
import { OG_URL } from "./site-og-ver.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL wave: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

function walkHtml(dir, base = "") {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkHtml(p, `${base}${name}/`));
    else if (name.endsWith(".html")) out.push(`${base}${name}`);
  }
  return out;
}

const css = readFileSync(join(web, "innsegall.css"), "utf8");
check("css cache token", css.includes(`/* Innsegall · brand tokens · v14`));
check("breakpoint tablet token", /--bp-tablet:\s*48rem/.test(css));
check("narrow mobile block", /@media \(max-width: 32\.5rem\)/.test(css));
check("companion safe-area padding", /\.companion-main[\s\S]*safe-area-inset/.test(css));
check("avenue grid mobile stack", /@media \(max-width: 32\.5rem\)[\s\S]*\.avenue-grid/.test(css));
check("blog article narrow spacing", /@media \(max-width: 32\.5rem\)[\s\S]*\.article-body/.test(css));
check("companion grid tablet", /@media \(min-width: 48rem\)[\s\S]*\.companion-grid/.test(css));

const marketingStrict = [
  "index.html",
  "ios.html",
  "tablet.html",
  "companion.html",
  "install/ios.html",
  "install/tablet.html",
  "blog/index.html",
];
for (const rel of marketingStrict) {
  const path = join(web, rel);
  if (!existsSync(path)) {
    check(`${rel} exists`, false);
    continue;
  }
  const html = readFileSync(path, "utf8");
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "";
  check(`${rel} meta 115-165`, desc.length >= 115 && desc.length <= 165, `${desc.length}ch`);
  check(`${rel} hosted og:image`, html.includes(OG_URL));
  check(`${rel} og:url`, /property="og:url"/.test(html));
  check(`${rel} twitter:card`, html.includes("summary_large_image"));
  check(`${rel} css ${CSS_HREF}`, html.includes(CSS_HREF));
  const canon = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const ogUrl = html.match(/property="og:url" content="([^"]+)"/)?.[1];
  if (canon && ogUrl) check(`${rel} canon=og:url`, canon === ogUrl);
}

let blogCount = 0;
let blogOgDesc = 0;
for (const file of readdirSync(join(web, "blog"))) {
  if (!file.endsWith(".html") || file === "index.html") continue;
  blogCount++;
  const html = readFileSync(join(web, "blog", file), "utf8");
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "";
  const ogDesc = html.match(/property="og:description" content="([^"]*)"/)?.[1] || "";
  const twDesc = html.match(/name="twitter:description" content="([^"]*)"/)?.[1] || "";
  check(`blog/${file} meta 120-160`, desc.length >= 120 && desc.length <= 160, `${desc.length}ch`);
  if (ogDesc && ogDesc === desc) blogOgDesc++;
  check(`blog/${file} twitter:description`, twDesc.length > 20);
  check(`blog/${file} BlogPosting`, html.includes('"@type": "BlogPosting"') || html.includes('"@type":"BlogPosting"'));
  check(`blog/${file} field desk`, html.includes("data-field-desk-version="));
  check(`blog/${file} related rail`, html.includes("data-related-version="));
}
check("blog og:description matches meta (all)", blogOgDesc === blogCount, `${blogOgDesc}/${blogCount}`);

const companion = readFileSync(join(web, "companion.html"), "utf8");
check("companion device guide", companion.includes("companion-device-guide"));
check("companion light signals", companion.includes("companion-light-signals"));
check("companion install ios link", companion.includes('href="/install/ios"'));

const index = readFileSync(join(web, "index.html"), "utf8");
check("home start-here first", index.indexOf('id="start-here"') < index.indexOf('class="hero"'));
check("home panic sentence case", index.includes("Panic is optional") && !index.includes("PANIC IS OPTIONAL"));

check("nested install ios", existsSync(join(web, "install", "ios.html")));
check("nested install tablet", existsSync(join(web, "install", "tablet.html")));

const sitemap = readFileSync(join(web, "sitemap.xml"), "utf8");
check("sitemap install/ios", sitemap.includes("/install/ios"));
check("sitemap install/tablet", sitemap.includes("/install/tablet"));
check("sitemap companion", sitemap.includes("/companion"));

console.log(failed ? `\n${failed} wave audit failure(s)` : `\nWave audit passed · ${blogCount} blog posts · CSS ${CSS_HREF}`);
process.exit(failed ? 1 : 0);
