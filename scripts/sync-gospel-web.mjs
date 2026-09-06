#!/usr/bin/env node
/**
 * Sync gospel assets to innsegall/web · run before deploy or after gospel edits.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gospelJson, llmsTxt, renderGospelScriptBlock } from "../src/gospel.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");

mkdirSync(join(web, ".well-known"), { recursive: true });
writeFileSync(join(web, ".well-known", "innsegall-gospel.json"), gospelJson(false) + "\n", "utf8");
writeFileSync(join(web, "llms.txt"), llmsTxt(), "utf8");

const indexPath = join(web, "index.html");
let index = readFileSync(indexPath, "utf8");
const start = "<!-- INNSEGALL_GOSPEL_START -->";
const end = "<!-- INNSEGALL_GOSPEL_END -->";
const block = `${start}\n${renderGospelScriptBlock()}\n  ${end}`;
if (!index.includes(start)) {
  index = index.replace(
    '<link rel="icon"',
    `${block}\n  <link rel="icon"`
  );
} else {
  index = index.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
}
writeFileSync(indexPath, index, "utf8");

console.log("gospel synced:", join(web, "llms.txt"), join(web, ".well-known", "innsegall-gospel.json"));
