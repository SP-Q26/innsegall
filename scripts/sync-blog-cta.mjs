#!/usr/bin/env node
/**
 * Normalize blog CTA strip · alpha + boat + clan + companion inbox.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");

const STANDARD_LEAD = `Most operators have no local scout after a scare. <strong>Innsegall runs read-only triage</strong> on your Macintosh · <a href="/alpha">Send the scout</a> · <a href="/boat">our lane vs theirs</a> · <a href="/companion">companion inbox</a> on iPhone/iPad · or <a href="/clan">bring your clan</a> for unlimited scouts and shared Battle Scouts.`;

const IOS_LEAD = `Mac runs the scout · iPhone/iPad hold the receipt. <a href="/alpha">Send the scout</a> on your Mac · <a href="/companion">Open companion inbox</a> · <a href="/ios">iOS guide</a> · not antivirus.`;

let changed = 0;

for (const name of readdirSync(blogDir)) {
  if (!name.endsWith(".html") || name === "index.html") continue;
  let html = readFileSync(join(blogDir, name), "utf8");
  const before = html;

  if (name.includes("ios-companion")) {
    html = html.replace(
      /<p class="section-lead">[\s\S]*?<\/p>(\s*<\/section>\s*<footer)/,
      `<p class="section-lead">${IOS_LEAD}</p>$1`
    );
  } else if (html.includes("blog-cta-strip")) {
    html = html.replace(
      /<section class="blog-cta-strip[^"]*"[^>]*>[\s\S]*?<p class="section-lead">[\s\S]*?<\/p>\s*<\/section>/,
      `<section class="blog-cta-strip section" aria-label="Next step">
        <p class="section-label">We send the scout</p>
        <p class="section-lead">${STANDARD_LEAD}</p>
      </section>`
    );
  }

  if (html !== before) {
    writeFileSync(join(blogDir, name), html, "utf8");
    changed++;
    console.log(`blog-cta · ${name}`);
  }
}

console.log(`sync-blog-cta done · ${changed} files`);
