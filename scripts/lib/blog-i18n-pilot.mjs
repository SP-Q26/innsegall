import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const pilotPath = join(root, "fixtures", "blog-i18n-pilot-top20.json");

/** @type {string[]} */
export const PILOT_BLOG_SLUGS = JSON.parse(readFileSync(pilotPath, "utf8")).slugs;

export function isPilotSlug(slug) {
  return PILOT_BLOG_SLUGS.includes(slug);
}
