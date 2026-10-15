#!/usr/bin/env node
/**
 * English post-scare coverage gate · must pass before i18n rollout.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web", "blog");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 en-coverage: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const matrix = JSON.parse(
  readFileSync(join(root, "fixtures", "post-scare-intent-matrix-en.json"), "utf8")
);
const seo = JSON.parse(readFileSync(join(root, "fixtures", "blog-posts-seo.json"), "utf8"));
const cta = JSON.parse(readFileSync(join(root, "fixtures", "blog-cta-variants.json"), "utf8"));
const browserFirst = new Set(cta.browser_first_slugs || []);
const llms = readFileSync(join(root, "web", "llms.txt"), "utf8");

check("matrix version", Boolean(matrix.version));
check("i18n blocked until en gate", matrix.i18n_blocked_until?.includes("en-coverage"));

for (const slug of matrix.product_anchors || []) {
  const path = join(web, `${slug}.html`);
  check(`anchor ${slug}`, existsSync(path));
  check(`anchor seo ${slug}`, Boolean(seo.posts?.[slug]?.description));
}

for (const slug of matrix.scary_moments_oct_2026 || []) {
  check(`scary moment html ${slug}`, existsSync(join(web, `${slug}.html`)));
  check(`scary moment llms ${slug}`, llms.includes(slug));
}

for (const row of matrix.intents || []) {
  const { slug, browser_first, scary_moment } = row;
  const path = join(web, `${slug}.html`);
  check(`intent ${slug}`, existsSync(path));
  check(`seo ${slug}`, Boolean(seo.posts?.[slug]?.description));

  if (!existsSync(path)) continue;
  const html = readFileSync(path, "utf8");
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, "");

  if (browser_first || browserFirst.has(slug)) {
    check(
      `${slug} sample CTA`,
      visible.includes("/samples/battle-scout-demo") || visible.includes("battle-scout-demo")
    );
  }
  if (scary_moment) {
    check(
      `${slug} boost section`,
      html.includes("blog-boost") || html.includes("data-boost-version")
    );
  }
  check(`${slug} send scout CTA`, visible.includes("/alpha") || visible.includes("Send the scout"));
  check(`${slug} no caretaker voice`, !/\bcaretaker\b/i.test(visible));
}

const hub = JSON.parse(readFileSync(join(root, "fixtures", "watch-hub.json"), "utf8"));
const maxDays = hub.max_field_glass_age_days || 14;
const latest = hub.latest_field_glass;
const ageDays = (Date.now() - Date.parse(latest.date)) / (1000 * 60 * 60 * 24);
check(`Field Glass fresh (≤${maxDays}d)`, ageDays <= maxDays + 1, `${Math.round(ageDays)}d`);

check("LANE_I18N_PLAN.md", existsSync(join(root, "docs", "LANE_I18N_PLAN.md")));
check("EN_POST_SCARE_COVERAGE.md", existsSync(join(root, "docs", "EN_POST_SCARE_COVERAGE.md")));

const intentCount = matrix.intents?.length || 0;
if (failed) {
  console.error(`\n${failed} EN coverage failure(s) · ${intentCount} intents in matrix`);
  process.exit(1);
}
console.log(`\nEN post-scare coverage PASS · ${intentCount} intents · ${matrix.deferred_en_p2?.length || 0} deferred P2`);
