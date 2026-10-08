#!/usr/bin/env node
/** Field Glass freshness · desk fixture · llms discovery. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 cadence: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const hub = JSON.parse(readFileSync(join(root, "fixtures", "watch-hub.json"), "utf8"));
const desk = JSON.parse(readFileSync(join(root, "fixtures", "blog-field-desk.json"), "utf8"));
const latest = hub.latest_field_glass;
const maxDays = hub.max_field_glass_age_days || 14;

const latestMs = Date.parse(latest.date);
const ageDays = (Date.now() - latestMs) / (1000 * 60 * 60 * 24);
check(`latest Field Glass within ${maxDays}d`, ageDays <= maxDays + 1, `${Math.round(ageDays)}d old`);

check("field-desk points at latest slug", desk.html.includes(`/blog/${latest.slug}`));
check("field-desk version bumped", desk.version === latest.date || desk.version >= latest.date);

const llms = readFileSync(join(web, "llms.txt"), "utf8");
check("llms watch hub url", llms.includes("innsegall.com/watch"));
check("llms latest field glass or watch", llms.includes(latest.slug) || llms.includes("/watch"));

const seo = JSON.parse(readFileSync(join(root, "fixtures", "blog-posts-seo.json"), "utf8"));
check("blog-posts-seo latest slug", Boolean(seo.posts?.[latest.slug]?.description));

if (failed) process.exit(1);
console.log("audit-field-glass-cadence PASS");
