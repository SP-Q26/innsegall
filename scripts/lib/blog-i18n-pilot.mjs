import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const pilotPath = join(root, "fixtures", "blog-i18n-pilot-top20.json");
const wave2Path = join(root, "fixtures", "blog-i18n-wave2.json");
const wave3Path = join(root, "fixtures", "blog-i18n-wave3.json");

/** @type {string[]} */
export const PILOT_BLOG_SLUGS = JSON.parse(readFileSync(pilotPath, "utf8")).slugs;

/** @type {string[]} */
export const WAVE2_BLOG_SLUGS = JSON.parse(readFileSync(wave2Path, "utf8")).slugs;

/** @type {string[]} */
export const WAVE3_BLOG_SLUGS = JSON.parse(readFileSync(wave3Path, "utf8")).slugs;

/** Slugs that get the stronger “body reviewed” locale notice (pilot + waves). */
export const BODY_REVIEWED_SLUGS = [
  ...new Set([...PILOT_BLOG_SLUGS, ...WAVE2_BLOG_SLUGS, ...WAVE3_BLOG_SLUGS]),
];

export function isPilotSlug(slug) {
  return PILOT_BLOG_SLUGS.includes(slug);
}

export function isWave2Slug(slug) {
  return WAVE2_BLOG_SLUGS.includes(slug);
}

export function isWave3Slug(slug) {
  return WAVE3_BLOG_SLUGS.includes(slug);
}

export function isBodyReviewedSlug(slug) {
  return BODY_REVIEWED_SLUGS.includes(slug);
}
