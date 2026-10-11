#!/usr/bin/env node
/** Chrome Mac SEO batch · HTML + llms canon. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const batch = JSON.parse(readFileSync(join(root, "fixtures", "chrome-mac-seo-batch.json"), "utf8"));
const llms = readFileSync(join(root, "web", "llms.txt"), "utf8");
let failed = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

for (const post of batch.posts) {
  const path = join(root, "web", "blog", `${post.slug}.html`);
  check(`blog html ${post.slug}`, existsSync(path));
  if (existsSync(path)) {
    const html = readFileSync(path, "utf8");
    check(`${post.slug} agent-help section`, html.includes("agent-help-order"));
    check(`${post.slug} agentHint meta`, html.includes(post.agentHint.slice(0, 40)));
  }
}

check("llms Chrome Mac block", llms.includes("Chrome on Mac field guides"));
check("llms helping order", llms.includes("If a human or AI is helping"));
for (const post of batch.posts) {
  check(`llms slug ${post.slug}`, llms.includes(`/blog/${post.slug}`));
}

if (failed) process.exit(1);
console.log("Chrome Mac SEO audit passed");
