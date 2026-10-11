#!/usr/bin/env node
/**
 * Merge spam/scam lane SEO canon into blog-posts-seo.json · then sync HTML meta.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lane = JSON.parse(readFileSync(join(root, "fixtures", "blog-spam-scam-seo.json"), "utf8"));
const packPath = join(root, "fixtures", "blog-posts-seo.json");
const pack = JSON.parse(readFileSync(packPath, "utf8"));

for (const [slug, seo] of Object.entries(lane.posts)) {
  pack.posts[slug] = { ...(pack.posts[slug] || {}), ...seo };
  const len = pack.posts[slug].description?.length || 0;
  if (len < 120 || len > 160) {
    console.error(`WARN ${slug} description length ${len} (want 120-160)`);
  }
}

pack.spam_scam_lane = {
  version: lane.version,
  slugs: Object.keys(lane.posts),
};

writeFileSync(packPath, JSON.stringify(pack, null, 2) + "\n", "utf8");
console.log(`merged ${Object.keys(lane.posts).length} spam/scam lane posts into blog-posts-seo.json`);

execSync("node scripts/sync-blog-seo.mjs", { cwd: root, stdio: "inherit" });
