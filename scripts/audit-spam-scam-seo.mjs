#!/usr/bin/env node
/** Spam & scam lane SEO canon · meta band · keywords · llms coverage. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lane = JSON.parse(readFileSync(join(root, "fixtures", "blog-spam-scam-seo.json"), "utf8"));
const pack = JSON.parse(readFileSync(join(root, "fixtures", "blog-posts-seo.json"), "utf8"));
const llms = readFileSync(join(root, "web", "llms.txt"), "utf8");
const sitemap = readFileSync(join(root, "web", "sitemap.xml"), "utf8");
let failed = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const LANE_LEX = /scam|spam|phishing|fake virus/i;
const NOT_AV = /not antivirus/i;

for (const slug of Object.keys(lane.posts)) {
  const seo = pack.posts[slug];
  const desc = seo?.description || "";
  check(`${slug} in blog-posts-seo`, Boolean(seo?.description));
  check(`${slug} meta 120-160`, desc.length >= 120 && desc.length <= 160);
  check(`${slug} lane lexicon`, LANE_LEX.test(desc) && NOT_AV.test(desc));
  check(`${slug} keywords in pack`, Boolean(seo?.keywords));

  const htmlPath = join(root, "web", "blog", `${slug}.html`);
  if (existsSync(htmlPath)) {
    const html = readFileSync(htmlPath, "utf8");
    check(`${slug} html keywords meta`, html.includes('name="keywords"'));
    check(`${slug} json-ld articleSection`, html.includes("Spam & scam triage"));
    check(`${slug} sitemap`, sitemap.includes(`/blog/${slug}`));
  } else {
    check(`${slug} html exists`, false);
  }
}

check("llms spam scam helping order", llms.includes("If a human or AI is helping"));
check("llms chrome mac guides", llms.includes("Chrome on Mac field guides"));
check("pack spam_scam_lane version", pack.spam_scam_lane?.version === lane.version);

if (failed) process.exit(1);
console.log(`spam/scam SEO audit passed · ${Object.keys(lane.posts).length} lane posts`);
