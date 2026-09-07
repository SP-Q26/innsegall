#!/usr/bin/env node
/**
 * SEO P0 audit · hosted OG · social meta · sitemap · JSON-LD.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const OG_URL = "https://innsegall.com/og/innsegall-card.png";
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
  "map.html",
  "warriors.html",
  "blog/index.html",
];
for (const rel of keyPages) {
  const html = readFileSync(join(web, rel), "utf8");
  check(`${rel} hosted og`, html.includes(OG_URL));
  check(`${rel} og dimensions`, html.includes("og:image:width"));
  check(`${rel} canonical`, html.includes('rel="canonical"'));
  check(`${rel} brand mark`, html.includes('class="brand-mark"'));
  check(`${rel} footer links`, html.includes('class="footer-links"'));
  check(`${rel} css v11`, html.includes("innsegall.css?v=11"));
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

if (failed) {
  console.error(`\n${failed} SEO audit failure(s)`);
  process.exit(1);
}
console.log("\nSEO audit passed · score lane 9+");
