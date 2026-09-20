#!/usr/bin/env node
/**
 * Phase 7 W1a · blog posts funnel to alpha + lane clarity.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web", "blog");
const desk = JSON.parse(
  readFileSync(join(root, "fixtures", "blog-field-desk.json"), "utf8")
);
let failed = 0;

function check(name, ok) {
  if (ok) console.log(`ok: ${name}`);
  else {
    console.error(`FAIL: ${name}`);
    failed++;
  }
}

function isComparisonPost(slug) {
  return (
    slug.includes("innsegall-vs-") ||
    slug.includes("virustotal") ||
    slug.includes("network-monitor")
  );
}

const posts = readdirSync(web).filter((n) => n.endsWith(".html") && n !== "index.html");

for (const file of posts) {
  const slug = file.replace(/\.html$/, "");
  const html = readFileSync(join(web, file), "utf8");
  const rel = `blog/${slug}`;

  check(`${rel} canonical`, html.includes(`https://innsegall.com/blog/${slug}`));
  check(`${rel} alpha CTA`, html.includes('href="/alpha"'));
  check(`${rel} blog-cta-strip`, html.includes("blog-cta-strip"));
  if (!desk.skip_slugs?.includes(slug)) {
    check(
      `${rel} field desk v${desk.version}`,
      html.includes(`data-field-desk-version="${desk.version}"`)
    );
  }
  check(
    `${rel} lane phrase`,
    /read-only triage|post-scare|not antivirus/i.test(html)
  );
  if (isComparisonPost(slug)) {
    check(`${rel} boat link`, html.includes('href="/boat"'));
  }
  if (slug.includes("ios") || slug.includes("companion")) {
    check(`${rel} companion link`, html.includes('href="/companion"'));
  }
}

check("blog index links alpha", readFileSync(join(web, "index.html"), "utf8").includes('href="/alpha"'));

console.log(failed ? `\n${failed} blog-funnel failure(s)` : "\nBlog funnel audit passed");
process.exit(failed ? 1 : 0);
