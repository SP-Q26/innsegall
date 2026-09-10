#!/usr/bin/env node
/** Blog posts · scout-for-you CTA strip before footer. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");
const CTA = `
      <section class="blog-cta-strip section" aria-label="Next step">
        <p class="section-label">We send the scout</p>
        <p class="section-lead">Most operators have no local scout after a scare. <strong>Innsegall runs read-only triage</strong> on your Macintosh · <a href="/alpha">Send the scout</a> · <a href="/boat">our lane vs theirs</a> · or <a href="/clan">bring your clan</a> for unlimited scouts and shared Battle Scouts.</p>
      </section>
`;

const OLD_LEAD =
  /Most households have no security scout\. <strong>Innsegall scouts for you<\/strong> · <a href="\/alpha">Send the scout<\/a> on your Macintosh · or <a href="\/clan">bring your clan<\/a> for unlimited scouts and shared receipts\./g;

const NEW_LEAD =
  "Most operators have no local scout after a scare. <strong>Innsegall runs read-only triage</strong> on your Macintosh · <a href=\"/alpha\">Send the scout</a> · <a href=\"/boat\">our lane vs theirs</a> · or <a href=\"/clan\">bring your clan</a> for unlimited scouts and shared Battle Scouts.";
let changed = 0;

for (const name of readdirSync(blogDir)) {
  if (!name.endsWith(".html") || name === "index.html") continue;
  const path = join(blogDir, name);
  let html = readFileSync(path, "utf8");
  if (html.includes("Most households have no security scout")) {
    html = html.replace(OLD_LEAD, NEW_LEAD);
    writeFileSync(path, html);
    changed++;
    console.log(`blog-cta · refresh ${name}`);
    continue;
  }
  if (html.includes("blog-cta-strip")) continue;
  if (!html.includes("<footer class=\"site-footer\">")) continue;
  html = html.replace(/\s*<footer class="site-footer">/, `${CTA}\n        <footer class="site-footer">`);
  writeFileSync(path, html);
  changed++;
  console.log(`blog-cta · ${name}`);
}

console.log(`sync-blog-cta done · ${changed} files`);
