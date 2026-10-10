/** Single source: match scripts/sync-site-chrome.mjs CSS_VER */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "scripts/sync-site-chrome.mjs"), "utf8");
const m = src.match(/const CSS_VER = (\d+)/);
export const CSS_VER = m ? Number(m[1]) : 0;
export const CSS_HREF = `innsegall.css?v=${CSS_VER}`;
export const CSS_RE = new RegExp(`innsegall\\.css\\?v=${CSS_VER}`);
