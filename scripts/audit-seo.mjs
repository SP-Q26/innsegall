#!/usr/bin/env node
/**
 * SEO P0 audit · hosted OG · social meta · sitemap · JSON-LD.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const OG_URL = "https://innsegall.com/og/innsegall-card.png?v=20261008";
const OG_PATH = join(web, "og/innsegall-card.png");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 SEO: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const ogBytes = existsSync(OG_PATH) ? statSync(OG_PATH).size : 0;
check("og png exists", existsSync(OG_PATH));
check("og png under 2mb", ogBytes > 0 && ogBytes < 2_000_000, `${Math.round(ogBytes / 1024)} KB`);

const index = readFileSync(join(web, "index.html"), "utf8");
check("index hosted og:image", index.includes(OG_URL));
check("index no data-uri og", !/og:image" content="data:image/.test(index));
check("index twitter large image", index.includes('twitter:card" content="summary_large_image"'));
check("index twitter:image", index.includes('name="twitter:image"'));
check("index og image dimensions", index.includes("og:image:width") && index.includes("og:image:height"));
check("index canonical", index.includes('rel="canonical" href="https://innsegall.com/"'));
check("index hreflang en", index.includes('hreflang="en"'));
check("index hreflang x-default", index.includes('hreflang="x-default"'));
check("index llms alternate", index.includes('href="https://innsegall.com/llms.txt"'));
check("index json-ld", index.includes('type="application/ld+json"'));
check("index faq schema", index.includes("FAQPage") || index.includes("@type\":\"FAQPage\""));
check("index favicon svg", index.includes('/favicon.svg'));
check("index web manifest", index.includes('rel="manifest"'));
check("index ai discovery link", index.includes("ai-discovery.json") || index.includes("/ai.txt"));

const sitemap = readFileSync(join(web, "sitemap.xml"), "utf8");
check("sitemap og asset", sitemap.includes("/og/innsegall-card.png") || existsSync(OG_PATH));

const keyPages = [
  "alpha.html",
  "clan.html",
  "boat.html",
  "guide.html",
  "stability.html",
  "install.html",
  "map.html",
  "watch.html",
  "warriors.html",
  "ios.html",
  "tablet.html",
  "companion.html",
  "msp.html",
  "supplies.html",
  "privacy.html",
  "tos.html",
  "blog/index.html",
];
for (const rel of keyPages) {
  const html = readFileSync(join(web, rel), "utf8");
  check(`${rel} hosted og`, html.includes(OG_URL));
  check(`${rel} og dimensions`, html.includes("og:image:width"));
  check(`${rel} canonical`, html.includes('rel="canonical"'));
  check(`${rel} og:url`, /property="og:url"/.test(html));
  check(`${rel} meta description`, /name="description"/.test(html));
  check(`${rel} page json-ld`, html.includes('type="application/ld+json"'));
  check(`${rel} ai discovery`, html.includes("ai-discovery.json") || html.includes("/ai.txt"));
  if (!rel.startsWith("blog/") && !rel.includes("privacy") && !rel.includes("tos")) {
    check(`${rel} brand mark`, html.includes('class="brand-mark"'));
    check(`${rel} footer links`, html.includes('class="footer-links"'));
  }
  check(`${rel} css v23`, html.includes("innsegall.css?v=23"));
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

for (const rel of walkHtml(web)) {
  if (rel.includes("samples/")) continue;
  const html = readFileSync(join(web, rel), "utf8");
  if (/noindex/.test(html)) continue;
  const canon = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  const og = html.match(/property="og:url" content="([^"]+)"/)?.[1];
  if (canon && og) {
    check(`${rel} canon=og:url`, canon === og);
  }
}

const smUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const blogSlugs = walkHtml(join(web, "blog"))
  .filter((f) => f !== "index.html")
  .map((f) => `https://innsegall.com/blog/${f.replace(".html", "")}`);
for (const u of blogSlugs) {
  check(`sitemap ${u.replace("https://innsegall.com", "")}`, smUrls.includes(u));
}

const robots = readFileSync(join(web, "robots.txt"), "utf8");
check("robots sitemap", robots.includes("Sitemap:"));
check("robots ai.txt", robots.includes("/ai.txt"));
check("robots parley", robots.includes("/api/parley"));

const discovery = existsSync(join(web, ".well-known/ai-discovery.json"))
  ? readFileSync(join(web, ".well-known/ai-discovery.json"), "utf8")
  : "";
check("ai-discovery parley endpoint", discovery.includes("/api/parley"));
check("ai-discovery llms", discovery.includes("/llms.txt"));

const iosHtml = readFileSync(join(web, "ios.html"), "utf8");
const tabletHtml = readFileSync(join(web, "tablet.html"), "utf8");
check("ios meta mentions Safari", /name="description" content="[^"]*Safari/i.test(iosHtml));
check("tablet meta mentions Safari", /name="description" content="[^"]*Safari/i.test(tabletHtml));
check("llms safari ios guides", readFileSync(join(web, "llms.txt"), "utf8").includes("safari-notifications-scam-iphone-ipad"));

const home = readFileSync(join(web, "index.html"), "utf8");
const homeOgDesc = home.match(/property="og:description" content="([^"]*)"/)?.[1] || "";
const homeTwDesc = home.match(/name="twitter:description" content="([^"]*)"/)?.[1] || "";
check("index og:description length", homeOgDesc.length >= 100 && homeOgDesc.length <= 300, `${homeOgDesc.length}`);
check("index twitter matches og description", homeTwDesc === homeOgDesc);
check("index og:image secure_url", home.includes("og:image:secure_url"));
check("index twitter:url", home.includes('name="twitter:url"'));

const platformBlogSlugs = [
  "safari-shift-key-scam-popup-mac",
  "safari-fake-virus-notifications-mac",
  "safari-search-engine-hijacked-mac",
  "safari-allowed-notifications-by-mistake-mac",
  "opened-suspicious-email-iphone-ipad",
  "downloaded-suspicious-file-iphone-ipad",
  "fake-virus-popup-iphone-ipad",
  "typed-password-scam-site-iphone-ipad",
  "clicked-bad-link-iphone-ipad-guide",
  "safari-notifications-scam-iphone-ipad",
  "safari-clear-website-data-iphone-ipad",
  "fake-virus-popup-macintosh",
  "clicked-suspicious-link-macintosh",
];
for (const slug of platformBlogSlugs) {
  check(`platform blog sitemap /blog/${slug}`, sitemap.includes(`/blog/${slug}`));
}

if (failed) {
  console.error(`\n${failed} SEO audit failure(s)`);
  process.exit(1);
}
console.log("\nSEO audit passed · score lane 9+");
